// Counting Game for Toddlers
// Count objects and tap the right number

const CountingGame = {
    container: null,
    currentCount: 0,
    correctAnswer: 0,
    score: 0,
    rounds: 0,
    maxRounds: 5,

    // Items to count
    itemSets: [
        { emoji: '🍎', name: 'appels' },
        { emoji: '⭐', name: 'sterren' },
        { emoji: '🐟', name: 'vissen' },
        { emoji: '🌸', name: 'bloemen' },
        { emoji: '🦋', name: 'vlinders' },
        { emoji: '🎈', name: 'ballonnen' },
        { emoji: '🍪', name: 'koekjes' },
        { emoji: '🐥', name: 'kuikentjes' },
        { emoji: '🚗', name: 'autos' },
        { emoji: '⚽', name: 'ballen' }
    ],

    difficulties: {
        easy: { min: 1, max: 3 },
        medium: { min: 1, max: 5 },
        hard: { min: 3, max: 7 }
    },

    difficulty: 'easy',

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Counting game container not found');
            return;
        }
        this.reset();
    },

    setDifficulty(level) {
        if (this.difficulties[level]) {
            this.difficulty = level;
        }
    },

    reset() {
        this.score = 0;
        this.rounds = 0;
        this.nextRound();
    },

    nextRound() {
        if (this.rounds >= this.maxRounds) {
            this.onGameComplete();
            return;
        }

        this.rounds++;

        // Pick random item set
        const itemSet = this.itemSets[Math.floor(Math.random() * this.itemSets.length)];

        // Pick random count
        const config = this.difficulties[this.difficulty];
        this.correctAnswer = config.min + Math.floor(Math.random() * (config.max - config.min + 1));

        this.currentItem = itemSet;

        // Sync to Firebase for remote display
        this.syncGameState();

        this.render();
    },

    syncGameState() {
        // Sync to Firebase so remote can display question and answer
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            TabletApp.roomRef.child('gameState').update({
                game: 'counting',
                emoji: this.currentItem.emoji,
                itemName: this.currentItem.name,
                correctAnswer: this.correctAnswer,
                round: this.rounds,
                maxRounds: this.maxRounds,
                score: this.score,
                timestamp: Date.now()
            });
        }
    },

    render() {
        if (!this.container) return;

        // Generate items with random positions
        const items = [];
        for (let i = 0; i < this.correctAnswer; i++) {
            items.push({
                emoji: this.currentItem.emoji,
                x: 10 + Math.random() * 80,
                y: 10 + Math.random() * 70,
                rotation: -15 + Math.random() * 30,
                scale: 0.9 + Math.random() * 0.3
            });
        }

        // Visual-only interface - NO buttons on tablet (parent answers on remote)
        this.container.innerHTML = `
            <div class="counting-game">
                <div class="counting-header">
                    <div class="counting-visual-progress">
                        ${Array(this.maxRounds).fill(0).map((_, i) => `
                            <span class="progress-circle ${i < this.rounds ? 'done' : ''} ${i === this.rounds - 1 ? 'current' : ''}"></span>
                        `).join('')}
                    </div>
                    <div class="counting-visual-score">
                        ${'⭐'.repeat(this.score)}
                    </div>
                </div>
                <div class="counting-question-visual">
                    <span class="counting-question-emoji">${this.currentItem.emoji}</span>
                    <span class="counting-question-mark">?</span>
                </div>
                <div class="counting-items-area">
                    ${items.map(item => `
                        <div class="counting-item"
                             style="left: ${item.x}%; top: ${item.y}%;
                                    transform: rotate(${item.rotation}deg) scale(${item.scale})">
                            ${item.emoji}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        // No events needed - parent answers on remote
    },

    // Called from remote when parent submits answer
    submitAnswer(number) {
        if (number === this.correctAnswer) {
            // Correct!
            this.score++;

            if (typeof AudioManager !== 'undefined') {
                AudioManager.playPiecePlaced();
            }

            // Show visual feedback
            this.showFeedback(true);

            // Sync score to remote
            this.syncGameState();

            setTimeout(() => {
                this.nextRound();
            }, 1000);
        } else {
            // Wrong
            if (typeof AudioManager !== 'undefined') {
                AudioManager.playClick();
            }

            this.showFeedback(false);
        }
    },

    showFeedback(isCorrect) {
        const feedback = document.createElement('div');
        feedback.className = `counting-feedback ${isCorrect ? 'correct' : 'wrong'}`;
        feedback.textContent = isCorrect ? '✓' : '✗';
        this.container.querySelector('.counting-items-area').appendChild(feedback);

        setTimeout(() => feedback.remove(), 800);
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        const stars = this.score >= this.maxRounds ? 3 : (this.score >= this.maxRounds - 1 ? 2 : 1);

        // Sync completion to remote (no popup on tablet - child can't read)
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            TabletApp.roomRef.child('gameState').update({
                game: 'counting',
                completed: true,
                finalScore: this.score,
                maxRounds: this.maxRounds,
                stars: stars,
                timestamp: Date.now()
            });
        }

        // Auto-reset after brief celebration
        setTimeout(() => {
            this.reset();
        }, 2000);
    }
};

window.CountingGame = CountingGame;
