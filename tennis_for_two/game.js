const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // No gravity for a top-down game
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let paddle1, paddle2, ball;
let cursors, spaceKey;

function preload() {
  // Load assets (if any)
}

function create() {
  // Add paddles
  paddle1 = this.physics.add.rectangle(50, 300, 20, 100, 0xffffff).setImmovable(true);
  paddle2 = this.physics.add.rectangle(750, 300, 20, 100, 0xffffff).setImmovable(true);

  // Add ball
  ball = this.physics.add.circle(400, 300, 10, 0xff0000);
  ball.setCollideWorldBounds(true);
  ball.setBounce(1, 1);
  ball.setVelocity(200, 200);

  // Add collisions
  this.physics.add.collider(ball, paddle1);
  this.physics.add.collider(ball, paddle2);

  // Keyboard input
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update() {
  // Move paddle1 (left paddle) with arrow keys
  if (cursors.up.isDown) {
    paddle1.y -= 5;
  } else if (cursors.down.isDown) {
    paddle1.y += 5;
  }

  // Move paddle2 (right paddle) with space and shift keys
  if (spaceKey.isDown) {
    paddle2.y -= 5;
  } else if (Phaser.Input.Keyboard.JustDown(cursors.shift)) {
    paddle2.y += 5;
  }

  // Prevent paddles from going out of bounds
  paddle1.y = Phaser.Math.Clamp(paddle1.y, 50, 550);
  paddle2.y = Phaser.Math.Clamp(paddle2.y, 50, 550);

  // Reset ball if it goes out of bounds
  if (ball.x < 0 || ball.x > 800) {
    ball.setPosition(400, 300);
    ball.setVelocity(200, 200);
  }
}