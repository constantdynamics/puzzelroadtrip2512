// Drawing Game for Toddlers
// Simple drawing app with prompts for 2-year-olds

const DrawingGame = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    currentColor: '#FF6B6B',
    brushSize: 15,
    container: null,
    currentPrompt: null,

    // Drawing prompts suitable for toddlers
    prompts: [
        { emoji: '☀️', text: 'Teken een zon!' },
        { emoji: '🌈', text: 'Teken een regenboog!' },
        { emoji: '🏠', text: 'Teken een huis!' },
        { emoji: '🌳', text: 'Teken een boom!' },
        { emoji: '🌸', text: 'Teken een bloem!' },
        { emoji: '🐱', text: 'Teken een kat!' },
        { emoji: '🐶', text: 'Teken een hond!' },
        { emoji: '🐟', text: 'Teken een vis!' },
        { emoji: '⭐', text: 'Teken sterren!' },
        { emoji: '❤️', text: 'Teken een hartje!' },
        { emoji: '🚗', text: 'Teken een auto!' },
        { emoji: '🌙', text: 'Teken de maan!' },
        { emoji: '⚽', text: 'Teken een bal!' },
        { emoji: '🎈', text: 'Teken ballonnen!' },
        { emoji: '🦋', text: 'Teken een vlinder!' }
    ],

    // Kid-friendly color palette
    colors: [
        '#FF6B6B', // Red
        '#FF8E53', // Orange
        '#FFD93D', // Yellow
        '#6BCB77', // Green
        '#4D96FF', // Blue
        '#9B59B6', // Purple
        '#FF69B4', // Pink
        '#8B4513', // Brown
        '#000000', // Black
        '#FFFFFF'  // White (eraser)
    ],

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Drawing game container not found');
            return;
        }
        this.render();
        this.setupCanvas();
        this.newPrompt();
    },

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="drawing-game">
                <div class="drawing-header">
                    <div class="drawing-prompt" id="drawing-prompt">
                        <span class="prompt-emoji">🎨</span>
                        <span class="prompt-text">Laten we tekenen!</span>
                    </div>
                </div>
                <div class="drawing-canvas-wrapper">
                    <canvas id="drawing-canvas"></canvas>
                </div>
                <div class="drawing-toolbar">
                    <div class="color-palette" id="color-palette">
                        ${this.colors.map(color => `
                            <button class="color-btn ${color === this.currentColor ? 'active' : ''}"
                                    style="background: ${color}; ${color === '#FFFFFF' ? 'border: 2px solid #ccc;' : ''}"
                                    data-color="${color}">
                            </button>
                        `).join('')}
                    </div>
                    <div class="drawing-actions">
                        <button class="action-btn" id="clear-btn">🗑️ Wissen</button>
                        <button class="action-btn" id="new-prompt-btn">🎲 Nieuwe opdracht</button>
                    </div>
                </div>
            </div>
        `;
    },

    setupCanvas() {
        this.canvas = document.getElementById('drawing-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Drawing events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e, 'start'), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouch(e, 'move'), { passive: false });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setColor(btn.dataset.color);
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Actions
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clear());
        document.getElementById('new-prompt-btn')?.addEventListener('click', () => this.newPrompt());

        // Clear canvas with white background
        this.clear();
    },

    resizeCanvas() {
        if (!this.canvas) return;

        const wrapper = this.canvas.parentElement;
        if (!wrapper) return;

        // Save current drawing
        const imageData = this.ctx?.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // Resize
        this.canvas.width = wrapper.clientWidth;
        this.canvas.height = wrapper.clientHeight;

        // Restore drawing if exists
        if (imageData && this.ctx) {
            this.ctx.putImageData(imageData, 0, 0);
        }

        // Set up drawing style
        if (this.ctx) {
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
        }
    },

    handleTouch(e, type) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        if (type === 'start') {
            this.startDrawing({ offsetX: x, offsetY: y });
        } else if (type === 'move') {
            this.draw({ offsetX: x, offsetY: y });
        }
    },

    startDrawing(e) {
        this.isDrawing = true;
        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];

        // Draw a dot for single clicks
        this.ctx.beginPath();
        this.ctx.arc(e.offsetX, e.offsetY, this.brushSize / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.currentColor;
        this.ctx.fill();
    },

    draw(e) {
        if (!this.isDrawing) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.stroke();

        [this.lastX, this.lastY] = [e.offsetX, e.offsetY];
    },

    stopDrawing() {
        this.isDrawing = false;
    },

    setColor(color) {
        this.currentColor = color;

        // White is the eraser
        if (color === '#FFFFFF') {
            this.brushSize = 30; // Bigger eraser
        } else {
            this.brushSize = 15;
        }
    },

    clear() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (typeof AudioManager !== 'undefined') {
            AudioManager.playClick();
        }
    },

    newPrompt() {
        const randomIndex = Math.floor(Math.random() * this.prompts.length);
        this.currentPrompt = this.prompts[randomIndex];

        const promptEl = document.getElementById('drawing-prompt');
        if (promptEl) {
            promptEl.innerHTML = `
                <span class="prompt-emoji">${this.currentPrompt.emoji}</span>
                <span class="prompt-text">${this.currentPrompt.text}</span>
            `;

            // Animate
            promptEl.classList.add('bounce');
            setTimeout(() => promptEl.classList.remove('bounce'), 500);
        }

        // Optionally clear canvas for new prompt
        // this.clear();

        if (typeof AudioManager !== 'undefined') {
            AudioManager.playTaskComplete();
        }
    },

    getCanvasImage() {
        return this.canvas?.toDataURL('image/png');
    }
};

// Make globally available
window.DrawingGame = DrawingGame;
