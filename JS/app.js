//* Variables to grab the DOM Elements

let gameArea = document.querySelector(".game-area");
// console.log(gameArea);

const player = document.getElementById("player");
// console.log(player);

const monster = document.getElementById("monster");
// console.log(monster);

const treasure = document.getElementById("treasure")
// console.log(treasure);

const rollButton = document.getElementById("roll-button");
// console.log(rollButton);

const startButton = document.getElementById("start-button");
// console.log(startButton);

const resetButton = document.getElementById("reset-button");
// console.log(resetButton);

const title = document.getElementById("game-title");
console.log(title);

const message = document.getElementById("message");
// console.log(message);

const livesDisplay = document.getElementById("lives");
// console.log(livesDisplay);

const treasureCountDisplay = document.getElementById("treasure-count")
// console.log(treasureCountDisplay);

const blackoutScreen = document.getElementById("blackout-screen");
// console.log(blackoutScreen);

//* Game state variables
let playerPosition = 0;
let dangerZones = [200, 400, 600]; // Danger spots where monster can wake up
let lives = 3;
let treasuresCollected = 0;
let gameOver = false;

//* Event Listener to start game when button is clicked
startButton.addEventListener("click", startGame);


function startGame(){
    debugger
    // Trigger blackout effect
    blackoutScreen.style.display = "block";
    blackoutScreen.style.opacity = "1";
    message.classList.remove("alert", "alert-info");
    message.textContent = "";

    setTimeout(() => {
        blackoutScreen.style.opacity = "0";
        setTimeout(() => blackoutScreen.style.display = "none", 500);
        title.textContent = "Let's Get Out Of Here!!"
        rollButton.style.display = "" // Show roll dice button
        startButton.style.display = "none"; // Hide start button
        message.classList.add("alert", "alert-info")
        message.textContent = "Roll the dice!";
    }, 1000); // Blackout effect last 1 second
}

//* Event listener to call rollDice function when "clicked"
rollButton.addEventListener("click", rollDice)


function rollDice(){
    debugger
    message.classList.remove("alert", "alert-info")
    if (gameOver) return;

    const diceRoll = Math.floor(Math.random() * 6) + 1; // Generate a number between 1-6
    movePlayer(diceRoll);
}


function movePlayer(diceRoll) {
    playerPosition += diceRoll * 50; //Move the player by 50 px per dice roll
    player.style.left = playerPosition + "px";

    // Check if the player lands on treasure
    if (playerPosition >= 500 && playerPosition <= 550 && treasuresCollected === 0) {
        collectTreasure();
    }

    // Check if the player landed on a danger zone
    if (dangerZones.includes(playerPosition)) {
        wakeUpMonster();
    } else if (playerPosition >= 700 && treasuresCollected === 1) {
        winGame();
    } else {
        message.textContent = `You rolled a ${diceRoll}. Keep going!`
    }
}


function collectTreasure(){
    message.textContent = `You found the treasure! Now reach the end!`;
    treasuresCollected += 1;
    treasureCountDisplay.textContent = `Treasures Collected: ${treasuresCollected}/1`
    treasure.style.display = "none";

    //Disable the roll button so the player can see the message
    rollButton.disabled = true;
    setTimeout(() => {
        rollButton.disabled = false;
    }, 1000) // Re-enable the button after 1 second
}


function wakeUpMonster(){
    lives -= 1; // Lose a life
    livesDisplay.innerText = `Lives: ${lives}`;
    message.textContent = "Uh Oh! You woke up the monster!";
    monster.style.backgroundImage = "url()" // Change to wake monster
    rollButton.disabled = true;
    
    if (lives <= 0) {
        gameOver = true;
        message.textContent = `Game Over! You've lost all of your lives.`
        resetButton.style.display = ""; // Shows reset button
    } else {
        setTimeout(() => {
            rollButton.disabled = false; // Enable roll Button after a short delay
        }, 1000) // Dely for 1 second
    }
}


function winGame(){
    message.textContent = "Congrats!! You Win!!!";
    rollButton.style.display = "none"; // Remove roll button
    gameOver = true;
    resetButton.style.display = ""; // Show reset button
}

// Reset game logic
resetButton.addEventListener("click", resetGame);


function resetGame() {
    playerPosition = 0;
    player.style.left = playerPosition + "px";
    monster.style.backgroundimage = "url()";
    rollButton.style.display = "";
    message.classList.add("alert", "alert-info")
    treasure.style.display = ""; // Show treasure again
    message.textContent = "Roll the dice to start!";
    lives = 3;
    treasuresCollected = 0;
    livesDisplay.textContent = `Lives: ${lives}`;
    resetButton.style.display = "none";
    title.textContent = "Do Not Disturb!"

    // Reset game stats
    gameOver = false;
}