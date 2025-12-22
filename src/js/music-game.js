// Music Instruments Game for Toddlers
// Tap instruments to make sounds

const MusicGame = {
    container: null,
    audioContext: null,
    currentInstrument: 'piano',

    instruments: {
        piano: {
            name: 'Piano',
            emoji: '🎹',
            notes: [
                { note: 'C', freq: 261.63, color: '#FF6B6B' },
                { note: 'D', freq: 293.66, color: '#FF8E53' },
                { note: 'E', freq: 329.63, color: '#FFD93D' },
                { note: 'F', freq: 349.23, color: '#6BCB77' },
                { note: 'G', freq: 392.00, color: '#4D96FF' },
                { note: 'A', freq: 440.00, color: '#9B59B6' },
                { note: 'B', freq: 493.88, color: '#FF69B4' },
                { note: 'C2', freq: 523.25, color: '#4ECDC4' }
            ]
        },
        xylophone: {
            name: 'Xylofoon',
            emoji: '🎵',
            notes: [
                { note: 'C', freq: 523.25, color: '#FF6B6B' },
                { note: 'D', freq: 587.33, color: '#FF8E53' },
                { note: 'E', freq: 659.25, color: '#FFD93D' },
                { note: 'F', freq: 698.46, color: '#6BCB77' },
                { note: 'G', freq: 783.99, color: '#4D96FF' },
                { note: 'A', freq: 880.00, color: '#9B59B6' },
                { note: 'B', freq: 987.77, color: '#FF69B4' },
                { note: 'C2', freq: 1046.50, color: '#4ECDC4' }
            ]
        },
        drums: {
            name: 'Drums',
            emoji: '🥁',
            pads: [
                { name: 'Kick', type: 'kick', color: '#FF6B6B' },
                { name: 'Snare', type: 'snare', color: '#4D96FF' },
                { name: 'Hi-Hat', type: 'hihat', color: '#FFD93D' },
                { name: 'Tom', type: 'tom', color: '#6BCB77' }
            ]
        }
    },

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Music game container not found');
            return;
        }

        // Initialize Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        this.render();
    },

    setInstrument(instrument) {
        if (this.instruments[instrument]) {
            this.currentInstrument = instrument;
            this.render();
        }
    },

    render() {
        if (!this.container) return;

        const instrument = this.instruments[this.currentInstrument];

        this.container.innerHTML = `
            <div class="music-game">
                <div class="music-header">
                    <div class="instrument-tabs">
                        ${Object.keys(this.instruments).map(key => `
                            <button class="instrument-tab ${key === this.currentInstrument ? 'active' : ''}"
                                    data-instrument="${key}">
                                ${this.instruments[key].emoji}
                            </button>
                        `).join('')}
                    </div>
                    <div class="instrument-name">${instrument.emoji} ${instrument.name}</div>
                </div>
                <div class="instrument-area">
                    ${this.currentInstrument === 'drums' ? this.renderDrums() : this.renderKeys()}
                </div>
            </div>
        `;

        this.setupEvents();
    },

    renderKeys() {
        const instrument = this.instruments[this.currentInstrument];
        return `
            <div class="music-keys">
                ${instrument.notes.map((note, i) => `
                    <div class="music-key" data-index="${i}" style="background: ${note.color}">
                        <span class="key-note">${note.note}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderDrums() {
        const drums = this.instruments.drums;
        return `
            <div class="drum-pads">
                ${drums.pads.map((pad, i) => `
                    <div class="drum-pad" data-type="${pad.type}" style="background: ${pad.color}">
                        <span class="pad-name">${pad.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    setupEvents() {
        // Instrument tabs
        this.container.querySelectorAll('.instrument-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.setInstrument(tab.dataset.instrument);
            });
        });

        // Keys/Pads
        if (this.currentInstrument === 'drums') {
            this.container.querySelectorAll('.drum-pad').forEach(pad => {
                const playSound = () => {
                    this.playDrum(pad.dataset.type);
                    pad.classList.add('pressed');
                    setTimeout(() => pad.classList.remove('pressed'), 150);
                };
                pad.addEventListener('touchstart', (e) => { e.preventDefault(); playSound(); }, { passive: false });
                pad.addEventListener('mousedown', playSound);
            });
        } else {
            this.container.querySelectorAll('.music-key').forEach(key => {
                const playSound = () => {
                    const index = parseInt(key.dataset.index);
                    this.playNote(index);
                    key.classList.add('pressed');
                    setTimeout(() => key.classList.remove('pressed'), 200);
                };
                key.addEventListener('touchstart', (e) => { e.preventDefault(); playSound(); }, { passive: false });
                key.addEventListener('mousedown', playSound);
            });
        }
    },

    playNote(index) {
        if (!this.audioContext) return;

        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const instrument = this.instruments[this.currentInstrument];
        const note = instrument.notes[index];
        if (!note) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Different wave types for different instruments
        if (this.currentInstrument === 'piano') {
            oscillator.type = 'triangle';
        } else {
            oscillator.type = 'sine';
        }

        oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime);

        // Envelope
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.8);
    },

    playDrum(type) {
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const now = this.audioContext.currentTime;

        switch(type) {
            case 'kick':
                this.playKick(now);
                break;
            case 'snare':
                this.playSnare(now);
                break;
            case 'hihat':
                this.playHiHat(now);
                break;
            case 'tom':
                this.playTom(now);
                break;
        }
    },

    playKick(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.start(time);
        osc.stop(time + 0.5);
    },

    playSnare(time) {
        // Noise for snare
        const bufferSize = this.audioContext.sampleRate * 0.2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();

        noise.buffer = buffer;
        noise.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);

        noiseGain.gain.setValueAtTime(0.5, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.start(time);
        noise.stop(time + 0.2);
    },

    playHiHat(time) {
        const bufferSize = this.audioContext.sampleRate * 0.05;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(5000, time);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        noise.start(time);
        noise.stop(time + 0.05);
    },

    playTom(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.3);

        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

        osc.start(time);
        osc.stop(time + 0.3);
    }
};

window.MusicGame = MusicGame;
