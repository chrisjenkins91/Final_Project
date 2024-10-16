//* Variables to grab the DOM Elements

let gameArea = document.querySelector(".game-area");
const dice = document.getElementById("dice-container");
const player = document.getElementById("player");
const monster = document.getElementById("monster");
const treasure = document.getElementById("treasure")
const rollButton = document.getElementById("roll-button");
const startButton = document.getElementById("start-button");
const resetButton = document.getElementById("reset-button");
const title = document.getElementById("game-title");
const message = document.getElementById("message");
const livesDisplay = document.getElementById("lives");
const treasureCountDisplay = document.getElementById("treasure-count")
const blackoutScreen = document.getElementById("blackout-screen");

//* Game variables
let playerPosition = 0; // Position where player starts
let monsterPosition = gameArea.clientWidth - 50;
let dangerZones = []; // Danger spots where monster can wake up
let lives = 3;
let treasures = []; // Array to hold treasure positions
let treasureNum = 3;
let treasuresCollected = 0;
let gameOver = false;
let gameWon = false;
const dangerZoneRange = 30; // Range to activate danger zone
const closeRange = 25; // Range considered close to monster in px

//* Roll limit variables
let rollCount = 0; // Counter for rolls
const maxRolls = 10; // Set the roll limit to 10

//* Event Listener to start game when button is clicked
startButton.addEventListener("click", startGame);

//* Event listener to call rollDice function when "clicked"
rollButton.addEventListener("click", rollDice)

resetButton.addEventListener("click", resetGame);

function startGame(){ // function to start game

    // Trigger blackout effect
    blackoutScreen.style.display = "block";
    blackoutScreen.style.opacity = "1";

    // Reset body background color to match the blackout
    document.body.classList.add('blackout-bg');
    message.classList.remove("d-none");
    message.classList.remove("alert", "alert-info");
    message.textContent = "";

    setTimeout(() => {
        document.body.style.backgroundImage = "none";
        title.textContent = "";
        startButton.classList.add("d-none")

        // Fade out blackout screen and start background fade-in
        blackoutScreen.style.opacity = "0";
        

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

            dangerZones = generateDangerZones(4, gameArea.clientWidth); // Generate 4 danger zones
            // console.log(dangerZones); // Debug to see the generated danger zones

            placeTreasure();
        }, 800);
    }, 500);
}

function isValidPosition(position, existingPositions) {
    const buffer = 50; // Minimum distance between treasures
    return !existingPositions.some(pos => Math.abs(position - pos) < buffer);
}

function placeTreasure() {
    treasures = [];
    const gameAreaWidth = gameArea.clientWidth;
    const maxPosition = gameAreaWidth - 10; // Prevent treasure from touching the right edge

    for (let i = 0; i < treasureNum; i++) {
        let treasurePosition;

        do {
            treasurePosition = Math.floor(Math.random() * (maxPosition / 10)) * 10;
        } while (!isValidPosition(treasurePosition, dangerZones) || !isValidPosition(treasurePosition, treasures));

        // Add the treasure position to the array
        treasures.push(treasurePosition);

        // Create and place the treasure element in the game area
        let treasureElement = document.createElement('div');
        treasureElement.classList.add('treasure', 'fade-in');
        treasureElement.style.left = `${treasurePosition}px`;
        gameArea.appendChild(treasureElement);
    }
}

function respawnTreasure() {
    if (treasuresCollected < treasureNum) {
        setTimeout(() => {
            placeTreasure(); // Call the function to place new treasures
        }, 5000); // Wait 5 seconds before respawning
    }
}

function generateDangerZones(numZones, gameWidth) { // function to generate danger zones


    const zones = new Set();

    while (zones.size < numZones) {
        const position = Math.floor(Math.random() * (gameWidth / 10)) * 10;
        if (!zones.has(position) && isValidPosition(position, treasures)) {
            zones.add(position);
        }
    }

    // Create red markers in the game area
    zones.forEach(zonePosition => {
        let marker = document.createElement('div'); // Create a new div for each zone
        marker.classList.add('danger-zone'); // Give it the red danger zone class
        marker.style.left = `${zonePosition}px`; // Position it in the game area
        gameArea.appendChild(marker); // Add it to the game area
    });

    return Array.from(zones);
}

