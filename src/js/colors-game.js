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

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="colors-game">
                <div class="colors-header">
                    <div class="target-color" style="background: ${this.targetColor.hex}">
                        <span>Zoek alles wat</span>
                        <strong>${this.targetColor.name}</strong>
                        <span>is!</span>
                    </div>
                    <div class="colors-score">
                        Gevonden: ${this.found}/${this.total}
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

            // Update score
            this.container.querySelector('.colors-score').textContent = `Gevonden: ${this.found}/${this.total}`;

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

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        setTimeout(() => {
            if (this.container) {
                const celebrationEl = document.createElement('div');
                celebrationEl.className = 'colors-celebration';
                celebrationEl.innerHTML = `
                    <div class="colors-celebration-content">
                        <h2>🎨 Geweldig! 🎨</h2>
                        <p>Je hebt alles gevonden dat ${this.targetColor.name.toLowerCase()} is!</p>
                        <button class="colors-play-again-btn" id="colors-play-again">Andere kleur</button>
                    </div>
                `;
                this.container.appendChild(celebrationEl);

                document.getElementById('colors-play-again').addEventListener('click', () => {
                    this.reset();
                });
            }
        }, 500);
    }
};

window.ColorsGame = ColorsGame;
