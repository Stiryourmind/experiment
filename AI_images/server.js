// server.js
require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const BASE_URL = "https://www.runninghub.ai";

const API_KEY = process.env.RUNNINGHUB_API_KEY;
const WEBAPP_ID = process.env.RUNNINGHUB_WEBAPP_ID;

const BG_NODE_ID = process.env.RUNNINGHUB_BG_NODE_ID;
const BG_FIELD_NAME = process.env.RUNNINGHUB_BG_FIELD_NAME;

const CHAR_NODE_ID = process.env.RUNNINGHUB_CHAR_NODE_ID;
const CHAR_FIELD_NAME = process.env.RUNNINGHUB_CHAR_FIELD_NAME;

const POS_NODE_ID = process.env.RUNNINGHUB_POS_NODE_ID;
const POS_FIELD_NAME = process.env.RUNNINGHUB_POS_FIELD_NAME;

const SEED_NODE_ID = process.env.RUNNINGHUB_SEED_NODE_ID;
const SEED_FIELD_NAME = process.env.RUNNINGHUB_SEED_FIELD_NAME;

if (!API_KEY || !WEBAPP_ID) {
  console.error("Missing RUNNINGHUB_API_KEY or RUNNINGHUB_WEBAPP_ID in .env");
  process.exit(1);
}

// ------------- helpers -------------

function generateRandomSeed() {
  return Math.floor(Math.random() * 4294967295);
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!res.ok) {
    const msg = payload.msg || payload.message || res.statusText;
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }

  return payload;
}

// Upload a local file to RunningHub and get a token/fileName
async function uploadImageToRunningHub(localPath) {
  const url = `${BASE_URL}/task/openapi/upload`;

  const formData = new FormData();
  formData.append("apiKey", API_KEY);
  formData.append("fileType", "image");
  formData.append("file", fs.createReadStream(localPath));

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const text = await res.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!res.ok) {
    const msg = payload.msg || payload.message || res.statusText;
    throw new Error(`Upload failed: HTTP ${res.status}: ${msg}`);
  }

  const data = payload.data || {};
  const token = data.fileName || data.url;
  if (!token) {
    throw new Error("Upload succeeded, but no file token returned.");
  }

  return token;
}

async function startTask(nodeInfoList) {
  const url = `${BASE_URL}/task/openapi/ai-app/run`;
  const payload = await postJson(url, {
    webappId: WEBAPP_ID,
    apiKey: API_KEY,
    nodeInfoList,
  });

  const data = payload.data || {};
  const taskId =
    payload.taskId ||
    payload.appRunLogId ||
    data.taskId ||
    data.id;

  if (!taskId) {
    throw new Error("No taskId from RunningHub response");
  }

  return String(taskId);
}

async function waitForTask(taskId, maxSeconds = 180) {
  const url = `${BASE_URL}/task/openapi/status`;
  const start = Date.now();

  while (true) {
    if ((Date.now() - start) / 1000 > maxSeconds) {
      throw new Error("Task timeout");
    }

    const payload = await postJson(url, { apiKey: API_KEY, taskId });
    const data = payload.data;

    let status = "";
    if (typeof data === "string") {
      status = data.toLowerCase();
    } else {
      status = String(
        (data && (data.taskStatus || data.status)) ||
        payload.status ||
        ""
      ).toLowerCase();
    }

    if (["success", "succeeded", "done", "finished", "complete"].includes(status)) {
      return;
    }
    if (["failed", "error", "timeout", "cancelled", "canceled"].includes(status)) {
      throw new Error("RunningHub task failed");
    }

    await new Promise(r => setTimeout(r, 1500));
  }
}

