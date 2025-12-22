// Size Sorting Game for Toddlers
// Sort items from biggest to smallest (or vice versa)

const SizeSortGame = {
    container: null,
    items: [],
    slots: [],
    currentOrder: [],
    draggedItem: null,

    // Item themes
    themes: {
        animals: [
            { emoji: '🐘', name: 'olifant' },
            { emoji: '🦁', name: 'leeuw' },
            { emoji: '🐕', name: 'hond' },
            { emoji: '🐈', name: 'kat' },
            { emoji: '🐰', name: 'konijn' },
            { emoji: '🐁', name: 'muis' }
        ],
        fruits: [
            { emoji: '🍉', name: 'watermeloen' },
            { emoji: '🍎', name: 'appel' },
            { emoji: '🍊', name: 'sinaasappel' },
            { emoji: '🍋', name: 'citroen' },
            { emoji: '🍓', name: 'aardbei' },
            { emoji: '🫐', name: 'bosbes' }
        ],
        vehicles: [
            { emoji: '🚂', name: 'trein' },
            { emoji: '🚌', name: 'bus' },
            { emoji: '🚗', name: 'auto' },
            { emoji: '🏍️', name: 'motor' },
            { emoji: '🚲', name: 'fiets' },
            { emoji: '🛴', name: 'step' }
        ],
        balls: [
            { emoji: '🏀', name: 'basketbal' },
            { emoji: '⚽', name: 'voetbal' },
            { emoji: '🎾', name: 'tennisbal' },
            { emoji: '🏐', name: 'volleybal' },
            { emoji: '⚾', name: 'honkbal' },
            { emoji: '🏓', name: 'pingpongbal' }
        ]
    },

    difficulties: {
        easy: 3,
        medium: 4,
        hard: 5
    },

    difficulty: 'easy',
    currentTheme: 'animals',
    sortDirection: 'big-to-small', // or 'small-to-big'

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Size sort game container not found');
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
        if (this.themes[theme]) {
            this.currentTheme = theme;
        }
    },

    reset() {
        this.draggedItem = null;
        this.currentOrder = [];

        // Random direction
        this.sortDirection = Math.random() < 0.5 ? 'big-to-small' : 'small-to-big';

        const itemCount = this.difficulties[this.difficulty];
        const themeItems = [...this.themes[this.currentTheme]];

        // Take first itemCount items (they're ordered by size in theme)
        this.items = themeItems.slice(0, itemCount).map((item, index) => ({
            ...item,
            id: index,
            size: itemCount - index, // Biggest = highest number
            placed: false,
            slotIndex: null
        }));

        // Create empty slots
        this.slots = Array(itemCount).fill(null);

        this.render();
    },

    render() {
        if (!this.container) return;

        const directionText = this.sortDirection === 'big-to-small'
            ? 'Van GROOT naar klein'
            : 'Van klein naar GROOT';

        const directionEmoji = this.sortDirection === 'big-to-small'
            ? '⬇️'
            : '⬆️';

        // Shuffle items for display
        const shuffledItems = [...this.items].filter(i => !i.placed).sort(() => Math.random() - 0.5);

        this.container.innerHTML = `
            <div class="size-sort-game">
                <div class="size-sort-header">
                    <h2>${directionEmoji} ${directionText} ${directionEmoji}</h2>
                    <p>Sleep de plaatjes in de goede volgorde!</p>
                </div>
                <div class="size-sort-area">
                    <div class="size-sort-slots">
                        ${this.slots.map((slot, index) => {
                            const placedItem = this.items.find(i => i.slotIndex === index);
                            const sizeLabel = this.sortDirection === 'big-to-small'
                                ? (index === 0 ? 'GROOT' : (index === this.slots.length - 1 ? 'klein' : ''))
                                : (index === 0 ? 'klein' : (index === this.slots.length - 1 ? 'GROOT' : ''));
                            return `
                                <div class="size-sort-slot ${placedItem ? 'filled' : ''}" data-slot="${index}">
                                    ${sizeLabel ? `<div class="slot-label">${sizeLabel}</div>` : ''}
                                    ${placedItem ? `
                                        <div class="size-sort-item placed" style="font-size: ${this.getItemFontSize(placedItem.size)}px">
                                            ${placedItem.emoji}
                                        </div>
                                    ` : '<div class="slot-placeholder">?</div>'}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="size-sort-items">
                        ${shuffledItems.map(item => `
                            <div class="size-sort-item draggable"
                                 data-id="${item.id}"
                                 style="font-size: ${this.getItemFontSize(item.size)}px">
                                ${item.emoji}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.setupEvents();
    },

    getItemFontSize(size) {
        // Scale from 40px to 80px based on size
        const minSize = 40;
        const maxSize = 80;
        const maxItemSize = this.difficulties[this.difficulty];
        return minSize + ((size / maxItemSize) * (maxSize - minSize));
    },

    setupEvents() {
        const draggables = this.container.querySelectorAll('.size-sort-item.draggable');

        draggables.forEach(el => {
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

        const id = parseInt(element.dataset.id);
        const item = this.items.find(i => i.id === id);
        if (!item || item.placed) return;

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

        // Check slots
        const slots = this.container.querySelectorAll('.size-sort-slot');
        let placed = false;

        slots.forEach(slot => {
            const rect = slot.getBoundingClientRect();
            const slotIndex = parseInt(slot.dataset.slot);

            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom &&
                this.slots[slotIndex] === null) {

                // Check if correct position
                const expectedSize = this.sortDirection === 'big-to-small'
                    ? this.difficulties[this.difficulty] - slotIndex
                    : slotIndex + 1;

                if (this.draggedItem.item.size === expectedSize) {
                    // Correct!
                    this.draggedItem.item.placed = true;
                    this.draggedItem.item.slotIndex = slotIndex;
                    this.slots[slotIndex] = this.draggedItem.item;
                    placed = true;

                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.playPiecePlaced();
                    }

                    // Check if complete
                    if (this.items.every(i => i.placed)) {
                        setTimeout(() => this.onGameComplete(), 300);
                    }
                } else {
                    // Wrong position - shake feedback
                    slot.classList.add('wrong');
                    setTimeout(() => slot.classList.remove('wrong'), 500);

                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.playClick();
                    }
                }
            }
        });

        // Reset element
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
        celebrationEl.className = 'size-sort-celebration';
        celebrationEl.innerHTML = `
            <div class="size-sort-celebration-content">
                <h2>🎉 Geweldig! 🎉</h2>
                <p>Je hebt alles goed gesorteerd!</p>
                <button class="size-sort-play-again-btn" id="size-sort-play-again">Opnieuw spelen</button>
            </div>
        `;
        this.container.appendChild(celebrationEl);

        document.getElementById('size-sort-play-again').addEventListener('click', () => {
            this.reset();
        });
    }
};

window.SizeSortGame = SizeSortGame;
