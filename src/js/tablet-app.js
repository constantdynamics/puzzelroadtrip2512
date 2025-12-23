// Tablet App - Simplified view for children
// All settings are controlled via remote (phone)

const TabletApp = {
    state: null,
    timerAnimationFrame: null,

    // Manual mode state
    collectedPieces: [], // Pieces available to place
    draggingPiece: null,
    dragStartPos: null,

    // Getter for roomRef - delegates to RemoteControl
    get roomRef() {
        return typeof RemoteControl !== 'undefined' ? RemoteControl.roomRef : null;
    },

    // Age-based snap tolerance (percentage of piece size)
    snapTolerances: {
        1: 0.6,  // 60% tolerance - very forgiving
        2: 0.5,  // 50% tolerance - forgiving
        3: 0.4,  // 40% tolerance
        4: 0.3,  // 30% tolerance
        5: 0.2   // 20% tolerance - more precise
    },

    async init() {
        console.log('Tablet App initializing...');

        // Load saved state
        this.state = StorageManager.load();

        // Initialize audio
        AudioManager.init();
        AudioManager.setEnabled(this.state.soundEnabled);
        AudioManager.setVolume(this.state.volume / 100);

        // Initialize puzzle engine with piece count
        PuzzleEngine.init('puzzle-canvas');
        PuzzleEngine.setPieceCount(this.state.pieceCount || 40);

        // Load custom image if saved
        if (this.state.customImage) {
            PuzzleEngine.setCustomImage(this.state.customImage);
        }

        // Initialize timer
        TimerManager.init(this.state.timerInterval);
        TimerManager.loadState({
            remaining: this.state.timerRemaining,
            isPaused: this.state.timerPaused
        });

        // Set up timer callbacks
        TimerManager.onTick = (remaining) => this.updateTimeDisplay();
        TimerManager.onPieceEarned = () => this.onTimerComplete();

        // Load current puzzle
        await PuzzleEngine.loadPuzzle(this.state.currentPuzzleIndex);
        PuzzleEngine.setPlacedPieces(this.state.piecesPlaced);

        // Update UI
        this.updateUI();
        this.updateVehicle(this.state.vehicle || '🏍️');

        // Apply saved background color
        if (this.state.bgColor) {
            this.setBackgroundColor(this.state.bgColor);
        }

        // Start timer
        TimerManager.start();

        // Start visual timer animation
        this.startVisualTimerAnimation();

        // Initialize game manager
        GameManager.init();

        // Setup celebration button
        document.getElementById('next-puzzle-btn').addEventListener('click', () => {
            this.nextPuzzle();
        });

        // Auto-enter fullscreen on first touch (required by browsers)
        const enterFullscreenOnTouch = () => {
            this.enterFullscreen();
            document.removeEventListener('touchstart', enterFullscreenOnTouch);
            document.removeEventListener('click', enterFullscreenOnTouch);
        };
        document.addEventListener('touchstart', enterFullscreenOnTouch, { once: true });
        document.addEventListener('click', enterFullscreenOnTouch, { once: true });

        // Listen for fullscreen changes to sync status to remote
        document.addEventListener('fullscreenchange', () => this.syncFullscreenStatus());
        document.addEventListener('webkitfullscreenchange', () => this.syncFullscreenStatus());

        // Start remote control automatically
        this.startRemoteControl();

        // Listen for state updates from remote
        this.listenForRemoteUpdates();

        // Auto-save periodically
        setInterval(() => this.saveState(), 30000);

        console.log('Tablet App initialized');
    },

    // Start remote control and show code
    async startRemoteControl() {
        try {
            const code = await RemoteControl.createRoom();
            console.log('Remote control ready, code:', code);

            // Display the code on screen
            this.showPairingCode(code);

            // Store code in state for remote to read
            this.state.remoteCode = code;
            this.saveState();

            // Set up callback for when piece is received
            RemoteControl.onPieceReceived = () => {
                this.onRemotePieceReceived();
            };

            // Listen for settings updates
            RemoteControl.onSettingsReceived = (settings) => {
                this.onRemoteSettingsReceived(settings);
            };

        } catch (error) {
            console.error('Remote control error:', error);
            // Retry after 5 seconds
            setTimeout(() => this.startRemoteControl(), 5000);
        }
    },

    // Listen for state updates from remote via Firebase
    listenForRemoteUpdates() {
        // Use real-time listener instead of polling for better responsiveness
        const setupListener = () => {
            if (RemoteControl.roomRef) {
                console.log('Setting up real-time settings listener');
                RemoteControl.roomRef.child('settings').on('value', (snapshot) => {
                    const settings = snapshot.val();
                    if (settings && settings.timestamp > (this.lastSettingsTimestamp || 0)) {
                        console.log('New settings received:', settings);
                        this.lastSettingsTimestamp = settings.timestamp;
                        this.applyRemoteSettings(settings);
                    }
                });
            } else {
                // Retry until roomRef is available
                setTimeout(setupListener, 1000);
            }
        };

        // Start after a short delay to ensure Firebase is ready
        setTimeout(setupListener, 2000);
    },

    // Apply settings received from remote
    applyRemoteSettings(settings) {
        console.log('Applying remote settings:', settings);

        if (settings.volume !== undefined) {
            this.state.volume = settings.volume;
            AudioManager.setVolume(settings.volume / 100);
        }

        if (settings.soundEnabled !== undefined) {
            this.state.soundEnabled = settings.soundEnabled;
            AudioManager.setEnabled(settings.soundEnabled);
        }

        if (settings.timerInterval !== undefined && settings.timerInterval !== this.state.timerInterval) {
            this.state.timerInterval = settings.timerInterval;
            TimerManager.setInterval(settings.timerInterval);
        }

        if (settings.vehicle !== undefined) {
            this.state.vehicle = settings.vehicle;
            this.updateVehicle(settings.vehicle);
        }

        if (settings.pieceCount !== undefined && settings.pieceCount !== this.state.pieceCount) {
            this.state.pieceCount = settings.pieceCount;
            PuzzleEngine.setPieceCount(settings.pieceCount);
            this.resetCurrentPuzzle();
        }

        if (settings.timerPaused !== undefined) {
            if (settings.timerPaused && !TimerManager.isPaused) {
                TimerManager.pause();
            } else if (!settings.timerPaused && TimerManager.isPaused) {
                TimerManager.resume();
            }
        }

        if (settings.resetPuzzle) {
            this.resetCurrentPuzzle();
            // Clear one-time action
            if (RemoteControl.roomRef) {
                RemoteControl.roomRef.child('settings/resetPuzzle').remove();
            }
        }

        if (settings.changePuzzle !== undefined && settings.changePuzzle !== null) {
            this.changePuzzle(settings.changePuzzle);
            // Clear the setting so it doesn't trigger again
            if (RemoteControl.roomRef) {
                RemoteControl.roomRef.child('settings/changePuzzle').remove();
            }
        }

        if (settings.nextPuzzle) {
            this.nextPuzzle();
            // Clear one-time action
            if (RemoteControl.roomRef) {
                RemoteControl.roomRef.child('settings/nextPuzzle').remove();
            }
        }

        if (settings.customImage) {
            this.loadCustomImage(settings.customImage);
            // Clear to avoid re-processing large image data
            if (RemoteControl.roomRef) {
                RemoteControl.roomRef.child('settings/customImage').remove();
            }
        }

        if (settings.bgColor) {
            this.setBackgroundColor(settings.bgColor);
        }

        if (settings.puzzleMode !== undefined) {
            this.setPuzzleMode(settings.puzzleMode);
        }

        if (settings.puzzleLines !== undefined) {
            PuzzleEngine.setShowPuzzleLines(settings.puzzleLines);
        }

        if (settings.pieceStyle !== undefined) {
            PuzzleEngine.setPieceStyle(settings.pieceStyle);
            // Re-render piece tray if in manual mode
            if (this.state.puzzleMode === 'manual') {
                this.renderPieceTray();
            }
        }

        if (settings.age !== undefined) {
            this.state.age = settings.age;
            console.log('Age set to:', settings.age, 'snap tolerance:', this.snapTolerances[settings.age]);
        }

        // Game switching - triggered by switchGame flag from remote
        if (settings.switchGame && settings.currentGame !== undefined) {
            console.log('Switching to game:', settings.currentGame);
            GameManager.switchGame(settings.currentGame);
            this.state.currentGame = settings.currentGame;
            // Clear the one-time action
            if (RemoteControl.roomRef) {
                RemoteControl.roomRef.child('settings/switchGame').remove();
            }
        }

        // Screen off mode
        if (settings.screenOff !== undefined) {
            this.setScreenOff(settings.screenOff);
        }

        // Fullscreen toggle from remote
        if (settings.enterFullscreen) {
            this.enterFullscreen();
            if (RemoteControl.roomRef) {
                RemoteControl.roomRef.child('settings/enterFullscreen').remove();
            }
        }

        // Memory game settings
        if (settings.memoryDifficulty !== undefined) {
            GameManager.setMemoryDifficulty(settings.memoryDifficulty);
        }

        if (settings.memoryTheme !== undefined) {
            GameManager.setMemoryTheme(settings.memoryTheme);
        }

        // Shapes game settings
        if (settings.shapesDifficulty !== undefined) {
            GameManager.setShapesDifficulty(settings.shapesDifficulty);
        }

        // Colors game settings
        if (settings.colorsDifficulty !== undefined) {
            GameManager.setColorsDifficulty(settings.colorsDifficulty);
        }

        // Counting game settings
        if (settings.countingDifficulty !== undefined) {
            GameManager.setCountingDifficulty(settings.countingDifficulty);
        }

        // Shadow game settings
        if (settings.shadowCategory !== undefined) {
            if (typeof ShadowGame !== 'undefined') {
                ShadowGame.setCategory(settings.shadowCategory);
                ShadowGame.reset();
            }
        }

        if (settings.shadowCount !== undefined) {
            if (typeof ShadowGame !== 'undefined') {
                ShadowGame.setCount(settings.shadowCount);
                ShadowGame.reset();
            }
        }

        // Drawing/Pictionary category
        if (settings.drawingCategory !== undefined) {
            GameManager.setDrawingCategory(settings.drawingCategory);
        }

        // Pictionary multiplayer settings
        if (settings.pictionaryMultiplayer !== undefined) {
            if (typeof DrawingGame !== 'undefined') {
                DrawingGame.setMultiplayerMode(settings.pictionaryMultiplayer);
            }
        }

        if (settings.pictionaryNewWord) {
            if (typeof DrawingGame !== 'undefined') {
                DrawingGame.newPrompt();
            }
            if (RemoteControl.roomRef) {
                RemoteControl.roomRef.child('settings/pictionaryNewWord').remove();
            }
        }

        if (settings.pictionaryDrawer !== undefined) {
            if (typeof DrawingGame !== 'undefined') {
                DrawingGame.setDrawer(settings.pictionaryDrawer);
                // Refresh the prompt display based on new drawer
                const promptEl = document.getElementById('drawing-prompt');
                if (promptEl && DrawingGame.currentPrompt) {
                    if (DrawingGame.multiplayerMode && settings.pictionaryDrawer === 'parent') {
                        promptEl.innerHTML = `
                            <span class="prompt-emoji">🤫</span>
                            <span class="prompt-text">Raad wat papa/mama tekent!</span>
                        `;
                    } else {
                        promptEl.innerHTML = `
                            <span class="prompt-emoji">${DrawingGame.currentPrompt.emoji}</span>
                            <span class="prompt-text">${DrawingGame.currentPrompt.text}</span>
                        `;
                    }
                }
                DrawingGame.syncGameState();
            }
        }

        // Counting game answer from remote
        if (settings.countingAnswer !== undefined) {
            if (typeof CountingGame !== 'undefined') {
                CountingGame.submitAnswer(settings.countingAnswer);
            }
            if (RemoteControl.roomRef) {
                RemoteControl.roomRef.child('settings/countingAnswer').remove();
            }
        }

        this.saveState();
    },

    // Set puzzle mode (auto/manual)
    setPuzzleMode(mode) {
        this.state.puzzleMode = mode;
        const tray = document.getElementById('piece-tray');

        if (mode === 'manual') {
            tray.style.display = 'block';
            this.setupManualModeEvents();
            this.renderPieceTray();
        } else {
            tray.style.display = 'none';
        }

        console.log('Puzzle mode set to:', mode);
    },

    // Setup touch/mouse events for manual mode
    setupManualModeEvents() {
        if (this.manualModeSetup) return;
        this.manualModeSetup = true;

        const puzzleContainer = document.querySelector('.puzzle-container');
        const trayItems = document.getElementById('piece-tray-items');

        // Touch events for dragging pieces
        trayItems.addEventListener('touchstart', (e) => this.onPieceDragStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.onPieceDragMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.onPieceDragEnd(e));

        // Mouse events for testing on desktop
        trayItems.addEventListener('mousedown', (e) => this.onPieceDragStart(e));
        document.addEventListener('mousemove', (e) => this.onPieceDragMove(e));
        document.addEventListener('mouseup', (e) => this.onPieceDragEnd(e));
    },

    // Background color presets
    bgColorPresets: {
        ocean: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        sunset: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
        forest: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        candy: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        sky: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
        berry: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
        sunshine: 'linear-gradient(135deg, #F7971E 0%, #FFD200 100%)',
        mint: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
        flamingo: 'linear-gradient(135deg, #fc67fa 0%, #f4c4f3 100%)',
        night: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
    },

    // Set background color
    setBackgroundColor(colorName) {
        const gradient = this.bgColorPresets[colorName];
        if (gradient) {
            document.body.style.background = gradient;
            this.state.bgColor = colorName;
        }
    },

    // Load a custom image as puzzle
    async loadCustomImage(imageData) {
        console.log('Loading custom image...');
        this.state.customImage = imageData;
        PuzzleEngine.setCustomImage(imageData);

        // Reload the puzzle to apply the custom image
        this.state.piecesPlaced = 0;
        await PuzzleEngine.loadPuzzle(this.state.currentPuzzleIndex);

        TimerManager.reset();
        TimerManager.start();

        this.updateProgress();
        this.saveState();

        // Update preview name
        const previewName = document.getElementById('preview-puzzle-name');
        if (previewName) previewName.textContent = '📷 Eigen Foto';
    },

    // Handle piece received from remote
    onRemotePieceReceived() {
        console.log('Remote piece received!');

        // Add a saved piece
        this.state.savedPieces++;
        this.updateSavedCount();
        AudioManager.playTaskComplete();

        // In manual mode, add to collection instead of auto-placing
        if (this.state.puzzleMode === 'manual') {
            this.addPieceToCollection();
            return;
        }

        // Auto-place piece if puzzle not complete (auto mode)
        if (!PuzzleEngine.isComplete()) {
            this.placeSavedPiece();
        }
    },

    // Add a piece to the collection tray (manual mode)
    addPieceToCollection() {
        if (PuzzleEngine.pieces.length === 0) return;

        const pieceIndex = PuzzleEngine.pieces.shift();
        this.collectedPieces.push(pieceIndex);
        this.renderPieceTray();

        // Visual feedback
        const tray = document.getElementById('piece-tray');
        tray.classList.add('pulse');
        setTimeout(() => tray.classList.remove('pulse'), 300);
    },

    // Render the pieces in the tray
    renderPieceTray() {
        const trayItems = document.getElementById('piece-tray-items');
        const trayCount = document.getElementById('piece-tray-count');

        trayItems.innerHTML = '';
        trayCount.textContent = this.collectedPieces.length;

        this.collectedPieces.forEach((pieceIndex, arrayIndex) => {
            const pieceEl = document.createElement('div');
            pieceEl.className = 'tray-piece';
            pieceEl.dataset.pieceIndex = pieceIndex;
            pieceEl.dataset.arrayIndex = arrayIndex;

            // Create mini canvas for piece preview
            const canvas = document.createElement('canvas');
            canvas.width = 80;
            canvas.height = 80;
            this.drawPiecePreview(canvas, pieceIndex);
            pieceEl.appendChild(canvas);

            trayItems.appendChild(pieceEl);
        });
    },

    // Draw a piece preview on a mini canvas with shape based on style
    drawPiecePreview(canvas, pieceIndex) {
        const ctx = canvas.getContext('2d');
        const pos = PuzzleEngine.getPiecePosition(pieceIndex);
        const edges = PuzzleEngine.getEdgePattern(pieceIndex);
        const style = PuzzleEngine.pieceStyle || 'simple';

        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the piece from the puzzle image
        if (PuzzleEngine.puzzleImage) {
            const sourceScale = 2;
            const pieceW = PuzzleEngine.pieceWidth;
            const pieceH = PuzzleEngine.pieceHeight;

            // Calculate margin based on style (same as PuzzleEngine)
            const margin = (style === 'simple') ? 0 : Math.min(pieceW, pieceH) * 0.15;

            // Calculate scale to fit piece in canvas
            const totalW = pieceW + margin * 2;
            const totalH = pieceH + margin * 2;
            const scale = Math.min(canvas.width / totalW, canvas.height / totalH) * 0.9;

            // Center the piece in canvas
            const offsetX = canvas.width / 2;
            const offsetY = canvas.height / 2;

            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(scale, scale);

            // Create clipping path centered at origin
            this.createPiecePathForPreview(ctx, -pieceW/2, -pieceH/2, pieceW, pieceH, edges);
            ctx.clip();

            // Draw the piece image - source from puzzle image at correct position
            ctx.drawImage(
                PuzzleEngine.puzzleImage,
                (pos.x - margin) * sourceScale, (pos.y - margin) * sourceScale,
                (pieceW + margin * 2) * sourceScale, (pieceH + margin * 2) * sourceScale,
                -pieceW/2 - margin, -pieceH/2 - margin,
                pieceW + margin * 2, pieceH + margin * 2
            );

            ctx.restore();

            // Draw border
            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(scale, scale);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 2 / scale;
            this.createPiecePathForPreview(ctx, -pieceW/2, -pieceH/2, pieceW, pieceH, edges);
            ctx.stroke();
            ctx.restore();
        }
    },

    // Create piece path for preview based on current style
    createPiecePathForPreview(ctx, x, y, width, height, edges) {
        const style = PuzzleEngine.pieceStyle || 'simple';

        if (style === 'simple') {
            ctx.beginPath();
            ctx.rect(x, y, width, height);
        } else if (style === 'geometric') {
            this.createGeometricPathForPreview(ctx, x, y, width, height, edges);
        } else if (style === 'shapes') {
            this.createUniqueShapePathForPreview(ctx, x, y, width, height, edges);
        } else {
            this.createJigsawPathForPreview(ctx, x, y, width, height, edges);
        }
    },

    // Seeded random for consistent shapes (same as PuzzleEngine)
    seededRandom(seed) {
        const x = Math.sin(seed * 9999) * 10000;
        return x - Math.floor(x);
    },

    // Get edge curve for wavy edges (same algorithm as PuzzleEngine)
    getEdgeCurve(edgeId, length, amplitude) {
        const seed = edgeId * 137 + 42;
        const numBumps = 2 + Math.floor(this.seededRandom(seed) * 3);
        const points = [];
        for (let i = 0; i <= numBumps; i++) {
            const t = i / numBumps;
            const bumpSeed = seed + i * 23;
            const amp = (this.seededRandom(bumpSeed) - 0.5) * amplitude * 2;
            const offset = (this.seededRandom(bumpSeed + 1) - 0.5) * 0.2;
            points.push({ t: t + offset * (i > 0 && i < numBumps ? 1 : 0), amp });
        }
        return points;
    },

    // Draw wavy edge for preview (same algorithm as PuzzleEngine)
    drawWavyEdgeForPreview(ctx, x1, y1, x2, y2, edgeId, amplitude, invert) {
        const curve = this.getEdgeCurve(edgeId, 1, amplitude);
        const dx = x2 - x1;
        const dy = y2 - y1;
        const px = -dy;
        const py = dx;
        const len = Math.sqrt(px * px + py * py);
        const nx = px / len;
        const ny = py / len;

        const segments = 20;
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const bx = x1 + dx * t;
            const by = y1 + dy * t;

            let waveOffset = 0;
            for (const point of curve) {
                const dist = Math.abs(t - point.t);
                const influence = Math.exp(-dist * dist * 20);
                waveOffset += point.amp * influence;
            }

            if (invert) waveOffset = -waveOffset;

            const fx = bx + nx * waveOffset;
            const fy = by + ny * waveOffset;

            ctx.lineTo(fx, fy);
        }
    },

    // Unique shapes path for preview - wavy edges that tile perfectly (same as PuzzleEngine)
    createUniqueShapePathForPreview(ctx, x, y, width, height, edges) {
        const pieceIndex = edges.pieceIndex || 0;
        const cols = PuzzleEngine.cols;
        const rows = PuzzleEngine.rows;
        const col = pieceIndex % cols;
        const row = Math.floor(pieceIndex / cols);
        const amplitude = Math.min(width, height) * 0.08;

        ctx.beginPath();

        // Top edge
        ctx.moveTo(x, y);
        if (row === 0) {
            ctx.lineTo(x + width, y);
        } else {
            const edgeId = row * 1000 + col;
            this.drawWavyEdgeForPreview(ctx, x, y, x + width, y, edgeId, amplitude, false);
        }

        // Right edge
        if (col === cols - 1) {
            ctx.lineTo(x + width, y + height);
        } else {
            const edgeId = 50000 + row * 1000 + col + 1;
            this.drawWavyEdgeForPreview(ctx, x + width, y, x + width, y + height, edgeId, amplitude, true);
        }

        // Bottom edge (reverse)
        if (row === rows - 1) {
            ctx.lineTo(x, y + height);
        } else {
            const edgeId = (row + 1) * 1000 + col;
            this.drawWavyEdgeForPreview(ctx, x + width, y + height, x, y + height, edgeId, amplitude, true);
        }

        // Left edge (reverse)
        if (col === 0) {
            ctx.lineTo(x, y);
        } else {
            const edgeId = 50000 + row * 1000 + col;
            this.drawWavyEdgeForPreview(ctx, x, y + height, x, y, edgeId, amplitude, false);
        }

        ctx.closePath();
    },

    // Geometric style path for preview
    createGeometricPathForPreview(ctx, x, y, width, height, edges) {
        const bumpSize = Math.min(width, height) * 0.12;
        const cornerRadius = Math.min(width, height) * 0.05;

        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);

        // Top edge
        if (edges.top === 0) {
            ctx.lineTo(x + width - cornerRadius, y);
        } else {
            const midX = x + width / 2;
            ctx.lineTo(midX - bumpSize, y);
            ctx.arc(midX, y, bumpSize, Math.PI, 0, edges.top > 0);
            ctx.lineTo(x + width - cornerRadius, y);
        }

        ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);

        // Right edge
        if (edges.right === 0) {
            ctx.lineTo(x + width, y + height - cornerRadius);
        } else {
            const midY = y + height / 2;
            ctx.lineTo(x + width, midY - bumpSize);
            ctx.arc(x + width, midY, bumpSize, -Math.PI/2, Math.PI/2, edges.right < 0);
            ctx.lineTo(x + width, y + height - cornerRadius);
        }

        ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);

        // Bottom edge
        if (edges.bottom === 0) {
            ctx.lineTo(x + cornerRadius, y + height);
        } else {
            const midX = x + width / 2;
            ctx.lineTo(midX + bumpSize, y + height);
            ctx.arc(midX, y + height, bumpSize, 0, Math.PI, edges.bottom < 0);
            ctx.lineTo(x + cornerRadius, y + height);
        }

        ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);

        // Left edge
        if (edges.left === 0) {
            ctx.lineTo(x, y + cornerRadius);
        } else {
            const midY = y + height / 2;
            ctx.lineTo(x, midY + bumpSize);
            ctx.arc(x, midY, bumpSize, Math.PI/2, -Math.PI/2, edges.left > 0);
            ctx.lineTo(x, y + cornerRadius);
        }

        ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
        ctx.closePath();
    },

    // Classic jigsaw path for preview
    createJigsawPathForPreview(ctx, x, y, width, height, edges) {
        const tabSize = Math.min(width, height) * 0.15;
        const neckWidth = tabSize * 0.4;

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Top edge
        if (edges.top === 0) {
            ctx.lineTo(x + width, y);
        } else {
            const dir = edges.top;
            const midX = x + width / 2;
            ctx.lineTo(midX - tabSize, y);
            ctx.bezierCurveTo(midX - neckWidth, y, midX - neckWidth, y - dir * tabSize * 0.4, midX - neckWidth, y - dir * tabSize * 0.6);
            ctx.bezierCurveTo(midX - tabSize * 0.9, y - dir * tabSize, midX + tabSize * 0.9, y - dir * tabSize, midX + neckWidth, y - dir * tabSize * 0.6);
            ctx.bezierCurveTo(midX + neckWidth, y - dir * tabSize * 0.4, midX + neckWidth, y, midX + tabSize, y);
            ctx.lineTo(x + width, y);
        }

        // Right edge
        if (edges.right === 0) {
            ctx.lineTo(x + width, y + height);
        } else {
            const dir = edges.right;
            const midY = y + height / 2;
            ctx.lineTo(x + width, midY - tabSize);
            ctx.bezierCurveTo(x + width, midY - neckWidth, x + width + dir * tabSize * 0.4, midY - neckWidth, x + width + dir * tabSize * 0.6, midY - neckWidth);
            ctx.bezierCurveTo(x + width + dir * tabSize, midY - tabSize * 0.9, x + width + dir * tabSize, midY + tabSize * 0.9, x + width + dir * tabSize * 0.6, midY + neckWidth);
            ctx.bezierCurveTo(x + width + dir * tabSize * 0.4, midY + neckWidth, x + width, midY + neckWidth, x + width, midY + tabSize);
            ctx.lineTo(x + width, y + height);
        }

        // Bottom edge
        if (edges.bottom === 0) {
            ctx.lineTo(x, y + height);
        } else {
            const dir = edges.bottom;
            const midX = x + width / 2;
            ctx.lineTo(midX + tabSize, y + height);
            ctx.bezierCurveTo(midX + neckWidth, y + height, midX + neckWidth, y + height + dir * tabSize * 0.4, midX + neckWidth, y + height + dir * tabSize * 0.6);
            ctx.bezierCurveTo(midX + tabSize * 0.9, y + height + dir * tabSize, midX - tabSize * 0.9, y + height + dir * tabSize, midX - neckWidth, y + height + dir * tabSize * 0.6);
            ctx.bezierCurveTo(midX - neckWidth, y + height + dir * tabSize * 0.4, midX - neckWidth, y + height, midX - tabSize, y + height);
            ctx.lineTo(x, y + height);
        }

        // Left edge
        if (edges.left === 0) {
            ctx.lineTo(x, y);
        } else {
            const dir = edges.left;
            const midY = y + height / 2;
            ctx.lineTo(x, midY + tabSize);
            ctx.bezierCurveTo(x, midY + neckWidth, x - dir * tabSize * 0.4, midY + neckWidth, x - dir * tabSize * 0.6, midY + neckWidth);
            ctx.bezierCurveTo(x - dir * tabSize, midY + tabSize * 0.9, x - dir * tabSize, midY - tabSize * 0.9, x - dir * tabSize * 0.6, midY - neckWidth);
            ctx.bezierCurveTo(x - dir * tabSize * 0.4, midY - neckWidth, x, midY - neckWidth, x, midY - tabSize);
            ctx.lineTo(x, y);
        }

        ctx.closePath();
    },

    // Drag start
    onPieceDragStart(e) {
        const trayPiece = e.target.closest('.tray-piece');
        if (!trayPiece) return;

        e.preventDefault();

        const touch = e.touches ? e.touches[0] : e;
        const pieceIndex = parseInt(trayPiece.dataset.pieceIndex);
        const arrayIndex = parseInt(trayPiece.dataset.arrayIndex);

        this.draggingPiece = {
            pieceIndex,
            arrayIndex,
            element: trayPiece
        };

        this.dragStartPos = { x: touch.clientX, y: touch.clientY };

        // Show dragging overlay
        const dragEl = document.getElementById('dragging-piece');
        const dragCanvas = document.getElementById('drag-piece-canvas');
        dragCanvas.width = 100;
        dragCanvas.height = 100;
        this.drawPiecePreview(dragCanvas, pieceIndex);

        dragEl.style.display = 'block';
        dragEl.style.left = touch.clientX + 'px';
        dragEl.style.top = touch.clientY + 'px';

        // Highlight drop zone
        document.querySelector('.puzzle-container').classList.add('drop-active');

        trayPiece.classList.add('selected');
    },

    // Drag move
    onPieceDragMove(e) {
        if (!this.draggingPiece) return;

        e.preventDefault();

        const touch = e.touches ? e.touches[0] : e;
        const dragEl = document.getElementById('dragging-piece');

        dragEl.style.left = touch.clientX + 'px';
        dragEl.style.top = touch.clientY + 'px';
    },

    // Drag end
    onPieceDragEnd(e) {
        if (!this.draggingPiece) return;

        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const dropX = touch.clientX;
        const dropY = touch.clientY;

        // Hide dragging overlay
        document.getElementById('dragging-piece').style.display = 'none';
        document.querySelector('.puzzle-container').classList.remove('drop-active');

        if (this.draggingPiece.element) {
            this.draggingPiece.element.classList.remove('selected');
        }

        // Check if dropped on puzzle area
        const puzzleCanvas = document.getElementById('puzzle-canvas');
        const canvasRect = puzzleCanvas.getBoundingClientRect();

        if (dropX >= canvasRect.left && dropX <= canvasRect.right &&
            dropY >= canvasRect.top && dropY <= canvasRect.bottom) {

            // Calculate position relative to canvas
            const relX = (dropX - canvasRect.left) / canvasRect.width;
            const relY = (dropY - canvasRect.top) / canvasRect.height;

            this.tryPlacePiece(this.draggingPiece.pieceIndex, relX, relY, this.draggingPiece.arrayIndex);
        }

        this.draggingPiece = null;
    },

    // Try to place a piece at the given position
    tryPlacePiece(pieceIndex, relX, relY, arrayIndex) {
        const targetPos = PuzzleEngine.getPiecePosition(pieceIndex);

        // Calculate expected relative position of piece center
        const expectedRelX = (targetPos.col + 0.5) / PuzzleEngine.cols;
        const expectedRelY = (targetPos.row + 0.5) / PuzzleEngine.rows;

        // Get snap tolerance based on age
        const age = this.state.age || 2;
        const tolerance = this.snapTolerances[age] || 0.5;

        // Calculate distance (normalized)
        const dx = Math.abs(relX - expectedRelX);
        const dy = Math.abs(relY - expectedRelY);

        // Tolerance is relative to piece size
        const toleranceX = tolerance / PuzzleEngine.cols;
        const toleranceY = tolerance / PuzzleEngine.rows;

        if (dx <= toleranceX && dy <= toleranceY) {
            // Success! Place the piece
            this.collectedPieces.splice(arrayIndex, 1);
            PuzzleEngine.placedPieces.push(pieceIndex);
            PuzzleEngine.redraw();

            AudioManager.playPiecePlaced();
            this.updateProgress();
            this.renderPieceTray();
            this.state.savedPieces--;
            this.updateSavedCount();

            if (PuzzleEngine.isComplete()) {
                this.onPuzzleComplete();
            }

            this.saveState();
        } else {
            // Wrong position - bounce back with feedback
            AudioManager.playClick();

            // Visual feedback on the tray piece
            const trayPiece = document.querySelector(`.tray-piece[data-array-index="${arrayIndex}"]`);
            if (trayPiece) {
                trayPiece.classList.add('shake');
                setTimeout(() => trayPiece.classList.remove('shake'), 300);
            }
        }
    },

    // Timer complete
    onTimerComplete() {
        console.log('Timer complete!');

        // Award a piece
        this.state.savedPieces++;
        this.updateSavedCount();
        AudioManager.playTimerDing();

        // Reset timer
        TimerManager.reset();
        TimerManager.start();

        // In manual mode, add to collection
        if (this.state.puzzleMode === 'manual') {
            this.addPieceToCollection();
            return;
        }

        // Auto-place if not complete (auto mode)
        if (!PuzzleEngine.isComplete()) {
            this.placeSavedPiece();
        }
    },

    // Place a saved piece
    placeSavedPiece() {
        if (this.state.savedPieces <= 0 || PuzzleEngine.isComplete()) return;

        this.state.savedPieces--;
        this.updateSavedCount();

        PuzzleEngine.placePiece((success) => {
            if (success) {
                AudioManager.playPiecePlaced();
                this.updateProgress();

                if (PuzzleEngine.isComplete()) {
                    this.onPuzzleComplete();
                }
            }
            this.saveState();
        });
    },

    // Puzzle complete
    onPuzzleComplete() {
        console.log('Puzzle complete!');

        // Add to completed list
        if (!this.state.completedPuzzles.includes(this.state.currentPuzzleIndex)) {
            this.state.completedPuzzles.push(this.state.currentPuzzleIndex);
        }

        // Show celebration
        AudioManager.playPuzzleComplete();
        this.showCelebration();
    },

    // Show celebration
    showCelebration() {
        const celebration = document.getElementById('celebration');
        celebration.style.display = 'flex';
        this.startConfetti();
    },

    // Hide celebration
    hideCelebration() {
        document.getElementById('celebration').style.display = 'none';
    },

    // Start confetti animation
    startConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const confetti = [];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];

        for (let i = 0; i < 150; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                r: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 4 + 2,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.2
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            confetti.forEach(c => {
                c.y += c.speed;
                c.x += Math.sin(c.angle) * 2;
                c.angle += c.spin;

                if (c.y > canvas.height) {
                    c.y = -20;
                    c.x = Math.random() * canvas.width;
                }

                ctx.beginPath();
                ctx.fillStyle = c.color;
                ctx.fillRect(c.x, c.y, c.r, c.r * 1.5);
            });

            if (document.getElementById('celebration').style.display !== 'none') {
                requestAnimationFrame(animate);
            }
        };

        animate();
    },

    // Next puzzle
    async nextPuzzle() {
        this.hideCelebration();

        this.state.currentPuzzleIndex = (this.state.currentPuzzleIndex + 1) % PuzzleEngine.puzzles.length;
        this.state.piecesPlaced = 0;

        await PuzzleEngine.loadPuzzle(this.state.currentPuzzleIndex);
        PuzzleEngine.reset();

        TimerManager.reset();
        TimerManager.start();

        this.updateUI();
        this.saveState();

        AudioManager.playClick();
    },

    // Change to specific puzzle
    async changePuzzle(index) {
        this.hideCelebration();

        // Clear custom image when switching to preset puzzle
        this.state.customImage = null;
        PuzzleEngine.clearCustomImage();

        this.state.currentPuzzleIndex = index;
        this.state.piecesPlaced = 0;

        // Clear collected pieces in manual mode
        this.collectedPieces = [];
        if (this.state.puzzleMode === 'manual') {
            this.renderPieceTray();
        }

        await PuzzleEngine.loadPuzzle(index);
        PuzzleEngine.reset();

        TimerManager.reset();
        TimerManager.start();

        this.updateUI();
        this.saveState();

        AudioManager.playClick();
    },

    // Reset current puzzle
    resetCurrentPuzzle() {
        this.hideCelebration();

        this.state.piecesPlaced = 0;
        PuzzleEngine.reset();

        TimerManager.reset();
        TimerManager.start();

        this.updateProgress();
        this.saveState();
    },

    // Update UI
    updateUI() {
        this.updateProgress();
        this.updateSavedCount();
        this.updateTimeDisplay();
        this.updatePuzzleIndicator();
    },

    // Update progress
    updateProgress() {
        const progress = PuzzleEngine.getProgress();
        document.getElementById('progress-fill').style.width = `${progress.percent}%`;
        document.getElementById('progress-text').textContent = `${progress.placed}/${progress.total} stukjes`;
    },

    // Update saved count
    updateSavedCount() {
        document.getElementById('saved-count-display').textContent = `🧩 ${this.state.savedPieces}`;
    },

    // Update time display
    updateTimeDisplay() {
        const timerState = TimerManager.getState();
        const minutes = Math.floor(timerState.remaining / 60);
        const seconds = timerState.remaining % 60;
        document.getElementById('timer-countdown').textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    // Update puzzle indicator
    updatePuzzleIndicator() {
        const total = PuzzleEngine.puzzles.length;
        const current = this.state.currentPuzzleIndex + 1;
        document.getElementById('puzzle-indicator').textContent = `Puzzel ${current}/${total}`;
    },

    // Update vehicle
    updateVehicle(emoji) {
        const vehicleEl = document.getElementById('timer-vehicle');
        if (vehicleEl) {
            vehicleEl.textContent = emoji;
            // Flip vehicles that face the wrong direction (need to face right)
            // Tractor, motorcycle, helicopter, boat face left by default - flip them
            const flipVehicles = ['🚜', '🏍️', '🚁', '🚤'];
            if (flipVehicles.includes(emoji)) {
                vehicleEl.style.transform = 'translateY(-50%) scaleX(-1)';
            } else {
                vehicleEl.style.transform = 'translateY(-50%)';
            }
        }
    },

    // Show pairing code on screen
    showPairingCode(code) {
        const codeEl = document.getElementById('pairing-code-value');
        if (codeEl) {
            codeEl.textContent = code;
        }
    },

    // Start visual timer animation
    startVisualTimerAnimation() {
        const animate = () => {
            this.updateVisualTimer();
            this.timerAnimationFrame = requestAnimationFrame(animate);
        };
        animate();
    },

    // Update visual timer position
    updateVisualTimer() {
        const vehicleEl = document.getElementById('timer-vehicle');
        if (!vehicleEl) return;

        const timerState = TimerManager.getState();

        // Don't update position if paused
        if (timerState.isPaused) {
            vehicleEl.classList.add('paused');
            return;
        }

        vehicleEl.classList.remove('paused');

        const totalTime = this.state.timerInterval * 60;
        const elapsed = totalTime - timerState.remaining;
        const progress = Math.min(elapsed / totalTime, 1);

        const trackWidth = vehicleEl.parentElement.offsetWidth;
        const startPos = 60;
        const endPos = trackWidth - 60;
        const travelDistance = endPos - startPos;
        const currentPos = startPos + (travelDistance * progress);

        vehicleEl.style.left = `${currentPos}px`;
    },

    // Save state
    saveState() {
        const timerState = TimerManager.getState();
        StorageManager.save({
            ...this.state,
            timerRemaining: timerState.remaining,
            timerPaused: timerState.isPaused,
            piecesPlaced: PuzzleEngine.placedPieces.length
        });

        // Also sync puzzle state to Firebase for remote preview
        this.syncPuzzleStateToRemote();
    },

    // Sync puzzle state to Firebase for remote to display
    syncPuzzleStateToRemote() {
        if (RemoteControl.roomRef) {
            const progress = PuzzleEngine.getProgress();

            // Get canvas image as small thumbnail for preview
            const canvas = document.getElementById('puzzle-canvas');
            let imageData = null;
            if (canvas) {
                // Create small thumbnail (max 200px wide)
                const thumbCanvas = document.createElement('canvas');
                const scale = Math.min(200 / canvas.width, 200 / canvas.height);
                thumbCanvas.width = canvas.width * scale;
                thumbCanvas.height = canvas.height * scale;
                const ctx = thumbCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
                imageData = thumbCanvas.toDataURL('image/jpeg', 0.6);
            }

            RemoteControl.roomRef.child('puzzleState').set({
                puzzleIndex: this.state.currentPuzzleIndex,
                piecesPlaced: progress.placed,
                totalPieces: progress.total,
                isComplete: PuzzleEngine.isComplete(),
                imageData: imageData,
                timestamp: Date.now()
            });
        }
    },

    // Screen off mode - black screen overlay
    setScreenOff(isOff) {
        let overlay = document.getElementById('screen-off-overlay');

        if (isOff) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'screen-off-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: black;
                    z-index: 99999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: none;
                `;
                overlay.innerHTML = '<div style="color: #333; font-size: 12px;">Tik om te activeren</div>';
                document.body.appendChild(overlay);
            }
            overlay.style.display = 'flex';

            // Pause timer when screen is off
            if (!TimerManager.isPaused) {
                TimerManager.pause();
            }
        } else {
            if (overlay) {
                overlay.style.display = 'none';
            }
        }

        this.state.screenOff = isOff;
    },

    // Enter fullscreen mode
    enterFullscreen() {
        const elem = document.documentElement;

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
        }

        // Also try to lock screen orientation to landscape
        if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {
                // Orientation lock not supported or not allowed
            });
        }
    },

    // Exit fullscreen mode
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    },

    // Toggle fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    },

    // Sync fullscreen status to Firebase for remote display
    syncFullscreenStatus() {
        const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
        if (RemoteControl.roomRef) {
            RemoteControl.roomRef.child('tabletStatus').update({
                isFullscreen: isFullscreen,
                timestamp: Date.now()
            });
        }
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TabletApp.init().catch(console.error);
});

// Make globally available
window.TabletApp = TabletApp;
