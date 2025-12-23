// Shadow Matching Game for Toddlers
// Drag items to match their shadows
// Configurable count and category

const ShadowGame = {
    container: null,
    items: [],
    matched: 0,
    total: 0,
    draggedItem: null,
    dragOffset: { x: 0, y: 0 },

    // Items with their emoji representations
    itemSets: {
        animals: {
            name: 'Dieren',
            emoji: '🐘',
            items: [
                { emoji: '🐘', name: 'olifant' },
                { emoji: '🦒', name: 'giraffe' },
                { emoji: '🐕', name: 'hond' },
                { emoji: '🐈', name: 'kat' },
                { emoji: '🐰', name: 'konijn' },
                { emoji: '🐢', name: 'schildpad' },
                { emoji: '🐟', name: 'vis' },
                { emoji: '🦆', name: 'eend' },
                { emoji: '🐓', name: 'haan' },
                { emoji: '🐷', name: 'varken' }
            ]
        },
        vehicles: {
            name: 'Voertuigen',
            emoji: '🚗',
            items: [
                { emoji: '🚗', name: 'auto' },
                { emoji: '🚌', name: 'bus' },
                { emoji: '✈️', name: 'vliegtuig' },
                { emoji: '🚂', name: 'trein' },
                { emoji: '🚢', name: 'boot' },
                { emoji: '🚁', name: 'helikopter' },
                { emoji: '🚲', name: 'fiets' },
                { emoji: '🚜', name: 'tractor' },
                { emoji: '🚒', name: 'brandweer' },
                { emoji: '🚀', name: 'raket' }
            ]
        },
        objects: {
            name: 'Voorwerpen',
            emoji: '⭐',
            items: [
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
        food: {
            name: 'Eten',
            emoji: '🍕',
            items: [
                { emoji: '🍕', name: 'pizza' },
                { emoji: '🍔', name: 'hamburger' },
                { emoji: '🍎', name: 'appel' },
                { emoji: '🍌', name: 'banaan' },
                { emoji: '🍓', name: 'aardbei' },
                { emoji: '🥕', name: 'wortel' },
                { emoji: '🍪', name: 'koekje' },
                { emoji: '🧁', name: 'cupcake' },
                { emoji: '🍩', name: 'donut' },
                { emoji: '🍦', name: 'ijsje' }
            ]
        }
    },

    // Count options
    countOptions: [2, 3, 4, 5, 6],
    itemCount: 3,
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
        // Map difficulty to count
        const mapping = { easy: 3, medium: 4, hard: 5 };
        if (mapping[level]) {
            this.itemCount = mapping[level];
        }
    },

    setCount(count) {
        if (this.countOptions.includes(count)) {
            this.itemCount = count;
        }
    },

    setCategory(category) {
        if (this.itemSets[category]) {
            this.currentSet = category;
        }
    },

    reset() {
        this.matched = 0;
        this.draggedItem = null;

        const allItems = [...this.itemSets[this.currentSet].items];

        // Shuffle and pick items
        const shuffled = allItems.sort(() => Math.random() - 0.5);
        this.items = shuffled.slice(0, this.itemCount).map((item, index) => ({
            ...item,
            id: index,
            matched: false
        }));

        this.total = this.items.length;
        this.render();
        this.syncGameState();
    },

    // Sync game state to Firebase for remote display
    syncGameState() {
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            const nextItem = this.items.find(i => !i.matched);
            TabletApp.roomRef.child('gameState').update({
                game: 'shadow',
                found: this.matched,
                total: this.total,
                targetEmoji: nextItem?.emoji || '🔍',
                completed: this.matched === this.total,
                timestamp: Date.now()
            });
        }
    },

    render() {
        if (!this.container) return;

        // Create shuffled order for draggable items
        const dragOrder = [...this.items].sort(() => Math.random() - 0.5);

        // Category buttons
        const categoryButtons = Object.entries(this.itemSets).map(([key, cat]) => `
            <button class="shadow-category-btn ${key === this.currentSet ? 'active' : ''}"
                    data-category="${key}">
                ${cat.emoji}
            </button>
        `).join('');

        // Count buttons
        const countButtons = this.countOptions.map(count => `
            <button class="shadow-count-btn ${count === this.itemCount ? 'active' : ''}"
                    data-count="${count}">
                ${count}
            </button>
        `).join('');

        // Visual-only interface - NO settings on tablet (parent controls on remote)
        this.container.innerHTML = `
            <div class="shadow-game">
                <div class="shadow-header">
                    <div class="shadow-visual-score">
                        ${'⭐'.repeat(this.matched)}${'☆'.repeat(this.total - this.matched)}
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
        // Settings are controlled from remote - no buttons on tablet

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

                // Sync progress to remote
                this.syncGameState();

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

        // Sync completion to remote (no popup on tablet - child can't read)
        this.syncGameState();

        // Auto-reset after brief celebration
        setTimeout(() => {
            this.reset();
        }, 2000);
    }
};

window.ShadowGame = ShadowGame;
