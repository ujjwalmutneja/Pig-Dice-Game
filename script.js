/**
 * Pig Game - Enhanced Version
 * A dice rolling game where players take turns accumulating points
 * First player to reach the winning score wins!
 */

// Game Configuration
const GAME_CONFIG = {
    WINNING_SCORE: 50,
    DICE_FACES: 6,
    ANIMATION_DURATION: 300
};

// Game State
class GameState {
    constructor() {
        this.scores = [0, 0];
        this.currentScore = 0;
        this.activePlayer = 0;
        this.isPlaying = true;
        this.gameHistory = [];
    }

    reset() {
        this.scores = [0, 0];
        this.currentScore = 0;
        this.activePlayer = 0;
        this.isPlaying = true;
        this.gameHistory = [];
    }

    switchPlayer() {
        this.currentScore = 0;
        this.activePlayer = this.activePlayer === 0 ? 1 : 0;
    }

    addToHistory(action, player, value) {
        this.gameHistory.push({
            action,
            player: player + 1,
            value,
            timestamp: Date.now()
        });
    }
}



// DOM Elements
const elements = {
    score0: document.querySelector('#score--0'),
    score1: document.querySelector('#score--1'),
    current0: document.querySelector('#current--0'),
    current1: document.querySelector('#current--1'),
    player0: document.querySelector('.player--0'),
    player1: document.querySelector('.player--1'),
    name0: document.querySelector('#name--0'),
    name1: document.querySelector('#name--1'),
    dice: document.querySelector('.dice'),
    btnRoll: document.querySelector('.btn--roll'),
    btnHold: document.querySelector('.btn--hold'),
    btnNew: document.querySelector('.btn--new')
};

// Game instance
const game = new GameState();

// Utility Functions
const playSound = (soundType) => {
    // Audio feedback (you can add actual sound files later)
    try {
        const audio = new Audio(`sounds/${soundType}.mp3`);
        audio.play().catch(() => {
            // Fallback: visual feedback only
            console.log(`Sound: ${soundType}`);
        });
    } catch (error) {
        // Silent fallback
    }
};

const addAnimation = (element, animationClass) => {
    element.classList.add(animationClass);
    setTimeout(() => {
        element.classList.remove(animationClass);
    }, GAME_CONFIG.ANIMATION_DURATION);
};

const updateUI = () => {
    // Update scores
    elements.score0.textContent = game.scores[0];
    elements.score1.textContent = game.scores[1];
    
    // Update current scores
    elements.current0.textContent = game.activePlayer === 0 ? game.currentScore : 0;
    elements.current1.textContent = game.activePlayer === 1 ? game.currentScore : 0;
    
    // Update active player styling
    elements.player0.classList.toggle('player--active', game.activePlayer === 0);
    elements.player1.classList.toggle('player--active', game.activePlayer === 1);
    
    // Update button states
    elements.btnRoll.disabled = !game.isPlaying;
    elements.btnHold.disabled = !game.isPlaying || game.currentScore === 0;
};

const showDice = (diceValue) => {
    elements.dice.classList.remove('hidden');
    elements.dice.src = `dice-${diceValue}.png`;
    elements.dice.alt = `Dice showing ${diceValue}`;
    addAnimation(elements.dice, 'dice-roll');
};

const hideDice = () => {
    elements.dice.classList.add('hidden');
};

const switchPlayer = () => {
    game.switchPlayer();
    updateUI();
    playSound('switch');
};

const declareWinner = () => {
    const winner = game.activePlayer;
    game.isPlaying = false;
    
    // Add winner styling
    document.querySelector(`.player--${winner}`)
        .classList.add('player--winner');
    
    // Update UI
    updateUI();
    hideDice();
    
    // Play victory sound
    playSound('victory');
    
    // Add to history
    game.addToHistory('win', winner, game.scores[winner]);
    
    // Show celebration message
    setTimeout(() => {
        alert(`🎉 ${elements[`name${winner}`].textContent} wins with ${game.scores[winner]} points!`);
    }, 100);
};

const initializeGame = () => {
    game.reset();
    
    // Reset UI
    elements.score0.textContent = 0;
    elements.score1.textContent = 0;
    elements.current0.textContent = 0;
    elements.current1.textContent = 0;
    
    // Remove all player states
    elements.player0.classList.remove('player--winner', 'player--active');
    elements.player1.classList.remove('player--winner', 'player--active');
    
    // Set initial active player
    elements.player0.classList.add('player--active');
    
    // Hide dice
    hideDice();
    
    // Update UI
    updateUI();
    
    playSound('newgame');
};

// Event Handlers
const handleRollDice = () => {
    if (!game.isPlaying) return;
    
    const diceValue = Math.trunc(Math.random() * GAME_CONFIG.DICE_FACES) + 1;
    
    // Show dice with animation
    showDice(diceValue);
    
    // Add to history
    game.addToHistory('roll', game.activePlayer, diceValue);
    
    if (diceValue !== 1) {
        // Add to current score
        game.currentScore += diceValue;
        updateUI();
        playSound('roll');
    } else {
        // Player loses turn
        playSound('lose');
        addAnimation(elements[`current${game.activePlayer}`], 'shake');
        
        setTimeout(() => {
            switchPlayer();
        }, 500);
    }
};

const handleHold = () => {
    if (!game.isPlaying || game.currentScore === 0) return;
    
    // Add current score to total
    game.scores[game.activePlayer] += game.currentScore;
    
    // Add to history
    game.addToHistory('hold', game.activePlayer, game.currentScore);
    
    // Check for winner
    if (game.scores[game.activePlayer] >= GAME_CONFIG.WINNING_SCORE) {
        declareWinner();
        return;
    }
    
    // Switch player
    playSound('hold');
    switchPlayer();
};

// Event Listeners
elements.btnRoll.addEventListener('click', handleRollDice);
elements.btnHold.addEventListener('click', handleHold);
elements.btnNew.addEventListener('click', initializeGame);

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (!game.isPlaying) return;
    
    switch (e.key) {
        case ' ':
        case 'Enter':
            e.preventDefault();
            handleRollDice();
            break;
        case 'h':
        case 'H':
            e.preventDefault();
            handleHold();
            break;
        case 'n':
        case 'N':
            e.preventDefault();
            initializeGame();
            break;
    }
});

// Player name customization
elements.name0.addEventListener('click', () => {
    const newName = prompt('Enter Player 1 name:', elements.name0.textContent);
    if (newName && newName.trim()) {
        elements.name0.textContent = newName.trim();
    }
});

elements.name1.addEventListener('click', () => {
    const newName = prompt('Enter Player 2 name:', elements.name1.textContent);
    if (newName && newName.trim()) {
        elements.name1.textContent = newName.trim();
    }
});

// Initialize game on load
initializeGame();