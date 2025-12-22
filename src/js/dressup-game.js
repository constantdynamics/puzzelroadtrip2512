// Dress Up Game for Toddlers
// Drag clothes onto the character

const DressUpGame = {
    container: null,
    character: null,
    clothingSlots: {},
    availableClothes: [],
    dressed: 0,
    total: 0,
    draggedItem: null,

    // Characters
    characters: {
        boy: {
            emoji: '👦',
            name: 'Tim',
            baseEmoji: '🧒'
        },
        girl: {
            emoji: '👧',
            name: 'Lisa',
            baseEmoji: '🧒'
        }
    },

    // Clothing items by slot
    clothingData: {
        hat: {
            slot: 'head',
            position: 'top',
            items: [
                { emoji: '🧢', name: 'Pet' },
                { emoji: '👒', name: 'Hoed' },
                { emoji: '🎩', name: 'Hoge hoed' },
                { emoji: '👑', name: 'Kroon' },
                { emoji: '🎀', name: 'Strik' }
            ]
        },
        glasses: {
            slot: 'face',
            position: 'middle',
            items: [
                { emoji: '👓', name: 'Bril' },
                { emoji: '🕶️', name: 'Zonnebril' }
            ]
        },
        top: {
            slot: 'body',
            position: 'middle',
            items: [
                { emoji: '👕', name: 'T-shirt' },
                { emoji: '👚', name: 'Blouse' },
                { emoji: '🧥', name: 'Jas' },
                { emoji: '👔', name: 'Overhemd' }
            ]
        },
        bottom: {
            slot: 'legs',
            position: 'lower',
            items: [
                { emoji: '👖', name: 'Broek' },
                { emoji: '👗', name: 'Jurk' },
                { emoji: '🩳', name: 'Korte broek' }
            ]
        },
        shoes: {
            slot: 'feet',
            position: 'bottom',
            items: [
                { emoji: '👟', name: 'Sneakers' },
                { emoji: '👢', name: 'Laarzen' },
                { emoji: '👠', name: 'Hakken' },
                { emoji: '🥿', name: 'Slippers' }
            ]
        },
        accessory: {
            slot: 'hand',
            position: 'side',
            items: [
                { emoji: '👜', name: 'Tas' },
                { emoji: '🎒', name: 'Rugzak' },
                { emoji: '🧸', name: 'Knuffel' },
                { emoji: '⚽', name: 'Bal' }
            ]
        }
    },

    // Outfit themes (which slots to use)
    outfitThemes: {
        casual: ['hat', 'top', 'bottom', 'shoes'],
        fancy: ['hat', 'glasses', 'top', 'bottom', 'shoes', 'accessory'],
        simple: ['top', 'bottom', 'shoes']
    },

    difficulties: {
        easy: 'simple',    // 3 items
        medium: 'casual',  // 4 items
        hard: 'fancy'      // 6 items
    },

    difficulty: 'easy',

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Dress up game container not found');
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
        this.dressed = 0;
        this.draggedItem = null;
        this.clothingSlots = {};

        // Random character
        const charKeys = Object.keys(this.characters);
        const charKey = charKeys[Math.floor(Math.random() * charKeys.length)];
        this.character = { id: charKey, ...this.characters[charKey] };

        // Get outfit theme
        const theme = this.outfitThemes[this.difficulties[this.difficulty]];

        // Setup slots and pick random clothes
        this.availableClothes = [];
        theme.forEach(slotType => {
            const slotData = this.clothingData[slotType];
            const randomItem = slotData.items[Math.floor(Math.random() * slotData.items.length)];

            this.clothingSlots[slotType] = {
                ...slotData,
                type: slotType,
                filled: false,
                item: null
            };

            this.availableClothes.push({
                id: slotType,
                slotType: slotType,
                ...randomItem,
                used: false
            });
        });

        // Shuffle clothes
        this.availableClothes.sort(() => Math.random() - 0.5);
        this.total = this.availableClothes.length;

        this.render();
    },

    render() {
        if (!this.container) return;

        const unusedClothes = this.availableClothes.filter(c => !c.used);

        this.container.innerHTML = `
            <div class="dressup-game">
                <div class="dressup-header">
                    <h2>👗 Kleed ${this.character.name} aan! 👔</h2>
                    <div class="dressup-score">
                        ${this.dressed}/${this.total} kledingstukken
                    </div>
                </div>
                <div class="dressup-area">
                    <div class="dressup-character">
                        <div class="character-figure">
                            <div class="slot slot-head ${this.clothingSlots.hat?.filled ? 'filled' : ''}" data-slot="hat">
                                ${this.clothingSlots.hat?.item?.emoji || ''}
                            </div>
                            <div class="slot slot-face ${this.clothingSlots.glasses?.filled ? 'filled' : ''}" data-slot="glasses">
                                ${this.clothingSlots.glasses?.item?.emoji || ''}
                            </div>
                            <div class="character-body">
                                <div class="character-emoji">${this.character.emoji}</div>
                            </div>
                            <div class="slot slot-body ${this.clothingSlots.top?.filled ? 'filled' : ''}" data-slot="top">
                                ${this.clothingSlots.top?.item?.emoji || (this.clothingSlots.top ? '?' : '')}
                            </div>
                            <div class="slot slot-legs ${this.clothingSlots.bottom?.filled ? 'filled' : ''}" data-slot="bottom">
                                ${this.clothingSlots.bottom?.item?.emoji || (this.clothingSlots.bottom ? '?' : '')}
                            </div>
                            <div class="slot slot-feet ${this.clothingSlots.shoes?.filled ? 'filled' : ''}" data-slot="shoes">
                                ${this.clothingSlots.shoes?.item?.emoji || (this.clothingSlots.shoes ? '?' : '')}
                            </div>
                            <div class="slot slot-hand ${this.clothingSlots.accessory?.filled ? 'filled' : ''}" data-slot="accessory">
                                ${this.clothingSlots.accessory?.item?.emoji || ''}
                            </div>
                        </div>
                    </div>
                    <div class="dressup-clothes">
                        ${unusedClothes.map(item => `
                            <div class="dressup-item" data-id="${item.id}" data-slot="${item.slotType}">
                                <span class="item-emoji">${item.emoji}</span>
                                <span class="item-name">${item.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.setupEvents();
    },

    setupEvents() {
        const clothes = this.container.querySelectorAll('.dressup-item');

        clothes.forEach(el => {
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
        const item = this.availableClothes.find(c => c.id === id);
        if (!item || item.used) return;

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

        // Check character area (more lenient drop zone)
        const characterArea = this.container.querySelector('.dressup-character');
        if (characterArea) {
            const rect = characterArea.getBoundingClientRect();

            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {

                // Find matching slot
                const slotType = this.draggedItem.item.slotType;
                const slot = this.clothingSlots[slotType];

                if (slot && !slot.filled) {
                    slot.filled = true;
                    slot.item = this.draggedItem.item;
                    this.draggedItem.item.used = true;
                    this.dressed++;

                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.playPiecePlaced();
                    }

                    if (this.dressed === this.total) {
                        setTimeout(() => this.onGameComplete(), 300);
                    }
                }
            }
        }

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
        celebrationEl.className = 'dressup-celebration';
        celebrationEl.innerHTML = `
            <div class="dressup-celebration-content">
                <h2>✨ Prachtig! ✨</h2>
                <p>${this.character.name} ziet er geweldig uit!</p>
                <div class="dressup-result">
                    ${Object.values(this.clothingSlots).filter(s => s.filled).map(s => s.item.emoji).join(' ')}
                </div>
                <button class="dressup-play-again-btn" id="dressup-play-again">Nieuwe outfit</button>
            </div>
        `;
        this.container.appendChild(celebrationEl);

        document.getElementById('dressup-play-again').addEventListener('click', () => {
            this.reset();
        });
    }
};

window.DressUpGame = DressUpGame;
