let snake = [];
let direction = [0, 0];
let gridSizeX;
let gridSizeY; 
let cellSizeX;
let cellSizeY;
let symbols = []; 
let items = []; 
let eatenSymbols = []; 
let margin = 2; 
let customFont; 
let englishFont;
let symbolSizeMultiplier = 1; 
let goldFoilGraphics;
let currentPhrase = "";

const AspectRatioWidth = 250;
const AspectRatioHeight = 400;

let startButton;
let restartButton;
let saveButton;
let arrowButtons = {}; 

let buttonSize = 55;
let xOffset, yOffset; 
let gameActive = false;


function preload() {
    customFont  = loadFont('HanyiSentyPagodaRegular.ttf'); 
    englishFont = loadFont('SnakeChan.otf');
}

///// Setup /////
function setup() {
  gridSizeX = windowWidth/30;
  gridSizeY = windowHeight/30;

	//const scaleFactor = min(windowWidth / AspectRatioWidth, windowHeight / AspectRatioHeight);
	createCanvas(windowWidth-100, windowHeight-100).parent('game-container');
 
	cellSizeX = width / gridSizeX; 
  cellSizeY = height / gridSizeY; 
  createGoldFoilGraphics();

	//arrom button
	createArrowButtons();	
  createStartPage();
}

///// Start Page /////
function createStartPage() {
  cleanupGame();
  clear();

   // Red background for Start page
   background(250, 50, 0);

   // Display gold foil pattern
   image(goldFoilGraphics, 0, 0);

  startButton = createButton('Start');
  startButton.parent('game-container'); 
  startButton.style('font-size', '45px');
  startButton.style('background', 'none'); 
  startButton.style('border', 'none'); 
  startButton.style('color', 'white'); 
  startButton.style('cursor', 'pointer');
  startButton.style('padding', '0');
  startButton.mouseOver(() => startButton.style('color', 'rgb(255, 215, 0)'));
  startButton.mouseOut(() => startButton.style('color', 'white'));
  startButton.style('font-family', 'Silkscreen');
  startButton.position('center');
  startButton.mousePressed(() => {
      startButton.hide();
      startGame();
      resizeGameElements();
      updateButtonDisplay('start');
  });

  currentPhrase = "";
}

function startGame() {
  initializeGame();
  createUI();
  createArrowButtons(); 

  for (let i = 0; i < 10; i++) {
      items.push(generateNonOverlappingItem());
  }

  frameRate(7);
  createGoldFoilGraphics();
  resizeGameElements();
  gameActive = true;

  if (restartButton) {
    restartButton.hide();
}

  loop();
}

/////UI elements /////
function createUI(){

  //save button
	saveButton = createButton('Save Image');
	saveButton.parent('game-container');
  saveButton.style('font-family', 'Silkscreen');
  saveButton.style('font-size', '20px');
  saveButton.style('background', 'none'); 
  saveButton.style('border', 'none');
  saveButton.style('color', 'white');
  saveButton.style('cursor', 'pointer');
  saveButton.style('padding', '0');
  saveButton.mouseOver(() => saveButton.style('color', 'rgb(255, 215, 0)')); 
  saveButton.mouseOut(() => saveButton.style('color', 'white'));
	saveButton.mousePressed(() => saveCanvas('snake_game', 'png'));
  saveButton.position((windowWidth-250),(10));
	
	//restart button
	restartButton = createButton('Restart');
  restartButton.parent('game-container');
  restartButton.style('font-family', 'Silkscreen');
  restartButton.style('font-size', '20px');
  restartButton.style('background', 'none'); 
  restartButton.style('border', 'none');
  restartButton.style('color', 'white');
  restartButton.style('cursor', 'pointer');
  restartButton.style('padding', '0'); 
  restartButton.mouseOver(() => restartButton.style('color', 'rgb(255, 215, 0)'));
  restartButton.mouseOut(() => restartButton.style('color', 'white'));
  restartButton.hide();
  restartButton.position((windowWidth-250),(50));
  restartButton.mousePressed(() => {
    cleanupGame();
    //restartButton.hide(); 
    createStartPage();
    updateButtonDisplay('restart');
  });

}

