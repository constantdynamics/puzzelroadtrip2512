// Color Matching Game for Toddlers
// Tap all items of the target color

const ColorsGame = {
    container: null,
    targetColor: null,
    items: [],
    found: 0,
    total: 0,
    mistakes: 0,

    // Color definitions with items
    colors: {
        red: {
            name: 'Rood',
            hex: '#FF6B6B',
            items: ['🍎', '🍓', '🍒', '❤️', '🌹', '🎈', '🦀', '🍅', '🌶️', '🐞']
        },
        blue: {
            name: 'Blauw',
            hex: '#4D96FF',
            items: ['🐳', '🦋', '💎', '🫐', '🧢', '🌊', '🐬', '🔵', '🥏', '🧿']
        },
        yellow: {
            name: 'Geel',
            hex: '#FFD93D',
            items: ['🌟', '⭐', '🌻', '🍋', '🍌', '🐥', '☀️', '🌕', '🧀', '🔔']
        },
        green: {
            name: 'Groen',
            hex: '#6BCB77',
            items: ['🥒', '🥦', '🍀', '🌲', '🐸', '🥝', '🌿', '🍃', '🥬', '🐢']
        },
        orange: {
            name: 'Oranje',
            hex: '#FF8E53',
            items: ['🍊', '🥕', '🎃', '🦊', '🏀', '🥭', '🍑', '🧡', '🔶', '🐅']
        },
        purple: {
            name: 'Paars',
            hex: '#9B59B6',
            items: ['🍇', '🍆', '💜', '🔮', '🦄', '☂️', '🪻', '👾', '🌸', '🎵']
        }
    },

    difficulties: {
        easy: { targetItems: 3, distractors: 3 },
        medium: { targetItems: 4, distractors: 5 },
        hard: { targetItems: 5, distractors: 7 }
    },

    difficulty: 'easy',

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Colors game container not found');
            return;
        }
        this.reset();
    },

    setDifficulty(level) {
        if (this.difficulties[level]) {
            this.difficulty = level;
        }
    },

    reset() {
        this.found = 0;
        this.mistakes = 0;

        // Pick random target color
        const colorKeys = Object.keys(this.colors);
        const targetKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
        this.targetColor = { key: targetKey, ...this.colors[targetKey] };

        // Sync target color to remote via Firebase
        this.syncTargetColor();

        // Get difficulty settings
        const config = this.difficulties[this.difficulty];

        // Pick target items
        const shuffledTargetItems = [...this.targetColor.items].sort(() => Math.random() - 0.5);
        const targetItems = shuffledTargetItems.slice(0, config.targetItems).map(emoji => ({
            emoji,
            isTarget: true,
            isFound: false
        }));

        this.total = targetItems.length;

        // Pick distractor items from other colors
        const otherColors = colorKeys.filter(k => k !== targetKey);
        const distractorItems = [];

        for (let i = 0; i < config.distractors; i++) {
            const randomColor = otherColors[Math.floor(Math.random() * otherColors.length)];
            const colorData = this.colors[randomColor];
            const randomItem = colorData.items[Math.floor(Math.random() * colorData.items.length)];
            distractorItems.push({
                emoji: randomItem,
                isTarget: false,
                isFound: false
            });
        }

        // Combine and shuffle all items
        this.items = [...targetItems, ...distractorItems].sort(() => Math.random() - 0.5);

        this.render();
    },

    syncTargetColor() {
        // Sync to Firebase so remote can display the target color
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            TabletApp.roomRef.child('gameState').update({
                game: 'colors',
                targetColor: this.targetColor.key,
                targetColorName: this.targetColor.name,
                targetColorHex: this.targetColor.hex,
                found: this.found,
                total: this.total,
                timestamp: Date.now()
            });
        }
    },

    render() {
        if (!this.container) return;

        // Visual-only indicator (no text - parent reads from remote)
        this.container.innerHTML = `
            <div class="colors-game">
                <div class="colors-header">
                    <div class="target-color-indicator" style="background: ${this.targetColor.hex}">
                        <span class="target-color-emoji">🔍</span>
                    </div>
                    <div class="colors-progress">
                        <div class="colors-progress-bar">
                            <div class="colors-progress-fill" style="width: ${(this.found / this.total) * 100}%; background: ${this.targetColor.hex}"></div>
                        </div>
                        <div class="colors-progress-dots">
                            ${Array(this.total).fill(0).map((_, i) => `
                                <span class="progress-dot ${i < this.found ? 'filled' : ''}" style="background: ${i < this.found ? this.targetColor.hex : '#ddd'}">
                                    ${i < this.found ? '✓' : ''}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="colors-grid">
                    ${this.items.map((item, i) => `
                        <div class="color-item ${item.isFound ? 'found' : ''}"
                             data-index="${i}"
                             ${item.isFound ? 'style="opacity: 0.3; pointer-events: none;"' : ''}>
                            ${item.emoji}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.setupEvents();
    },

    setupEvents() {
        this.container.querySelectorAll('.color-item').forEach(item => {
            const tap = () => {
                const index = parseInt(item.dataset.index);
                this.tapItem(index, item);
            };

            item.addEventListener('touchstart', (e) => {
                e.preventDefault();
                tap();
            }, { passive: false });

            item.addEventListener('click', tap);
        });
    },

    tapItem(index, element) {
        const item = this.items[index];
        if (!item || item.isFound) return;

        if (item.isTarget) {
            // Correct!
            item.isFound = true;
            this.found++;

            element.classList.add('found', 'correct');

            if (typeof AudioManager !== 'undefined') {
                AudioManager.playPiecePlaced();
            }

            // Update visual progress (re-render to update progress bar)
            this.render();

            // Sync progress to remote
            this.syncProgress();

            if (this.found === this.total) {
                this.onGameComplete();
            }
        } else {
            // Wrong!
            this.mistakes++;

            element.classList.add('wrong');
            setTimeout(() => element.classList.remove('wrong'), 500);

            if (typeof AudioManager !== 'undefined') {
                AudioManager.playClick();
            }
        }
    },

    syncProgress() {
        // Sync progress to Firebase
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            TabletApp.roomRef.child('gameState').update({
                found: this.found,
                total: this.total,
                timestamp: Date.now()
            });
        }
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        // Sync completion to remote (no popup on tablet - child can't read)
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            TabletApp.roomRef.child('gameState').update({
                game: 'colors',
                completed: true,
                timestamp: Date.now()
            });
        }

        // Auto-reset after brief celebration
        setTimeout(() => {
            this.reset();
        }, 2000);
    }
};

window.ColorsGame = ColorsGame;
