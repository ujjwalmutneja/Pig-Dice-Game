# 🐷 Pig Dice Game - Enhanced Edition

A modern, interactive implementation of the classic Pig dice game with improved user experience, accessibility, and code quality.

## 🎮 Game Rules

- **Objective**: First player to reach 100 points wins
- **Rolling**: Add dice value to your current score
- **Holding**: Add current score to total and end turn
- **Risk**: Rolling a 1 loses all current points and ends your turn

## ✨ New Features & Improvements

### 🎯 Enhanced Gameplay
- **Configurable winning score** (default: 100 points, was 20)
- **Player name customization** - click on player names to change them
- **Game history tracking** - keeps track of all rolls and actions
- **Victory celebration** with visual and audio feedback

### ⌨️ Keyboard Controls
- **Space/Enter**: Roll dice
- **H**: Hold current score
- **N**: Start new game

### 🎨 Visual Enhancements
- **Modern glassmorphism design** with backdrop blur effects
- **Smooth animations** for dice rolls, player switches, and UI updates
- **Responsive design** that works on mobile devices
- **Active player indicator** with visual highlighting
- **Winner celebration** with trophy emoji and special styling

### ♿ Accessibility Improvements
- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus indicators** for better navigation
- **High contrast mode** support
- **Reduced motion** support for users with vestibular disorders

### 🛠️ Code Quality
- **Modern ES6+ JavaScript** with classes and proper structure
- **Error handling** and graceful fallbacks
- **Modular code organization** with separated concerns
- **Comprehensive documentation** and comments
- **Clean, maintainable codebase** following best practices

### 📱 Mobile Support
- **Responsive grid layout** that adapts to screen size
- **Touch-friendly controls** with proper sizing
- **Optimized typography** for mobile reading

### 🎵 Audio Features (Ready for Enhancement)
- **Sound effect framework** in place for:
  - Dice rolls
  - Player switches
  - Victory sounds
  - New game sounds
- Add sound files to `sounds/` directory to enable audio

## 🚀 Getting Started

1. Open `index.html` in your web browser
2. Click on player names to customize them
3. Use mouse clicks or keyboard shortcuts to play
4. First to 100 points wins!

## 📁 Project Structure

```
Dice-roll/
├── index.html          # Main game interface
├── style.css           # Enhanced styling with animations
├── script.js           # Improved game logic and features
├── dice-1.png          # Dice face images
├── dice-2.png
├── dice-3.png
├── dice-4.png
├── dice-5.png
├── dice-6.png
└── README.md           # This file
```

## 🎨 Customization

### Changing the Winning Score
Edit the `WINNING_SCORE` in the `GAME_CONFIG` object in `script.js`:

```javascript
const GAME_CONFIG = {
    WINNING_SCORE: 50, // Change to desired score
    DICE_FACES: 6,
    ANIMATION_DURATION: 300
};
```

### Adding Sound Effects
Create a `sounds/` directory and add these audio files:
- `roll.mp3` - For dice rolls
- `hold.mp3` - For holding scores
- `switch.mp3` - For player switches
- `victory.mp3` - For winning
- `newgame.mp3` - For starting new games
- `lose.mp3` - For rolling a 1

## 🌟 Future Enhancement Ideas

- [ ] **Multiplayer support** for more than 2 players
- [ ] **AI opponents** with different difficulty levels
- [ ] **Game statistics** and score tracking
- [ ] **Different game modes** (speed rounds, reverse scoring, etc.)
- [ ] **Tournament mode** with brackets
- [ ] **Online multiplayer** capability
- [ ] **Themes and customization** options
- [ ] **Progressive Web App** features for offline play

## 🐛 Bug Fixes from Original

- Fixed initialization issues with player states
- Improved error handling for DOM elements
- Better state management and consistency
- Fixed accessibility issues
- Resolved mobile layout problems

## 📝 Version History

### v2.0 (Enhanced Edition)
- Complete rewrite with modern JavaScript
- Added accessibility features
- Responsive mobile design
- Enhanced visual design
- Keyboard controls
- Player customization
- Improved code structure

### v1.0 (Original)
- Basic pig game functionality
- Simple styling
- Mouse-only controls

---

**Enjoy the game! 🎲🐷**
