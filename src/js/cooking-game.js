// Cooking Game for Toddlers
// Follow simple recipes by adding ingredients

const CookingGame = {
    container: null,
    currentRecipe: null,
    ingredients: [],
    addedIngredients: [],
    step: 0,
    draggedIngredient: null,

    // Recipes
    recipes: {
        pizza: {
            name: 'Pizza',
            emoji: '🍕',
            result: '🍕',
            base: '🫓',
            steps: [
                { ingredient: '🍅', name: 'Tomatensaus', action: 'Doe er tomatensaus op!' },
                { ingredient: '🧀', name: 'Kaas', action: 'Strooi er kaas over!' },
                { ingredient: '🍄', name: 'Champignons', action: 'Leg er champignons op!' }
            ]
        },
        salad: {
            name: 'Salade',
            emoji: '🥗',
            result: '🥗',
            base: '🥣',
            steps: [
                { ingredient: '🥬', name: 'Sla', action: 'Doe de sla erin!' },
                { ingredient: '🍅', name: 'Tomaat', action: 'Voeg tomaat toe!' },
                { ingredient: '🥒', name: 'Komkommer', action: 'Doe er komkommer bij!' }
            ]
        },
        smoothie: {
            name: 'Smoothie',
            emoji: '🥤',
            result: '🥤',
            base: '🫙',
            steps: [
                { ingredient: '🍌', name: 'Banaan', action: 'Doe de banaan erin!' },
                { ingredient: '🍓', name: 'Aardbeien', action: 'Voeg aardbeien toe!' },
                { ingredient: '🥛', name: 'Melk', action: 'Giet er melk bij!' }
            ]
        },
        sandwich: {
            name: 'Boterham',
            emoji: '🥪',
            result: '🥪',
            base: '🍞',
            steps: [
                { ingredient: '🧈', name: 'Boter', action: 'Smeer er boter op!' },
                { ingredient: '🧀', name: 'Kaas', action: 'Leg er kaas op!' },
                { ingredient: '🥬', name: 'Sla', action: 'Doe er sla op!' }
            ]
        },
        pancakes: {
            name: 'Pannenkoek',
            emoji: '🥞',
            result: '🥞',
            base: '🍳',
            steps: [
                { ingredient: '🥚', name: 'Ei', action: 'Breek het ei!' },
                { ingredient: '🥛', name: 'Melk', action: 'Giet er melk bij!' },
                { ingredient: '🌾', name: 'Meel', action: 'Doe het meel erbij!' }
            ]
        },
        soup: {
            name: 'Soep',
            emoji: '🍲',
            result: '🍲',
            base: '🥘',
            steps: [
                { ingredient: '💧', name: 'Water', action: 'Doe water in de pan!' },
                { ingredient: '🥕', name: 'Wortel', action: 'Voeg wortels toe!' },
                { ingredient: '🧅', name: 'Ui', action: 'Doe er ui bij!' }
            ]
        },
        cake: {
            name: 'Taart',
            emoji: '🎂',
            result: '🎂',
            base: '🍰',
            steps: [
                { ingredient: '🥚', name: 'Eieren', action: 'Breek de eieren!' },
                { ingredient: '🧈', name: 'Boter', action: 'Voeg boter toe!' },
                { ingredient: '🍫', name: 'Chocolade', action: 'Doe er chocolade bij!' }
            ]
        },
        icecream: {
            name: 'IJsje',
            emoji: '🍦',
            result: '🍦',
            base: '🍨',
            steps: [
                { ingredient: '🥛', name: 'Room', action: 'Doe de room erin!' },
                { ingredient: '🍓', name: 'Fruit', action: 'Voeg fruit toe!' },
                { ingredient: '🍫', name: 'Chocolade', action: 'Strooi er chocolade over!' }
            ]
        }
    },

    difficulties: {
        easy: 2,   // 2 steps
        medium: 3, // 3 steps
        hard: 4    // all steps + bonus
    },

    difficulty: 'easy',

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Cooking game container not found');
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
        this.step = 0;
        this.addedIngredients = [];
        this.draggedIngredient = null;

        // Pick random recipe
        const recipeKeys = Object.keys(this.recipes);
        const recipeKey = recipeKeys[Math.floor(Math.random() * recipeKeys.length)];
        this.currentRecipe = { id: recipeKey, ...this.recipes[recipeKey] };

        // Limit steps based on difficulty
        const maxSteps = this.difficulties[this.difficulty];
        if (this.currentRecipe.steps.length > maxSteps) {
            this.currentRecipe.steps = this.currentRecipe.steps.slice(0, maxSteps);
        }

        // Create ingredients list (recipe ingredients + distractors)
        const recipeIngredients = this.currentRecipe.steps.map((step, i) => ({
            id: `recipe-${i}`,
            emoji: step.ingredient,
            name: step.name,
            isRecipe: true,
            stepIndex: i,
            used: false
        }));

        // Add some distractor ingredients
        const allIngredients = ['🥑', '🌶️', '🍋', '🧄', '🥜', '🍯', '🌿', '🫒'];
        const distractors = allIngredients
            .filter(emoji => !recipeIngredients.some(i => i.emoji === emoji))
            .slice(0, 2)
            .map((emoji, i) => ({
                id: `distractor-${i}`,
                emoji,
                name: 'Verkeerd',
                isRecipe: false,
                used: false
            }));

        this.ingredients = [...recipeIngredients, ...distractors].sort(() => Math.random() - 0.5);

        this.render();
    },

    render() {
        if (!this.container) return;

        const currentStep = this.currentRecipe.steps[this.step];
        const isComplete = this.step >= this.currentRecipe.steps.length;
        const unusedIngredients = this.ingredients.filter(i => !i.used);

        this.container.innerHTML = `
            <div class="cooking-game">
                <div class="cooking-header">
                    <h2>👨‍🍳 We maken: ${this.currentRecipe.name} ${this.currentRecipe.emoji}</h2>
                    <div class="cooking-progress">
                        Stap ${Math.min(this.step + 1, this.currentRecipe.steps.length)}/${this.currentRecipe.steps.length}
                    </div>
                </div>
                <div class="cooking-area">
                    <div class="cooking-bowl">
                        <div class="bowl-emoji">${this.currentRecipe.base}</div>
                        <div class="bowl-contents">
                            ${this.addedIngredients.map(i => `<span class="added-ingredient">${i}</span>`).join('')}
                        </div>
                        ${!isComplete ? `
                            <div class="cooking-instruction">
                                ${currentStep.action}
                            </div>
                        ` : ''}
                    </div>
                    ${!isComplete ? `
                        <div class="cooking-ingredients">
                            ${unusedIngredients.map(item => `
                                <div class="cooking-ingredient ${item.isRecipe && item.stepIndex === this.step ? 'correct-next' : ''}"
                                     data-id="${item.id}">
                                    <span class="ingredient-emoji">${item.emoji}</span>
                                    <span class="ingredient-name">${item.name}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        if (!isComplete) {
            this.setupEvents();
        }
    },

    setupEvents() {
        const ingredients = this.container.querySelectorAll('.cooking-ingredient');

        ingredients.forEach(el => {
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
        const ingredient = this.ingredients.find(i => i.id === id);
        if (!ingredient || ingredient.used) return;

        this.draggedIngredient = { element, id, ingredient };

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
        if (!this.draggedIngredient) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = this.draggedIngredient.element.getBoundingClientRect();

        this.draggedIngredient.element.style.left = (clientX - rect.width / 2) + 'px';
        this.draggedIngredient.element.style.top = (clientY - rect.height / 2) + 'px';
    },

    endDrag(e) {
        if (!this.draggedIngredient) return;

        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

        // Check if dropped on bowl
        const bowl = this.container.querySelector('.cooking-bowl');
        if (bowl) {
            const rect = bowl.getBoundingClientRect();

            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {

                const ingredient = this.draggedIngredient.ingredient;

                if (ingredient.isRecipe && ingredient.stepIndex === this.step) {
                    // Correct ingredient!
                    ingredient.used = true;
                    this.addedIngredients.push(ingredient.emoji);
                    this.step++;

                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.playPiecePlaced();
                    }

                    if (this.step >= this.currentRecipe.steps.length) {
                        setTimeout(() => this.onGameComplete(), 300);
                    }
                } else {
                    // Wrong ingredient
                    bowl.classList.add('wrong');
                    setTimeout(() => bowl.classList.remove('wrong'), 500);

                    if (typeof AudioManager !== 'undefined') {
                        AudioManager.playClick();
                    }
                }
            }
        }

        // Reset
        this.draggedIngredient.element.classList.remove('dragging');
        this.draggedIngredient.element.style.position = '';
        this.draggedIngredient.element.style.zIndex = '';
        this.draggedIngredient.element.style.left = '';
        this.draggedIngredient.element.style.top = '';

        this.draggedIngredient = null;
        this.render();
    },

    onGameComplete() {
        if (typeof AudioManager !== 'undefined') {
            AudioManager.playPuzzleComplete();
        }

        const celebrationEl = document.createElement('div');
        celebrationEl.className = 'cooking-celebration';
        celebrationEl.innerHTML = `
            <div class="cooking-celebration-content">
                <h2>🎉 Heerlijk! 🎉</h2>
                <p>Je ${this.currentRecipe.name} is klaar!</p>
                <div class="cooking-result">
                    ${this.currentRecipe.result}
                </div>
                <button class="cooking-play-again-btn" id="cooking-play-again">Nieuw recept</button>
            </div>
        `;
        this.container.appendChild(celebrationEl);

        document.getElementById('cooking-play-again').addEventListener('click', () => {
            this.reset();
        });
    }
};

window.CookingGame = CookingGame;