function winGame(){ // function to win game
    rollButton.style.display = "none"; // Hide roll button
    dice.classList.add("d-none");
    gameOver = true; // Make sure game is over
    gameWon = true; // Mark the game as won
    resetButton.classList.remove("d-none");
    resetButton.style.display = "";

    if (lives === 3) {
        message.textContent = "";
        message.textContent = "You evaded the monster with no problems. You win!!!";
        resetTreasures();
        resetDangerZones();
    } else {
        message.textContent = "";
        message.textContent = "Whew!! That was close... but you made it out!!!! You win!!!";
        resetTreasures();
        resetDangerZones();
    }
}

function rollDice() { // function to roll dice after rollButton is clicked
    
    if (gameOver) {
        if (lives <= 0) resetGameState();
        return; // Stop the function if the game is over
    } 
    // Increment the roll count
    rollCount++;

    // Check if the roll count exceeds the limit
    if (rollCount > maxRolls) {
        wakeUpMonster(); // Startle the monster if limit is hit
        return;
    }

    

    // Show rolling animation
    dice.classList.add("rolling");

    dice.style.fontSize = "40px";
    dice.style.borderRadius = "2px solid #000";
    dice.classList.add("text-light");

    setTimeout(() => {
        
        dice.classList.remove("rolling"); // Stop the rolling animation
        const diceRoll = Math.floor(Math.random() * 6) + 1; // Generate dice roll
        dice.textContent = diceRoll; // Update dice display with rolled number

        movePlayer(diceRoll);
        moveMonster(diceRoll);

        // Add the bounce effect after rolling
        dice.classList.add("bounce");
        setTimeout(() => {
            dice.classList.remove("bounce", "fade-in"); // Remove bounce effect after it finishes
        }, 500);
        
    }, 1000);
}

function movePlayer(diceRoll) { // function to move player after dice is rolled
    
    message.textContent = `You rolled a ${diceRoll}. Let's keep on pushing...`;

    playerPosition += diceRoll * 15; // Move the player by 15px per dice roll
    player.style.left = playerPosition + "px";

    // Check if the player is close to any treasure
    treasures.forEach((treasurePosition, index) => {
        if(Math.abs(playerPosition - treasurePosition) <= 20) {
            collectTreasure(index); // all the collect function and pass the treasure's index
        }
    })

    // Check if player goes beyond the right edge without collecting the treasure
    if (playerPosition > gameArea.clientWidth) {
        if (treasuresCollected === 0) {
            // Player has not collected treasure, reset position and treasure
            message.textContent = "Oh no! You missed the treasure! Starting over...";
            
            // Reset player position and treasure positions
            playerPosition = 0;
            player.style.left = playerPosition + "px";
            
            // Clear existing treasures from the game area
            resetTreasures();

            // Redistribute treasure in random positions
            placeTreasure();

            return;
        } else {
            playerPosition = gameArea.clientWidth; // Stop at the edge if treasure is collected
        }
    }

    if (playerPosition > gameArea.clientWidth) {
        playerPosition = gameArea.clientWidth; // Stop at the edge
    };

    player.style.left = playerPosition + "px"; // Update player's postion
    
    
    if (dangerZones.includes(playerPosition)) {
        
        if (lives > 1) { // Allow waking the monster but only if lives are greater than 1
            wakeUpMonster();
            
        } else {
            // Reset game state if no lives left
            if (gameOver) resetGame();
        }
    } 

    // Check if the player is near a danger zone
    dangerZones.forEach(dangerZonePosition => {
        if (Math.abs(playerPosition - dangerZonePosition) <= dangerZoneRange) {
            wakeUpMonster(); // Activate the danger zone if player is close
        }
    });


    if (playerPosition >= gameArea.clientWidth && treasuresCollected >= 2) {
        winGame();
    } 
    
}

function createDangerZoneMarkers() {
    dangerZones.forEach(zone => {
        let marker = document.createElement('div');
        marker.classList.add('danger-zone');
        marker.style.left = `${zone}px`;
        gameArea.appendChild(marker);
    });
}

function increaseMonsterSpeed() {
    monsterSpeed +=1;
}

function moveMonster(diceRoll) {
    if (gameOver) return;

    // Calculate monster's speed based on distance from player
    const relativeDistanceSpeed = calculateMonsterSpeed();
    
    // Check whether the monster should move left or right
    let movementDirection = playerPosition > monsterPosition ? 1 : -1;

    // Calculate the movement based on dice roll and speed
    let newMonsterPosition = monsterPosition + movementDirection * diceRoll * (5 + relativeDistanceSpeed * 10);
    
    // Apply boundary constraints to prevent the monster from moving off-screen
    newMonsterPosition = applyBoundaryConstraints(newMonsterPosition);

    // Update the monster's position visually
    updateMonsterPosition(newMonsterPosition);
}

