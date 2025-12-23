// Size Sorting Game for Toddlers
// Sort shapes from small to big (left to right)
// Smallest and biggest are already placed as hints

const SizeSortGame = {
    container: null,
    items: [],
    slots: [],
    draggedItem: null,
    currentShape: 'circle',

    // Shape types with colors
    shapes: [
        { type: 'circle', color: '#E53935', name: 'cirkel' },
        { type: 'square', color: '#1E88E5', name: 'vierkant' },
        { type: 'triangle', color: '#FDD835', name: 'driehoek' },
        { type: 'star', color: '#FB8C00', name: 'ster' },
        { type: 'heart', color: '#8E24AA', name: 'hart' }
    ],

    // Always 5 items with distinct sizes
    sizes: [
        { size: 1, scale: 0.4 },  // Smallest (left - given)
        { size: 2, scale: 0.55 },
        { size: 3, scale: 0.7 },
        { size: 4, scale: 0.85 },
        { size: 5, scale: 1.0 }   // Biggest (right - given)
    ],

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Size sort game container not found');
            return;
        }
        this.reset();
    },

    reset() {
        this.draggedItem = null;

        // Pick random shape
        this.currentShape = this.shapes[Math.floor(Math.random() * this.shapes.length)];

        // Create 5 items
        this.items = this.sizes.map((sizeInfo, index) => ({
            id: index,
            size: sizeInfo.size,
            scale: sizeInfo.scale,
            placed: false,
            slotIndex: null,
            isHint: index === 0 || index === 4 // First and last are hints
        }));

        // Pre-place the hints (smallest left, biggest right)
        this.items[0].placed = true;
        this.items[0].slotIndex = 0;
        this.items[4].placed = true;
        this.items[4].slotIndex = 4;

        // Create slots
        this.slots = [this.items[0], null, null, null, this.items[4]];

        this.render();
        this.syncGameState();
    },

    // Sync game state to Firebase for remote display
    syncGameState() {
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            const sorted = this.items.filter(i => i.placed).length;
            TabletApp.roomRef.child('gameState').update({
                game: 'sizesort',
                sorted: sorted,
                total: 5,
                completed: sorted === 5,
                timestamp: Date.now()
            });
        }
    },

    getShapeSVG(scale, isPlaceholder = false) {
        const baseSize = 140;
        const size = baseSize * scale;
        const color = isPlaceholder ? '#DDD' : this.currentShape.color;
        const stroke = isPlaceholder ? '#999' : this.getDarkColor(this.currentShape.color);
        const strokeStyle = isPlaceholder ? 'stroke-dasharray="8,4"' : '';
        const fill = isPlaceholder ? 'white' : color;

        switch (this.currentShape.type) {
            case 'circle':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="${fill}" stroke="${stroke}" stroke-width="4" ${strokeStyle}/>
                </svg>`;

            case 'square':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <rect x="5" y="5" width="90" height="90" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="4" ${strokeStyle}/>
                </svg>`;

            case 'triangle':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <polygon points="50,5 95,90 5,90" fill="${fill}" stroke="${stroke}" stroke-width="4" ${strokeStyle}/>
                </svg>`;

            case 'star':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <polygon points="50,5 61,35 95,35 68,55 79,90 50,70 21,90 32,55 5,35 39,35"
                             fill="${fill}" stroke="${stroke}" stroke-width="3" ${strokeStyle}/>
                </svg>`;

            case 'heart':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <path d="M50,88 C20,60 5,40 5,25 C5,10 20,5 35,5 C45,5 50,15 50,15
                             C50,15 55,5 65,5 C80,5 95,10 95,25 C95,40 80,60 50,88Z"
                          fill="${fill}" stroke="${stroke}" stroke-width="3" ${strokeStyle}/>
                </svg>`;

            default:
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="${fill}" stroke="${stroke}" stroke-width="4" ${strokeStyle}/>
                </svg>`;
        }
    },

    getDarkColor(color) {
        // Simple darkening
        const colors = {
            '#E53935': '#B71C1C',
            '#1E88E5': '#0D47A1',
            '#FDD835': '#F9A825',
            '#FB8C00': '#E65100',
            '#8E24AA': '#6A1B9A'
        };
        return colors[color] || '#333';
    },

    render() {
        if (!this.container) return;

        // Get items that need to be placed (not hints, not placed)
        const availableItems = this.items.filter(i => !i.placed && !i.isHint);
        // Shuffle them
        const shuffledItems = [...availableItems].sort(() => Math.random() - 0.5);

        this.container.innerHTML = `
            <div class="size-sort-game">
                <div class="size-sort-header">
                    <div class="size-hint-left">
                        <span class="hint-arrow">⬅️</span>
                        <span class="hint-text">Klein</span>
                    </div>
                    <div class="size-hint-right">
                        <span class="hint-text">Groot</span>
                        <span class="hint-arrow">➡️</span>
                    </div>
                </div>
                <div class="size-sort-area">
                    <div class="size-sort-slots">
                        ${this.slots.map((slot, index) => {
                            const placedItem = this.items.find(i => i.slotIndex === index);
                            const isHintSlot = index === 0 || index === 4;
                            return `
                                <div class="size-sort-slot ${placedItem ? 'filled' : ''} ${isHintSlot ? 'hint-slot' : ''}"
                                     data-slot="${index}">
                                    ${placedItem ? `
                                        <div class="size-sort-shape placed ${isHintSlot ? 'hint-shape' : ''}">
                                            ${this.getShapeSVG(placedItem.scale)}
                                        </div>
                                    ` : `
                                        <div class="slot-placeholder">
                                            ${this.getShapeSVG(this.sizes[index].scale, true)}
                                        </div>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="size-sort-items">
                        ${shuffledItems.map(item => `
                            <div class="size-sort-shape draggable" data-id="${item.id}">
                                ${this.getShapeSVG(item.scale)}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.setupEvents();
    },

    setupEvents() {
        const draggables = this.container.querySelectorAll('.size-sort-shape.draggable');

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

                // Check if correct position (slot index should match size - 1)
                // Size 1 goes in slot 0, size 2 in slot 1, etc.
                const expectedSize = slotIndex + 1;

                if (this.draggedItem.item.size === expectedSize) {
                    // Correct!
                    this.draggedItem.item.placed = true;
                    this.draggedItem.item.slotIndex = slotIndex;
                    this.slots[slotIndex] = this.draggedItem.item;
                    placed = true;

                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.playPiecePlaced();
                    }

                    // Sync progress to remote
                    this.syncGameState();

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

        // Sync completion to remote (no popup on tablet - child can't read)
        this.syncGameState();

        // Auto-reset after brief celebration
        setTimeout(() => {
            this.reset();
        }, 2000);
    }
};

window.SizeSortGame = SizeSortGame;
