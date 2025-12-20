// Tablet App - Simplified view for children
// All settings are controlled via remote (phone)

const TabletApp = {
    state: null,
    timerAnimationFrame: null,

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
        TimerManager.onComplete = () => this.onTimerComplete();

        // Load current puzzle
        await PuzzleEngine.loadPuzzle(this.state.currentPuzzleIndex);
        PuzzleEngine.setPlacedPieces(this.state.piecesPlaced);

        // Update UI
        this.updateUI();
        this.updateVehicle(this.state.vehicle || '🚗');

        // Start timer
        TimerManager.start();

        // Start visual timer animation
        this.startVisualTimerAnimation();

        // Setup celebration button
        document.getElementById('next-puzzle-btn').addEventListener('click', () => {
            this.nextPuzzle();
        });

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
        // Poll for settings changes every 2 seconds
        setInterval(() => {
            if (RemoteControl.roomRef) {
                RemoteControl.roomRef.child('settings').once('value', (snapshot) => {
                    const settings = snapshot.val();
                    if (settings && settings.timestamp > (this.lastSettingsTimestamp || 0)) {
                        this.lastSettingsTimestamp = settings.timestamp;
                        this.applyRemoteSettings(settings);
                    }
                });
            }
        }, 2000);
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
        }

        if (settings.changePuzzle !== undefined) {
            this.changePuzzle(settings.changePuzzle);
        }

        if (settings.nextPuzzle) {
            this.nextPuzzle();
        }

        if (settings.customImage) {
            this.loadCustomImage(settings.customImage);
        }

        this.saveState();
    },

    // Load a custom image as puzzle
    async loadCustomImage(imageData) {
        console.log('Loading custom image...');
        this.state.customImage = imageData;
        PuzzleEngine.setCustomImage(imageData);
        this.resetCurrentPuzzle();
        // Update preview name
        document.getElementById('preview-puzzle-name')?.textContent = '📷 Eigen Foto';
    },

    // Handle piece received from remote
    onRemotePieceReceived() {
        console.log('Remote piece received!');

        // Add a saved piece
        this.state.savedPieces++;
        this.updateSavedCount();
        AudioManager.playTaskComplete();

        // Auto-place piece if puzzle not complete
        if (!PuzzleEngine.isComplete()) {
            this.placeSavedPiece();
        }
    },

    // Timer complete
    onTimerComplete() {
        console.log('Timer complete!');

        // Award a piece
        this.state.savedPieces++;
        this.updateSavedCount();
        AudioManager.playTimerComplete();

        // Reset timer
        TimerManager.reset();
        TimerManager.start();

        // Auto-place if not complete
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
        AudioManager.playVictory();
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

        this.state.currentPuzzleIndex = index;
        this.state.piecesPlaced = 0;

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
        const totalTime = this.state.timerInterval * 60;
        const elapsed = totalTime - timerState.remaining;
        const progress = Math.min(elapsed / totalTime, 1);

        const trackWidth = vehicleEl.parentElement.offsetWidth;
        const startPos = 60;
        const endPos = trackWidth - 60;
        const travelDistance = endPos - startPos;
        const currentPos = startPos + (travelDistance * progress);

        vehicleEl.style.left = `${currentPos}px`;

        if (timerState.isPaused) {
            vehicleEl.classList.add('paused');
        } else {
            vehicleEl.classList.remove('paused');
        }
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
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TabletApp.init().catch(console.error);
});

// Make globally available
window.TabletApp = TabletApp;
