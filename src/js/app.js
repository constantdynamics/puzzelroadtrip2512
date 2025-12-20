// Main Application - Ties everything together

const App = {
    state: null,
    isAnimating: false,
    timerAnimationFrame: null,

    // Initialize the application
    async init() {
        console.log('Roadtrip Puzzel App initializing...');

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
        TimerManager.onTick = (remaining) => this.onTimerTick(remaining);
        TimerManager.onPieceEarned = () => this.onTimerPieceEarned();

        // Load current puzzle
        await PuzzleEngine.loadPuzzle(this.state.currentPuzzleIndex);
        PuzzleEngine.setPlacedPieces(this.state.piecesPlaced);

        // Set up UI
        this.setupUI();
        this.updateUI();

        // Set vehicle emoji
        this.updateVehicle(this.state.vehicle || '🚗');

        // Start timer
        TimerManager.start();

        // Start visual timer animation
        this.startVisualTimerAnimation();

        // Populate tasks grid
        TasksManager.populateTasksGrid('tasks-grid', (task) => this.onTaskSelected(task));

        // Populate puzzle selection
        this.populatePuzzleSelection();

        // Update time display
        this.updateTimeDisplay();
        setInterval(() => this.updateTimeDisplay(), 1000);

        // Save state periodically
        setInterval(() => this.saveState(), 10000);

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveState();
            }
        });

        // Handle before unload
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });

        // Resume audio on first interaction
        document.addEventListener('click', () => AudioManager.resume(), { once: true });
        document.addEventListener('touchstart', () => AudioManager.resume(), { once: true });

        console.log('App initialized successfully!');
    },

    // Set up UI event listeners
    setupUI() {
        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('click', () => {
            this.state.soundEnabled = !this.state.soundEnabled;
            AudioManager.setEnabled(this.state.soundEnabled);
            this.updateSoundButton();
            AudioManager.playClick();
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'flex';
            AudioManager.playClick();
        });

        // Close settings
        document.getElementById('close-settings').addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'none';
            AudioManager.playClick();
        });

        // Volume slider
        document.getElementById('volume-slider').addEventListener('input', (e) => {
            this.state.volume = parseInt(e.target.value);
            AudioManager.setVolume(this.state.volume / 100);
        });

        // Timer interval
        document.getElementById('timer-interval').addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            if (value >= 1 && value <= 60) {
                this.state.timerInterval = value;
                TimerManager.setInterval(value);
            }
        });

        // Reset puzzle button
        document.getElementById('reset-puzzle').addEventListener('click', () => {
            if (confirm('Weet je zeker dat je de huidige puzzel wilt resetten?')) {
                this.resetCurrentPuzzle();
                document.getElementById('settings-modal').style.display = 'none';
            }
        });

        // Choose puzzle button
        document.getElementById('choose-puzzle').addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'none';
            document.getElementById('puzzle-select-modal').style.display = 'flex';
        });

        // Timer pause button
        document.getElementById('timer-pause').addEventListener('click', () => {
            const isPaused = TimerManager.togglePause();
            this.state.timerPaused = isPaused;
            this.updateTimerButton();
            AudioManager.playClick();
        });

        // Task buttons
        document.querySelectorAll('.task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.onTaskButtonClick(e.currentTarget);
            });
        });

        // More tasks button
        document.getElementById('more-tasks-btn').addEventListener('click', () => {
            document.getElementById('tasks-modal').style.display = 'flex';
            AudioManager.playClick();
        });

        // Close tasks modal
        document.getElementById('close-tasks').addEventListener('click', () => {
            document.getElementById('tasks-modal').style.display = 'none';
            AudioManager.playClick();
        });

        // Close puzzle select modal
        document.getElementById('close-puzzle-select').addEventListener('click', () => {
            document.getElementById('puzzle-select-modal').style.display = 'none';
            AudioManager.playClick();
        });

        // Next puzzle button (celebration)
        document.getElementById('next-puzzle-btn').addEventListener('click', () => {
            this.goToNextPuzzle();
        });

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });

        // Piece count selector
        document.getElementById('piece-count').addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            this.state.pieceCount = count;
            PuzzleEngine.setPieceCount(count);
            this.resetCurrentPuzzle();
            AudioManager.playClick();
        });

        // Vehicle selector
        document.getElementById('vehicle-select').addEventListener('change', (e) => {
            this.state.vehicle = e.target.value;
            this.updateVehicle(e.target.value);
            AudioManager.playClick();
        });

        // Custom image upload
        document.getElementById('custom-image').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    const base64 = event.target.result;
                    this.state.customImage = base64;
                    PuzzleEngine.setCustomImage(base64);
                    document.getElementById('file-name').textContent = file.name;
                    document.getElementById('clear-custom-image').style.display = 'inline-block';

                    // Reload current puzzle with custom image
                    await PuzzleEngine.loadPuzzle(this.state.currentPuzzleIndex);
                    this.resetCurrentPuzzle();
                    AudioManager.playClick();
                };
                reader.readAsDataURL(file);
            }
        });

        // Clear custom image
        document.getElementById('clear-custom-image').addEventListener('click', async () => {
            this.state.customImage = null;
            PuzzleEngine.clearCustomImage();
            document.getElementById('file-name').textContent = '';
            document.getElementById('clear-custom-image').style.display = 'none';
            document.getElementById('custom-image').value = '';

            // Reload current puzzle without custom image
            await PuzzleEngine.loadPuzzle(this.state.currentPuzzleIndex);
            this.resetCurrentPuzzle();
            AudioManager.playClick();
        });

        // Remote control toggle
        document.getElementById('toggle-remote').addEventListener('click', async () => {
            await this.toggleRemoteControl();
        });

        // Set initial values from state
        document.getElementById('volume-slider').value = this.state.volume;
        document.getElementById('timer-interval').value = this.state.timerInterval;
        document.getElementById('piece-count').value = this.state.pieceCount || 40;
        document.getElementById('vehicle-select').value = this.state.vehicle || '🚗';
        if (this.state.customImage) {
            document.getElementById('file-name').textContent = 'Eigen foto geladen';
            document.getElementById('clear-custom-image').style.display = 'inline-block';
        }
    },

    // Update UI elements
    updateUI() {
        this.updateSoundButton();
        this.updateTimerButton();
        this.updateSavedCount();
        this.updateProgress();
        this.updatePuzzleIndicator();
        this.updateTimerDisplay();
    },

    // Update sound button
    updateSoundButton() {
        const btn = document.getElementById('sound-toggle');
        btn.querySelector('.sound-on').style.display = this.state.soundEnabled ? 'inline' : 'none';
        btn.querySelector('.sound-off').style.display = this.state.soundEnabled ? 'none' : 'inline';
    },

    // Update timer button
    updateTimerButton() {
        const btn = document.getElementById('timer-pause');
        btn.textContent = this.state.timerPaused ? '▶️ Hervat' : '⏸️ Pauze';
        btn.classList.toggle('paused', this.state.timerPaused);
    },

    // Update saved pieces count
    updateSavedCount() {
        document.getElementById('saved-count').textContent = this.state.savedPieces;
    },

    // Update progress bar
    updateProgress() {
        const progress = PuzzleEngine.getProgress();
        document.getElementById('progress-fill').style.width = `${progress.percent}%`;
        document.getElementById('progress-text').textContent = `${progress.placed}/${progress.total} stukjes`;
    },

    // Update puzzle indicator
    updatePuzzleIndicator() {
        const total = PuzzleEngine.puzzles.length;
        const current = this.state.currentPuzzleIndex + 1;
        document.getElementById('puzzle-indicator').textContent = `Puzzel ${current} van ${total}`;
    },

    // Update timer display
    updateTimerDisplay() {
        document.getElementById('timer-countdown').textContent = TimerManager.getFormattedTime();
    },

    // Update current time
    updateTimeDisplay() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        document.getElementById('current-time').textContent = `${hours}:${minutes}`;
    },

    // Timer tick callback
    onTimerTick(remaining) {
        this.state.timerRemaining = remaining;
        this.updateTimerDisplay();
    },

    // Timer piece earned callback
    onTimerPieceEarned() {
        this.state.savedPieces++;
        this.updateSavedCount();
        AudioManager.playTimerDing();
        this.saveState();
    },

    // Task button click handler
    onTaskButtonClick(btn) {
        if (this.isAnimating) return;

        // Add pressed animation
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 300);

        // Add a saved piece
        this.state.savedPieces++;
        this.updateSavedCount();
        AudioManager.playTaskComplete();

        // Auto-place piece if we have saved pieces and puzzle not complete
        if (!PuzzleEngine.isComplete()) {
            this.placeSavedPiece();
        }
    },

    // Task selected from modal
    onTaskSelected(task) {
        document.getElementById('tasks-modal').style.display = 'none';

        if (this.isAnimating) return;

        // Add a saved piece
        this.state.savedPieces++;
        this.updateSavedCount();
        AudioManager.playTaskComplete();

        // Auto-place piece
        if (!PuzzleEngine.isComplete()) {
            this.placeSavedPiece();
        }
    },

    // Place a saved piece
    placeSavedPiece() {
        if (this.state.savedPieces <= 0 || this.isAnimating) return;
        if (PuzzleEngine.isComplete()) return;

        this.isAnimating = true;
        this.state.savedPieces--;
        this.updateSavedCount();

        PuzzleEngine.placePiece((success) => {
            this.isAnimating = false;

            if (success) {
                AudioManager.playPiecePlaced();
                this.state.piecesPlaced = PuzzleEngine.placedPieces.length;
                this.updateProgress();
                this.saveState();

                // Check if puzzle complete
                if (PuzzleEngine.isComplete()) {
                    this.onPuzzleComplete();
                }
            }
        });
    },

    // Puzzle completed
    onPuzzleComplete() {
        // Mark as completed
        StorageManager.completePuzzle(this.state.currentPuzzleIndex);

        // Play fanfare
        AudioManager.playPuzzleComplete();

        // Show celebration
        this.showCelebration();
    },

    // Show celebration overlay
    showCelebration() {
        const celebration = document.getElementById('celebration');
        celebration.style.display = 'flex';

        // Start confetti
        this.startConfetti();
    },

    // Confetti animation
    startConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const confetti = [];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];

        // Create confetti particles
        for (let i = 0; i < 150; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedY: Math.random() * 3 + 2,
                speedX: Math.random() * 2 - 1,
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 10 - 5
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            confetti.forEach(p => {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
                ctx.restore();

                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;

                // Reset if off screen
                if (p.y > canvas.height) {
                    p.y = -p.size;
                    p.x = Math.random() * canvas.width;
                }
            });

            if (document.getElementById('celebration').style.display !== 'none') {
                requestAnimationFrame(animate);
            }
        };

        animate();
    },

    // Go to next puzzle
    async goToNextPuzzle() {
        document.getElementById('celebration').style.display = 'none';

        // Find next incomplete puzzle
        const nextIndex = StorageManager.getNextIncompletePuzzle(PuzzleEngine.puzzles.length);

        // If all puzzles completed, just go to next in sequence
        let newIndex = nextIndex;
        if (StorageManager.isPuzzleCompleted(nextIndex)) {
            newIndex = (this.state.currentPuzzleIndex + 1) % PuzzleEngine.puzzles.length;
        }

        await this.selectPuzzle(newIndex);
    },

    // Select a specific puzzle
    async selectPuzzle(index) {
        this.state.currentPuzzleIndex = index;
        this.state.piecesPlaced = 0;
        this.state.savedPieces = 0;

        await PuzzleEngine.loadPuzzle(index);
        this.updateUI();
        this.saveState();
    },

    // Reset current puzzle
    async resetCurrentPuzzle() {
        this.state.piecesPlaced = 0;
        this.state.savedPieces = 0;
        PuzzleEngine.reset();
        this.updateUI();
        this.saveState();
    },

    // Populate puzzle selection grid
    populatePuzzleSelection() {
        const grid = document.getElementById('puzzle-grid');
        grid.innerHTML = '';

        PuzzleEngine.getPuzzleList().forEach(puzzle => {
            const item = document.createElement('div');
            item.className = 'puzzle-item';
            if (StorageManager.isPuzzleCompleted(puzzle.index)) {
                item.classList.add('completed');
            }

            item.style.background = `linear-gradient(135deg, ${puzzle.color}40, ${puzzle.color}80)`;
            item.innerHTML = `
                <span style="font-size: 48px;">${puzzle.emoji}</span>
                <div class="puzzle-item-name">${puzzle.name}</div>
            `;

            item.addEventListener('click', async () => {
                document.getElementById('puzzle-select-modal').style.display = 'none';
                await this.selectPuzzle(puzzle.index);
                AudioManager.playClick();
            });

            grid.appendChild(item);
        });
    },

    // Save current state
    saveState() {
        const timerState = TimerManager.getState();
        StorageManager.save({
            ...this.state,
            timerRemaining: timerState.remaining,
            timerPaused: timerState.isPaused,
            piecesPlaced: PuzzleEngine.placedPieces.length
        });
    },

    // Update vehicle emoji
    updateVehicle(emoji) {
        const vehicleEl = document.getElementById('timer-vehicle');
        if (vehicleEl) {
            vehicleEl.textContent = emoji;
        }
    },

    // Start visual timer animation loop
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
        const totalTime = this.state.timerInterval * 60; // total seconds
        const elapsed = totalTime - timerState.remaining;
        const progress = Math.min(elapsed / totalTime, 1);

        // Calculate position (60px from left edge to track width - 60px from right)
        const trackWidth = vehicleEl.parentElement.offsetWidth;
        const startPos = 60;
        const endPos = trackWidth - 60;
        const travelDistance = endPos - startPos;
        const currentPos = startPos + (travelDistance * progress);

        vehicleEl.style.left = `${currentPos}px`;

        // Add paused class for bounce animation
        if (timerState.isPaused) {
            vehicleEl.classList.add('paused');
        } else {
            vehicleEl.classList.remove('paused');
        }
    },

    // Toggle remote control
    async toggleRemoteControl() {
        const btn = document.getElementById('toggle-remote');
        const status = document.getElementById('remote-status');
        const codeDiv = document.getElementById('remote-code');

        if (RemoteControl.isConnected()) {
            // Disconnect
            RemoteControl.disconnect();
            btn.textContent = '📱 Remote Starten';
            btn.classList.remove('active');
            status.innerHTML = '<span class="remote-off">Niet actief</span>';
            codeDiv.style.display = 'none';
            AudioManager.playClick();
        } else {
            // Connect
            btn.textContent = 'Verbinden...';
            btn.disabled = true;

            try {
                const code = await RemoteControl.createRoom();

                // Set up callback for when piece is received
                RemoteControl.onPieceReceived = () => {
                    this.onRemotePieceReceived();
                };

                btn.textContent = '🔴 Remote Stoppen';
                btn.classList.add('active');
                btn.disabled = false;
                status.innerHTML = '<span class="remote-on">✓ Wacht op verbinding...</span>';
                codeDiv.style.display = 'block';
                codeDiv.querySelector('.code-display').textContent = code;

                AudioManager.playClick();
            } catch (error) {
                console.error('Remote control error:', error);
                btn.textContent = '📱 Remote Starten';
                btn.disabled = false;
                status.innerHTML = '<span class="remote-off">Fout: ' + error.message + '</span>';
            }
        }
    },

    // Handle piece received from remote
    onRemotePieceReceived() {
        console.log('Remote piece received!');

        // Update status to show connected
        const status = document.getElementById('remote-status');
        status.innerHTML = '<span class="remote-on">✓ Verbonden!</span>';

        // Add a saved piece (same as task button)
        this.state.savedPieces++;
        this.updateSavedCount();
        AudioManager.playTaskComplete();

        // Auto-place piece if puzzle not complete
        if (!PuzzleEngine.isComplete()) {
            this.placeSavedPiece();
        }
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init().catch(console.error);
});

// Make globally available for debugging
window.App = App;
