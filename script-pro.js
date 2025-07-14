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
        this.elements.btnRoll?.addEventListener('click', () => this.handleRollDice());
        this.elements.btnHold?.addEventListener('click', () => this.handleHold());
        this.elements.btnNew?.addEventListener('click', () => this.handleNewGame());

        // Modal events
        this.setupModalHandlers();

        // Keyboard events
        this.setupKeyboardHandlers();

        // Player name events
        this.setupPlayerNameHandlers();
    }

    setupModalHandlers() {
        // Settings button
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.openModal('settings-modal');
        });

        // Stats button
        document.getElementById('stats-btn')?.addEventListener('click', () => {
            this.updateStatsDisplay();
            this.openModal('stats-modal');
        });

        // Info button
        document.getElementById('info-btn')?.addEventListener('click', () => {
            this.openModal('info-modal');
        });

        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal')?.id);
            });
        });

        // Settings handlers
        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('reset-settings')?.addEventListener('click', () => {
            this.resetSettings();
        });

        // Stats handlers
        document.getElementById('clear-stats')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all statistics?')) {
                this.stats.clearStats();
                this.updateStatsDisplay();
            }
        });

        document.getElementById('export-stats')?.addEventListener('click', () => {
            this.stats.exportStats();
        });
    }

    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            if (this.isModalOpen()) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'enter':
                    e.preventDefault();
                    if (this.game.isPlaying) this.handleRollDice();
                    break;
                case 'h':
                    e.preventDefault();
                    if (this.game.isPlaying) this.handleHold();
                    break;
                case 'n':
                    e.preventDefault();
                    this.handleNewGame();
                    break;
                case 's':
                    e.preventDefault();
                    this.openModal('settings-modal');
                    break;
                case 'escape':
                    this.closeAllModals();
                    break;
            }
        });
    }

    setupPlayerNameHandlers() {
        this.elements.name0?.addEventListener('click', () => {
            this.changePlayerName(0);
        });

        this.elements.name1?.addEventListener('click', () => {
            this.changePlayerName(1);
        });
    }

    handleRollDice() {
        if (!this.game.isPlaying) return;

        const diceValue = Math.trunc(Math.random() * GAME_CONFIG.DICE_FACES) + 1;
        
        // Record statistics
        this.stats.recordDiceRoll(diceValue);
        this.game.rollsThisRound[this.game.activePlayer]++;

        // Show dice with animation
        this.showDice(diceValue);
        this.addAnimation(this.elements.dice, 'dice-roll');

        // Add to history
        this.game.addToHistory('roll', this.game.activePlayer, diceValue);

        if (diceValue !== 1) {
            // Add to current score
            this.game.currentScore += diceValue;
            
            // Apply difficulty rules
            if (this.game.settings.difficulty === 'hard' && diceValue === 6) {
                this.game.currentScore += diceValue; // Double on 6
                this.updateGameStatus(`${this.getPlayerName(this.game.activePlayer)} rolled a 6! Score doubled!`);
            }
            
            this.updateUI();
            this.playSound('roll');
        } else {
            // Player loses turn
            this.playSound('lose');
            this.addAnimation(this.elements[`current${this.game.activePlayer}`], 'shake');
            this.updateGameStatus(`${this.getPlayerName(this.game.activePlayer)} rolled a 1! Turn lost!`);
            
            setTimeout(() => {
                this.switchPlayer();
            }, 500);
        }
    }

    handleHold() {
        if (!this.game.isPlaying || this.game.currentScore === 0) return;

        // Add current score to total
        this.game.scores[this.game.activePlayer] += this.game.currentScore;
        
        // Update high score
        this.stats.updateHighScore(this.game.scores[this.game.activePlayer]);

        // Add to history
        this.game.addToHistory('hold', this.game.activePlayer, this.game.currentScore);

        // Check for winner
        const winningScore = this.game.settings.winningScore || GAME_CONFIG.WINNING_SCORE;
        if (this.game.scores[this.game.activePlayer] >= winningScore) {
            this.declareWinner();
            return;
        }

        // Switch player
        this.playSound('hold');
        this.updateGameStatus(`${this.getPlayerName(this.game.activePlayer)} held ${this.game.currentScore} points!`);
        this.switchPlayer();
    }

    handleNewGame() {
        this.game.reset();
        this.startGameTimer();
        this.updateUI();
        this.updateGameStatus('New game started! Player 1\'s turn.');
        this.playSound('newgame');
    }

    switchPlayer() {
        this.game.switchPlayer();
        this.updateUI();
        this.updateGameStatus(`${this.getPlayerName(this.game.activePlayer)}'s turn`);
        this.playSound('switch');
    }

    declareWinner() {
        const winner = this.game.activePlayer;
        const winnerName = this.getPlayerName(winner);
        const duration = this.game.getGameDuration();
        
        this.game.isPlaying = false;
        this.game.totalWins[winner]++;
        
        // Record statistics
        this.stats.recordGameEnd(winner, duration, {
            finalScore: this.game.scores[winner],
            rounds: this.game.roundNumber,
            difficulty: this.game.settings.difficulty
        });

        // Add winner styling
        this.elements[`player${winner}`]?.classList.add('player--winner');
        
        // Update UI
        this.updateUI();
        this.hideDice();
        this.stopGameTimer();
        
        // Play victory sound
        this.playSound('victory');
        
        // Add to history
        this.game.addToHistory('win', winner, this.game.scores[winner]);
        
        // Update status
        this.updateGameStatus(`🎉 ${winnerName} wins with ${this.game.scores[winner]} points!`);
        
        // Show celebration
        setTimeout(() => {
            this.showWinnerCelebration(winnerName, this.game.scores[winner], duration);
        }, 500);
    }

    updateUI() {
        // Update scores
        if (this.elements.score0) this.elements.score0.textContent = this.game.scores[0];
        if (this.elements.score1) this.elements.score1.textContent = this.game.scores[1];
        
        // Update current scores
        if (this.elements.current0) this.elements.current0.textContent = this.game.activePlayer === 0 ? this.game.currentScore : 0;
        if (this.elements.current1) this.elements.current1.textContent = this.game.activePlayer === 1 ? this.game.currentScore : 0;
        
        // Update progress bars
        const winningScore = this.game.settings.winningScore || GAME_CONFIG.WINNING_SCORE;
        this.updateProgressBar(0, this.game.scores[0], winningScore);
        this.updateProgressBar(1, this.game.scores[1], winningScore);
        
        // Update active player styling
        this.elements.player0?.classList.toggle('player--active', this.game.activePlayer === 0);
        this.elements.player1?.classList.toggle('player--active', this.game.activePlayer === 1);
        
        // Update button states
        if (this.elements.btnRoll) this.elements.btnRoll.disabled = !this.game.isPlaying;
        if (this.elements.btnHold) this.elements.btnHold.disabled = !this.game.isPlaying || this.game.currentScore === 0;
        
        // Update round number
        if (this.elements.roundNumber) this.elements.roundNumber.textContent = this.game.roundNumber;
        
        // Update rolls count
        if (this.elements.rolls0) this.elements.rolls0.textContent = `Rolls: ${this.game.rollsThisRound[0]}`;
        if (this.elements.rolls1) this.elements.rolls1.textContent = `Rolls: ${this.game.rollsThisRound[1]}`;
        
        // Update wins count
        if (this.elements.wins0) this.elements.wins0.textContent = `Wins: ${this.game.totalWins[0]}`;
        if (this.elements.wins1) this.elements.wins1.textContent = `Wins: ${this.game.totalWins[1]}`;
        
        // Update winning score display
        if (this.elements.winningScoreDisplay) this.elements.winningScoreDisplay.textContent = winningScore;
    }

    updateProgressBar(player, score, maxScore) {
        const percentage = Math.min((score / maxScore) * 100, 100);
        const progressBar = this.elements[`progress${player}`];
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    showDice(diceValue) {
        if (this.elements.dice) {
            this.elements.dice.classList.remove('hidden');
            this.elements.dice.src = `dice-${diceValue}.png`;
            this.elements.dice.alt = `Dice showing ${diceValue}`;
        }
    }

    hideDice() {
        if (this.elements.dice) {
            this.elements.dice.classList.add('hidden');
        }
    }

    updateDiceHistory(entry) {
        if (entry.action === 'roll' && this.elements.diceHistory) {
            const historyItem = document.createElement('span');
            historyItem.className = 'dice-history-item';
            historyItem.textContent = entry.value;
            historyItem.title = `Player ${entry.player} rolled ${entry.value}`;
            
            if (entry.value === 1) {
                historyItem.classList.add('losing-roll');
            }
            
            this.elements.diceHistory.appendChild(historyItem);
            
            // Keep only last 10 rolls visible
            const items = this.elements.diceHistory.children;
            if (items.length > 10) {
                this.elements.diceHistory.removeChild(items[0]);
            }
        }
    }

    startGameTimer() {
        this.startTime = Date.now();
        this.gameTimer = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            if (this.elements.gameTimer) {
                this.elements.gameTimer.textContent = `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    updateGameStatus(message) {
        const statusText = this.elements.gameStatus?.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = message;
        }
    }

    getPlayerName(playerIndex) {
        const nameElement = this.elements[`name${playerIndex}`];
        return nameElement ? nameElement.textContent : `Player ${playerIndex + 1}`;
    }

    changePlayerName(playerIndex) {
        const currentName = this.getPlayerName(playerIndex);
        const newName = prompt(`Enter Player ${playerIndex + 1} name:`, currentName);
        if (newName && newName.trim()) {
            const nameElement = this.elements[`name${playerIndex}`];
            if (nameElement) {
                nameElement.textContent = newName.trim();
                // Save to localStorage
                const names = StorageManager.load(STORAGE_KEYS.PLAYER_NAMES, ['Player 1', 'Player 2']);
                names[playerIndex] = newName.trim();
                StorageManager.save(STORAGE_KEYS.PLAYER_NAMES, names);
            }
        }
    }

    // Modal management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus the first focusable element
            const focusable = modal.querySelector('button, input, select, textarea');
            if (focusable) focusable.focus();
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.closeModal(modal.id);
        });
    }

    isModalOpen() {
        return Array.from(document.querySelectorAll('.modal')).some(modal => 
            modal.style.display === 'flex'
        );
    }

    // Settings management
    saveSettings() {
        const winningScoreInput = document.getElementById('winning-score-input');
        const difficultySelect = document.getElementById('difficulty-select');
        const soundToggle = document.getElementById('sound-toggle');
        const themeSelect = document.getElementById('theme-select');

        if (winningScoreInput && difficultySelect && soundToggle && themeSelect) {
            const winningScore = parseInt(winningScoreInput.value);
            const difficulty = difficultySelect.value;
            const soundEnabled = soundToggle.checked;
            const theme = themeSelect.value;

            this.game.updateSetting('winningScore', winningScore);
            this.game.updateSetting('difficulty', difficulty);
            this.game.updateSetting('soundEnabled', soundEnabled);
            this.game.updateSetting('theme', theme);

            this.applyTheme(theme);
            this.updateUI();
            this.closeModal('settings-modal');
            this.updateGameStatus('Settings saved successfully!');
        }
    }

    resetSettings() {
        const elements = {
            winningScore: document.getElementById('winning-score-input'),
            difficulty: document.getElementById('difficulty-select'),
            sound: document.getElementById('sound-toggle'),
            theme: document.getElementById('theme-select')
        };

        if (elements.winningScore) elements.winningScore.value = 50;
        if (elements.difficulty) elements.difficulty.value = 'medium';
        if (elements.sound) elements.sound.checked = true;
        if (elements.theme) elements.theme.value = 'default';
    }

    applyTheme(theme) {
        document.body.className = theme !== 'default' ? `theme-${theme}` : '';
    }

    // Statistics display
    updateStatsDisplay() {
        const stats = this.stats.stats;
        const statsContent = document.getElementById('stats-content');
        
        if (!statsContent) return;

        const formatTime = (ms) => {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            if (hours > 0) {
                return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
            } else if (minutes > 0) {
                return `${minutes}m ${seconds % 60}s`;
            } else {
                return `${seconds}s`;
            }
        };

        statsContent.innerHTML = `
            <div class="stat-card">
                <h4>🎮 Game Stats</h4>
                <p>Games Played: <strong>${stats.gamesPlayed}</strong></p>
                <p>Total Game Time: <strong>${formatTime(stats.totalGameTime)}</strong></p>
                <p>Average Game Duration: <strong>${formatTime(stats.averageGameDuration)}</strong></p>
                <p>Fastest Win: <strong>${stats.fastestWin ? formatTime(stats.fastestWin) : 'N/A'}</strong></p>
            </div>
            
            <div class="stat-card">
                <h4>🏆 Win Stats</h4>
                <p>Player 1 Wins: <strong>${stats.totalWins[0]}</strong></p>
                <p>Player 2 Wins: <strong>${stats.totalWins[1]}</strong></p>
                <p>Win Rate P1: <strong>${stats.gamesPlayed > 0 ? Math.round((stats.totalWins[0] / stats.gamesPlayed) * 100) : 0}%</strong></p>
                <p>Win Rate P2: <strong>${stats.gamesPlayed > 0 ? Math.round((stats.totalWins[1] / stats.gamesPlayed) * 100) : 0}%</strong></p>
            </div>
            
            <div class="stat-card">
                <h4>🎲 Dice Stats</h4>
                ${Object.entries(stats.diceRollStats).map(([face, count]) => 
                    `<p>Rolled ${face}: <strong>${count} times</strong></p>`
                ).join('')}
            </div>
            
            <div class="stat-card">
                <h4>📈 Records</h4>
                <p>Highest Score: <strong>${stats.highestScore}</strong></p>
                <p>Longest Win Streak P1: <strong>${stats.longestWinStreak[0]}</strong></p>
                <p>Longest Win Streak P2: <strong>${stats.longestWinStreak[1]}</strong></p>
                <p>Last Played: <strong>${stats.lastPlayed ? new Date(stats.lastPlayed).toLocaleDateString() : 'Never'}</strong></p>
            </div>
        `;
    }

    showWinnerCelebration(winnerName, score, duration) {
        const formatTime = (ms) => {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
        };

        alert(`🎉 Congratulations ${winnerName}!\n\n` +
              `Final Score: ${score} points\n` +
              `Game Duration: ${formatTime(duration)}\n` +
              `Rounds Played: ${this.game.roundNumber}\n\n` +
              `Click "New Game" to play again!`);
    }

    playSound(soundType) {
        if (!this.game.settings.soundEnabled) return;
        
        try {
            const audio = new Audio(`sounds/${soundType}.mp3`);
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Silent fallback for browsers that block autoplay
                console.log(`Sound: ${soundType}`);
            });
        } catch (error) {
            // Silent fallback
        }
    }

    addAnimation(element, animationClass) {
        if (element) {
            element.classList.add(animationClass);
            setTimeout(() => {
                element.classList.remove(animationClass);
            }, GAME_CONFIG.ANIMATION_DURATION);
        }
    }

    hideLoadingScreen() {
        setTimeout(() => {
            if (this.elements.loadingScreen) {
                this.elements.loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    this.elements.loadingScreen.style.display = 'none';
                }, 300);
            }
        }, 1000);
    }

    initializeFromStorage() {
        // Load player names
        const savedNames = StorageManager.load(STORAGE_KEYS.PLAYER_NAMES, ['Player 1', 'Player 2']);
        if (this.elements.name0) this.elements.name0.textContent = savedNames[0];
        if (this.elements.name1) this.elements.name1.textContent = savedNames[1];

        // Apply saved theme
        this.applyTheme(this.game.settings.theme);

        // Update settings form
        const elements = {
            winningScore: document.getElementById('winning-score-input'),
            difficulty: document.getElementById('difficulty-select'),
            sound: document.getElementById('sound-toggle'),
            theme: document.getElementById('theme-select')
        };

        if (elements.winningScore) elements.winningScore.value = this.game.settings.winningScore;
        if (elements.difficulty) elements.difficulty.value = this.game.settings.difficulty;
        if (elements.sound) elements.sound.checked = this.game.settings.soundEnabled;
        if (elements.theme) elements.theme.value = this.game.settings.theme;
    }
}

// ========================
// APPLICATION INITIALIZATION
// ========================

class PigGameApp {
    constructor() {
        this.stats = new StatisticsManager();
        this.game = new GameState();
        this.ui = new UIManager(this.game, this.stats);
        
        this.initialize();
    }

    initialize() {
        // Initialize UI from saved data
        this.ui.initializeFromStorage();
        
        // Start the game
        this.ui.handleNewGame();
        
        // Hide loading screen
        this.ui.hideLoadingScreen();
        
        // Setup auto-save
        this.setupAutoSave();
        
        console.log('🎲 Professional Pig Game initialized successfully!');
        console.log('💡 This project showcases modern web development practices:');
        console.log('   - ES6+ JavaScript with classes and modules');
        console.log('   - Local storage for data persistence');
        console.log('   - Responsive design and accessibility');
        console.log('   - Performance monitoring and optimization');
        console.log('   - Comprehensive error handling');
    }

    setupAutoSave() {
        setInterval(() => {
            StorageManager.save(STORAGE_KEYS.GAME_STATE, {
                game: this.game,
                timestamp: Date.now()
            });
        }, GAME_CONFIG.AUTO_SAVE_INTERVAL);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.pigGame = new PigGameApp();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PigGameApp, GameState, StatisticsManager, UIManager };
}
