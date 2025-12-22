// Shape Sorting Game for Toddlers
// Drag shapes to matching holes

const ShapesGame = {
    container: null,
    shapes: [],
    holes: [],
    currentDragging: null,
    matched: 0,
    total: 0,

    // Shape definitions with emoji and path
    shapeTypes: [
        { name: 'circle', emoji: '🔴', color: '#FF6B6B' },
        { name: 'square', emoji: '🟦', color: '#4D96FF' },
        { name: 'triangle', emoji: '🔺', color: '#FFD93D' },
        { name: 'star', emoji: '⭐', color: '#FF8E53' },
        { name: 'heart', emoji: '💜', color: '#9B59B6' },
        { name: 'diamond', emoji: '🔷', color: '#4ECDC4' }
    ],

    difficulties: {
        easy: 3,    // 3 shapes
        medium: 4,  // 4 shapes
        hard: 6     // 6 shapes
    },

    difficulty: 'easy',

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Shapes game container not found');
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
        this.matched = 0;
        this.total = this.difficulties[this.difficulty];

        // Select random shapes
        const shuffled = [...this.shapeTypes].sort(() => Math.random() - 0.5);
        this.shapes = shuffled.slice(0, this.total).map((shape, i) => ({
            ...shape,
            id: i,
            isMatched: false
        }));

        // Create holes in random order
        this.holes = [...this.shapes].sort(() => Math.random() - 0.5);

        this.render();
        this.setupEvents();
    },

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="shapes-game">
                <div class="shapes-header">
                    <span class="shapes-score">Gesorteerd: ${this.matched}/${this.total}</span>
                </div>
                <div class="shapes-board">
                    <div class="holes-area">
                        ${this.holes.map(hole => this.renderHole(hole)).join('')}
                    </div>
                    <div class="shapes-area">
                        ${this.shapes.filter(s => !s.isMatched).map(shape => this.renderShape(shape)).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderHole(hole) {
        const filled = this.shapes.find(s => s.name === hole.name && s.isMatched);
        return `
            <div class="shape-hole ${filled ? 'filled' : ''}" data-shape="${hole.name}">
                <div class="hole-outline" style="--shape-color: ${hole.color}">
                    ${this.getShapeSVG(hole.name, true)}
                </div>
                ${filled ? `<div class="hole-filled">${this.getShapeSVG(hole.name, false, hole.color)}</div>` : ''}
            </div>
        `;
    },

    renderShape(shape) {
        return `
            <div class="draggable-shape" data-shape="${shape.name}" data-id="${shape.id}">
                ${this.getShapeSVG(shape.name, false, shape.color)}
            </div>
        `;
    },

    getShapeSVG(shapeName, isOutline = false, color = '#ccc') {
        const stroke = isOutline ? 'stroke="#aaa" stroke-width="3" stroke-dasharray="8,4" fill="rgba(0,0,0,0.05)"' : `fill="${color}"`;
        const size = 80;

        switch(shapeName) {
            case 'circle':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" ${stroke}/>
                </svg>`;
            case 'square':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <rect x="10" y="10" width="80" height="80" rx="5" ${stroke}/>
                </svg>`;
            case 'triangle':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <polygon points="50,5 95,90 5,90" ${stroke}/>
                </svg>`;
            case 'star':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <polygon points="50,5 61,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 39,35" ${stroke}/>
                </svg>`;
            case 'heart':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <path d="M50,88 C20,60 5,40 15,25 C25,10 40,15 50,30 C60,15 75,10 85,25 C95,40 80,60 50,88Z" ${stroke}/>
                </svg>`;
            case 'diamond':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <polygon points="50,5 95,50 50,95 5,50" ${stroke}/>
                </svg>`;
            default:
                return '';
        }
    },

    setupEvents() {
        const shapes = this.container.querySelectorAll('.draggable-shape');

        shapes.forEach(shape => {
            // Touch events
            shape.addEventListener('touchstart', (e) => this.onDragStart(e, shape), { passive: false });
            shape.addEventListener('touchmove', (e) => this.onDragMove(e), { passive: false });
            shape.addEventListener('touchend', (e) => this.onDragEnd(e));

            // Mouse events
            shape.addEventListener('mousedown', (e) => this.onDragStart(e, shape));
        });

        document.addEventListener('mousemove', (e) => this.onDragMove(e));
        document.addEventListener('mouseup', (e) => this.onDragEnd(e));
    },

    onDragStart(e, shapeEl) {
        e.preventDefault();

        const touch = e.touches ? e.touches[0] : e;
        const rect = shapeEl.getBoundingClientRect();

        this.currentDragging = {
            element: shapeEl,
            shapeName: shapeEl.dataset.shape,
            shapeId: parseInt(shapeEl.dataset.id),
            offsetX: touch.clientX - rect.left - rect.width / 2,
            offsetY: touch.clientY - rect.top - rect.height / 2,
            startX: rect.left,
            startY: rect.top
        };

        shapeEl.classList.add('dragging');
        shapeEl.style.position = 'fixed';
        shapeEl.style.zIndex = '1000';
        shapeEl.style.left = (touch.clientX - rect.width / 2) + 'px';
        shapeEl.style.top = (touch.clientY - rect.height / 2) + 'px';

        if (typeof AudioManager !== 'undefined') {
            AudioManager.playClick();
        }
    },

    onDragMove(e) {
        if (!this.currentDragging) return;
        e.preventDefault();

        const touch = e.touches ? e.touches[0] : e;
        const el = this.currentDragging.element;
        const rect = el.getBoundingClientRect();

        el.style.left = (touch.clientX - rect.width / 2) + 'px';
        el.style.top = (touch.clientY - rect.height / 2) + 'px';
    },

    onDragEnd(e) {
        if (!this.currentDragging) return;

        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const el = this.currentDragging.element;

        // Check if dropped on matching hole
        const holes = this.container.querySelectorAll('.shape-hole');
        let matched = false;

        holes.forEach(hole => {
            const holeRect = hole.getBoundingClientRect();
            const dropX = touch.clientX;
            const dropY = touch.clientY;

            if (dropX >= holeRect.left && dropX <= holeRect.right &&
                dropY >= holeRect.top && dropY <= holeRect.bottom) {

                if (hole.dataset.shape === this.currentDragging.shapeName && !hole.classList.contains('filled')) {
                    // Match!
                    matched = true;
                    this.onMatch(this.currentDragging.shapeId, hole);
                }
            }
        });

        if (!matched) {
            // Return to original position
            el.classList.remove('dragging');
            el.style.position = '';
            el.style.zIndex = '';
            el.style.left = '';
            el.style.top = '';
        }

        this.currentDragging = null;
    },

    onMatch(shapeId, holeEl) {
        const shape = this.shapes.find(s => s.id === shapeId);
        if (shape) {
            shape.isMatched = true;
            this.matched++;

            if (typeof AudioManager !== 'undefined') {
                AudioManager.playPiecePlaced();
            }

            this.render();

            if (this.matched === this.total) {
                this.onGameComplete();
            }
        }
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        setTimeout(() => {
            if (this.container) {
                const celebrationEl = document.createElement('div');
                celebrationEl.className = 'shapes-celebration';
                celebrationEl.innerHTML = `
                    <div class="shapes-celebration-content">
                        <h2>🎉 Super! 🎉</h2>
                        <p>Alle vormen gesorteerd!</p>
                        <button class="shapes-play-again-btn" id="shapes-play-again">Opnieuw spelen</button>
                    </div>
                `;
                this.container.appendChild(celebrationEl);

                document.getElementById('shapes-play-again').addEventListener('click', () => {
                    this.reset();
                });
            }
        }, 500);
    }
};

window.ShapesGame = ShapesGame;
