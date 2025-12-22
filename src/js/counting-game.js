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
        this.render();
    },

    render() {
        if (!this.container) return;

        const config = this.difficulties[this.difficulty];

        // Generate items with random positions
        const items = [];
        for (let i = 0; i < this.correctAnswer; i++) {
            items.push({
                emoji: this.currentItem.emoji,
                x: 15 + Math.random() * 70,
                y: 15 + Math.random() * 60,
                rotation: -15 + Math.random() * 30,
                scale: 0.9 + Math.random() * 0.3
            });
        }

        // Generate number buttons (shuffled wrong answers + correct)
        const numbers = this.generateNumberOptions();

        this.container.innerHTML = `
            <div class="counting-game">
                <div class="counting-header">
                    <div class="counting-progress">
                        Ronde ${this.rounds}/${this.maxRounds}
                    </div>
                    <div class="counting-score">
                        Score: ${this.score}
                    </div>
                </div>
                <div class="counting-question">
                    <span>Hoeveel ${this.currentItem.name}?</span>
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
                <div class="counting-buttons">
                    ${numbers.map(num => `
                        <button class="counting-number-btn" data-number="${num}">
                            ${num}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        this.setupEvents();
    },

    generateNumberOptions() {
        const config = this.difficulties[this.difficulty];
        const options = new Set([this.correctAnswer]);

        // Add some wrong answers
        while (options.size < Math.min(4, config.max)) {
            const wrongAnswer = config.min + Math.floor(Math.random() * (config.max - config.min + 1));
            options.add(wrongAnswer);
        }

        // Convert to array and shuffle
        return Array.from(options).sort(() => Math.random() - 0.5);
    },

    setupEvents() {
        this.container.querySelectorAll('.counting-number-btn').forEach(btn => {
            const tap = () => {
                const number = parseInt(btn.dataset.number);
                this.checkAnswer(number, btn);
            };

            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                tap();
            }, { passive: false });

            btn.addEventListener('click', tap);
        });
    },

    checkAnswer(number, buttonEl) {
        if (number === this.correctAnswer) {
            // Correct!
            this.score++;
            buttonEl.classList.add('correct');

            if (typeof AudioManager !== 'undefined') {
                AudioManager.playPiecePlaced();
            }

            // Show celebration briefly
            this.showFeedback(true);

            setTimeout(() => {
                this.nextRound();
            }, 1000);
        } else {
            // Wrong
            buttonEl.classList.add('wrong');

            if (typeof AudioManager !== 'undefined') {
                AudioManager.playClick();
            }

            this.showFeedback(false);

            setTimeout(() => {
                buttonEl.classList.remove('wrong');
            }, 500);
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

        this.container.innerHTML = `
            <div class="counting-game">
                <div class="counting-celebration">
                    <h2>🎉 Klaar! 🎉</h2>
                    <p>Je hebt ${this.score} van de ${this.maxRounds} goed!</p>
                    <div class="counting-stars">
                        ${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}
                    </div>
                    <button class="counting-play-again-btn" id="counting-play-again">
                        Opnieuw tellen
                    </button>
                </div>
            </div>
        `;

        document.getElementById('counting-play-again').addEventListener('click', () => {
            this.reset();
        });
    }
};

window.CountingGame = CountingGame;
