// Puzzle Engine - Handles puzzle rendering, pieces, and animations

const PuzzleEngine = {
    canvas: null,
    ctx: null,
    puzzleImage: null,
    pieces: [],
    placedPieces: [],
    animatingPiece: null,
    totalPieces: 40,
    cols: 8,
    rows: 5,
    pieceWidth: 0,
    pieceHeight: 0,
    puzzleWidth: 0,
    puzzleHeight: 0,
    offsetX: 0,
    offsetY: 0,

    // Puzzle definitions with SVG-based images
    puzzles: [
        { name: 'Hond', emoji: '🐕', color: '#8B4513' },
        { name: 'Kat', emoji: '🐱', color: '#FFA500' },
        { name: 'Olifant', emoji: '🐘', color: '#808080' },
        { name: 'Leeuw', emoji: '🦁', color: '#DAA520' },
        { name: 'Giraffe', emoji: '🦒', color: '#F4A460' },
        { name: 'Eend', emoji: '🦆', color: '#FFD700' },
        { name: 'Konijn', emoji: '🐰', color: '#FFC0CB' },
        { name: 'Beer', emoji: '🐻', color: '#8B4513' },
        { name: 'Vis', emoji: '🐟', color: '#4169E1' },
        { name: 'Vogel', emoji: '🐦', color: '#FF6347' },
        { name: 'Koe', emoji: '🐄', color: '#000000' },
        { name: 'Varken', emoji: '🐷', color: '#FFB6C1' },
        { name: 'Paard', emoji: '🐴', color: '#8B4513' },
        { name: 'Schaap', emoji: '🐑', color: '#F5F5DC' },
        { name: 'Kikker', emoji: '🐸', color: '#32CD32' },
        { name: 'Schildpad', emoji: '🐢', color: '#228B22' },
        { name: 'Zebra', emoji: '🦓', color: '#000000' },
        { name: 'Pinguïn', emoji: '🐧', color: '#000000' },
        { name: 'Aap', emoji: '🐵', color: '#8B4513' },
        { name: 'Tijger', emoji: '🐯', color: '#FF8C00' },
        { name: 'Vlinder', emoji: '🦋', color: '#9370DB' },
        { name: 'Lieveheersbeestje', emoji: '🐞', color: '#FF0000' },
        { name: 'Bij', emoji: '🐝', color: '#FFD700' },
        { name: 'Slang', emoji: '🐍', color: '#228B22' },
        { name: 'Uil', emoji: '🦉', color: '#8B4513' }
    ],

    currentPuzzleIndex: 0,

    // Initialize the puzzle engine
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    },

    // Resize canvas to fit container
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;

        // Calculate puzzle dimensions maintaining aspect ratio
        const aspectRatio = this.cols / this.rows;
        let width = containerWidth;
        let height = width / aspectRatio;

        if (height > containerHeight) {
            height = containerHeight;
            width = height * aspectRatio;
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.puzzleWidth = width;
        this.puzzleHeight = height;
        this.pieceWidth = width / this.cols;
        this.pieceHeight = height / this.rows;

        this.redraw();
    },

    // Load a puzzle by index
    async loadPuzzle(index) {
        this.currentPuzzleIndex = index;
        this.placedPieces = [];
        this.pieces = this.generatePieceOrder();

        // Create puzzle image
        await this.createPuzzleImage(this.puzzles[index]);
        this.redraw();
    },

    // Generate puzzle image using canvas
    async createPuzzleImage(puzzle) {
        return new Promise((resolve) => {
            const img = document.createElement('canvas');
            img.width = this.puzzleWidth * 2; // Higher resolution
            img.height = this.puzzleHeight * 2;
            const ctx = img.getContext('2d');

            // Background gradient
            const gradient = ctx.createRadialGradient(
                img.width / 2, img.height / 2, 0,
                img.width / 2, img.height / 2, img.width / 2
            );
            gradient.addColorStop(0, this.lightenColor(puzzle.color, 60));
            gradient.addColorStop(1, this.lightenColor(puzzle.color, 30));
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, img.width, img.height);

            // Draw decorative elements
            this.drawDecorativeBackground(ctx, img.width, img.height, puzzle.color);

            // Draw large emoji in center
            ctx.font = `${Math.min(img.width, img.height) * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(puzzle.emoji, img.width / 2, img.height / 2);

            // Draw animal name
            ctx.font = `bold ${img.height * 0.08}px Arial`;
            ctx.fillStyle = '#333';
            ctx.fillText(puzzle.name.toUpperCase(), img.width / 2, img.height * 0.9);

            this.puzzleImage = img;
            resolve();
        });
    },

    // Draw decorative background elements
    drawDecorativeBackground(ctx, width, height, baseColor) {
        ctx.save();

        // Draw some circles/bubbles
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = 20 + Math.random() * 60;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = this.lightenColor(baseColor, 70 + Math.random() * 20);
            ctx.globalAlpha = 0.3;
            ctx.fill();
        }

        // Draw some stars
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 10 + Math.random() * 20;
            this.drawStar(ctx, x, y, size, '#FFD700');
        }

        ctx.restore();
    },

    // Draw a star
    drawStar(ctx, x, y, size, color) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    },

    // Lighten a color
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `rgb(${R}, ${G}, ${B})`;
    },

    // Generate random order for pieces
    generatePieceOrder() {
        const pieces = [];
        for (let i = 0; i < this.totalPieces; i++) {
            pieces.push(i);
        }
        // Shuffle using Fisher-Yates
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        return pieces;
    },

    // Get piece position from index
    getPiecePosition(pieceIndex) {
        const col = pieceIndex % this.cols;
        const row = Math.floor(pieceIndex / this.cols);
        return {
            x: col * this.pieceWidth,
            y: row * this.pieceHeight,
            col,
            row
        };
    },

    // Draw the puzzle
    redraw() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background grid
        this.drawGrid();

        // Draw placed pieces
        this.placedPieces.forEach(pieceIndex => {
            this.drawPiece(pieceIndex);
        });

        // Draw animating piece if any
        if (this.animatingPiece) {
            this.drawAnimatingPiece();
        }
    },

    // Draw background grid showing where pieces go
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        this.ctx.lineWidth = 1;

        // Draw grid lines
        for (let col = 0; col <= this.cols; col++) {
            const x = col * this.pieceWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.puzzleHeight);
            this.ctx.stroke();
        }

        for (let row = 0; row <= this.rows; row++) {
            const y = row * this.pieceHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.puzzleWidth, y);
            this.ctx.stroke();
        }

        // Draw puzzle outline
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this.puzzleWidth, this.puzzleHeight);
    },

    // Draw a single piece
    drawPiece(pieceIndex) {
        if (!this.puzzleImage) return;

        const pos = this.getPiecePosition(pieceIndex);
        const sourceScale = 2; // Because we create image at 2x resolution

        // Draw the piece from the puzzle image
        this.ctx.drawImage(
            this.puzzleImage,
            pos.x * sourceScale, pos.y * sourceScale,
            this.pieceWidth * sourceScale, this.pieceHeight * sourceScale,
            pos.x, pos.y,
            this.pieceWidth, this.pieceHeight
        );

        // Draw jigsaw-style border for visual effect
        this.drawPieceBorder(pos.x, pos.y, this.pieceWidth, this.pieceHeight, pieceIndex);
    },

    // Draw jigsaw piece border
    drawPieceBorder(x, y, width, height, pieceIndex) {
        const col = pieceIndex % this.cols;
        const row = Math.floor(pieceIndex / this.cols);

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;

        // Draw the border with tabs/notches for jigsaw effect
        this.ctx.beginPath();

        // Top edge
        this.ctx.moveTo(x, y);
        if (row > 0) {
            // Add notch at top
            this.ctx.lineTo(x + width * 0.35, y);
            this.ctx.arc(x + width * 0.5, y, width * 0.08, Math.PI, 0, pieceIndex % 2 === 0);
            this.ctx.lineTo(x + width, y);
        } else {
            this.ctx.lineTo(x + width, y);
        }

        // Right edge
        if (col < this.cols - 1) {
            this.ctx.lineTo(x + width, y + height * 0.35);
            this.ctx.arc(x + width, y + height * 0.5, height * 0.08, -Math.PI/2, Math.PI/2, (pieceIndex + 1) % 2 === 0);
            this.ctx.lineTo(x + width, y + height);
        } else {
            this.ctx.lineTo(x + width, y + height);
        }

        // Bottom edge
        if (row < this.rows - 1) {
            this.ctx.lineTo(x + width * 0.65, y + height);
            this.ctx.arc(x + width * 0.5, y + height, width * 0.08, 0, Math.PI, (pieceIndex + row) % 2 === 0);
            this.ctx.lineTo(x, y + height);
        } else {
            this.ctx.lineTo(x, y + height);
        }

        // Left edge
        if (col > 0) {
            this.ctx.lineTo(x, y + height * 0.65);
            this.ctx.arc(x, y + height * 0.5, height * 0.08, Math.PI/2, -Math.PI/2, (pieceIndex + col) % 2 === 0);
            this.ctx.lineTo(x, y);
        } else {
            this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();
        this.ctx.restore();
    },

    // Draw the animating piece
    drawAnimatingPiece() {
        if (!this.animatingPiece || !this.puzzleImage) return;

        const { pieceIndex, currentX, currentY, targetX, targetY, scale, opacity } = this.animatingPiece;
        const sourceScale = 2;
        const pos = this.getPiecePosition(pieceIndex);

        this.ctx.save();
        this.ctx.globalAlpha = opacity;

        // Draw piece at current animation position
        const drawWidth = this.pieceWidth * scale;
        const drawHeight = this.pieceHeight * scale;
        const drawX = currentX - drawWidth / 2;
        const drawY = currentY - drawHeight / 2;

        // Shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetY = 5;

        this.ctx.drawImage(
            this.puzzleImage,
            pos.x * sourceScale, pos.y * sourceScale,
            this.pieceWidth * sourceScale, this.pieceHeight * sourceScale,
            drawX, drawY,
            drawWidth, drawHeight
        );

        this.ctx.restore();
    },

    // Animate placing a piece
    placePiece(callback) {
        if (this.pieces.length === 0 || this.animatingPiece) {
            if (callback) callback(false);
            return;
        }

        const pieceIndex = this.pieces.shift();
        const targetPos = this.getPiecePosition(pieceIndex);

        // Start position (from top of canvas)
        const startX = this.puzzleWidth / 2;
        const startY = -this.pieceHeight;

        // Target position (center of piece slot)
        const targetX = targetPos.x + this.pieceWidth / 2;
        const targetY = targetPos.y + this.pieceHeight / 2;

        this.animatingPiece = {
            pieceIndex,
            currentX: startX,
            currentY: startY,
            targetX,
            targetY,
            scale: 1.3,
            opacity: 0.8,
            startTime: performance.now(),
            duration: 800 // milliseconds
        };

        this.animatePiece(callback);
    },

    // Animation loop for piece placement
    animatePiece(callback) {
        if (!this.animatingPiece) return;

        const now = performance.now();
        const elapsed = now - this.animatingPiece.startTime;
        const progress = Math.min(elapsed / this.animatingPiece.duration, 1);

        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        // Update position
        const { currentX, currentY, targetX, targetY, pieceIndex } = this.animatingPiece;
        const startX = this.puzzleWidth / 2;
        const startY = -this.pieceHeight;

        this.animatingPiece.currentX = startX + (targetX - startX) * easeProgress;
        this.animatingPiece.currentY = startY + (targetY - startY) * easeProgress;
        this.animatingPiece.scale = 1.3 - 0.3 * easeProgress;
        this.animatingPiece.opacity = 0.8 + 0.2 * easeProgress;

        this.redraw();

        if (progress < 1) {
            requestAnimationFrame(() => this.animatePiece(callback));
        } else {
            // Animation complete
            this.placedPieces.push(pieceIndex);
            this.animatingPiece = null;
            this.redraw();

            // Flash effect
            this.flashEffect();

            if (callback) callback(true);
        }
    },

    // Flash effect when piece is placed
    flashEffect() {
        const flash = document.createElement('div');
        flash.className = 'piece-flash';
        this.canvas.parentElement.appendChild(flash);

        setTimeout(() => flash.remove(), 300);
    },

    // Check if puzzle is complete
    isComplete() {
        return this.placedPieces.length >= this.totalPieces;
    },

    // Get progress
    getProgress() {
        return {
            placed: this.placedPieces.length,
            total: this.totalPieces,
            percent: (this.placedPieces.length / this.totalPieces) * 100
        };
    },

    // Get remaining pieces to place
    getRemainingPieces() {
        return this.pieces.length;
    },

    // Set placed pieces (for loading saved state)
    setPlacedPieces(count) {
        this.placedPieces = [];
        const allPieces = [...Array(this.totalPieces).keys()];

        // Shuffle to get random order
        for (let i = allPieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allPieces[i], allPieces[j]] = [allPieces[j], allPieces[i]];
        }

        // Place the specified count
        for (let i = 0; i < Math.min(count, this.totalPieces); i++) {
            this.placedPieces.push(allPieces[i]);
        }

        // Remaining pieces are the ones not placed
        this.pieces = allPieces.slice(count);

        this.redraw();
    },

    // Reset puzzle
    reset() {
        this.placedPieces = [];
        this.pieces = this.generatePieceOrder();
        this.animatingPiece = null;
        this.redraw();
    },

    // Get puzzle list for selection
    getPuzzleList() {
        return this.puzzles.map((puzzle, index) => ({
            index,
            name: puzzle.name,
            emoji: puzzle.emoji,
            color: puzzle.color
        }));
    }
};

// Make globally available
window.PuzzleEngine = PuzzleEngine;
