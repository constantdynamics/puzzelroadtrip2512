// Timer Manager - Handles automatic piece rewards

const TimerManager = {
    remaining: 15 * 60, // seconds
    interval: 15, // minutes per piece
    isPaused: false,
    tickInterval: null,
    onPieceEarned: null,
    onTick: null,

    // Initialize timer
    init(intervalMinutes = 15) {
        this.interval = intervalMinutes;
        this.remaining = intervalMinutes * 60;
    },

    // Start the timer
    start() {
        if (this.tickInterval) return;

        this.tickInterval = setInterval(() => {
            if (!this.isPaused && document.visibilityState === 'visible') {
                this.tick();
            }
        }, 1000);

        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            // Timer pauses when app is not visible
            // This is intentional as per requirements
        });
    },

    // Stop the timer
    stop() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
    },

    // Process a single tick
    tick() {
        this.remaining--;

        if (this.remaining <= 0) {
            // Piece earned!
            this.remaining = this.interval * 60;
            if (this.onPieceEarned) {
                this.onPieceEarned();
            }
        }

        if (this.onTick) {
            this.onTick(this.remaining);
        }
    },

    // Pause/resume toggle
    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    },

    // Set paused state
    setPaused(paused) {
        this.isPaused = paused;
    },

    // Get formatted time string
    getFormattedTime() {
        const minutes = Math.floor(this.remaining / 60);
        const seconds = this.remaining % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    // Set remaining time
    setRemaining(seconds) {
        this.remaining = Math.max(0, seconds);
    },

    // Set interval
    setInterval(minutes) {
        this.interval = minutes;
        // Don't reset current timer, just use new interval next time
    },

    // Reset timer to full interval
    reset() {
        this.remaining = this.interval * 60;
    },

    // Get state for saving
    getState() {
        return {
            remaining: this.remaining,
            interval: this.interval,
            isPaused: this.isPaused
        };
    },

    // Load state
    loadState(state) {
        if (state.remaining !== undefined) this.remaining = state.remaining;
        if (state.interval !== undefined) this.interval = state.interval;
        if (state.isPaused !== undefined) this.isPaused = state.isPaused;
    }
};

// Make globally available
window.TimerManager = TimerManager;
