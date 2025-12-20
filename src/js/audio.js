// Audio Manager - Handles all sound effects using Web Audio API

const AudioManager = {
    context: null,
    enabled: true,
    volume: 0.5,

    // Initialize audio context
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    },

    // Resume audio context (needed after user interaction)
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    },

    // Set enabled state
    setEnabled(enabled) {
        this.enabled = enabled;
    },

    // Set volume (0-1)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    },

    // Play a tone with given frequency and duration
    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.context) return;

        this.resume();

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(this.volume * 0.3, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + duration);
    },

    // Play piece placement sound (plop/click)
    playPiecePlaced() {
        if (!this.enabled || !this.context) return;

        this.resume();

        // Create a "plop" sound
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.frequency.setValueAtTime(400, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.context.currentTime + 0.1);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume * 0.4, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.15);
    },

    // Play task completed sound (ding)
    playTaskComplete() {
        if (!this.enabled || !this.context) return;

        this.resume();

        // Two-tone "ding"
        const frequencies = [523.25, 659.25]; // C5, E5

        frequencies.forEach((freq, i) => {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = this.context.currentTime + (i * 0.1);
            gainNode.gain.setValueAtTime(this.volume * 0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    },

    // Play puzzle completed fanfare
    playPuzzleComplete() {
        if (!this.enabled || !this.context) return;

        this.resume();

        // Triumphant fanfare - C major arpeggio
        const notes = [
            { freq: 523.25, time: 0 },      // C5
            { freq: 659.25, time: 0.15 },   // E5
            { freq: 783.99, time: 0.3 },    // G5
            { freq: 1046.50, time: 0.45 },  // C6
            { freq: 783.99, time: 0.7 },    // G5
            { freq: 1046.50, time: 0.85 },  // C6 (final)
        ];

        notes.forEach(note => {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);

            oscillator.frequency.value = note.freq;
            oscillator.type = 'triangle';

            const startTime = this.context.currentTime + note.time;
            const duration = note === notes[notes.length - 1] ? 0.8 : 0.25;

            gainNode.gain.setValueAtTime(this.volume * 0.35, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    },

    // Play timer complete sound
    playTimerDing() {
        if (!this.enabled || !this.context) return;

        this.resume();

        // Simple ding
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.frequency.value = 880; // A5
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.volume * 0.3, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.5);
    },

    // Play button click sound
    playClick() {
        if (!this.enabled || !this.context) return;

        this.resume();

        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.frequency.value = 600;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(this.volume * 0.1, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.05);
    }
};

// Make globally available
window.AudioManager = AudioManager;
