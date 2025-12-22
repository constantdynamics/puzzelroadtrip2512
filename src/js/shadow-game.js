// Shadow Matching Game for Toddlers
// Drag items to match their shadows

const ShadowGame = {
    container: null,
    items: [],
    matched: 0,
    total: 0,
    draggedItem: null,
    dragOffset: { x: 0, y: 0 },

    // Items with their emoji representations
    itemSets: {
        animals: [
            { emoji: '🐘', name: 'olifant' },
            { emoji: '🦒', name: 'giraffe' },
            { emoji: '🐕', name: 'hond' },
            { emoji: '🐈', name: 'kat' },
            { emoji: '🐰', name: 'konijn' },
            { emoji: '🦋', name: 'vlinder' },
            { emoji: '🐢', name: 'schildpad' },
            { emoji: '🐟', name: 'vis' },
            { emoji: '🦆', name: 'eend' },
            { emoji: '🐓', name: 'haan' }
        ],
        vehicles: [
            { emoji: '🚗', name: 'auto' },
            { emoji: '🚌', name: 'bus' },
            { emoji: '✈️', name: 'vliegtuig' },
            { emoji: '🚂', name: 'trein' },
            { emoji: '🚢', name: 'boot' },
            { emoji: '🚁', name: 'helikopter' },
            { emoji: '🚲', name: 'fiets' },
            { emoji: '🏍️', name: 'motor' },
            { emoji: '🚜', name: 'tractor' },
            { emoji: '🚒', name: 'brandweer' }
        ],
        objects: [
            { emoji: '⭐', name: 'ster' },
            { emoji: '❤️', name: 'hart' },
            { emoji: '🌙', name: 'maan' },
            { emoji: '🌳', name: 'boom' },
            { emoji: '🏠', name: 'huis' },
            { emoji: '⚽', name: 'bal' },
            { emoji: '🎈', name: 'ballon' },
            { emoji: '🍎', name: 'appel' },
            { emoji: '🌻', name: 'bloem' },
            { emoji: '☂️', name: 'paraplu' }
        ]
    },

    difficulties: {
        easy: 3,
        medium: 4,
        hard: 6
    },

    difficulty: 'easy',
    currentSet: 'animals',

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Shadow game container not found');
            return;
        }
        this.reset();
    },

    setDifficulty(level) {
        if (this.difficulties[level]) {
            this.difficulty = level;
        }
    },

    setTheme(theme) {
        if (this.itemSets[theme]) {
            this.currentSet = theme;
        }
    },

    reset() {
        this.matched = 0;
        this.draggedItem = null;

        const itemCount = this.difficulties[this.difficulty];
        const allItems = [...this.itemSets[this.currentSet]];

        // Shuffle and pick items
        const shuffled = allItems.sort(() => Math.random() - 0.5);
        this.items = shuffled.slice(0, itemCount).map((item, index) => ({
            ...item,
            id: index,
            matched: false
        }));

        this.total = this.items.length;
        this.render();
    },

    render() {
        if (!this.container) return;

        // Create shuffled order for draggable items
        const dragOrder = [...this.items].sort(() => Math.random() - 0.5);

        this.container.innerHTML = `
            <div class="shadow-game">
                <div class="shadow-header">
                    <h2>🔍 Sleep naar de schaduw!</h2>
                    <div class="shadow-score">
                        ${this.matched}/${this.total} gevonden
                    </div>
                </div>
                <div class="shadow-play-area">
                    <div class="shadow-targets">
                        ${this.items.map(item => `
                            <div class="shadow-target ${item.matched ? 'matched' : ''}"
                                 data-id="${item.id}">
                                <div class="shadow-silhouette">${item.emoji}</div>
                                ${item.matched ? `<div class="shadow-revealed">${item.emoji}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="shadow-items">
                        ${dragOrder.filter(item => !item.matched).map(item => `
                            <div class="shadow-draggable" data-id="${item.id}">
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
        const draggables = this.container.querySelectorAll('.shadow-draggable');

        draggables.forEach(el => {
            // Touch events
            el.addEventListener('touchstart', (e) => this.startDrag(e, el), { passive: false });

            // Mouse events
            el.addEventListener('mousedown', (e) => this.startDrag(e, el));
        });

        // Global move and end events
        document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });
        document.addEventListener('touchend', (e) => this.endDrag(e));
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));
    },

    startDrag(e, element) {
        e.preventDefault();

        const id = parseInt(element.dataset.id);
        this.draggedItem = { element, id };

        const rect = element.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        this.dragOffset = {
            x: clientX - rect.left - rect.width / 2,
            y: clientY - rect.top - rect.height / 2
        };

        element.classList.add('dragging');
        element.style.position = 'fixed';
        element.style.zIndex = '1000';
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

        // Check if dropped on matching target
        const targets = this.container.querySelectorAll('.shadow-target');
        let matched = false;

        targets.forEach(target => {
            const rect = target.getBoundingClientRect();
            const targetId = parseInt(target.dataset.id);

            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom &&
                targetId === this.draggedItem.id) {

                // Match found!
                matched = true;
                this.items[targetId].matched = true;
                this.matched++;

                if (typeof AudioManager !== 'undefined') {
                    AudioManager.playPiecePlaced();
                }

                if (this.matched === this.total) {
                    setTimeout(() => this.onGameComplete(), 300);
                }
            }
        });

        if (!matched) {
            // Return to original position
            this.draggedItem.element.classList.remove('dragging');
            this.draggedItem.element.style.position = '';
            this.draggedItem.element.style.zIndex = '';
            this.draggedItem.element.style.left = '';
            this.draggedItem.element.style.top = '';
        }

        this.draggedItem = null;
        this.render(); // Re-render to update state
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        const celebrationEl = document.createElement('div');
        celebrationEl.className = 'shadow-celebration';
        celebrationEl.innerHTML = `
            <div class="shadow-celebration-content">
                <h2>🌟 Super! 🌟</h2>
                <p>Je hebt alle schaduwen gevonden!</p>
                <button class="shadow-play-again-btn" id="shadow-play-again">Opnieuw spelen</button>
            </div>
        `;
        this.container.appendChild(celebrationEl);

        document.getElementById('shadow-play-again').addEventListener('click', () => {
            this.reset();
        });
    }
};

window.ShadowGame = ShadowGame;
