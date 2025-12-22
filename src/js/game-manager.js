// Game Manager - Handles switching between different games
// Supports: Puzzle, Memory, Drawing/Pictionary, Shapes, Music, CarWash, Colors, Counting,
//           Shadow, SizeSort, ColorSort, Sorting, Farm, DressUp, Cooking

const GameManager = {
    currentGame: 'puzzle',
    gameContainer: null,
    initialized: {},

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
            name: 'Pictionary',
            emoji: '🎨',
            description: 'Teken en raad!'
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
        console.log('GameManager initializing...');
        this.gameContainer = document.getElementById('game-container');

        if (!this.gameContainer) {
            console.error('Game container not found!');
            return;
        }

        console.log('GameManager initialized, container found');
    },

    switchGame(gameName) {
        console.log('=== GameManager.switchGame START ===');
        console.log('Switching to game:', gameName);

        if (!this.games[gameName]) {
            console.error('Unknown game:', gameName);
            return;
        }

        this.currentGame = gameName;

        // Hide ALL game screens
        const puzzleScreen = document.getElementById('puzzle-screen');
        const pieceTray = document.getElementById('piece-tray');

        console.log('Found puzzle-screen:', !!puzzleScreen);

        // Hide puzzle screen
        if (puzzleScreen) {
            puzzleScreen.style.display = 'none';
            console.log('Puzzle screen hidden');
        }
        if (pieceTray) {
            pieceTray.style.display = 'none';
        }

        // Hide all other game containers
        const allGames = [
            'memory', 'drawing', 'shapes', 'music', 'carwash', 'colors', 'counting',
            'shadow', 'sizesort', 'colorsort', 'sorting', 'farm', 'dressup', 'cooking'
        ];

        allGames.forEach(game => {
            const container = document.getElementById(`${game}-container`);
            if (container) {
                container.style.display = 'none';
            }
        });

        // Show selected game
        console.log('Now showing game:', gameName);

        if (gameName === 'puzzle') {
            if (puzzleScreen) {
                puzzleScreen.style.display = 'flex';
                console.log('Puzzle screen shown');
            }
            if (typeof TabletApp !== 'undefined' && TabletApp.state?.puzzleMode === 'manual') {
                if (pieceTray) pieceTray.style.display = 'block';
            }
        } else {
            const container = document.getElementById(`${gameName}-container`);
            console.log(`Looking for container: ${gameName}-container, found:`, !!container);
            if (container) {
                container.style.display = 'flex';
                console.log(`Container ${gameName}-container shown`);
                this.initGame(gameName, container.id);
            } else {
                console.error('Container not found for game:', gameName);
            }
        }

        // Play sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playClick();
        }

        // Update header
        this.updateHeader();
        console.log('=== GameManager.switchGame END ===');
    },

    initGame(gameName, containerId) {
        console.log('Initializing game:', gameName, 'in container:', containerId);

        // Only init once per session, or re-init if needed
        switch (gameName) {
            case 'memory':
                if (typeof MemoryGame !== 'undefined') MemoryGame.init(containerId);
                break;
            case 'drawing':
                if (typeof DrawingGame !== 'undefined') DrawingGame.init(containerId);
                break;
            case 'shapes':
                if (typeof ShapesGame !== 'undefined') ShapesGame.init(containerId);
                break;
            case 'music':
                if (typeof MusicGame !== 'undefined') MusicGame.init(containerId);
                break;
            case 'carwash':
                if (typeof CarWashGame !== 'undefined') CarWashGame.init(containerId);
                break;
            case 'colors':
                if (typeof ColorsGame !== 'undefined') ColorsGame.init(containerId);
                break;
            case 'counting':
                if (typeof CountingGame !== 'undefined') CountingGame.init(containerId);
                break;
            case 'shadow':
                if (typeof ShadowGame !== 'undefined') ShadowGame.init(containerId);
                break;
            case 'sizesort':
                if (typeof SizeSortGame !== 'undefined') SizeSortGame.init(containerId);
                break;
            case 'colorsort':
                if (typeof ColorSortGame !== 'undefined') ColorSortGame.init(containerId);
                break;
            case 'sorting':
                if (typeof SortingGame !== 'undefined') SortingGame.init(containerId);
                break;
            case 'farm':
                if (typeof FarmGame !== 'undefined') FarmGame.init(containerId);
                break;
            case 'dressup':
                if (typeof DressUpGame !== 'undefined') DressUpGame.init(containerId);
                break;
            case 'cooking':
                if (typeof CookingGame !== 'undefined') CookingGame.init(containerId);
                break;
        }

        this.initialized[gameName] = true;
    },

    updateHeader() {
        const game = this.games[this.currentGame];
        const indicator = document.getElementById('puzzle-indicator');
        if (indicator) {
            if (this.currentGame === 'puzzle') {
                // Reset to puzzle indicator
                const puzzleIndex = TabletApp?.state?.currentPuzzleIndex || 0;
                indicator.textContent = `Puzzel ${puzzleIndex + 1}/25`;
            } else {
                indicator.textContent = `${game.emoji} ${game.name}`;
            }
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

    // Settings for drawing/pictionary game
    setDrawingCategory(category) {
        if (typeof DrawingGame !== 'undefined') {
            DrawingGame.setCategory(category);
            if (this.currentGame === 'drawing') {
                DrawingGame.newPrompt();
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