/////Arrow button /////
function createArrowButtons() {
	// Common styles for all buttons
	const commonStyles = {
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        background: 'transparent',
        border: '2px solid rgb(255,255,255)',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: `${buttonSize * 0.5}px`,
        color: 'rgb(255,255,255)',
        //'rgb(255, 215, 0)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
	};
	// UP
	arrowButtons.up = createButton('▲');
	arrowButtons.up.parent('game-container');
  applyStyles(arrowButtons.up, commonStyles);
  arrowButtons.up.mousePressed(() => (direction = [0, -1]));
  arrowButtons.up.position((windowWidth-100)/2 -buttonSize/2,(windowHeight-100)-buttonSize*3.5);

	// DOWN
  arrowButtons.down = createButton('▼');
  arrowButtons.down.parent('game-container');
  applyStyles(arrowButtons.down, commonStyles);
  arrowButtons.down.mousePressed(() => (direction = [0, 1]));
  arrowButtons.down.position((windowWidth-100)/2 -buttonSize/2,(windowHeight-100)-buttonSize*1.5);

	// LEFT
  arrowButtons.left = createButton('◀');
  arrowButtons.left.parent('game-container');
  applyStyles(arrowButtons.left, commonStyles);
	arrowButtons.left.mousePressed(() => (direction = [-1, 0]));
  arrowButtons.left.position((windowWidth-100)/2 -buttonSize*1.5,(windowHeight-100)-buttonSize*2.5);

	// RIGHT 
  arrowButtons.right = createButton('▶');
  arrowButtons.right.parent('game-container'); 
  applyStyles(arrowButtons.right, commonStyles);
  arrowButtons.right.mousePressed(() => (direction = [1, 0]));
  arrowButtons.right.position((windowWidth-100)/2 +buttonSize*0.5,(windowHeight-100)-buttonSize*2.5);
}
	
// Helper function to apply styles to buttons
function applyStyles(button, styles) {
	for (const [key, value] of Object.entries(styles)) {
		button.style(key, value);
	}
}
	
  //Add Gold foil pattern
  function createGoldFoilGraphics(){
		goldFoilGraphics = createGraphics(width, height);
		const goldFoilCount = Math.floor(random(200, 500));
		addGoldFoil(goldFoilGraphics, goldFoilCount);
	}
	

/////Initialize game state /////
function initializeGame() {
  const startX = floor(gridSizeX / 2);
  const startY = floor(gridSizeY / 2);
  snake = [[startX, startY]];
	
  symbols = [drawSmiley, drawGoldCoin, drawRedEnvelope, drawFuDiamond, drawFlower];
  items = [];
  eatenSymbols = [];
  score = 0 ;
  updateScore2();
  direction = [0, 0];

}

///// updateButtonDisplay /////
function updateButtonDisplay(state) {
  if (state === 'start' || state === 'playing') {
      Object.values(arrowButtons).forEach((button) => {
          button.show();
      });

      if (saveButton) saveButton.hide();
      if (restartButton) restartButton.hide();
  } else if (state === 'gameOver') {
      Object.values(arrowButtons).forEach((button) => button.hide());
      saveButton.show();
      restartButton.show();
  } else if (state === 'restart') {
      Object.values(arrowButtons).forEach((button) => {
          button.show();
      });

      // Hide save and restart buttons
      if (saveButton) saveButton.hide();
      if (restartButton) restartButton.hide();
  }

}

