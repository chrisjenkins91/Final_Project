//* Variables to grab the DOM Elements

let gameArea = document.querySelector(".game-area");
// console.log(gameArea);

const dice = document.getElementById("dice-container");
// console.log(dice);

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
// console.log(title);

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
let dangerZones = [100, 200, 400, 600, 800, 1000, 1200, 1500]; // Danger spots where monster can wake up
let lives = 3;
let treasuresCollected = 0;
let gameOver = false;
let gameWon = false;

//* Event Listener to start game when button is clicked
startButton.addEventListener("click", startGame);


function startGame(){

    debugger
    // Trigger blackout effect
    blackoutScreen.style.display = "block";
    blackoutScreen.style.opacity = "1";

     // Reset body background color to match the blackout
     document.body.classList.add('blackout-bg');

    message.classList.remove("alert", "alert-info");
    message.textContent = "";

    setTimeout(() => {
        title.textContent = "";
        startButton.classList.add("d-none")

        // Fade out blackout screen and start background fade-in
        blackoutScreen.style.opacity = "0";

        

        // After the blackout fades out, start fading in elements
        setTimeout(() => {
            title.textContent = "Let's Get Out Of Here!!";
            rollButton.style.display = ""; 
            dice.classList.remove("d-none"); 
            blackoutScreen.style.display = "none";
            document.body.classList.remove('blackout-bg');
            document.body.classList.add('fade-in-bg');
            livesDisplay.style.display = "block";
            livesDisplay.classList.add('fade-in')
            treasureCountDisplay.style.display = "block";
            treasureCountDisplay.classList.add('fade-in')

            // Trigger fade-in animation for game area and dice
            gameArea.classList.remove("d-none");
            gameArea.classList.add("fade-in");
            dice.classList.add("fade-in");
            rollButton.classList.add("fade-in");
            message.classList.add("fade-in");

            message.classList.add("alert", "alert-info");
            message.textContent = "Roll the dice!";

            // Fade out blackout screen
            blackoutScreen.style.opacity = "0";

            dangerZones = generateDangerZones(3, gameArea.clientWidth); // Generate 3 danger zones
            console.log(dangerZones); // Debug to see the generated danger zones

            placeTreasure();
        }, 800); // Give blackout screen some time to fade out
    }, 500); // Blackout effect lasts 1 second
}




function winGame(){
    message.textContent = "Congrats!! You Win!!!";
    rollButton.style.display = "none"; // Hide roll button
    dice.style.display = "none"; // Hide dice after winning
    gameOver = true;
    resetButton.classList.remove("d-none");
}


//* Event listener to call rollDice function when "clicked"
rollButton.addEventListener("click", rollDice)


function rollDice() {
    debugger
    if (gameOver) return;

    // Show rolling animation
    dice.classList.add("rolling");

    // Generate a number between 1 and 6 after the animation
    setTimeout(() => {
        dice.classList.remove("rolling"); // Stop the rolling animation
        const diceRoll = Math.floor(Math.random() * 6) + 1; // Generate dice roll
        dice.textContent = diceRoll; // Update dice display with rolled number

        // Add the bounce effect after rolling
        dice.classList.add("bounce");
        setTimeout(() => {
            dice.classList.remove("bounce", "fade-in"); // Remove bounce effect after it finishes
        }, 500); // Duration of the bounce

        // Move the player based on the dice roll
        movePlayer(diceRoll);
    }, 1000); // Animation duration is 1 second
}




function movePlayer(diceRoll) {
    playerPosition += diceRoll * 10; //Move the player by 10 px per dice roll
    player.style.left = playerPosition + "px";

    // Check if the player lands on treasure
    if (playerPosition >= 500 && playerPosition <= 550 && treasuresCollected === 0) {
        collectTreasure();
    }

    // Check if the player landed on a danger zone
    if (dangerZones.includes(playerPosition)) {
        wakeUpMonster();
    } 
    //Check if the player wins the game
    else if (playerPosition >= 700 && treasuresCollected === 1) {
        winGame();
    } 
    // Otherwise, keep the game going
    else {
        message.textContent = `You rolled a ${diceRoll}. Keep going!`
    }
}

function placeTreasure() {
    const gameAreaWidth = gameArea.clientWidth; // Width of the game area
    const treasurePosition = Math.floor(Math.random() * (gameAreaWidth / 10)) * 10; // Random position aligned to 10px increments
    treasure.style.left = `${treasurePosition}px`;
}


function collectTreasure(){
    debugger
    treasuresCollected += 1;
    message.classList.add("alert", "alert-info");
    message.textContent = "You found the treasure! Now reach the end!";
    treasureCountDisplay.style.display = "block";
    

    //Disable the roll button so the player can see the message
    rollButton.disabled = true;
    setTimeout(() => {
        treasureCountDisplay.textContent = `Treasures Collected: ${treasuresCollected}/1`
        treasure.style.display = "none";
        rollButton.disabled = false;
    }, 1000) // Re-enable the button after 1 second
}

//* Function to make dangerZones random
function generateDangerZones(numZones, gameWidth) {
    const zones = new Set();
    while (zones.size < numZones) {
        const position = Math.floor(Math.random() * (gameWidth / 10)) * 10; // Align to 10px increments
        if (!zones.has(position)) {
            zones.add(position);
        }
    }
    return Array.from(zones);
}


function wakeUpMonster(){
    lives -= 1; // Lose a life
    livesDisplay.innerText = `Lives: ${lives}`; // Update lives display
    message.textContent = `Uh Ohh! You've starlted the monster!! You have ${lives} lives left.`
    monster.style.backgroundImage = "url('')" // Change to wake monster
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


// Reset game logic
resetButton.addEventListener("click", resetGame);


function resetGame() {
    resetGameState();
}

function resetGameState() {
    playerPosition = 0;
    player.style.left = playerPosition + "px";
    monster.style.backgroundImage = "url('')";
    rollButton.style.display = "";
    message.classList.remove("alert", "alert-info");
    treasure.style.display = "block"; // Show treasure again
    message.textContent = 'Roll the dice to start!';

    // Reset lives and treasures
    lives = 3;
    treasuresCollected = 0;

    // Update and hide the lives and treasure count display
    livesDisplay.textContent = `Lives: ${lives}`;
    treasureCountDisplay.style.display = "none";
    treasureCountDisplay.textContent = `Treasures Collected: ${treasuresCollected}/1`;

    // Hide the reset button and update the title
    resetButton.style.display = "none";
    title.textContent = "Do Not Disturb!";

    // Reset game state
    gameOver = false;

    // Re-enable roll button
    rollButton.disabled = false; // Ensure the roll button is enabled
    rollButton.addEventListener("click", rollDice); // Ensure event listener is attached
}
