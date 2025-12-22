// Cooking Game for Toddlers
// Follow simple recipes by adding ingredients
// Visual actions: stir, pour, place (no text on tablet)

const CookingGame = {
    container: null,
    currentRecipe: null,
    ingredients: [],
    addedIngredients: [],
    step: 0,
    draggedIngredient: null,

    // Visual action types (icons instead of text)
    actionIcons: {
        add: '➕',      // Add ingredient
        stir: '🥄',     // Stir with spoon
        pour: '💧',     // Pour liquid
        mix: '🔄',      // Mix together
        sprinkle: '✨', // Sprinkle on top
        place: '👇',    // Place on top
        spread: '🧈'    // Spread on
    },

    // Recipes with visual action types
    recipes: {
        pizza: {
            name: 'Pizza',
            emoji: '🍕',
            result: '🍕',
            base: '🫓',
            steps: [
                { ingredient: '🍅', name: 'Tomatensaus', action: 'spread', actionText: 'Smeer de saus!' },
                { ingredient: '🧀', name: 'Kaas', action: 'sprinkle', actionText: 'Strooi de kaas!' },
                { ingredient: '🍄', name: 'Champignons', action: 'place', actionText: 'Leg er op!' },
                { ingredient: '🫑', name: 'Paprika', action: 'place', actionText: 'Leg er op!' },
                { ingredient: '🧅', name: 'Ui', action: 'place', actionText: 'Leg er op!' }
            ]
        },
        salad: {
            name: 'Salade',
            emoji: '🥗',
            result: '🥗',
            base: '🥣',
            steps: [
                { ingredient: '🥬', name: 'Sla', action: 'add', actionText: 'Doe erin!' },
                { ingredient: '🍅', name: 'Tomaat', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🥒', name: 'Komkommer', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🥕', name: 'Wortel', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🫒', name: 'Olijf', action: 'add', actionText: 'Doe erbij!' }
            ]
        },
        smoothie: {
            name: 'Smoothie',
            emoji: '🥤',
            result: '🥤',
            base: '🫙',
            steps: [
                { ingredient: '🍌', name: 'Banaan', action: 'add', actionText: 'Doe erin!' },
                { ingredient: '🍓', name: 'Aardbeien', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🥛', name: 'Melk', action: 'pour', actionText: 'Giet erbij!' },
                { ingredient: '🍯', name: 'Honing', action: 'pour', actionText: 'Giet erbij!' },
                { ingredient: '🥄', name: 'Roeren', action: 'stir', actionText: 'Roer!' }
            ]
        },
        sandwich: {
            name: 'Boterham',
            emoji: '🥪',
            result: '🥪',
            base: '🍞',
            steps: [
                { ingredient: '🧈', name: 'Boter', action: 'spread', actionText: 'Smeer erop!' },
                { ingredient: '🧀', name: 'Kaas', action: 'place', actionText: 'Leg erop!' },
                { ingredient: '🥬', name: 'Sla', action: 'place', actionText: 'Leg erop!' },
                { ingredient: '🍅', name: 'Tomaat', action: 'place', actionText: 'Leg erop!' },
                { ingredient: '🥒', name: 'Komkommer', action: 'place', actionText: 'Leg erop!' }
            ]
        },
        pancakes: {
            name: 'Pannenkoek',
            emoji: '🥞',
            result: '🥞',
            base: '🍳',
            steps: [
                { ingredient: '🥚', name: 'Ei', action: 'add', actionText: 'Breek erin!' },
                { ingredient: '🥛', name: 'Melk', action: 'pour', actionText: 'Giet erbij!' },
                { ingredient: '🌾', name: 'Meel', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🥄', name: 'Roeren', action: 'stir', actionText: 'Roer!' },
                { ingredient: '🍯', name: 'Stroop', action: 'pour', actionText: 'Giet erop!' }
            ]
        },
        soup: {
            name: 'Soep',
            emoji: '🍲',
            result: '🍲',
            base: '🥘',
            steps: [
                { ingredient: '💧', name: 'Water', action: 'pour', actionText: 'Giet erin!' },
                { ingredient: '🥕', name: 'Wortel', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🧅', name: 'Ui', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🥔', name: 'Aardappel', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🥄', name: 'Roeren', action: 'stir', actionText: 'Roer!' }
            ]
        },
        cake: {
            name: 'Taart',
            emoji: '🎂',
            result: '🎂',
            base: '🍰',
            steps: [
                { ingredient: '🥚', name: 'Eieren', action: 'add', actionText: 'Breek erin!' },
                { ingredient: '🧈', name: 'Boter', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🍫', name: 'Chocolade', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🥄', name: 'Roeren', action: 'stir', actionText: 'Mixen!' },
                { ingredient: '🍓', name: 'Fruit', action: 'place', actionText: 'Versieren!' }
            ]
        },
        icecream: {
            name: 'IJsje',
            emoji: '🍦',
            result: '🍦',
            base: '🍨',
            steps: [
                { ingredient: '🥛', name: 'Room', action: 'pour', actionText: 'Giet erin!' },
                { ingredient: '🍓', name: 'Fruit', action: 'add', actionText: 'Doe erbij!' },
                { ingredient: '🍫', name: 'Chocolade', action: 'sprinkle', actionText: 'Strooi erop!' },
                { ingredient: '🍒', name: 'Kers', action: 'place', actionText: 'Leg erop!' },
                { ingredient: '🥜', name: 'Nootjes', action: 'sprinkle', actionText: 'Strooi erop!' }
            ]
        }
    },

    // Difficulty: 2-5 ingredients
    difficulties: {
        easy: 2,    // 2 steps
        medium: 3,  // 3 steps
        hard: 5     // 5 steps
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
        this.syncGameState();
    },

    // Sync game state to Firebase for remote display
    syncGameState() {
        if (typeof TabletApp !== 'undefined' && TabletApp.roomRef) {
            const currentStep = this.currentRecipe?.steps[this.step];
            TabletApp.roomRef.child('gameState').update({
                game: 'cooking',
                recipeName: this.currentRecipe?.name || 'Recept',
                recipeEmoji: this.currentRecipe?.emoji || '🍳',
                step: this.step,
                totalSteps: this.currentRecipe?.steps?.length || 5,
                nextIngredient: currentStep?.ingredient || '',
                actionText: currentStep?.actionText || '',
                completed: this.step >= (this.currentRecipe?.steps?.length || 0),
                timestamp: Date.now()
            });
        }
    },

    render() {
        if (!this.container) return;

        const currentStep = this.currentRecipe.steps[this.step];
        const isComplete = this.step >= this.currentRecipe.steps.length;
        const unusedIngredients = this.ingredients.filter(i => !i.used);
        const actionIcon = currentStep ? this.actionIcons[currentStep.action] || '➕' : '';

        // Visual-only interface (no text - parent reads from remote)
        this.container.innerHTML = `
            <div class="cooking-game">
                <div class="cooking-header">
                    <div class="cooking-recipe-icon">
                        <span class="recipe-target">${this.currentRecipe.emoji}</span>
                    </div>
                    <div class="cooking-progress-visual">
                        ${this.currentRecipe.steps.map((_, i) => `
                            <span class="cooking-step-dot ${i < this.step ? 'done' : ''} ${i === this.step ? 'current' : ''}">
                                ${i < this.step ? '✓' : ''}
                            </span>
                        `).join('')}
                    </div>
                </div>
                <div class="cooking-area">
                    <div class="cooking-bowl">
                        <div class="bowl-emoji">${this.currentRecipe.base}</div>
                        <div class="bowl-contents">
                            ${this.addedIngredients.map(i => `<span class="added-ingredient">${i}</span>`).join('')}
                        </div>
                        ${!isComplete ? `
                            <div class="cooking-action-indicator">
                                <span class="action-icon">${actionIcon}</span>
                                <span class="next-ingredient-hint">${currentStep.ingredient}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${!isComplete ? `
                        <div class="cooking-ingredients">
                            ${unusedIngredients.map(item => `
                                <div class="cooking-ingredient ${item.isRecipe && item.stepIndex === this.step ? 'correct-next' : ''}"
                                     data-id="${item.id}">
                                    <span class="ingredient-emoji">${item.emoji}</span>
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

                    // Sync progress to remote
                    this.syncGameState();

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

        // Visual-only celebration (no text)
        const celebrationEl = document.createElement('div');
        celebrationEl.className = 'cooking-celebration';
        celebrationEl.innerHTML = `
            <div class="cooking-celebration-content">
                <div class="celebration-emoji">🎉👨‍🍳🎉</div>
                <div class="cooking-result">
                    ${this.currentRecipe.result}
                </div>
                <div class="cooking-ingredients-used">
                    ${this.addedIngredients.join(' ')}
                </div>
                <button class="cooking-play-again-btn" id="cooking-play-again">🔄</button>
            </div>
        `;
        this.container.appendChild(celebrationEl);

        document.getElementById('cooking-play-again').addEventListener('click', () => {
            this.reset();
        });
    }
};

window.CookingGame = CookingGame;
