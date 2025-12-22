// General Sorting Game for Toddlers
// Sort items by category (food/toys, land/water animals, etc.)

const SortingGame = {
    container: null,
    categories: [],
    items: [],
    sorted: 0,
    total: 0,
    draggedItem: null,

    // Sorting challenges
    challenges: {
        food_toys: {
            name: 'Eten of Speelgoed?',
            categories: [
                { id: 'food', name: 'Eten', emoji: '🍽️', color: '#FF6B6B', items: ['🍎', '🍕', '🍦', '🥕', '🍪', '🧁', '🍔', '🌮'] },
                { id: 'toys', name: 'Speelgoed', emoji: '🧸', color: '#4D96FF', items: ['🧸', '🎮', '🎨', '⚽', '🪀', '🎪', '🎯', '🪁'] }
            ]
        },
        land_water: {
            name: 'Land of Water?',
            categories: [
                { id: 'land', name: 'Land', emoji: '🌳', color: '#6BCB77', items: ['🐘', '🦁', '🐕', '🐈', '🐰', '🦒', '🐻', '🐵'] },
                { id: 'water', name: 'Water', emoji: '🌊', color: '#4D96FF', items: ['🐳', '🐟', '🦈', '🐙', '🦀', '🐬', '🦑', '🐠'] }
            ]
        },
        hot_cold: {
            name: 'Warm of Koud?',
            categories: [
                { id: 'hot', name: 'Warm', emoji: '☀️', color: '#FF8E53', items: ['☀️', '🔥', '🌶️', '🏖️', '🌴', '🍦', '🥵', '🏜️'] },
                { id: 'cold', name: 'Koud', emoji: '❄️', color: '#74B9FF', items: ['❄️', '⛄', '🧊', '🐧', '🎿', '🌨️', '🥶', '🧣'] }
            ]
        },
        day_night: {
            name: 'Dag of Nacht?',
            categories: [
                { id: 'day', name: 'Dag', emoji: '☀️', color: '#FFD93D', items: ['☀️', '🌻', '🐓', '🦋', '🌈', '⛅', '🐝', '🌺'] },
                { id: 'night', name: 'Nacht', emoji: '🌙', color: '#6C5CE7', items: ['🌙', '⭐', '🦉', '🦇', '🌃', '💤', '🛏️', '🌌'] }
            ]
        },
        fly_walk: {
            name: 'Vliegen of Lopen?',
            categories: [
                { id: 'fly', name: 'Vliegen', emoji: '🦅', color: '#74B9FF', items: ['🦅', '🐦', '🦋', '🐝', '🦇', '✈️', '🚁', '🎈'] },
                { id: 'walk', name: 'Lopen', emoji: '🐕', color: '#A29BFE', items: ['🐕', '🐈', '🐘', '🐢', '🦁', '🐰', '🦒', '🐻'] }
            ]
        },
        fruits_veggies: {
            name: 'Fruit of Groente?',
            categories: [
                { id: 'fruits', name: 'Fruit', emoji: '🍎', color: '#FF6B6B', items: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍑', '🍒', '🥝'] },
                { id: 'veggies', name: 'Groente', emoji: '🥦', color: '#6BCB77', items: ['🥦', '🥕', '🥒', '🌽', '🍆', '🥬', '🧅', '🫑'] }
            ]
        }
    },

    difficulties: {
        easy: 3,   // items per category
        medium: 4,
        hard: 5
    },

    difficulty: 'easy',
    currentChallenge: 'food_toys',

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Sorting game container not found');
            return;
        }
        this.reset();
    },

    setDifficulty(level) {
        if (this.difficulties[level]) {
            this.difficulty = level;
        }
    },

    setChallenge(challenge) {
        if (this.challenges[challenge]) {
            this.currentChallenge = challenge;
        }
    },

    randomChallenge() {
        const keys = Object.keys(this.challenges);
        this.currentChallenge = keys[Math.floor(Math.random() * keys.length)];
    },

    reset() {
        this.sorted = 0;
        this.draggedItem = null;

        // Random challenge each time
        this.randomChallenge();

        const challenge = this.challenges[this.currentChallenge];
        const itemsPerCategory = this.difficulties[this.difficulty];

        // Setup categories
        this.categories = challenge.categories.map(cat => ({
            ...cat,
            collected: []
        }));

        // Create items
        this.items = [];
        this.categories.forEach(cat => {
            const shuffled = [...cat.items].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, itemsPerCategory);

            selected.forEach((emoji, i) => {
                this.items.push({
                    id: `${cat.id}-${i}`,
                    emoji,
                    categoryId: cat.id,
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
            const challenge = this.challenges[this.currentChallenge];
            TabletApp.roomRef.child('gameState').update({
                game: 'sorting',
                sorted: this.sorted,
                total: this.total,
                category: challenge?.name || 'Sorteren',
                completed: this.sorted === this.total,
                timestamp: Date.now()
            });
        }
    },

    render() {
        if (!this.container) return;

        const challenge = this.challenges[this.currentChallenge];
        const unsortedItems = this.items.filter(i => !i.sorted);

        this.container.innerHTML = `
            <div class="sorting-game">
                <div class="sorting-header">
                    <h2>🤔 ${challenge.name}</h2>
                    <div class="sorting-score">
                        ${this.sorted}/${this.total} gesorteerd
                    </div>
                </div>
                <div class="sorting-area">
                    <div class="sorting-bins">
                        ${this.categories.map(cat => `
                            <div class="sorting-bin" data-category="${cat.id}"
                                 style="background: ${cat.color}20; border-color: ${cat.color}">
                                <div class="bin-header" style="background: ${cat.color}">
                                    <span class="bin-emoji">${cat.emoji}</span>
                                    <span class="bin-name">${cat.name}</span>
                                </div>
                                <div class="bin-contents">
                                    ${cat.collected.map(emoji => `<span class="bin-item">${emoji}</span>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="sorting-items">
                        ${unsortedItems.map(item => `
                            <div class="sorting-item" data-id="${item.id}" data-category="${item.categoryId}">
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
        const items = this.container.querySelectorAll('.sorting-item');

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

        const bins = this.container.querySelectorAll('.sorting-bin');

        bins.forEach(bin => {
            const rect = bin.getBoundingClientRect();
            const catId = bin.dataset.category;

            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {

                if (catId === this.draggedItem.item.categoryId) {
                    // Correct!
                    this.draggedItem.item.sorted = true;
                    this.sorted++;

                    const cat = this.categories.find(c => c.id === catId);
                    if (cat) {
                        cat.collected.push(this.draggedItem.item.emoji);
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
                    // Wrong
                    bin.classList.add('wrong');
                    setTimeout(() => bin.classList.remove('wrong'), 500);

                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.playClick();
                    }
                }
            }
        });

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

        // Sync completion to remote (no popup on tablet - child can't read)
        this.syncGameState();

        // Auto-reset after brief celebration
        setTimeout(() => {
            this.reset();
        }, 2000);
    }
};

window.SortingGame = SortingGame;
