// Shape Sorting Game for Toddlers
// Drag shapes to matching holes - WCAG accessible design

const ShapesGame = {
    container: null,
    shapes: [],
    holes: [],
    currentDragging: null,
    matched: 0,
    total: 0,

    // Shape definitions with high contrast WCAG compliant colors
    shapeTypes: [
        { name: 'circle', color: '#E53935', darkColor: '#B71C1C' },      // Red
        { name: 'square', color: '#1E88E5', darkColor: '#0D47A1' },       // Blue
        { name: 'triangle', color: '#FDD835', darkColor: '#F9A825' },     // Yellow
        { name: 'star', color: '#FB8C00', darkColor: '#E65100' },         // Orange
        { name: 'heart', color: '#8E24AA', darkColor: '#6A1B9A' },        // Purple
        { name: 'diamond', color: '#00ACC1', darkColor: '#006064' }       // Cyan
    ],

    difficulties: {
        easy: 3,
        medium: 4,
        hard: 5
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

        const shuffled = [...this.shapeTypes].sort(() => Math.random() - 0.5);
        this.shapes = shuffled.slice(0, this.total).map((shape, i) => ({
            ...shape,
            id: i,
            isMatched: false
        }));

        this.holes = [...this.shapes].sort(() => Math.random() - 0.5);

        this.render();
        this.setupEvents();
        this.syncGameState();
    },

    // Sync game state to Firebase for remote display
    syncGameState() {
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            const currentShape = this.shapes.find(s => !s.isMatched);
            TabletApp.roomRef.child('gameState').update({
                game: 'shapes',
                placed: this.matched,
                total: this.total,
                currentShape: currentShape ? this.getShapeEmoji(currentShape.name) : '',
                completed: this.matched === this.total,
                timestamp: Date.now()
            });
        }
    },

    getShapeEmoji(shapeName) {
        const emojis = {
            circle: '🔴',
            square: '🟦',
            triangle: '🔺',
            star: '⭐',
            heart: '❤️',
            diamond: '💎'
        };
        return emojis[shapeName] || '🔷';
    },

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="shapes-game">
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
                <div class="hole-outline">
                    ${this.getShapeSVG(hole.name, true, hole.darkColor)}
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

    getShapeSVG(shapeName, isOutline = false, color = '#666') {
        // Outline: white fill with colored dashed border
        // Filled: solid color
        const size = 120;
        const stroke = isOutline
            ? `stroke="${color}" stroke-width="4" stroke-dasharray="10,6" fill="white"`
            : `fill="${color}" stroke="#333" stroke-width="2"`;

        switch(shapeName) {
            case 'circle':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" ${stroke}/>
                </svg>`;
            case 'square':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <rect x="8" y="8" width="84" height="84" rx="8" ${stroke}/>
                </svg>`;
            case 'triangle':
                return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
                    <polygon points="50,8 92,88 8,88" ${stroke}/>
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
            shape.addEventListener('touchstart', (e) => this.onDragStart(e, shape), { passive: false });
            shape.addEventListener('touchmove', (e) => this.onDragMove(e), { passive: false });
            shape.addEventListener('touchend', (e) => this.onDragEnd(e));
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

        const holes = this.container.querySelectorAll('.shape-hole');
        let matched = false;

        holes.forEach(hole => {
            const holeRect = hole.getBoundingClientRect();
            const dropX = touch.clientX;
            const dropY = touch.clientY;

            if (dropX >= holeRect.left && dropX <= holeRect.right &&
                dropY >= holeRect.top && dropY <= holeRect.bottom) {

                if (hole.dataset.shape === this.currentDragging.shapeName && !hole.classList.contains('filled')) {
                    matched = true;
                    this.onMatch(this.currentDragging.shapeId, hole);
                }
            }
        });

        if (!matched) {
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
            this.syncGameState();

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
                        <h2>🎉</h2>
                        <button class="shapes-play-again-btn" id="shapes-play-again">🔄</button>
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
