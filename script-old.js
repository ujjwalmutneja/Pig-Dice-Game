/**
 * Professional Pig Game - Portfolio Version
 * A comprehensive dice rolling game showcasing advanced web development skills
 * 
 * Features:
 * - Modern ES6+ JavaScript with classes and modules
 * - Local storage for persistent data
 * - Statistics tracking and analytics
 * - Multiple game modes and difficulty levels
 * - Accessibility features and keyboard navigation
 * - Responsive design and smooth animations
 * - Error handling and performance optimization
 * 
 * @author Your Name
 * @version 3.0.0
 * @license MIT
 */

'use strict';

// ========================
// CONFIGURATION & CONSTANTS
// ========================

const GAME_CONFIG = {
    WINNING_SCORE: 50,
    DICE_FACES: 6,
    ANIMATION_DURATION: 300,
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    MAX_HISTORY_ENTRIES: 1000,
    DIFFICULTIES: {
        easy: { winScore: 30, specialRules: false },
        medium: { winScore: 50, specialRules: false },
        hard: { winScore: 100, specialRules: true } // Double on 6
    }
};

const STORAGE_KEYS = {
    GAME_STATE: 'pigGame_state',
    STATISTICS: 'pigGame_stats',
    SETTINGS: 'pigGame_settings',
    PLAYER_NAMES: 'pigGame_names'
};

const THEMES = {
    default: 'Default',
    dark: 'Dark Mode',
    colorful: 'Colorful'
};

// ========================
// UTILITY CLASSES
// ========================

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            return false;
        }
    }

    static load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
            return false;
        }
    }
}

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            gameLoads: 0,
            totalGameTime: 0,
            averageGameDuration: 0,
            diceRolls: 0,
            fastestWin: Infinity
        };
    }

    recordGameStart() {
        this.gameStartTime = performance.now();
        this.metrics.gameLoads++;
    }

    recordGameEnd() {
        if (this.gameStartTime) {
            const duration = performance.now() - this.gameStartTime;
            this.metrics.totalGameTime += duration;
            this.metrics.averageGameDuration = this.metrics.totalGameTime / this.metrics.gameLoads;
            this.metrics.fastestWin = Math.min(this.metrics.fastestWin, duration);
        }
    }

    recordDiceRoll() {
        this.metrics.diceRolls++;
    }

    getMetrics() {
        return { ...this.metrics };
    }
}

// ========================
// CORE GAME CLASSES
// ========================

class GameState extends EventEmitter {
    constructor() {
        super();
        this.reset();
        this.difficulty = 'medium';
        this.settings = this.loadSettings();
    }

    reset() {
        this.scores = [0, 0];
        this.currentScore = 0;
        this.activePlayer = 0;
        this.isPlaying = true;
        this.gameHistory = [];
        this.roundNumber = 1;
        this.rollsThisRound = [0, 0];
        this.gameStartTime = Date.now();
        this.totalWins = [0, 0];
        this.emit('gameReset');
    }

    switchPlayer() {
        this.currentScore = 0;
        this.rollsThisRound[this.activePlayer] = 0;
        this.activePlayer = this.activePlayer === 0 ? 1 : 0;
        this.roundNumber++;
        this.emit('playerSwitched', { activePlayer: this.activePlayer });
    }

    addToHistory(action, player, value, extraData = {}) {
        const entry = {
            id: Date.now() + Math.random(),
            action,
            player: player + 1,
            value,
            timestamp: Date.now(),
            round: this.roundNumber,
            ...extraData
        };
        
        this.gameHistory.push(entry);
        
        // Limit history size for performance
        if (this.gameHistory.length > GAME_CONFIG.MAX_HISTORY_ENTRIES) {
            this.gameHistory = this.gameHistory.slice(-GAME_CONFIG.MAX_HISTORY_ENTRIES);
        }
        
        this.emit('historyUpdated', entry);
    }

    getGameDuration() {
        return Date.now() - this.gameStartTime;
    }

    loadSettings() {
        return StorageManager.load(STORAGE_KEYS.SETTINGS, {
            soundEnabled: true,
            theme: 'default',
            difficulty: 'medium',
            winningScore: 50
        });
    }

    saveSettings() {
        StorageManager.save(STORAGE_KEYS.SETTINGS, this.settings);
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.emit('settingChanged', { key, value });
    }
}

class StatisticsManager {
    constructor() {
        this.stats = this.loadStats();
    }