/////Draw Function /////
function draw() {

  if (!gameActive) return;

	//Red canvas
  push();
  noStroke();
  fill(250, 50, 0);
  rect(0, 0, width, height);
  pop();
	
	//Gold foil
  image(goldFoilGraphics, 0, 0);
	
	// Draw all active items
  for (let item of items) {
    item.symbol(
      item.x * cellSizeX + cellSizeX / 2,
      item.y * cellSizeY + cellSizeY / 2,
      cellSizeX * 1
    );
  }

  drawSnake();
	
// Check if the game is over
    if (!isLooping()) {
        gameOver();
			  return;
		}
	// Update the snake's position
	if (direction[0] !== 0 || direction[1] !== 0) {
		updateSnake();
	}

	// Check for collisions (with items or itself)
	checkCollisions();
}

	///// Draw the snake /////
	function drawSnake() {
		for (let i = 0; i < snake.length; i++) {
			const [x, y] = snake[i];

    // Snake Head
			if (i === 0) {
				drawSnakeHead(x, y);
			}else{
				drawSnakeBody(x, y, i);
			}
		}
	}
	
	//Snake Head
	function drawSnakeHead(x,y){
		push();
		
		fill(255, 204, 0);
		noStroke();
    rect(x * cellSizeX, y * cellSizeY, cellSizeX, cellSizeY, 20); // Rounded head
		
		
		// Snake eyes
		fill(250, 50, 0); 
		noStroke();
		const eyeOffsetX = cellSizeX * 0.3;
		const eyeOffsetY = cellSizeY * 0.25;
		const eyeSize = cellSizeX * 0.2;
		
		circle(x * cellSizeX + eyeOffsetX, y * cellSizeY + eyeOffsetY, eyeSize); //left eye 
		circle(x * cellSizeX + cellSizeX - eyeOffsetX, y * cellSizeY + eyeOffsetY, eyeSize); //right eye 
		
		pop();
	}
			
    // Snake body
	function drawSnakeBody(x, y, i){
		push();
		
		if (i - 1 < eatenSymbols.length) {
      const symbol = eatenSymbols[i - 1];
			symbol(
        x * cellSizeX + cellSizeX / 2,
        y * cellSizeY + cellSizeY / 2,
        cellSizeX * 0.85
			);
		} else {
      push();
      fill(150);
      noStroke();
      rect(x * cellSizeX, y * cellSizeY, cellSizeX, cellSizeY);
		}
      pop();
	}

	//update Snake position
	function updateSnake() {
		const head = snake[0];
		const newHead = [head[0] + direction[0], head[1] + direction[1]];
		snake.unshift(newHead);
		
		// Add the eaten symbol to the body
		if (!checkIfEaten(newHead)) {
			snake.pop();
			//if (eatenSymbols.length > snake.length - 1) {
			//	eatenSymbols.pop(); 
   // }
  }
}
	
	function checkIfEaten(newHead) {
		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			if (newHead[0] === item.x && newHead[1] === item.y) {
				eatenSymbols.push(symbols[item.type]);
      	items.splice(i, 1); // Remove the item from the canvas
      	items.push(generateNonOverlappingItem()); // Add a new random item to the canvas
				score++; // Increase the score
        updateScore2();
      	return true;
			}
		}
		return false;
	}
	
	// Check for collisions with the frame/ itself
	function checkCollisions() {
		const head = snake[0];
  	const headX = head[0] * cellSizeX;
  	const headY = head[1] * cellSizeY;
		
		if (
			headX < 0 || // Left boundary
			headX  >= width  || // Right boundary
			headY < 0 || // Top boundary
			headY  >= height// Bottom boundary
		) {
			gameOver();
			return;
		}
		for (let i = 1; i < snake.length; i++) {
			if (head[0] === snake[i][0] && head[1] === snake[i][1]) {
				gameOver();
				return;
			}
		}
	}
	
/////Random phrase /////
function getRandomPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    return phrases[randomIndex];
}

/////Game over /////
  function gameOver() {
  noLoop();
  gameActive = false;

		if (currentPhrase === "") {
			currentPhrase = getRandomPhrase();
		}

  fill(0);
  textFont(customFont);
  textSize(height/5);
  textAlign(CENTER, CENTER);

	const verticalText = currentPhrase.split("");
  const charHeight = textSize() * 1.05; 
  const totalTextHeight = verticalText.length * charHeight;
  const startY = (height - totalTextHeight) / 2 + charHeight / 2 -20;
  const centerX = width / 2;

  // Draw character vertically
  for (let i = 0; i < verticalText.length; i++) {
    text(verticalText[i], centerX, startY + i * charHeight);
	}
  updateButtonDisplay('gameOver');
}

