// Music Instruments Game for Toddlers
// Visual instruments that kids can play

const MusicGame = {
    container: null,
    audioContext: null,
    currentInstrument: 'drums',

    // Current octave for keyboard instruments (1-3)
    currentOctave: 2,

    // Base frequencies for 3 octaves (C3, C4, C5)
    octaveBaseFreqs: {
        1: 130.81, // C3
        2: 261.63, // C4 (middle C)
        3: 523.25  // C5
    },

    // Note colors (rainbow order)
    noteColors: ['#E53935', '#FF9800', '#FDD835', '#43A047', '#1E88E5', '#7B1FA2', '#E91E63'],

    instruments: {
        drums: { name: 'Drums' },
        xylophone: { name: 'Xylofoon' },
        piano: { name: 'Piano' },
        trumpet: { name: 'Trompet' },
        saxophone: { name: 'Saxofoon' },
        flute: { name: 'Fluit' },
        accordion: { name: 'Accordeon' }
    },

    // Get notes for current octave
    getNotesForOctave(octave) {
        const baseFreq = this.octaveBaseFreqs[octave];
        // Equal temperament frequency ratios
        const ratios = [1, 1.122, 1.260, 1.335, 1.498, 1.682, 1.888, 2];
        const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C+'];

        return noteNames.map((note, i) => ({
            note: note,
            freq: baseFreq * ratios[i],
            color: this.noteColors[i % 7]
        }));
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

    setOctave(octave) {
        if (octave >= 1 && octave <= 3) {
            this.currentOctave = octave;
            this.render();
        }
    },

    render() {
        if (!this.container) return;

        const showOctaveControls = ['xylophone', 'piano', 'trumpet', 'saxophone', 'flute', 'accordion'].includes(this.currentInstrument);

        this.container.innerHTML = `
            <div class="music-game">
                <div class="music-header">
                    <div class="instrument-tabs">
                        <button class="instrument-tab ${this.currentInstrument === 'drums' ? 'active' : ''}" data-instrument="drums">
                            🥁
                        </button>
                        <button class="instrument-tab ${this.currentInstrument === 'xylophone' ? 'active' : ''}" data-instrument="xylophone">
                            🎵
                        </button>
                        <button class="instrument-tab ${this.currentInstrument === 'piano' ? 'active' : ''}" data-instrument="piano">
                            🎹
                        </button>
                        <button class="instrument-tab ${this.currentInstrument === 'trumpet' ? 'active' : ''}" data-instrument="trumpet">
                            🎺
                        </button>
                        <button class="instrument-tab ${this.currentInstrument === 'saxophone' ? 'active' : ''}" data-instrument="saxophone">
                            🎷
                        </button>
                        <button class="instrument-tab ${this.currentInstrument === 'flute' ? 'active' : ''}" data-instrument="flute">
                            🪈
                        </button>
                        <button class="instrument-tab ${this.currentInstrument === 'accordion' ? 'active' : ''}" data-instrument="accordion">
                            🪗
                        </button>
                    </div>
                    ${showOctaveControls ? `
                        <div class="octave-controls">
                            <button class="octave-btn ${this.currentOctave === 1 ? 'active' : ''}" data-octave="1">Laag</button>
                            <button class="octave-btn ${this.currentOctave === 2 ? 'active' : ''}" data-octave="2">Midden</button>
                            <button class="octave-btn ${this.currentOctave === 3 ? 'active' : ''}" data-octave="3">Hoog</button>
                        </div>
                    ` : ''}
                </div>
                <div class="instrument-area">
                    ${this.renderCurrentInstrument()}
                </div>
            </div>
        `;

        this.setupEvents();
    },

    renderCurrentInstrument() {
        switch (this.currentInstrument) {
            case 'drums': return this.renderDrums();
            case 'xylophone': return this.renderXylophone();
            case 'piano': return this.renderPiano();
            case 'trumpet': return this.renderWindInstrument('trumpet');
            case 'saxophone': return this.renderWindInstrument('saxophone');
            case 'flute': return this.renderWindInstrument('flute');
            case 'accordion': return this.renderAccordion();
            default: return '';
        }
    },

    renderDrums() {
        return `
            <div class="drum-kit">
                <div class="cymbals-row">
                    ${this.renderCymbal('hihat', 'left')}
                    ${this.renderCymbal('crash', 'right')}
                </div>
                <div class="toms-row">
                    ${this.renderTom('tom', 'large')}
                    ${this.renderTom('tom2', 'small')}
                </div>
                <div class="bottom-drums-row">
                    ${this.renderBassDrum()}
                    ${this.renderSnareDrum()}
                </div>
            </div>
        `;
    },

    renderCymbal(type, position) {
        const isHiHat = type === 'hihat';
        return `
            <div class="drum-item cymbal ${position}" data-type="${type}">
                <svg viewBox="0 0 120 60" class="cymbal-svg">
                    <rect x="57" y="30" width="6" height="35" fill="#666" rx="2"/>
                    <rect x="50" y="60" width="20" height="5" fill="#444" rx="2"/>
                    <ellipse cx="60" cy="25" rx="55" ry="15" fill="url(#cymbalGradient${type})" class="cymbal-plate"/>
                    <circle cx="60" cy="25" r="8" fill="#8B7355"/>
                    <circle cx="60" cy="25" r="4" fill="#444"/>
                    ${isHiHat ? `<ellipse cx="60" cy="35" rx="50" ry="12" fill="url(#cymbalGradient${type})" opacity="0.8"/>` : ''}
                    <defs>
                        <radialGradient id="cymbalGradient${type}" cx="40%" cy="30%">
                            <stop offset="0%" stop-color="#FFE066"/>
                            <stop offset="50%" stop-color="#FFD700"/>
                            <stop offset="100%" stop-color="#B8860B"/>
                        </radialGradient>
                    </defs>
                </svg>
            </div>
        `;
    },

    renderTom(type, size) {
        const width = size === 'large' ? 140 : 110;
        const height = size === 'large' ? 100 : 80;
        const color = size === 'large' ? '#1565C0' : '#7B1FA2';
        const darkColor = size === 'large' ? '#0D47A1' : '#4A148C';

        return `
            <div class="drum-item tom-drum ${size}" data-type="${type}">
                <svg viewBox="0 0 ${width} ${height}" class="tom-svg">
                    <ellipse cx="${width/2}" cy="${height-15}" rx="${width/2-10}" ry="12" fill="${darkColor}"/>
                    <rect x="10" y="${height/3}" width="${width-20}" height="${height/2}" fill="${color}"/>
                    <ellipse cx="${width/2}" cy="${height/3}" rx="${width/2-10}" ry="12" fill="#888" stroke="#666" stroke-width="3"/>
                    <ellipse cx="${width/2}" cy="${height/3}" rx="${width/2-15}" ry="10" fill="#F5F5DC" stroke="#DDD" stroke-width="2"/>
                </svg>
            </div>
        `;
    },

    renderBassDrum() {
        return `
            <div class="drum-item bass-drum" data-type="kick">
                <svg viewBox="0 0 200 150" class="bass-svg">
                    <ellipse cx="30" cy="75" rx="25" ry="60" fill="#B71C1C"/>
                    <rect x="30" y="15" width="140" height="120" fill="#D32F2F"/>
                    <ellipse cx="170" cy="75" rx="25" ry="60" fill="#EF5350" stroke="#B71C1C" stroke-width="3"/>
                    <ellipse cx="170" cy="75" rx="20" ry="50" fill="#F5F5DC" stroke="#CCC" stroke-width="2"/>
                    <ellipse cx="30" cy="75" rx="27" ry="62" fill="none" stroke="#888" stroke-width="4"/>
                    <ellipse cx="170" cy="75" rx="27" ry="62" fill="none" stroke="#888" stroke-width="4"/>
                    <rect x="60" y="130" width="8" height="20" fill="#444"/>
                    <rect x="130" y="130" width="8" height="20" fill="#444"/>
                </svg>
            </div>
        `;
    },

    renderSnareDrum() {
        return `
            <div class="drum-item snare-drum" data-type="snare">
                <svg viewBox="0 0 160 100" class="snare-svg">
                    <line x1="40" y1="70" x2="20" y2="95" stroke="#666" stroke-width="4"/>
                    <line x1="120" y1="70" x2="140" y2="95" stroke="#666" stroke-width="4"/>
                    <line x1="80" y1="75" x2="80" y2="95" stroke="#666" stroke-width="4"/>
                    <ellipse cx="80" cy="65" rx="65" ry="15" fill="#555"/>
                    <rect x="15" y="35" width="130" height="30" fill="#777"/>
                    <ellipse cx="80" cy="35" rx="65" ry="15" fill="#888" stroke="#666" stroke-width="3"/>
                    <ellipse cx="80" cy="35" rx="58" ry="12" fill="#F5F5DC" stroke="#DDD" stroke-width="2"/>
                </svg>
            </div>
        `;
    },

    renderXylophone() {
        const notes = this.getNotesForOctave(this.currentOctave);
        const barHeights = [180, 165, 150, 135, 120, 105, 90, 75];

        return `
            <div class="xylophone">
                <div class="xylophone-frame">
                    ${notes.map((note, i) => `
                        <div class="xylophone-bar-container" data-index="${i}" data-freq="${note.freq}">
                            <svg viewBox="0 0 60 ${barHeights[i] + 20}" class="xylophone-bar-svg">
                                <rect x="8" y="12" width="44" height="${barHeights[i]}" rx="5" fill="rgba(0,0,0,0.2)"/>
                                <rect x="5" y="8" width="50" height="${barHeights[i]}" rx="6" fill="${note.color}"/>
                                <rect x="8" y="10" width="20" height="${barHeights[i] - 10}" rx="4" fill="rgba(255,255,255,0.3)"/>
                                <circle cx="30" cy="20" r="4" fill="rgba(0,0,0,0.3)"/>
                                <circle cx="30" cy="${barHeights[i] - 5}" r="4" fill="rgba(0,0,0,0.3)"/>
                            </svg>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderPiano() {
        const notes = this.getNotesForOctave(this.currentOctave);
        // White keys: C, D, E, F, G, A, B (indices 0,1,2,3,4,5,6)
        // Black keys between: C#, D#, F#, G#, A# (after indices 0,1,3,4,5)
        const blackKeyPositions = [0, 1, 3, 4, 5]; // After which white keys to place black keys

        return `
            <div class="piano-keyboard">
                <div class="piano-white-keys">
                    ${notes.slice(0, 7).map((note, i) => `
                        <div class="piano-key white" data-index="${i}" data-freq="${note.freq}">
                            <span class="key-label">${note.note}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="piano-black-keys">
                    ${blackKeyPositions.map((pos, i) => {
                        const baseFreq = notes[pos].freq;
                        const sharpFreq = baseFreq * 1.0595; // Semitone up
                        return `<div class="piano-key black" data-black-pos="${pos}" data-freq="${sharpFreq}" style="left: ${pos * 14.28 + 10}%"></div>`;
                    }).join('')}
                </div>
            </div>
        `;
    },

    renderWindInstrument(type) {
        const notes = this.getNotesForOctave(this.currentOctave);
        const instrumentEmoji = { trumpet: '🎺', saxophone: '🎷', flute: '🪈' }[type];
        const instrumentColor = { trumpet: '#FFD700', saxophone: '#D4AF37', flute: '#C0C0C0' }[type];

        return `
            <div class="wind-instrument ${type}">
                <div class="wind-instrument-display">
                    <span class="wind-emoji">${instrumentEmoji}</span>
                </div>
                <div class="wind-buttons">
                    ${notes.map((note, i) => `
                        <button class="wind-note-btn" data-index="${i}" data-freq="${note.freq}" style="background: ${note.color}">
                            ${note.note}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderAccordion() {
        const notes = this.getNotesForOctave(this.currentOctave);

        return `
            <div class="accordion-instrument">
                <div class="accordion-display">
                    <span class="accordion-emoji">🪗</span>
                </div>
                <div class="accordion-buttons">
                    ${notes.map((note, i) => `
                        <button class="accordion-btn" data-index="${i}" data-freq="${note.freq}" style="background: ${note.color}">
                            ${note.note}
                        </button>
                    `).join('')}
                </div>
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

        // Octave controls
        this.container.querySelectorAll('.octave-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setOctave(parseInt(btn.dataset.octave));
            });
        });

        // Drums
        if (this.currentInstrument === 'drums') {
            this.container.querySelectorAll('.drum-item').forEach(item => {
                const playSound = (e) => {
                    e.preventDefault();
                    this.playDrum(item.dataset.type);
                    item.classList.add('hit');
                    setTimeout(() => item.classList.remove('hit'), 100);
                };
                item.addEventListener('touchstart', playSound, { passive: false });
                item.addEventListener('mousedown', playSound);
            });
        }

        // Xylophone
        if (this.currentInstrument === 'xylophone') {
            this.container.querySelectorAll('.xylophone-bar-container').forEach(bar => {
                const playSound = (e) => {
                    e.preventDefault();
                    const freq = parseFloat(bar.dataset.freq);
                    this.playToneNote(freq, 'xylophone');
                    bar.classList.add('hit');
                    setTimeout(() => bar.classList.remove('hit'), 150);
                };
                bar.addEventListener('touchstart', playSound, { passive: false });
                bar.addEventListener('mousedown', playSound);
            });
        }

        // Piano
        if (this.currentInstrument === 'piano') {
            this.container.querySelectorAll('.piano-key').forEach(key => {
                const playSound = (e) => {
                    e.preventDefault();
                    const freq = parseFloat(key.dataset.freq);
                    this.playToneNote(freq, 'piano');
                    key.classList.add('hit');
                    setTimeout(() => key.classList.remove('hit'), 150);
                };
                key.addEventListener('touchstart', playSound, { passive: false });
                key.addEventListener('mousedown', playSound);
            });
        }

        // Wind instruments
        if (['trumpet', 'saxophone', 'flute'].includes(this.currentInstrument)) {
            this.container.querySelectorAll('.wind-note-btn').forEach(btn => {
                const playSound = (e) => {
                    e.preventDefault();
                    const freq = parseFloat(btn.dataset.freq);
                    this.playToneNote(freq, this.currentInstrument);
                    btn.classList.add('hit');
                    setTimeout(() => btn.classList.remove('hit'), 150);
                };
                btn.addEventListener('touchstart', playSound, { passive: false });
                btn.addEventListener('mousedown', playSound);
            });
        }

        // Accordion
        if (this.currentInstrument === 'accordion') {
            this.container.querySelectorAll('.accordion-btn').forEach(btn => {
                const playSound = (e) => {
                    e.preventDefault();
                    const freq = parseFloat(btn.dataset.freq);
                    this.playToneNote(freq, 'accordion');
                    btn.classList.add('hit');
                    setTimeout(() => btn.classList.remove('hit'), 150);
                };
                btn.addEventListener('touchstart', playSound, { passive: false });
                btn.addEventListener('mousedown', playSound);
            });
        }
    },

    playToneNote(freq, instrumentType) {
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Different wave types and envelopes for different instruments
        switch (instrumentType) {
            case 'xylophone':
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.6, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
                oscillator.start(now);
                oscillator.stop(now + 1.0);
                break;

            case 'piano':
                oscillator.type = 'triangle';
                gainNode.gain.setValueAtTime(0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
                oscillator.start(now);
                oscillator.stop(now + 1.5);
                break;

            case 'trumpet':
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                oscillator.start(now);
                oscillator.stop(now + 0.8);
                break;

            case 'saxophone':
                oscillator.type = 'sawtooth';
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.35, now + 0.03);
                gainNode.gain.setValueAtTime(0.3, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
                oscillator.start(now);
                oscillator.stop(now + 1.0);
                break;

            case 'flute':
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
                oscillator.start(now);
                oscillator.stop(now + 1.2);
                break;

            case 'accordion':
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.2, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                oscillator.start(now);
                oscillator.stop(now + 0.8);
                break;

            default:
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.5, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
                oscillator.start(now);
                oscillator.stop(now + 1.0);
        }

        oscillator.frequency.setValueAtTime(freq, now);
    },

    playDrum(type) {
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const now = this.audioContext.currentTime;

        switch(type) {
            case 'kick': this.playKick(now); break;
            case 'snare': this.playSnare(now); break;
            case 'hihat': this.playHiHat(now); break;
            case 'crash': this.playCrash(now); break;
            case 'tom': this.playTom(now, 150); break;
            case 'tom2': this.playTom(now, 200); break;
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
        const bufferSize = this.audioContext.sampleRate * 0.2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, time);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        noiseGain.gain.setValueAtTime(0.5, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        noise.start(time);
        noise.stop(time + 0.2);

        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        osc.connect(oscGain);
        oscGain.connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(180, time);
        oscGain.gain.setValueAtTime(0.3, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
    },

    playHiHat(time) {
        const bufferSize = this.audioContext.sampleRate * 0.08;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, time);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        noise.start(time);
        noise.stop(time + 0.08);
    },

    playCrash(time) {
        const bufferSize = this.audioContext.sampleRate * 1.0;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        noise.buffer = buffer;
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(3000, time);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 1.0);
        noise.start(time);
        noise.stop(time + 1.0);
    },

    playTom(time, baseFreq) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.setValueAtTime(baseFreq, time);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, time + 0.3);
        gain.gain.setValueAtTime(0.7, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
    }
};

window.MusicGame = MusicGame;