    loadStats() {
        return StorageManager.load(STORAGE_KEYS.STATISTICS, {
            gamesPlayed: 0,
            totalWins: [0, 0],
            totalGameTime: 0,
            averageGameDuration: 0,
            highestScore: 0,
            longestWinStreak: [0, 0],
            currentWinStreak: [0, 0],
            diceRollStats: {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
            },
            averageRollsPerGame: 0,
            fastestWin: null,
            lastPlayed: null
        });
    }

    recordGameEnd(winner, duration, gameData) {
        this.stats.gamesPlayed++;
        this.stats.totalWins[winner]++;
        this.stats.totalGameTime += duration;
        this.stats.averageGameDuration = this.stats.totalGameTime / this.stats.gamesPlayed;
        this.stats.lastPlayed = Date.now();

        // Update win streaks
        this.stats.currentWinStreak[winner]++;
        this.stats.currentWinStreak[1 - winner] = 0;
        this.stats.longestWinStreak[winner] = Math.max(
            this.stats.longestWinStreak[winner],
            this.stats.currentWinStreak[winner]
        );

        // Record fastest win
        if (!this.stats.fastestWin || duration < this.stats.fastestWin) {
            this.stats.fastestWin = duration;
        }

        this.saveStats();
    }

    recordDiceRoll(value) {
        this.stats.diceRollStats[value]++;
        this.saveStats();
    }

    updateHighScore(score) {
        this.stats.highestScore = Math.max(this.stats.highestScore, score);
        this.saveStats();
    }

    saveStats() {
        StorageManager.save(STORAGE_KEYS.STATISTICS, this.stats);
    }

    clearStats() {
        this.stats = {
            gamesPlayed: 0,
            totalWins: [0, 0],
            totalGameTime: 0,
            averageGameDuration: 0,
            highestScore: 0,
            longestWinStreak: [0, 0],
            currentWinStreak: [0, 0],
            diceRollStats: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
            averageRollsPerGame: 0,
            fastestWin: null,
            lastPlayed: null
        };
        this.saveStats();
    }

    exportStats() {
        const exportData = {
            ...this.stats,
            exportDate: new Date().toISOString(),
            version: '3.0.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pig-game-stats-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// ========================
// UI MANAGEMENT
// ========================

class UIManager {
    constructor(game, stats) {
        this.game = game;
        this.stats = stats;
        this.elements = this.initializeElements();
        this.setupEventListeners();
        this.gameTimer = null;
        this.startTime = Date.now();
    }

    initializeElements() {
        return {
            // Player elements
            score0: document.querySelector('#score--0'),
            score1: document.querySelector('#score--1'),
            current0: document.querySelector('#current--0'),
            current1: document.querySelector('#current--1'),
            progress0: document.querySelector('#progress--0'),
            progress1: document.querySelector('#progress--1'),
            player0: document.querySelector('.player--0'),
            player1: document.querySelector('.player--1'),
            name0: document.querySelector('#name--0'),
            name1: document.querySelector('#name--1'),
            wins0: document.querySelector('#wins--0'),
            wins1: document.querySelector('#wins--1'),
            rolls0: document.querySelector('#rolls--0'),
            rolls1: document.querySelector('#rolls--1'),

            // Game controls
            dice: document.querySelector('#game-dice'),
            btnRoll: document.querySelector('#btn-roll'),
            btnHold: document.querySelector('#btn-hold'),
            btnNew: document.querySelector('#btn-new'),

            // UI elements
            gameTimer: document.querySelector('#game-timer'),
            roundNumber: document.querySelector('#round-number'),
            gameStatus: document.querySelector('#game-status'),
            diceHistory: document.querySelector('#dice-history'),
            winningScoreDisplay: document.querySelector('#winning-score-display'),

            // Modal elements
            settingsModal: document.querySelector('#settings-modal'),
            statsModal: document.querySelector('#stats-modal'),
            infoModal: document.querySelector('#info-modal'),
            
            // Loading screen
            loadingScreen: document.querySelector('#loading-screen')
        };
    }

    setupEventListeners() {
        // Game events
        this.game.on('gameReset', () => this.updateUI());
        this.game.on('playerSwitched', () => this.updateUI());
        this.game.on('historyUpdated', (entry) => this.updateDiceHistory(entry));

        // Button events
        this.elements.btnRoll.addEventListener('click', () => this.handleRollDice());
        this.elements.btnHold.addEventListener('click', () => this.handleHold());
        this.elements.btnNew.addEventListener('click', () => this.handleNewGame());

        // Modal events
        this.setupModalHandlers();

        // Keyboard events
        this.setupKeyboardHandlers();

        // Player name events
        this.setupPlayerNameHandlers();
    }

    // ... (continuing with more methods)



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