///// clean up canvas /////
function cleanupGame() {
  // Clear the snake and items
  snake = [];
  items = [];
  eatenSymbols = [];
  direction = [0, 0];
  score = 0;
  updateScore2();
  currentPhrase = "";
  gameActive = false;
  

if (restartButton) {
  restartButton.hide();
}
Object.values(arrowButtons).forEach((button) => button.remove());

  noLoop();
  clear(); 
}

	function generateNonOverlappingItem() {
		let x, y, isOverlapping;
		
		do {
			x = floor(random(margin / cellSizeX, gridSizeX - margin / cellSizeX));
			y = floor(random(margin / cellSizeY, gridSizeY - margin / cellSizeY));
			
			// Ensure the new item does not overlap the snake or other items
			isOverlapping =
				snake.some(([sx, sy]) => sx === x && sy === y) ||
				items.some((item) => item.x === x && item.y === y);
		} while (isOverlapping);
		
		const type = floor(random(symbols.length));
		return { x, y, type, symbol: symbols[type] };
	}
	
	///// Gold Foil /////
	function addGoldFoil(graphics, count) {
		for (let i = 0; i < count; i++) {
			let x = random(margin, graphics.width- margin);
			let y = random(margin, graphics.height- margin);
			let size = random(0.2, 3);
			graphics.fill(255, 215, 0, random(150, 255));
			graphics.noStroke();
			
			graphics.beginShape();
			for (let j = 0; j < 5; j++) {
				let angle = TWO_PI / 5 * j;
				let r = size * random(0.5, 1);
				let xOffset = r * cos(angle);
				let yOffset = r * sin(angle);
				graphics.vertex(x + xOffset, y + yOffset);
			}
			graphics.endShape(CLOSE);
		}
	}


	function keyPressed() {
		if (keyCode === UP_ARROW && direction[1] === 0) {
			direction = [0, -1];
    	arrowButtons.up.style('background', 'rgba(0, 0, 0, 0.2)');
		} else if (keyCode === DOWN_ARROW && direction[1] === 0) {
			direction = [0, 1];
			arrowButtons.down.style('background', 'rgba(0, 0, 0, 0.2)');
  	} else if (keyCode === LEFT_ARROW && direction[0] === 0) {
    	direction = [-1, 0];
    	arrowButtons.left.style('background', 'rgba(0, 0, 0, 0.2)');
  	} else if (keyCode === RIGHT_ARROW && direction[0] === 0) {
    	direction = [1, 0];
    	arrowButtons.right.style('background', 'rgba(0, 0, 0, 0.2)');
		}
	}
	
	function keyReleased() {
  	if (keyCode === UP_ARROW) {
    	arrowButtons.up.style('background', 'transparent');
  	} else if (keyCode === DOWN_ARROW) {
    	arrowButtons.down.style('background', 'transparent');
  	} else if (keyCode === LEFT_ARROW) {
    	arrowButtons.left.style('background', 'transparent');
  	} else if (keyCode === RIGHT_ARROW) {
    	arrowButtons.right.style('background', 'transparent');
  	} else if (key === 'S' || key === 's') {
    	if (!isLooping()) {
      	saveCanvas('snake_game', 'png'); 
			}
		}
	}

	// Update the score display
  function updateScore2(){
    const scoreDisplay = document.getElementById('scoreDisplay'); // Get the score display element
    if (scoreDisplay) {
        scoreDisplay.innerText = `Score: ${score}`; // Update the score in the HTML
    } else {
        console.error('Score display element not found!');
    }
}
	
///// Resize /////
function resizeGameElements() {
  //  const originalPositions = {
        //restartButton: { x: AspectRatioWidth/2- buttonSize -30, y: height + 90 },
   // }

    //restartButton.position(originalPositions.restartButton.x, originalPositions.restartButton.y);

      //Recalculate positions for arrow buttons
      //arrowButtons.up.position(WindowWidth/2- buttonSize, WindowHeight-100);
      //arrowButtons.down.position(width/2 - buttonSize +15, height + buttonSize *2+15);
      //arrowButtons.left.position(width/2 - buttonSize *2 +10, height + buttonSize +15);
      //arrowButtons.right.position(width/2 + buttonSize/2 +2, height + buttonSize+15);
      
}

function windowResized() {
	/*const scaleFactor = min(windowWidth / AspectRatioWidth, windowHeight / AspectRatioHeight);
    const newWidth = min(windowWidth, AspectRatioWidth);
    const newHeight = min(windowHeight, AspectRatioHeight);*/

    // Ensure the canvas size doesn't exceed the maximum dimensions
    resizeCanvas(windowWidth, windowHeight);
    cellSizeX = width / gridSizeX;
    cellSizeY = height / gridSizeY;
    // Resize UI elements
    resizeGameElements();
}


/////Symbol Functions/////

function drawSmiley(x, y, size) {
	size *= symbolSizeMultiplier; 
  push();
  noFill();
  stroke(255, 204, 0); // Gold stroke style
  strokeWeight(2);
  ellipse(x, y, size); // Outer circle
  fill(255, 204, 0); // Fill for eyes
  noStroke();
  ellipse(x - size / 5, y - size / 5, size / 10); // Left eye
  ellipse(x + size / 5, y - size / 5, size / 10); // Right eye
  noFill();
  stroke(255, 204, 0);
  arc(x, y, size / 1.5, size / 1.5, 0, PI); // Smile
  pop();
}

