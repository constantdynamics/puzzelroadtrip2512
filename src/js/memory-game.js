// Memory Game for Toddlers
// Simple matching game with emoji cards

const MemoryGame = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    isProcessing: false,
    difficulty: 'easy', // easy (4 pairs), medium (6 pairs), hard (8 pairs)
    container: null,

    // Emoji sets for different themes
    themes: {
        animals: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🐨', '🦁', '🐯', '🐮'],
        food: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍕', '🍦', '🧁', '🍩', '🍪'],
        vehicles: ['🚗', '🚌', '🚀', '🚁', '🚂', '🚢', '🏍️', '✈️', '🚜', '🚒'],
        nature: ['🌸', '🌻', '🌈', '⭐', '🌙', '☀️', '🌲', '🍄', '🦋', '🐝'],
        toys: ['🎈', '🎁', '🧸', '🎨', '🎭', '🎪', '⚽', '🏀', '🪁', '🎯']
    },

    currentTheme: 'animals',

    difficulties: {
        easy: { pairs: 4, cols: 4 },    // 2x4 grid
        medium: { pairs: 6, cols: 4 },  // 3x4 grid
        hard: { pairs: 8, cols: 4 }     // 4x4 grid
    },

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Memory game container not found');
            return;
        }
        this.reset();
    },

    setDifficulty(level) {
        if (this.difficulties[level]) {
            this.difficulty = level;
        }
    },

    setTheme(theme) {
        if (this.themes[theme]) {
            this.currentTheme = theme;
        }
    },

    reset() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.isProcessing = false;

        const config = this.difficulties[this.difficulty];
        this.totalPairs = config.pairs;

        this.createCards();
        this.render();
    },

    createCards() {
        const config = this.difficulties[this.difficulty];
        const emojis = this.themes[this.currentTheme].slice(0, config.pairs);

        // Create pairs
        const cardValues = [...emojis, ...emojis];

        // Shuffle cards
        for (let i = cardValues.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardValues[i], cardValues[j]] = [cardValues[j], cardValues[i]];
        }

        this.cards = cardValues.map((emoji, index) => ({
            id: index,
            emoji: emoji,
            isFlipped: false,
            isMatched: false
        }));
    },

    render() {
        if (!this.container) return;

        const config = this.difficulties[this.difficulty];
        const cols = config.cols;
        const rows = Math.ceil(this.cards.length / cols);

        this.container.innerHTML = `
            <div class="memory-game">
                <div class="memory-header">
                    <span class="memory-score">Gevonden: ${this.matchedPairs}/${this.totalPairs}</span>
                </div>
                <div class="memory-grid" style="--cols: ${cols}; --rows: ${rows}">
                    ${this.cards.map(card => this.renderCard(card)).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        this.container.querySelectorAll('.memory-card').forEach(cardEl => {
            cardEl.addEventListener('click', () => this.flipCard(parseInt(cardEl.dataset.id)));
            cardEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.flipCard(parseInt(cardEl.dataset.id));
            }, { passive: false });
        });
    },

    renderCard(card) {
        const flippedClass = card.isFlipped || card.isMatched ? 'flipped' : '';
        const matchedClass = card.isMatched ? 'matched' : '';

        return `
            <div class="memory-card ${flippedClass} ${matchedClass}" data-id="${card.id}">
                <div class="memory-card-inner">
                    <div class="memory-card-front">❓</div>
                    <div class="memory-card-back">${card.emoji}</div>
                </div>
            </div>
        `;
    },

    flipCard(cardId) {
        if (this.isProcessing) return;

        const card = this.cards[cardId];
        if (!card || card.isFlipped || card.isMatched) return;

        // Flip the card
        card.isFlipped = true;
        this.flippedCards.push(card);

        // Play sound
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playClick();
        }

        this.render();

        // Check for match if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.isProcessing = true;
            this.checkMatch();
        }
    },

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.emoji === card2.emoji) {
            // Match found!
            card1.isMatched = true;
            card2.isMatched = true;
            this.matchedPairs++;

            if (typeof AudioManager !== 'undefined') {
                AudioManager.playPiecePlaced();
            }

            this.flippedCards = [];
            this.isProcessing = false;
            this.render();

            // Check for win
            if (this.matchedPairs === this.totalPairs) {
                this.onGameComplete();
            }
        } else {
            // No match - flip back after delay
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;
                this.flippedCards = [];
                this.isProcessing = false;
                this.render();
            }, 1000);
        }
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        // Show celebration
        setTimeout(() => {
            if (this.container) {
                const celebrationEl = document.createElement('div');
                celebrationEl.className = 'memory-celebration';
                celebrationEl.innerHTML = `
                    <div class="memory-celebration-content">
                        <h2>🎉 Gewonnen! 🎉</h2>
                        <p>Alle paren gevonden!</p>
                        <button class="memory-play-again-btn" id="memory-play-again">Opnieuw spelen</button>
                    </div>
                `;
                this.container.appendChild(celebrationEl);

                document.getElementById('memory-play-again').addEventListener('click', () => {
                    this.reset();
                });
            }
        }, 500);
    },

    getProgress() {
        return {
            matched: this.matchedPairs,
            total: this.totalPairs,
            percent: Math.round((this.matchedPairs / this.totalPairs) * 100)
        };
    }
};

// Make globally available
window.MemoryGame = MemoryGame;
