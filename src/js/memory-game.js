// Memory Game for Toddlers
// Simple matching game with emoji cards - with flip animations

const MemoryGame = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    isProcessing: false,
    difficulty: 'easy',
    container: null,
    flipDelay: 2000, // Longer delay for young children to see the cards

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
        easy: { pairs: 4, cols: 4 },
        medium: { pairs: 6, cols: 4 },
        hard: { pairs: 8, cols: 4 }
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
        this.syncGameState();
    },

    // Sync game state to Firebase for remote display
    syncGameState() {
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            TabletApp.roomRef.child('gameState').update({
                game: 'memory',
                pairsFound: this.matchedPairs,
                totalPairs: this.totalPairs,
                completed: this.matchedPairs === this.totalPairs,
                timestamp: Date.now()
            });
        }
    },

    createCards() {
        const config = this.difficulties[this.difficulty];
        const emojis = this.themes[this.currentTheme].slice(0, config.pairs);

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
                    <span class="memory-score">⭐ ${this.matchedPairs}/${this.totalPairs}</span>
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
                    <div class="memory-card-front">
                        <div class="card-pattern"></div>
                    </div>
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

        // Update just this card for smooth animation
        const cardEl = this.container.querySelector(`.memory-card[data-id="${cardId}"]`);
        if (cardEl) {
            cardEl.classList.add('flipped');
        }

        // Check for match if two cards are flipped
        if (this.flippedCards.length === 2) {
            this.isProcessing = true;
            setTimeout(() => this.checkMatch(), 300);
        }
    },

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.emoji === card2.emoji) {
            // Match found!
            card1.isMatched = true;
            card2.isMatched = true;
            this.matchedPairs++;

            // Add matched class for celebration animation
            const card1El = this.container.querySelector(`.memory-card[data-id="${card1.id}"]`);
            const card2El = this.container.querySelector(`.memory-card[data-id="${card2.id}"]`);
            if (card1El) card1El.classList.add('matched');
            if (card2El) card2El.classList.add('matched');

            if (typeof AudioManager !== 'undefined') {
                AudioManager.playPiecePlaced();
            }

            this.flippedCards = [];
            this.isProcessing = false;

            // Update score
            const scoreEl = this.container.querySelector('.memory-score');
            if (scoreEl) scoreEl.textContent = `⭐ ${this.matchedPairs}/${this.totalPairs}`;

            // Sync progress to remote
            this.syncGameState();

            // Check for win
            if (this.matchedPairs === this.totalPairs) {
                this.onGameComplete();
            }
        } else {
            // No match - flip back after longer delay (2 seconds for young children)
            setTimeout(() => {
                card1.isFlipped = false;
                card2.isFlipped = false;

                const card1El = this.container.querySelector(`.memory-card[data-id="${card1.id}"]`);
                const card2El = this.container.querySelector(`.memory-card[data-id="${card2.id}"]`);
                if (card1El) card1El.classList.remove('flipped');
                if (card2El) card2El.classList.remove('flipped');

                this.flippedCards = [];
                this.isProcessing = false;
            }, this.flipDelay);
        }
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        // Sync completion to remote (no popup on tablet - child can't read)
        this.syncGameState();

        // Auto-reset after brief celebration
        setTimeout(() => {
            this.reset();
        }, 2000);
    },

    getProgress() {
        return {
            matched: this.matchedPairs,
            total: this.totalPairs,
            percent: Math.round((this.matchedPairs / this.totalPairs) * 100)
        };
    }
};

window.MemoryGame = MemoryGame;
