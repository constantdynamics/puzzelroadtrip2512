// Game Manager - Handles switching between different games
// Supports: Puzzle, Memory, Drawing, Shapes, Music, CarWash, Colors, Counting,
//           Shadow, SizeSort, ColorSort, Sorting, Farm, DressUp, Cooking

const GameManager = {
    currentGame: 'puzzle',
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
        },
        shapes: {
            name: 'Vormen',
            emoji: '🔷',
            description: 'Sorteer de vormen!'
        },
        music: {
            name: 'Muziek',
            emoji: '🎹',
            description: 'Maak muziek!'
        },
        carwash: {
            name: 'Auto wassen',
            emoji: '🚗',
            description: 'Was de auto schoon!'
        },
        colors: {
            name: 'Kleuren',
            emoji: '🌈',
            description: 'Zoek de juiste kleur!'
        },
        counting: {
            name: 'Tellen',
            emoji: '🔢',
            description: 'Hoeveel zijn er?'
        },
        shadow: {
            name: 'Schaduw',
            emoji: '🔍',
            description: 'Zoek de schaduw!'
        },
        sizesort: {
            name: 'Grootte',
            emoji: '📏',
            description: 'Sorteer groot naar klein!'
        },
        colorsort: {
            name: 'Kleuren Sorteren',
            emoji: '🎨',
            description: 'Sorteer op kleur!'
        },
        sorting: {
            name: 'Sorteren',
            emoji: '🗂️',
            description: 'Wat hoort waar?'
        },
        farm: {
            name: 'Boerderij',
            emoji: '🚜',
            description: 'Voer de dieren!'
        },
        dressup: {
            name: 'Aankleden',
            emoji: '👗',
            description: 'Kleed het poppetje aan!'
        },
        cooking: {
            name: 'Koken',
            emoji: '👨‍🍳',
            description: 'Maak een recept!'
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

                // Create containers for all games
                const gameContainers = [
                    'memory', 'drawing', 'shapes', 'music', 'carwash', 'colors', 'counting',
                    'shadow', 'sizesort', 'colorsort', 'sorting', 'farm', 'dressup', 'cooking'
                ];

                gameContainers.forEach(game => {
                    const container = document.createElement('div');
                    container.id = `${game}-container`;
                    container.className = `game-screen ${game}-container`;
                    container.style.display = 'none';
                    this.gameContainer.appendChild(container);
                });
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

        if (puzzleArea) puzzleArea.style.display = 'none';
        if (pieceTray) pieceTray.style.display = 'none';

        // Hide all game containers
        const allContainers = [
            'memory', 'drawing', 'shapes', 'music', 'carwash', 'colors', 'counting',
            'shadow', 'sizesort', 'colorsort', 'sorting', 'farm', 'dressup', 'cooking'
        ];
        allContainers.forEach(game => {
            const container = document.getElementById(`${game}-container`);
            if (container) container.style.display = 'none';
        });

        // Show selected game
        switch (gameName) {
            case 'puzzle':
                if (puzzleArea) puzzleArea.style.display = 'flex';
                if (typeof TabletApp !== 'undefined' && TabletApp.state?.puzzleMode === 'manual') {
                    if (pieceTray) pieceTray.style.display = 'block';
                }
                break;

            case 'memory':
                this.showGameContainer('memory', () => {
                    if (typeof MemoryGame !== 'undefined') MemoryGame.init('memory-container');
                });
                break;

            case 'drawing':
                this.showGameContainer('drawing', () => {
                    if (typeof DrawingGame !== 'undefined') DrawingGame.init('drawing-container');
                });
                break;

            case 'shapes':
                this.showGameContainer('shapes', () => {
                    if (typeof ShapesGame !== 'undefined') ShapesGame.init('shapes-container');
                });
                break;

            case 'music':
                this.showGameContainer('music', () => {
                    if (typeof MusicGame !== 'undefined') MusicGame.init('music-container');
                });
                break;

            case 'carwash':
                this.showGameContainer('carwash', () => {
                    if (typeof CarWashGame !== 'undefined') CarWashGame.init('carwash-container');
                });
                break;

            case 'colors':
                this.showGameContainer('colors', () => {
                    if (typeof ColorsGame !== 'undefined') ColorsGame.init('colors-container');
                });
                break;

            case 'counting':
                this.showGameContainer('counting', () => {
                    if (typeof CountingGame !== 'undefined') CountingGame.init('counting-container');
                });
                break;

            case 'shadow':
                this.showGameContainer('shadow', () => {
                    if (typeof ShadowGame !== 'undefined') ShadowGame.init('shadow-container');
                });
                break;

            case 'sizesort':
                this.showGameContainer('sizesort', () => {
                    if (typeof SizeSortGame !== 'undefined') SizeSortGame.init('sizesort-container');
                });
                break;

            case 'colorsort':
                this.showGameContainer('colorsort', () => {
                    if (typeof ColorSortGame !== 'undefined') ColorSortGame.init('colorsort-container');
                });
                break;

            case 'sorting':
                this.showGameContainer('sorting', () => {
                    if (typeof SortingGame !== 'undefined') SortingGame.init('sorting-container');
                });
                break;

            case 'farm':
                this.showGameContainer('farm', () => {
                    if (typeof FarmGame !== 'undefined') FarmGame.init('farm-container');
                });
                break;

            case 'dressup':
                this.showGameContainer('dressup', () => {
                    if (typeof DressUpGame !== 'undefined') DressUpGame.init('dressup-container');
                });
                break;

            case 'cooking':
                this.showGameContainer('cooking', () => {
                    if (typeof CookingGame !== 'undefined') CookingGame.init('cooking-container');
                });
                break;
        }

        // Play sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playClick();
        }

        // Update header
        this.updateHeader();
    },

    showGameContainer(gameName, initCallback) {
        const container = document.getElementById(`${gameName}-container`);
        if (container) {
            container.style.display = 'flex';
            if (initCallback) initCallback();
        }
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

    // Settings for shapes game
    setShapesDifficulty(level) {
        if (typeof ShapesGame !== 'undefined') {
            ShapesGame.setDifficulty(level);
            if (this.currentGame === 'shapes') {
                ShapesGame.reset();
            }
        }
    },

    // Settings for colors game
    setColorsDifficulty(level) {
        if (typeof ColorsGame !== 'undefined') {
            ColorsGame.setDifficulty(level);
            if (this.currentGame === 'colors') {
                ColorsGame.reset();
            }
        }
    },

    // Settings for counting game
    setCountingDifficulty(level) {
        if (typeof CountingGame !== 'undefined') {
            CountingGame.setDifficulty(level);
            if (this.currentGame === 'counting') {
                CountingGame.reset();
            }
        }
    },

    // Settings for shadow game
    setShadowDifficulty(level) {
        if (typeof ShadowGame !== 'undefined') {
            ShadowGame.setDifficulty(level);
            if (this.currentGame === 'shadow') {
                ShadowGame.reset();
            }
        }
    },

    // Settings for size sort game
    setSizeSortDifficulty(level) {
        if (typeof SizeSortGame !== 'undefined') {
            SizeSortGame.setDifficulty(level);
            if (this.currentGame === 'sizesort') {
                SizeSortGame.reset();
            }
        }
    },

    // Settings for color sort game
    setColorSortDifficulty(level) {
        if (typeof ColorSortGame !== 'undefined') {
            ColorSortGame.setDifficulty(level);
            if (this.currentGame === 'colorsort') {
                ColorSortGame.reset();
            }
        }
    },

    // Settings for sorting game
    setSortingDifficulty(level) {
        if (typeof SortingGame !== 'undefined') {
            SortingGame.setDifficulty(level);
            if (this.currentGame === 'sorting') {
                SortingGame.reset();
            }
        }
    },

    // Settings for farm game
    setFarmDifficulty(level) {
        if (typeof FarmGame !== 'undefined') {
            FarmGame.setDifficulty(level);
            if (this.currentGame === 'farm') {
                FarmGame.reset();
            }
        }
    },

    // Settings for dress up game
    setDressUpDifficulty(level) {
        if (typeof DressUpGame !== 'undefined') {
            DressUpGame.setDifficulty(level);
            if (this.currentGame === 'dressup') {
                DressUpGame.reset();
            }
        }
    },

    // Settings for cooking game
    setCookingDifficulty(level) {
        if (typeof CookingGame !== 'undefined') {
            CookingGame.setDifficulty(level);
            if (this.currentGame === 'cooking') {
                CookingGame.reset();
            }
        }
    },

    resetCurrentGame() {
        switch (this.currentGame) {
            case 'puzzle':
                if (typeof TabletApp !== 'undefined') TabletApp.resetCurrentPuzzle();
                break;
            case 'memory':
                if (typeof MemoryGame !== 'undefined') MemoryGame.reset();
                break;
            case 'drawing':
                if (typeof DrawingGame !== 'undefined') {
                    DrawingGame.clear();
                    DrawingGame.newPrompt();
                }
                break;
            case 'shapes':
                if (typeof ShapesGame !== 'undefined') ShapesGame.reset();
                break;
            case 'music':
                // Music doesn't need reset
                break;
            case 'carwash':
                if (typeof CarWashGame !== 'undefined') CarWashGame.reset();
                break;
            case 'colors':
                if (typeof ColorsGame !== 'undefined') ColorsGame.reset();
                break;
            case 'counting':
                if (typeof CountingGame !== 'undefined') CountingGame.reset();
                break;
            case 'shadow':
                if (typeof ShadowGame !== 'undefined') ShadowGame.reset();
                break;
            case 'sizesort':
                if (typeof SizeSortGame !== 'undefined') SizeSortGame.reset();
                break;
            case 'colorsort':
                if (typeof ColorSortGame !== 'undefined') ColorSortGame.reset();
                break;
            case 'sorting':
                if (typeof SortingGame !== 'undefined') SortingGame.reset();
                break;
            case 'farm':
                if (typeof FarmGame !== 'undefined') FarmGame.reset();
                break;
            case 'dressup':
                if (typeof DressUpGame !== 'undefined') DressUpGame.reset();
                break;
            case 'cooking':
                if (typeof CookingGame !== 'undefined') CookingGame.reset();
                break;
        }
    }
};

// Make globally available
window.GameManager = GameManager;
