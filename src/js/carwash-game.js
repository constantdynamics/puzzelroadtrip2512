// Car Wash Game for Toddlers
// Drag sponge over dirty objects to clean them

const CarWashGame = {
    container: null,
    canvas: null,
    ctx: null,
    dirtCanvas: null,
    dirtCtx: null,
    isWashing: false,
    cleanPercent: 0,
    currentObject: null,
    currentCategory: 'vehicles',
    spongePos: { x: 0, y: 0 },

    categories: {
        vehicles: {
            name: 'Voertuigen',
            items: [
                { emoji: '🚗', name: 'auto' },
                { emoji: '🚙', name: 'SUV' },
                { emoji: '🚕', name: 'taxi' },
                { emoji: '🚌', name: 'bus' },
                { emoji: '🏎️', name: 'raceauto' },
                { emoji: '🚓', name: 'politie' },
                { emoji: '🚑', name: 'ambulance' },
                { emoji: '🚒', name: 'brandweer' },
                { emoji: '🛻', name: 'pickup' },
                { emoji: '🚲', name: 'fiets' },
                { emoji: '🛵', name: 'scooter' },
                { emoji: '🚜', name: 'tractor' }
            ]
        },
        dishes: {
            name: 'Servies',
            items: [
                { emoji: '🍽️', name: 'bord' },
                { emoji: '🥣', name: 'kom' },
                { emoji: '🍵', name: 'kopje' },
                { emoji: '🥤', name: 'beker' },
                { emoji: '🫖', name: 'theepot' },
                { emoji: '🥄', name: 'lepel' },
                { emoji: '🍴', name: 'bestek' },
                { emoji: '🥢', name: 'stokjes' }
            ]
        },
        kitchen: {
            name: 'Keuken',
            items: [
                { emoji: '🍳', name: 'pan' },
                { emoji: '🥘', name: 'stoofpot' },
                { emoji: '🫕', name: 'fondue' },
                { emoji: '🥡', name: 'bakje' },
                { emoji: '🧊', name: 'ijsblokje' }
            ]
        },
        house: {
            name: 'Huizen',
            items: [
                { emoji: '🏠', name: 'huis' },
                { emoji: '🏡', name: 'huis tuin' },
                { emoji: '🏢', name: 'gebouw' },
                { emoji: '🏰', name: 'kasteel' },
                { emoji: '⛺', name: 'tent' },
                { emoji: '🏕️', name: 'camping' }
            ]
        },
        animals: {
            name: 'Dieren',
            items: [
                { emoji: '🐕', name: 'hond' },
                { emoji: '🐈', name: 'kat' },
                { emoji: '🐖', name: 'varken' },
                { emoji: '🐘', name: 'olifant' },
                { emoji: '🦛', name: 'nijlpaard' }
            ]
        }
    },

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Car wash game container not found');
            return;
        }
        this.reset();
    },

    reset() {
        // Pick random category and item
        const categoryKeys = Object.keys(this.categories);
        this.currentCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
        const category = this.categories[this.currentCategory];
        this.currentObject = category.items[Math.floor(Math.random() * category.items.length)];

        this.cleanPercent = 0;
        this.isWashing = false;
        this.completed = false;

        this.render();
        this.setupCanvas();
        this.setupEvents();
        this.syncGameState();
    },

    // Sync game state to Firebase for remote display
    syncGameState() {
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            TabletApp.roomRef.child('gameState').update({
                game: 'carwash',
                currentObject: this.currentObject?.emoji || '🚗',
                cleanProgress: Math.round(this.cleanPercent),
                completed: this.completed || false,
                timestamp: Date.now()
            });
        }
    },

    selectCategory(categoryKey) {
        if (this.categories[categoryKey]) {
            this.currentCategory = categoryKey;
            const category = this.categories[categoryKey];
            this.currentObject = category.items[Math.floor(Math.random() * category.items.length)];
            this.cleanPercent = 0;
            this.isWashing = false;
            this.completed = false;

            this.render();
            this.setupCanvas();
            this.setupEvents();
        }
    },

    render() {
        if (!this.container) return;

        const categoryButtons = Object.entries(this.categories).map(([key, cat]) => `
            <button class="wash-category-btn ${key === this.currentCategory ? 'active' : ''}"
                    data-category="${key}">
                ${cat.items[0].emoji}
            </button>
        `).join('');

        this.container.innerHTML = `
            <div class="carwash-game">
                <div class="carwash-header">
                    <div class="wash-categories">
                        ${categoryButtons}
                    </div>
                    <div class="clean-meter">
                        <div class="clean-meter-fill" id="clean-meter-fill" style="width: 0%"></div>
                        <span class="clean-meter-text" id="clean-meter-text">0%</span>
                    </div>
                </div>
                <div class="carwash-area">
                    <div class="wash-object-container" id="wash-object-container">
                        <div class="wash-object-emoji" id="wash-object-emoji">${this.currentObject.emoji}</div>
                        <canvas id="dirt-canvas" class="dirt-canvas"></canvas>
                    </div>
                    <div class="sponge" id="sponge">🧽</div>
                </div>
                <div class="carwash-bubbles" id="carwash-bubbles"></div>
            </div>
        `;
    },

    setupCanvas() {
        this.dirtCanvas = document.getElementById('dirt-canvas');
        if (!this.dirtCanvas) return;

        const objectContainer = document.getElementById('wash-object-container');
        this.dirtCanvas.width = objectContainer.offsetWidth;
        this.dirtCanvas.height = objectContainer.offsetHeight;

        this.dirtCtx = this.dirtCanvas.getContext('2d');

        // Fill with dirt (brown spots and mud)
        this.addDirt();
    },

    addDirt() {
        if (!this.dirtCtx) return;

        const w = this.dirtCanvas.width;
        const h = this.dirtCanvas.height;

        // Add mud splatters
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = 20 + Math.random() * 40;

            this.dirtCtx.beginPath();
            this.dirtCtx.arc(x, y, radius, 0, Math.PI * 2);
            this.dirtCtx.fillStyle = `rgba(139, 90, 43, ${0.5 + Math.random() * 0.4})`;
            this.dirtCtx.fill();
        }

        // Add some darker spots
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = 15 + Math.random() * 25;

            this.dirtCtx.beginPath();
            this.dirtCtx.arc(x, y, radius, 0, Math.PI * 2);
            this.dirtCtx.fillStyle = `rgba(101, 67, 33, ${0.4 + Math.random() * 0.3})`;
            this.dirtCtx.fill();
        }
    },

    setupEvents() {
        const sponge = document.getElementById('sponge');
        const objectContainer = document.getElementById('wash-object-container');

        if (!sponge || !objectContainer) return;

        // Category buttons
        this.container.querySelectorAll('.wash-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectCategory(btn.dataset.category);
            });
        });

        // Touch events
        sponge.addEventListener('touchstart', (e) => this.startWashing(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.wash(e), { passive: false });
        document.addEventListener('touchend', () => this.stopWashing());

        // Mouse events
        sponge.addEventListener('mousedown', (e) => this.startWashing(e));
        document.addEventListener('mousemove', (e) => this.wash(e));
        document.addEventListener('mouseup', () => this.stopWashing());

        // Also allow starting from anywhere
        objectContainer.addEventListener('touchstart', (e) => this.startWashing(e), { passive: false });
        objectContainer.addEventListener('mousedown', (e) => this.startWashing(e));
    },

    startWashing(e) {
        e.preventDefault();
        this.isWashing = true;

        const sponge = document.getElementById('sponge');
        if (sponge) {
            sponge.classList.add('active');
        }

        this.wash(e);
    },

    wash(e) {
        if (!this.isWashing || !this.dirtCtx) return;
        e.preventDefault();

        const touch = e.touches ? e.touches[0] : e;
        const objectContainer = document.getElementById('wash-object-container');
        const sponge = document.getElementById('sponge');

        if (!objectContainer || !sponge) return;

        const rect = objectContainer.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Move sponge
        sponge.style.left = (touch.clientX - 50) + 'px';
        sponge.style.top = (touch.clientY - 50) + 'px';

        // Clean the dirt (erase) - larger brush for bigger area
        this.dirtCtx.globalCompositeOperation = 'destination-out';
        this.dirtCtx.beginPath();
        this.dirtCtx.arc(x, y, 60, 0, Math.PI * 2);
        this.dirtCtx.fill();
        this.dirtCtx.globalCompositeOperation = 'source-over';

        // Add bubble effect
        this.addBubble(touch.clientX, touch.clientY);

        // Calculate clean percentage
        this.calculateCleanPercent();
    },

    stopWashing() {
        this.isWashing = false;

        const sponge = document.getElementById('sponge');
        if (sponge) {
            sponge.classList.remove('active');
        }
    },

    addBubble(x, y) {
        const bubblesContainer = document.getElementById('carwash-bubbles');
        if (!bubblesContainer) return;

        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = '🫧';
        bubble.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
        bubble.style.top = (y + (Math.random() - 0.5) * 60) + 'px';

        bubblesContainer.appendChild(bubble);

        // Remove after animation
        setTimeout(() => bubble.remove(), 1000);
    },

    calculateCleanPercent() {
        if (!this.dirtCtx || !this.dirtCanvas) return;

        const imageData = this.dirtCtx.getImageData(0, 0, this.dirtCanvas.width, this.dirtCanvas.height);
        const pixels = imageData.data;

        let transparentPixels = 0;
        const totalPixels = pixels.length / 4;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) {
                transparentPixels++;
            }
        }

        this.cleanPercent = Math.round((transparentPixels / totalPixels) * 100);

        // Update UI
        const meterFill = document.getElementById('clean-meter-fill');
        const meterText = document.getElementById('clean-meter-text');

        if (meterFill) meterFill.style.width = this.cleanPercent + '%';
        if (meterText) meterText.textContent = this.cleanPercent + '%';

        // Sync progress to remote (throttled - every 10%)
        if (this.cleanPercent % 10 === 0 || this.cleanPercent >= 85) {
            this.syncGameState();
        }

        // Check for completion
        if (this.cleanPercent >= 85 && !this.completed) {
            this.completed = true;
            this.syncGameState();
            this.onGameComplete();
        }
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        // Sync completion to remote (no popup on tablet - child can't read)
        this.syncGameState();

        // Auto-reset after brief celebration
        setTimeout(() => {
            this.completed = false;
            this.reset();
        }, 2000);
    }
};

window.CarWashGame = CarWashGame;
