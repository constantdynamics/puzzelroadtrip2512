// Farm Feeding Game for Toddlers
// Feed the animals their favorite food

const FarmGame = {
    container: null,
    animals: [],
    foods: [],
    fed: 0,
    total: 0,
    draggedFood: null,

    // Farm animals and their food
    animalData: {
        cow: {
            emoji: '🐄',
            name: 'Koe',
            sound: 'Boe!',
            food: { emoji: '🌾', name: 'Hooi' }
        },
        pig: {
            emoji: '🐷',
            name: 'Varken',
            sound: 'Knor!',
            food: { emoji: '🥕', name: 'Wortels' }
        },
        chicken: {
            emoji: '🐔',
            name: 'Kip',
            sound: 'Tok tok!',
            food: { emoji: '🌽', name: 'Mais' }
        },
        horse: {
            emoji: '🐴',
            name: 'Paard',
            sound: 'Hinnik!',
            food: { emoji: '🍎', name: 'Appel' }
        },
        sheep: {
            emoji: '🐑',
            name: 'Schaap',
            sound: 'Bè!',
            food: { emoji: '🥬', name: 'Gras' }
        },
        duck: {
            emoji: '🦆',
            name: 'Eend',
            sound: 'Kwak!',
            food: { emoji: '🍞', name: 'Brood' }
        },
        goat: {
            emoji: '🐐',
            name: 'Geit',
            sound: 'Mè!',
            food: { emoji: '🥗', name: 'Sla' }
        },
        rabbit: {
            emoji: '🐰',
            name: 'Konijn',
            sound: '*knabbel*',
            food: { emoji: '🥕', name: 'Wortel' }
        }
    },

    difficulties: {
        easy: 3,
        medium: 4,
        hard: 6
    },

    difficulty: 'easy',

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Farm game container not found');
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
        this.fed = 0;
        this.draggedFood = null;

        const animalCount = this.difficulties[this.difficulty];
        const animalKeys = Object.keys(this.animalData);

        // Shuffle and pick animals
        const shuffled = [...animalKeys].sort(() => Math.random() - 0.5);
        const selectedKeys = shuffled.slice(0, animalCount);

        // Create animals
        this.animals = selectedKeys.map((key, index) => ({
            id: key,
            ...this.animalData[key],
            fed: false,
            happy: false
        }));

        // Create food items (one for each animal)
        this.foods = this.animals.map(animal => ({
            id: `food-${animal.id}`,
            forAnimal: animal.id,
            emoji: animal.food.emoji,
            name: animal.food.name,
            used: false
        }));

        // Shuffle foods
        this.foods.sort(() => Math.random() - 0.5);

        this.total = this.animals.length;
        this.render();
        this.syncGameState();
    },

    // Sync game state to Firebase for remote display
    syncGameState() {
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            const nextAnimal = this.animals.find(a => !a.fed);
            TabletApp.roomRef.child('gameState').update({
                game: 'farm',
                fed: this.fed,
                total: this.total,
                currentAnimal: nextAnimal?.emoji || '🐄',
                completed: this.fed === this.total,
                timestamp: Date.now()
            });
        }
    },

    render() {
        if (!this.container) return;

        const unusedFoods = this.foods.filter(f => !f.used);

        this.container.innerHTML = `
            <div class="farm-game">
                <div class="farm-header">
                    <h2>🚜 Voer de dieren! 🌾</h2>
                    <div class="farm-score">
                        ${this.fed}/${this.total} dieren gevoerd
                    </div>
                </div>
                <div class="farm-area">
                    <div class="farm-animals">
                        ${this.animals.map(animal => `
                            <div class="farm-animal ${animal.fed ? 'fed' : ''} ${animal.happy ? 'happy' : ''}"
                                 data-id="${animal.id}">
                                <div class="animal-emoji">${animal.emoji}</div>
                                <div class="animal-name">${animal.name}</div>
                                ${animal.fed ? `
                                    <div class="animal-speech">${animal.sound}</div>
                                    <div class="animal-food-eaten">${animal.food.emoji}</div>
                                ` : `
                                    <div class="animal-hungry">🍽️ Honger!</div>
                                `}
                            </div>
                        `).join('')}
                    </div>
                    <div class="farm-foods">
                        ${unusedFoods.map(food => `
                            <div class="farm-food" data-id="${food.id}" data-for="${food.forAnimal}">
                                <span class="food-emoji">${food.emoji}</span>
                                <span class="food-name">${food.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.setupEvents();
    },

    setupEvents() {
        const foods = this.container.querySelectorAll('.farm-food');

        foods.forEach(el => {
            el.addEventListener('touchstart', (e) => this.startDrag(e, el), { passive: false });
            el.addEventListener('mousedown', (e) => this.startDrag(e, el));
        });

        document.addEventListener('touchmove', (e) => this.onDrag(e), { passive: false });
        document.addEventListener('touchend', (e) => this.endDrag(e));
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));
    },

    startDrag(e, element) {
        e.preventDefault();

        const id = element.dataset.id;
        const food = this.foods.find(f => f.id === id);
        if (!food || food.used) return;

        this.draggedFood = { element, id, food };

        const rect = element.getBoundingClientRect();
        element.classList.add('dragging');
        element.style.position = 'fixed';
        element.style.zIndex = '1000';

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        element.style.left = (clientX - rect.width / 2) + 'px';
        element.style.top = (clientY - rect.height / 2) + 'px';

        if (typeof AudioManager !== 'undefined') {
            AudioManager.playClick();
        }
    },

    onDrag(e) {
        if (!this.draggedFood) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = this.draggedFood.element.getBoundingClientRect();

        this.draggedFood.element.style.left = (clientX - rect.width / 2) + 'px';
        this.draggedFood.element.style.top = (clientY - rect.height / 2) + 'px';
    },

    endDrag(e) {
        if (!this.draggedFood) return;

        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

        const animals = this.container.querySelectorAll('.farm-animal');

        animals.forEach(animalEl => {
            const rect = animalEl.getBoundingClientRect();
            const animalId = animalEl.dataset.id;

            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {

                if (animalId === this.draggedFood.food.forAnimal) {
                    // Correct food!
                    const animal = this.animals.find(a => a.id === animalId);
                    if (animal && !animal.fed) {
                        animal.fed = true;
                        this.draggedFood.food.used = true;
                        this.fed++;

                        // Animate happy
                        setTimeout(() => {
                            animal.happy = true;
                            this.render();
                        }, 100);

                        if (typeof AudioManager !== 'undefined') {
                            AudioManager.playPiecePlaced();
                        }

                        // Sync progress to remote
                        this.syncGameState();

                        if (this.fed === this.total) {
                            setTimeout(() => this.onGameComplete(), 500);
                        }
                    }
                } else {
                    // Wrong food
                    animalEl.classList.add('wrong');
                    setTimeout(() => animalEl.classList.remove('wrong'), 500);

                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.playClick();
                    }
                }
            }
        });

        // Reset
        this.draggedFood.element.classList.remove('dragging');
        this.draggedFood.element.style.position = '';
        this.draggedFood.element.style.zIndex = '';
        this.draggedFood.element.style.left = '';
        this.draggedFood.element.style.top = '';

        this.draggedFood = null;
        this.render();
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        const celebrationEl = document.createElement('div');
        celebrationEl.className = 'farm-celebration';
        celebrationEl.innerHTML = `
            <div class="farm-celebration-content">
                <h2>🎉 Alle dieren zijn blij! 🎉</h2>
                <p>Je hebt de hele boerderij gevoerd!</p>
                <div class="farm-animals-happy">
                    ${this.animals.map(a => a.emoji).join(' ')}
                </div>
                <button class="farm-play-again-btn" id="farm-play-again">Opnieuw spelen</button>
            </div>
        `;
        this.container.appendChild(celebrationEl);

        document.getElementById('farm-play-again').addEventListener('click', () => {
            this.reset();
        });
    }
};

window.FarmGame = FarmGame;