async function getOutputs(taskId) {
  const url = `${BASE_URL}/task/openapi/outputs`;
  const payload = await postJson(url, { apiKey: API_KEY, taskId });

  const data = payload.data;
  const urls = [];

  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && item.fileUrl) urls.push(item.fileUrl);
    }
  } else if (data && typeof data === "object") {
    if (Array.isArray(data.outputs)) {
      for (const o of data.outputs) {
        if (typeof o === "string" && o.startsWith("http")) urls.push(o);
        if (o && o.fileUrl) urls.push(o.fileUrl);
      }
    }
    if (Array.isArray(data.images)) {
      for (const o of data.images) {
        if (typeof o === "string" && o.startsWith("http")) urls.push(o);
        if (o && o.url) urls.push(o.url);
      }
    }
  }

  return urls;
}

// ------------- main API -------------

// Expect multipart/form-data with:
// - bgImage (file)
// - charImage (file)
// - positivePrompt (text)
// - seed (text/number)
// - fixedSeed ("true"/"false")
app.post(
  "/api/generate",
  upload.fields([
    { name: "bgImage", maxCount: 1 },
    { name: "charImage", maxCount: 1 },
  ]),
  async (req, res) => {
    const bgFile = req.files?.bgImage?.[0];
    const charFile = req.files?.charImage?.[0];

    const {
      positivePrompt,
      seed,
      fixedSeed,
    } = req.body;

    if (!bgFile || !charFile) {
      return res.status(400).json({ error: "Please upload both background and character images." });
    }
    if (!positivePrompt) {
      return res.status(400).json({ error: "positivePrompt is required" });
    }

    let seedToUse;
    const fixed = fixedSeed === "true" || fixedSeed === true;

    if (fixed) {
      const parsed = parseInt(seed, 10);
      if (Number.isFinite(parsed) && parsed >= 0) {
        seedToUse = parsed;
      } else {
        seedToUse = generateRandomSeed();
      }
    } else {
      seedToUse = generateRandomSeed();
    }

    try {
      // 1) Upload both images
      const bgToken = await uploadImageToRunningHub(bgFile.path);
      const charToken = await uploadImageToRunningHub(charFile.path);

      // 2) Build nodeInfoList for this workflow
      const nodeInfoList = [];

      // Background image
      if (BG_NODE_ID && BG_FIELD_NAME) {
        nodeInfoList.push({
          nodeId: BG_NODE_ID,
          fieldName: BG_FIELD_NAME,
          fieldValue: bgToken,
          description: "background image",
        });
      }

      // Character image
      if (CHAR_NODE_ID && CHAR_FIELD_NAME) {
        nodeInfoList.push({
          nodeId: CHAR_NODE_ID,
          fieldName: CHAR_FIELD_NAME,
          fieldValue: charToken,
          description: "character image",
        });
      }

      // Positive prompt
      if (POS_NODE_ID && POS_FIELD_NAME) {
        nodeInfoList.push({
          nodeId: POS_NODE_ID,
          fieldName: POS_FIELD_NAME,
          fieldValue: positivePrompt,
          description: "positive prompt",
        });
      }


      // Seed
      if (SEED_NODE_ID && SEED_FIELD_NAME) {
        nodeInfoList.push({
          nodeId: SEED_NODE_ID,
          fieldName: SEED_FIELD_NAME,
          fieldValue: String(seedToUse),
          description: "seed",
        });
      }

      console.log("nodeInfoList:", JSON.stringify(nodeInfoList, null, 2));

      // 3) Start task
      const taskId = await startTask(nodeInfoList);

      // 4) Wait
      await waitForTask(taskId);

      // 5) Get outputs
      const outputs = await getOutputs(taskId);

      if (!outputs.length) {
        throw new Error("No output images from RunningHub");
      }

      res.json({ imageUrl: outputs[0], seed: seedToUse });
    } catch (err) {
      console.error("Error in /api/generate:", err);
      res.status(500).json({ error: err.message || String(err) });
    } finally {
      // cleanup temp files
      if (bgFile?.path) fs.unlink(bgFile.path, () => {});
      if (charFile?.path) fs.unlink(charFile.path, () => {});
    }
  }
);

// serve index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
