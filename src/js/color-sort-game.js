// Color Sorting Game for Toddlers
// Sort items into matching colored bins
// Only using clearly colored items (WCAG compliant)

const ColorSortGame = {
    container: null,
    bins: [],
    items: [],
    sorted: 0,
    total: 0,
    draggedItem: null,

    // WCAG compliant colors with clearly colored items only
    colorData: {
        red: {
            name: 'Rood',
            hex: '#E53935',
            darkHex: '#B71C1C',
            items: ['🍎', '🍓', '❤️', '🍅', '🎈', '🌶️', '🍒']
        },
        blue: {
            name: 'Blauw',
            hex: '#1E88E5',
            darkHex: '#0D47A1',
            items: ['🐳', '💎', '🫐', '💧', '🧊', '🐟', '🔵']
        },
        yellow: {
            name: 'Geel',
            hex: '#FDD835',
            darkHex: '#F9A825',
            items: ['⭐', '🌻', '🍋', '🍌', '☀️', '🌽', '🟡']
        },
        green: {
            name: 'Groen',
            hex: '#43A047',
            darkHex: '#2E7D32',
            items: ['🥒', '🍀', '🥝', '🥦', '🥬', '🌲', '🟢']
        },
        orange: {
            name: 'Oranje',
            hex: '#FB8C00',
            darkHex: '#E65100',
            items: ['🍊', '🥕', '🎃', '🥭', '🏀', '🧡', '🟠']
        },
        purple: {
            name: 'Paars',
            hex: '#8E24AA',
            darkHex: '#6A1B9A',
            items: ['🍇', '🍆', '💜', '🔮', '🟣', '☂️', '🪻']
        }
    },

    difficulties: {
        easy: { colors: 2, itemsPerColor: 3 },
        medium: { colors: 3, itemsPerColor: 3 },
        hard: { colors: 4, itemsPerColor: 3 }
    },

    difficulty: 'easy',

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Color sort game container not found');
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
        this.sorted = 0;
        this.draggedItem = null;

        const config = this.difficulties[this.difficulty];
        const colorKeys = Object.keys(this.colorData);

        // Pick random colors
        const shuffledColors = [...colorKeys].sort(() => Math.random() - 0.5);
        const selectedColors = shuffledColors.slice(0, config.colors);

        // Create bins
        this.bins = selectedColors.map(colorKey => ({
            color: colorKey,
            ...this.colorData[colorKey],
            items: []
        }));

        // Create items for each color
        this.items = [];
        selectedColors.forEach(colorKey => {
            const colorInfo = this.colorData[colorKey];
            const shuffledItems = [...colorInfo.items].sort(() => Math.random() - 0.5);
            const selectedItems = shuffledItems.slice(0, config.itemsPerColor);

            selectedItems.forEach((emoji, i) => {
                this.items.push({
                    id: `${colorKey}-${i}`,
                    emoji,
                    color: colorKey,
                    sorted: false
                });
            });
        });

        // Shuffle all items
        this.items.sort(() => Math.random() - 0.5);
        this.total = this.items.length;

        this.render();
        this.syncGameState();
    },

    // Sync game state to Firebase for remote display
    syncGameState() {
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            TabletApp.roomRef.child('gameState').update({
                game: 'colorsort',
                sorted: this.sorted,
                total: this.total,
                completed: this.sorted === this.total,
                timestamp: Date.now()
            });
        }
    },

    render() {
        if (!this.container) return;

        const unsortedItems = this.items.filter(i => !i.sorted);

        this.container.innerHTML = `
            <div class="color-sort-game">
                <div class="color-sort-header">
                    <div class="color-sort-score">
                        ${this.sorted}/${this.total}
                    </div>
                </div>
                <div class="color-sort-area">
                    <div class="color-sort-bins">
                        ${this.bins.map(bin => `
                            <div class="color-sort-bin" data-color="${bin.color}"
                                 style="background: ${bin.hex}25; border-color: ${bin.hex}">
                                <div class="bin-label" style="background: ${bin.hex}; border: 3px solid ${bin.darkHex}">${bin.name}</div>
                                <div class="bin-contents">
                                    ${bin.items.map(emoji => `<span class="bin-item">${emoji}</span>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="color-sort-items">
                        ${unsortedItems.map(item => `
                            <div class="color-sort-item" data-id="${item.id}" data-color="${item.color}">
                                ${item.emoji}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.setupEvents();
    },

    setupEvents() {
        const items = this.container.querySelectorAll('.color-sort-item');

        items.forEach(el => {
            el.addEventListener('touchstart', (e) => this.startDrag(e, el), { passive: false });
            el.addEventListener('mousedown', (e) => this.startDrag(e, el));
        });

        document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });
        document.addEventListener('touchend', (e) => this.endDrag(e));
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));
    },

    startDrag(e, element) {
        e.preventDefault();

        const id = element.dataset.id;
        const item = this.items.find(i => i.id === id);
        if (!item || item.sorted) return;

        this.draggedItem = { element, id, item };

        const rect = element.getBoundingClientRect();
        element.classList.add('dragging');
        element.style.position = 'fixed';
        element.style.zIndex = '1000';

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        element.style.left = (clientX - rect.width / 2) + 'px';
        element.style.top = (clientY - rect.height / 2) + 'px';

        if (typeof AudioManager !== 'undefined') {
            AudioManager.playClick();
        }
    },

    onDrag(e) {
        if (!this.draggedItem) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = this.draggedItem.element.getBoundingClientRect();

        this.draggedItem.element.style.left = (clientX - rect.width / 2) + 'px';
        this.draggedItem.element.style.top = (clientY - rect.height / 2) + 'px';
    },

    endDrag(e) {
        if (!this.draggedItem) return;

        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

        // Check bins
        const bins = this.container.querySelectorAll('.color-sort-bin');

        bins.forEach(bin => {
            const rect = bin.getBoundingClientRect();
            const binColor = bin.dataset.color;

            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {

                if (binColor === this.draggedItem.item.color) {
                    // Correct!
                    this.draggedItem.item.sorted = true;
                    this.sorted++;

                    // Add to bin
                    const binData = this.bins.find(b => b.color === binColor);
                    if (binData) {
                        binData.items.push(this.draggedItem.item.emoji);
                    }

                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.playPiecePlaced();
                    }

                    // Sync progress to remote
                    this.syncGameState();

                    if (this.sorted === this.total) {
                        setTimeout(() => this.onGameComplete(), 300);
                    }
                } else {
                    // Wrong bin - shake
                    bin.classList.add('wrong');
                    setTimeout(() => bin.classList.remove('wrong'), 500);

                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.playClick();
                    }
                }
            }
        });

        // Reset
        this.draggedItem.element.classList.remove('dragging');
        this.draggedItem.element.style.position = '';
        this.draggedItem.element.style.zIndex = '';
        this.draggedItem.element.style.left = '';
        this.draggedItem.element.style.top = '';

        this.draggedItem = null;
        this.render();
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        const celebrationEl = document.createElement('div');
        celebrationEl.className = 'color-sort-celebration';
        celebrationEl.innerHTML = `
            <div class="color-sort-celebration-content">
                <h2>🌈 Super! 🌈</h2>
                <p>Alles op kleur!</p>
                <button class="color-sort-play-again-btn" id="color-sort-play-again">Opnieuw</button>
            </div>
        `;
        this.container.appendChild(celebrationEl);

        document.getElementById('color-sort-play-again').addEventListener('click', () => {
            this.reset();
        });
    }
};

window.ColorSortGame = ColorSortGame;
