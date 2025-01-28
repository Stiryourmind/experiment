//UI elements
function createUI(){
	//score display
	scoreDisplay = createDiv(`祝福 Good Luck + ${score}`);
	scoreDisplay.style('font-size', '12px');
	scoreDisplay.style('font-weight', 'bold');
	scoreDisplay.style('color', 'rgb(255, 215, 0)');
	scoreDisplay.style('text-align', 'left');
	//scoreDisplay.position(xOffset + 5, yOffset + 5);
	scoreDisplay.parent('game-container'); //
		
	//save button
	saveButton = createButton('Save Image');
	saveButton.parent('game-container');
	saveButton.position(10, 10);
	saveButton.mousePressed(() => saveCanvas('snake_game', 'png'));
	
    
	//restart button
	restartButton = createButton('Restart');
	restartButton.parent('game-container');
	restartButton.position(100, 10); 
	restartButton.mousePressed(restartGame);
		
	//arrom button
	createArrowButtons();	
}

//Arrow button
function createArrowButtons() {
	// Common styles for all buttons
	const commonStyles = {
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        background: 'rgb(250, 50, 0)',
        border: '2px solid rgb(255, 215, 0)',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: `${buttonSize * 0.5}px`,
        color: 'white',
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
		
	// DOWN
  arrowButtons.down = createButton('▼');
  arrowButtons.down.parent('game-container');
  applyStyles(arrowButtons.down, commonStyles);
  arrowButtons.down.mousePressed(() => (direction = [0, 1]));
		
	// LEFT
  arrowButtons.left = createButton('◀');
  arrowButtons.left.parent('game-container');
  applyStyles(arrowButtons.left, commonStyles);
	arrowButtons.left.mousePressed(() => (direction = [-1, 0]));
		
	// RIGHT 
  arrowButtons.right = createButton('▶');
  arrowButtons.right.parent('game-container'); 
  applyStyles(arrowButtons.right, commonStyles);
  arrowButtons.right.mousePressed(() => (direction = [1, 0]));
}
	
// Helper function to apply styles to buttons
function applyStyles(button, styles) {
	for (const [key, value] of Object.entries(styles)) {
		button.style(key, value);
	}
}