// Music Instruments Game for Toddlers
// Visual drums and cymbals that kids can understand

const MusicGame = {
    container: null,
    audioContext: null,
    currentInstrument: 'drums',

    instruments: {
        drums: {
            name: 'Drums',
            items: [
                { name: 'Kick', type: 'kick', visual: 'bass-drum' },
                { name: 'Snare', type: 'snare', visual: 'snare-drum' },
                { name: 'Tom', type: 'tom', visual: 'tom-drum' },
                { name: 'Tom 2', type: 'tom2', visual: 'tom-drum-small' },
                { name: 'Hi-Hat', type: 'hihat', visual: 'cymbal' },
                { name: 'Crash', type: 'crash', visual: 'cymbal-big' }
            ]
        },
        xylophone: {
            name: 'Xylofoon',
            notes: [
                { note: 'C', freq: 523.25, color: '#E53935' },
                { note: 'D', freq: 587.33, color: '#FF9800' },
                { note: 'E', freq: 659.25, color: '#FDD835' },
                { note: 'F', freq: 698.46, color: '#43A047' },
                { note: 'G', freq: 783.99, color: '#1E88E5' },
                { note: 'A', freq: 880.00, color: '#7B1FA2' },
                { note: 'B', freq: 987.77, color: '#E91E63' },
                { note: 'C2', freq: 1046.50, color: '#00ACC1' }
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

        this.container.innerHTML = `
            <div class="music-game">
                <div class="music-header">
                    <div class="instrument-tabs">
                        <button class="instrument-tab ${this.currentInstrument === 'drums' ? 'active' : ''}"
                                data-instrument="drums">
                            ${this.getDrumSetIcon()}
                        </button>
                        <button class="instrument-tab ${this.currentInstrument === 'xylophone' ? 'active' : ''}"
                                data-instrument="xylophone">
                            ${this.getXylophoneIcon()}
                        </button>
                    </div>
                </div>
                <div class="instrument-area">
                    ${this.currentInstrument === 'drums' ? this.renderDrums() : this.renderXylophone()}
                </div>
            </div>
        `;

        this.setupEvents();
    },

    getDrumSetIcon() {
        return `<svg viewBox="0 0 60 60" width="50" height="50">
            <ellipse cx="30" cy="45" rx="20" ry="8" fill="#8B4513" stroke="#5D3A1A" stroke-width="2"/>
            <rect x="10" y="30" width="40" height="15" fill="#CD853F" stroke="#8B4513" stroke-width="2"/>
            <ellipse cx="30" cy="30" rx="20" ry="8" fill="#DEB887" stroke="#8B4513" stroke-width="2"/>
            <circle cx="15" cy="15" r="8" fill="#FFD700" stroke="#B8860B" stroke-width="2"/>
            <circle cx="45" cy="15" r="8" fill="#FFD700" stroke="#B8860B" stroke-width="2"/>
        </svg>`;
    },

    getXylophoneIcon() {
        return `<svg viewBox="0 0 60 40" width="50" height="35">
            <rect x="5" y="5" width="8" height="30" rx="2" fill="#E53935"/>
            <rect x="14" y="7" width="8" height="26" rx="2" fill="#FF9800"/>
            <rect x="23" y="9" width="8" height="22" rx="2" fill="#FDD835"/>
            <rect x="32" y="11" width="8" height="18" rx="2" fill="#43A047"/>
            <rect x="41" y="13" width="8" height="14" rx="2" fill="#1E88E5"/>
            <rect x="50" y="15" width="5" height="10" rx="2" fill="#7B1FA2"/>
        </svg>`;
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
                    <!-- Stand -->
                    <rect x="57" y="30" width="6" height="35" fill="#666" rx="2"/>
                    <rect x="50" y="60" width="20" height="5" fill="#444" rx="2"/>
                    <!-- Cymbal -->
                    <ellipse cx="60" cy="25" rx="55" ry="15" fill="url(#cymbalGradient${type})" class="cymbal-plate"/>
                    <ellipse cx="60" cy="25" rx="50" ry="12" fill="none" stroke="#B8860B" stroke-width="1" opacity="0.5"/>
                    <ellipse cx="60" cy="25" rx="40" ry="9" fill="none" stroke="#B8860B" stroke-width="1" opacity="0.3"/>
                    <circle cx="60" cy="25" r="8" fill="#8B7355"/>
                    <circle cx="60" cy="25" r="4" fill="#444"/>
                    ${isHiHat ? `
                        <ellipse cx="60" cy="35" rx="50" ry="12" fill="url(#cymbalGradient${type}2)" opacity="0.8"/>
                    ` : ''}
                    <defs>
                        <radialGradient id="cymbalGradient${type}" cx="40%" cy="30%">
                            <stop offset="0%" stop-color="#FFE066"/>
                            <stop offset="50%" stop-color="#FFD700"/>
                            <stop offset="100%" stop-color="#B8860B"/>
                        </radialGradient>
                        <radialGradient id="cymbalGradient${type}2" cx="40%" cy="30%">
                            <stop offset="0%" stop-color="#FFD54F"/>
                            <stop offset="100%" stop-color="#A67C00"/>
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
                    <!-- Drum body -->
                    <ellipse cx="${width/2}" cy="${height-15}" rx="${width/2-10}" ry="12" fill="${darkColor}"/>
                    <rect x="10" y="${height/3}" width="${width-20}" height="${height/2}" fill="${color}" />
                    <rect x="10" y="${height/3}" width="${width-20}" height="${height/2}" fill="url(#tomShine${type})" />
                    <!-- Metal rim -->
                    <ellipse cx="${width/2}" cy="${height/3}" rx="${width/2-10}" ry="12" fill="#888" stroke="#666" stroke-width="3"/>
                    <!-- Drum head -->
                    <ellipse cx="${width/2}" cy="${height/3}" rx="${width/2-15}" ry="10" fill="#F5F5DC" stroke="#DDD" stroke-width="2"/>
                    <!-- Shine -->
                    <ellipse cx="${width/2-10}" cy="${height/3-2}" rx="${width/4}" ry="5" fill="rgba(255,255,255,0.3)"/>
                    <defs>
                        <linearGradient id="tomShine${type}" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="rgba(255,255,255,0.1)"/>
                            <stop offset="50%" stop-color="rgba(255,255,255,0.3)"/>
                            <stop offset="100%" stop-color="rgba(0,0,0,0.1)"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        `;
    },

    renderBassDrum() {
        return `
            <div class="drum-item bass-drum" data-type="kick">
                <svg viewBox="0 0 200 150" class="bass-svg">
                    <!-- Drum body (cylinder on side) -->
                    <ellipse cx="30" cy="75" rx="25" ry="60" fill="#B71C1C"/>
                    <rect x="30" y="15" width="140" height="120" fill="#D32F2F"/>
                    <rect x="30" y="15" width="140" height="120" fill="url(#bassShine)"/>
                    <ellipse cx="170" cy="75" rx="25" ry="60" fill="#EF5350" stroke="#B71C1C" stroke-width="3"/>
                    <!-- Front head -->
                    <ellipse cx="170" cy="75" rx="20" ry="50" fill="#F5F5DC" stroke="#CCC" stroke-width="2"/>
                    <!-- Logo area -->
                    <ellipse cx="170" cy="75" rx="15" ry="35" fill="none" stroke="#D32F2F" stroke-width="3"/>
                    <!-- Metal hoops -->
                    <ellipse cx="30" cy="75" rx="27" ry="62" fill="none" stroke="#888" stroke-width="4"/>
                    <ellipse cx="170" cy="75" rx="27" ry="62" fill="none" stroke="#888" stroke-width="4"/>
                    <!-- Legs -->
                    <rect x="60" y="130" width="8" height="20" fill="#444"/>
                    <rect x="130" y="130" width="8" height="20" fill="#444"/>
                    <defs>
                        <linearGradient id="bassShine" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="rgba(255,255,255,0.2)"/>
                            <stop offset="50%" stop-color="rgba(255,255,255,0)"/>
                            <stop offset="100%" stop-color="rgba(0,0,0,0.2)"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        `;
    },

    renderSnareDrum() {
        return `
            <div class="drum-item snare-drum" data-type="snare">
                <svg viewBox="0 0 160 100" class="snare-svg">
                    <!-- Stand legs -->
                    <line x1="40" y1="70" x2="20" y2="95" stroke="#666" stroke-width="4"/>
                    <line x1="120" y1="70" x2="140" y2="95" stroke="#666" stroke-width="4"/>
                    <line x1="80" y1="75" x2="80" y2="95" stroke="#666" stroke-width="4"/>
                    <!-- Drum body -->
                    <ellipse cx="80" cy="65" rx="65" ry="15" fill="#555"/>
                    <rect x="15" y="35" width="130" height="30" fill="#777"/>
                    <rect x="15" y="35" width="130" height="30" fill="url(#snareShine)"/>
                    <!-- Metal shell details -->
                    <rect x="15" y="35" width="130" height="4" fill="#999"/>
                    <rect x="15" y="61" width="130" height="4" fill="#999"/>
                    <!-- Top rim -->
                    <ellipse cx="80" cy="35" rx="65" ry="15" fill="#888" stroke="#666" stroke-width="3"/>
                    <!-- Drum head -->
                    <ellipse cx="80" cy="35" rx="58" ry="12" fill="#F5F5DC" stroke="#DDD" stroke-width="2"/>
                    <!-- Shine -->
                    <ellipse cx="70" cy="32" rx="30" ry="6" fill="rgba(255,255,255,0.4)"/>
                    <defs>
                        <linearGradient id="snareShine" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="rgba(255,255,255,0.1)"/>
                            <stop offset="50%" stop-color="rgba(255,255,255,0.3)"/>
                            <stop offset="100%" stop-color="rgba(0,0,0,0.1)"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        `;
    },

    renderXylophone() {
        const notes = this.instruments.xylophone.notes;
        const barHeights = [180, 165, 150, 135, 120, 105, 90, 75];

        return `
            <div class="xylophone">
                <div class="xylophone-frame">
                    ${notes.map((note, i) => `
                        <div class="xylophone-bar-container" data-index="${i}">
                            <svg viewBox="0 0 60 ${barHeights[i] + 20}" class="xylophone-bar-svg">
                                <!-- Bar shadow -->
                                <rect x="8" y="12" width="44" height="${barHeights[i]}" rx="5" fill="rgba(0,0,0,0.2)"/>
                                <!-- Main bar -->
                                <rect x="5" y="8" width="50" height="${barHeights[i]}" rx="6" fill="${note.color}"/>
                                <!-- Shine -->
                                <rect x="8" y="10" width="20" height="${barHeights[i] - 10}" rx="4" fill="rgba(255,255,255,0.3)"/>
                                <!-- Holes for cord -->
                                <circle cx="30" cy="20" r="4" fill="rgba(0,0,0,0.3)"/>
                                <circle cx="30" cy="${barHeights[i] - 5}" r="4" fill="rgba(0,0,0,0.3)"/>
                            </svg>
                        </div>
                    `).join('')}
                </div>
                <!-- Mallets decoration -->
                <div class="xylophone-mallets">
                    <svg viewBox="0 0 100 60" class="mallet-svg">
                        <rect x="10" y="30" width="80" height="8" rx="4" fill="#8B4513"/>
                        <circle cx="10" cy="34" r="12" fill="#FF5722"/>
                        <circle cx="90" cy="34" r="12" fill="#FF5722"/>
                    </svg>
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
        } else {
            // Xylophone
            this.container.querySelectorAll('.xylophone-bar-container').forEach(bar => {
                const playSound = (e) => {
                    e.preventDefault();
                    const index = parseInt(bar.dataset.index);
                    this.playXylophoneNote(index);
                    bar.classList.add('hit');
                    setTimeout(() => bar.classList.remove('hit'), 150);
                };
                bar.addEventListener('touchstart', playSound, { passive: false });
                bar.addEventListener('mousedown', playSound);
            });
        }
    },

    playXylophoneNote(index) {
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const note = this.instruments.xylophone.notes[index];
        if (!note) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Xylophone-like sound (sine with quick decay)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime);

        // Quick attack, medium decay for xylophone sound
        gainNode.gain.setValueAtTime(0.6, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1.0);
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
            case 'crash':
                this.playCrash(now);
                break;
            case 'tom':
                this.playTom(now, 150);
                break;
            case 'tom2':
                this.playTom(now, 200);
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

        // Add a bit of tone
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

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

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

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

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