// Helper function to calculate monster speed based on distance from player
function calculateMonsterSpeed() {
    return Math.abs(playerPosition - monsterPosition) / gameArea.clientWidth;
}

// Helper function to apply boundary constraints (prevent moving off-screen)
function applyBoundaryConstraints(position) {
    if (position < 0) {
        return 0;
    } else if (position > gameArea.clientWidth - monster.offsetWidth) {
        return gameArea.clientWidth - monster.offsetWidth;
    }
    return position;
}

// Update the monster's position on the screen
function updateMonsterPosition(newPosition) {
    monsterPosition = newPosition;
    monster.style.left = newPosition + "px"; // Update the CSS to reflect the new position
}

function collectTreasure(index){ // function to collect treasure when landed on treasure zone
    rollCount = 0;
    treasuresCollected += 1;

    // Find the treasure element in the game area using the index
    let treasureElement = document.querySelectorAll('.treasure')[index];
    
    // Remove the treasure from the game area (disappear)
    treasureElement.remove();

    // Remove the treasure from the treasures array
    treasures.splice(index, 1);

    message.classList.add("alert", "alert-info");
    message.textContent = "";
    treasureCountDisplay.style.display = "block";
    rollButton.disabled = true;
    setTimeout(() => {
        treasureCountDisplay.textContent = `Treasures Collected: ${treasuresCollected}/4`
        treasure.style.display = "none";
        rollButton.disabled = false;
        message.textContent = `You found the treasure! Now LET'S GET OUT OF HERE`;
    }, 1000)
}

function wakeUpMonster(){ // function to wake up monster if player land on danger zones
    debugger
    rollCount = 0
    lives -= 1;
    livesDisplay.innerText = `Lives: ${lives}`;
    message.textContent = `Uh Ohh! You've starlted the monster!! You have ${lives} lives left.`;
    rollButton.disabled = true;
    
    if (lives <= 0) {
        gameOver = true;
        message.textContent = `Awww man!! You woke up the monster!!!`
        dice.classList.add("d-none");
        rollButton.style.display = "none"
        resetButton.style.display = ""; 
        resetButton.classList.remove("d-none");
    } else if (lives <= 0 && treasuresCollected < 2) {
        gameOver = true;
        message.textContent = `You almost had it. You woke the up the monster!!! `
        dice.classList.add("d-none");
        rollButton.style.display = "none"
        resetButton.style.display = ""; 
        resetButton.classList.remove("d-none");
    } else {
        setTimeout(() => {
            rollButton.disabled = false;
        }, 500)
        return;
    }
}

function resetGame() { // Reset game function
    resetGameState();
}

function resetGameState() { // function to reset the game state of elements variables
    blackoutScreen.style.display = "none";  
    blackoutScreen.style.opacity = "0";     
    playerPosition = 0;
    player.style.left = playerPosition + "px";
    monsterPosition = 0;
    monster.style.right = monsterPosition + "px";
    monster.style.left = "auto";
    rollButton.style.display = "";
    message.classList.remove("alert", "alert-info");
    treasure.style.display = "block";
    message.textContent = 'Roll the dice to start!';

    lives = 3;
    treasuresCollected = 0;
    rollCount = 0; // Reset the roll counter
    livesDisplay.textContent = `Lives: ${lives}`;
    treasureCountDisplay.style.display = "";
    treasureCountDisplay.textContent = `Treasures Collected: ${treasuresCollected}/4`;

    resetButton.style.display = "none";
    title.textContent = "Do Not Disturb!";

    gameOver = false;

    dice.classList.remove("d-none");

    rollButton.disabled = false;
    rollButton.removeEventListener("click", rollDice);
    rollButton.addEventListener("click", rollDice)
    message.classList.add("alert", "alert-info");
    
    // Clear old treasures and create new ones
    resetTreasures();
    resetDangerZones(); 
    placeTreasure();

    generateDangerZones(4, gameArea.clientWidth);

}

function resetTreasures() {
    let oldTreasures = document.querySelectorAll(".treasure");
    oldTreasures.forEach(treasure => {
        treasure.remove(); // Remove old treasures
    });
    treasures = []; // Clear the treasure positions array
}

function resetDangerZones() {
    let oldZones = document.querySelectorAll(".danger-zone");

    oldZones.forEach(zone => {
        zone.remove(); // Remove old danger zones
    });
    dangerZones = []; // Clear the danger zones array
}
