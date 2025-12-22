// Car Wash Game for Toddlers
// Drag sponge over dirty car to clean it

const CarWashGame = {
    container: null,
    canvas: null,
    ctx: null,
    dirtCanvas: null,
    dirtCtx: null,
    isWashing: false,
    cleanPercent: 0,
    carEmoji: '🚗',
    spongePos: { x: 0, y: 0 },

    cars: ['🚗', '🚙', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🛻'],

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Car wash game container not found');
            return;
        }
        this.reset();
    },

    reset() {
        // Pick random car
        this.carEmoji = this.cars[Math.floor(Math.random() * this.cars.length)];
        this.cleanPercent = 0;
        this.isWashing = false;

        this.render();
        this.setupCanvas();
        this.setupEvents();
    },

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="carwash-game">
                <div class="carwash-header">
                    <span class="carwash-title">🧽 Was de auto schoon!</span>
                    <div class="clean-meter">
                        <div class="clean-meter-fill" id="clean-meter-fill" style="width: 0%"></div>
                        <span class="clean-meter-text" id="clean-meter-text">0%</span>
                    </div>
                </div>
                <div class="carwash-area">
                    <div class="car-container" id="car-container">
                        <div class="car-emoji" id="car-emoji">${this.carEmoji}</div>
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

        const carContainer = document.getElementById('car-container');
        this.dirtCanvas.width = carContainer.offsetWidth;
        this.dirtCanvas.height = carContainer.offsetHeight;

        this.dirtCtx = this.dirtCanvas.getContext('2d');

        // Fill with dirt (brown spots and mud)
        this.addDirt();
    },

    addDirt() {
        if (!this.dirtCtx) return;

        const w = this.dirtCanvas.width;
        const h = this.dirtCanvas.height;

        // Add mud splatters
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = 15 + Math.random() * 30;

            this.dirtCtx.beginPath();
            this.dirtCtx.arc(x, y, radius, 0, Math.PI * 2);
            this.dirtCtx.fillStyle = `rgba(139, 90, 43, ${0.4 + Math.random() * 0.4})`;
            this.dirtCtx.fill();
        }

        // Add some darker spots
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const radius = 10 + Math.random() * 20;

            this.dirtCtx.beginPath();
            this.dirtCtx.arc(x, y, radius, 0, Math.PI * 2);
            this.dirtCtx.fillStyle = `rgba(101, 67, 33, ${0.3 + Math.random() * 0.3})`;
            this.dirtCtx.fill();
        }
    },

    setupEvents() {
        const sponge = document.getElementById('sponge');
        const carContainer = document.getElementById('car-container');

        if (!sponge || !carContainer) return;

        // Touch events
        sponge.addEventListener('touchstart', (e) => this.startWashing(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.wash(e), { passive: false });
        document.addEventListener('touchend', () => this.stopWashing());

        // Mouse events
        sponge.addEventListener('mousedown', (e) => this.startWashing(e));
        document.addEventListener('mousemove', (e) => this.wash(e));
        document.addEventListener('mouseup', () => this.stopWashing());

        // Also allow starting from anywhere
        carContainer.addEventListener('touchstart', (e) => this.startWashing(e), { passive: false });
        carContainer.addEventListener('mousedown', (e) => this.startWashing(e));
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
        const carContainer = document.getElementById('car-container');
        const sponge = document.getElementById('sponge');

        if (!carContainer || !sponge) return;

        const rect = carContainer.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // Move sponge
        sponge.style.left = (touch.clientX - 40) + 'px';
        sponge.style.top = (touch.clientY - 40) + 'px';

        // Clean the dirt (erase)
        this.dirtCtx.globalCompositeOperation = 'destination-out';
        this.dirtCtx.beginPath();
        this.dirtCtx.arc(x, y, 40, 0, Math.PI * 2);
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
        bubble.style.left = (x + (Math.random() - 0.5) * 50) + 'px';
        bubble.style.top = (y + (Math.random() - 0.5) * 50) + 'px';

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

        // Check for completion
        if (this.cleanPercent >= 90 && !this.completed) {
            this.completed = true;
            this.onGameComplete();
        }
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        setTimeout(() => {
            if (this.container) {
                const celebrationEl = document.createElement('div');
                celebrationEl.className = 'carwash-celebration';
                celebrationEl.innerHTML = `
                    <div class="carwash-celebration-content">
                        <h2>✨ Blinkt! ✨</h2>
                        <p>De auto is helemaal schoon!</p>
                        <div class="clean-car">${this.carEmoji}</div>
                        <button class="carwash-play-again-btn" id="carwash-play-again">Nog een auto wassen</button>
                    </div>
                `;
                this.container.appendChild(celebrationEl);

                document.getElementById('carwash-play-again').addEventListener('click', () => {
                    this.completed = false;
                    this.reset();
                });
            }
        }, 500);
    }
};

window.CarWashGame = CarWashGame;
