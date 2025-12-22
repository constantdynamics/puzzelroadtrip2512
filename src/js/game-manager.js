// Game Manager - Handles switching between different games
// Supports: Puzzle, Memory, Drawing

const GameManager = {
    currentGame: 'puzzle', // 'puzzle', 'memory', 'drawing'
    gameContainer: null,

    games: {
        puzzle: {
            name: 'Puzzel',
            emoji: '🧩',
            description: 'Maak de puzzel af!'
        },
        memory: {
            name: 'Memory',
            emoji: '🃏',
            description: 'Vind alle paren!'
        },
        drawing: {
            name: 'Tekenen',
            emoji: '🎨',
            description: 'Teken iets moois!'
        }
    },

    init() {
        // Create game container if it doesn't exist
        this.gameContainer = document.getElementById('game-container');
        if (!this.gameContainer) {
            // Wrap puzzle area in game container
            const puzzleArea = document.querySelector('.puzzle-area');
            if (puzzleArea) {
                this.gameContainer = document.createElement('div');
                this.gameContainer.id = 'game-container';
                this.gameContainer.className = 'game-container';
                puzzleArea.parentNode.insertBefore(this.gameContainer, puzzleArea);
                this.gameContainer.appendChild(puzzleArea);

                // Create other game containers
                const memoryContainer = document.createElement('div');
                memoryContainer.id = 'memory-container';
                memoryContainer.className = 'game-screen memory-container';
                memoryContainer.style.display = 'none';
                this.gameContainer.appendChild(memoryContainer);

                const drawingContainer = document.createElement('div');
                drawingContainer.id = 'drawing-container';
                drawingContainer.className = 'game-screen drawing-container';
                drawingContainer.style.display = 'none';
                this.gameContainer.appendChild(drawingContainer);
            }
        }
    },

    switchGame(gameName) {
        if (!this.games[gameName]) {
            console.error('Unknown game:', gameName);
            return;
        }

        this.currentGame = gameName;
        console.log('Switching to game:', gameName);

        // Hide all game screens
        const puzzleArea = document.querySelector('.puzzle-area');
        const pieceTray = document.getElementById('piece-tray');
        const memoryContainer = document.getElementById('memory-container');
        const drawingContainer = document.getElementById('drawing-container');

        if (puzzleArea) puzzleArea.style.display = 'none';
        if (pieceTray) pieceTray.style.display = 'none';
        if (memoryContainer) memoryContainer.style.display = 'none';
        if (drawingContainer) drawingContainer.style.display = 'none';

        // Show selected game
        switch (gameName) {
            case 'puzzle':
                if (puzzleArea) puzzleArea.style.display = 'flex';
                // Show piece tray if in manual mode
                if (typeof TabletApp !== 'undefined' && TabletApp.state?.puzzleMode === 'manual') {
                    if (pieceTray) pieceTray.style.display = 'block';
                }
                break;

            case 'memory':
                if (memoryContainer) {
                    memoryContainer.style.display = 'flex';
                    if (typeof MemoryGame !== 'undefined') {
                        MemoryGame.init('memory-container');
                    }
                }
                break;

            case 'drawing':
                if (drawingContainer) {
                    drawingContainer.style.display = 'flex';
                    if (typeof DrawingGame !== 'undefined') {
                        DrawingGame.init('drawing-container');
                    }
                }
                break;
        }

        // Play sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playClick();
        }

        // Update header if exists
        this.updateHeader();
    },

    updateHeader() {
        const game = this.games[this.currentGame];
        const indicator = document.getElementById('puzzle-indicator');
        if (indicator && this.currentGame !== 'puzzle') {
            indicator.textContent = `${game.emoji} ${game.name}`;
        }
    },

    getCurrentGame() {
        return this.currentGame;
    },

    getGameInfo(gameName) {
        return this.games[gameName || this.currentGame];
    },

    // Settings for memory game
    setMemoryDifficulty(level) {
        if (typeof MemoryGame !== 'undefined') {
            MemoryGame.setDifficulty(level);
            if (this.currentGame === 'memory') {
                MemoryGame.reset();
            }
        }
    },

    setMemoryTheme(theme) {
        if (typeof MemoryGame !== 'undefined') {
            MemoryGame.setTheme(theme);
            if (this.currentGame === 'memory') {
                MemoryGame.reset();
            }
        }
    },

    resetCurrentGame() {
        switch (this.currentGame) {
            case 'puzzle':
                if (typeof TabletApp !== 'undefined') {
                    TabletApp.resetCurrentPuzzle();
                }
                break;
            case 'memory':
                if (typeof MemoryGame !== 'undefined') {
                    MemoryGame.reset();
                }
                break;
            case 'drawing':
                if (typeof DrawingGame !== 'undefined') {
                    DrawingGame.clear();
                    DrawingGame.newPrompt();
                }
                break;
        }
    }
};

// Make globally available
window.GameManager = GameManager;