function drawGoldCoin(x, y, size) {
	size *= symbolSizeMultiplier; 
  push();
  noFill();
  stroke(255, 204, 0); // Gold stroke style
  strokeWeight(2);
  ellipse(x, y, size); // Outer circle
  ellipse(x, y, size * 0.6); // Inner circle
  rectMode(CENTER);
  rect(x, y, size * 0.2, size * 0.2); // Inner square
  ellipse(x, y - size * 0.3, size * 0.1); // Top hole
  ellipse(x, y + size * 0.3, size * 0.1); // Bottom hole
  ellipse(x - size * 0.3, y, size * 0.1); // Left hole
  ellipse(x + size * 0.3, y, size * 0.1); // Right hole
  pop();
}

function drawRedEnvelope(x, y, size) {
  size *= symbolSizeMultiplier; // Scale the size of the red envelope
  push();
  noFill();
  stroke(255, 204, 0); // Gold stroke for the envelope
  strokeWeight(2);

  // Draw wider rectangle (envelope body)
  rectMode(CENTER);
  rect(x, y, size , size*1.2); // Wider envelope body

  // Draw envelope flap
  triangle(
    x - size * 0.4, // Left corner
    y - size * 0.6, // Top left
    x + size * 0.4, // Right corner
    y - size * 0.6, // Top right
    x, // Center point
    y - size * 0.4 // Bottom center
  );

  // Draw a larger heart
  fill(255, 204, 0); 
  noStroke();
  beginShape();
  vertex(x, y - size * 0.1); // Top of heart
  bezierVertex(
    x - size * 0.3, y - size * 0.3, // Left curve
    x - size * 0.6, y, // Left bottom
    x, y + size * 0.3 // Bottom point
  );
  bezierVertex(
    x + size * 0.6, y, // Right bottom
    x + size * 0.3, y - size * 0.3, // Right curve
    x, y - size * 0.1 // Top right
  );
  endShape(CLOSE);
  pop();
}

function drawFuDiamond(x, y, size) {
	size *= symbolSizeMultiplier; 
  push();
  noFill();
  stroke(255, 204, 0); 
  strokeWeight(2);
  translate(x, y);
  rotate(PI / 4);
  rectMode(CENTER);
  rect(0, 0, size, size); // Draw the diamond shape
  pop();

  // Draw the upside-down "福" diamond
  push();
  translate(x, y); 
  rotate(PI);
  textSize(size / 1.5); 
  textAlign(CENTER, CENTER); 
  fill(255, 204, 0); 
  noStroke();
  text("福", 0, 0);
  pop();
}

function drawFlower(x, y, size) {
  size *= symbolSizeMultiplier*0.8; // Scale the size of the flower symbol
  push();
  translate(x, y); // Center the drawing at (x, y)
  stroke(255, 204, 0); // Gold stroke for the flower
  strokeWeight(2);
  noFill();

  // Draw petals (5 petals)
  for (let i = 0; i < 5; i++) {
    ellipse(0, -size * 0.4, size * 0.5, size * 0.7); // Petal shape
    rotate((2 * PI) / 5); // Rotate for the next petal
  }

  // Center circle
  fill(255, 204, 0); 
  noStroke();
  ellipse(0, 0, size * 0.4);

  // Decorative lines inside petals
  stroke(255, 204, 0); 
  noFill();
  for (let i = 0; i < 5; i++) {
    line(0, -size * 0.3, 0, -size * 0.15); // Line inside petal
    rotate((2 * PI) / 5);
  }

  pop();
}

///// Phrases Array ///// 

const phrases = [
  "蛇年快樂",
  "日日精彩",
  "心中有夢",
  "無憂無慮",
  "煩惱消散",
  "隨心所欲",
  "多姿多彩",
  "輕鬆自在",
  "勁學新野",
  "紅中發財",
  "小人退散",
  "能量滿滿",
  "幸運加倍",
  "唔洗OT",
  "水浸荷包",
  "發個大達",
  "滿載而歸",
  "身體健康",
  "賺到笑",
  "食極唔肥",
  "無拘無束",
  "充滿驚喜",
  "中六合彩",
  "大癲",
  "夢想成真",
  "善待自己",
  "快樂美滿",
  "早睡早起",
  "食飽瞓飽",
  "隨心所欲",
  "贏到手軟",
  "笑到唔停"
];
