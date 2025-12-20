// Tasks Manager - All 100 tasks and task handling

const TasksManager = {
    // All 100 tasks organized by category
    tasks: [
        // Categorie: Basis Activiteiten (1-10)
        { id: 1, text: 'Zing "Twinkle Twinkle Little Star"', category: 'basis' },
        { id: 2, text: 'Drink een slokje water', category: 'basis' },
        { id: 3, text: 'Eet een koekje of cracker', category: 'basis' },
        { id: 4, text: 'Klap 5 keer in je handen', category: 'basis' },
        { id: 5, text: 'Tel tot 10', category: 'basis' },
        { id: 6, text: 'Zeg "mama" 3 keer', category: 'basis' },
        { id: 7, text: 'Zeg "papa" 3 keer', category: 'basis' },
        { id: 8, text: 'Geef papa of mama een kus', category: 'basis' },
        { id: 9, text: 'Zwaai naar buiten', category: 'basis' },
        { id: 10, text: 'Doe je ogen 10 seconden dicht', category: 'basis' },

        // Categorie: Observatie - Dingen Zoeken (11-25)
        { id: 11, text: 'Zoek een rode auto', category: 'observatie' },
        { id: 12, text: 'Zoek een blauwe auto', category: 'observatie' },
        { id: 13, text: 'Zoek een truck', category: 'observatie' },
        { id: 14, text: 'Zoek een motorfiets', category: 'observatie' },
        { id: 15, text: 'Zoek een bus', category: 'observatie' },
        { id: 16, text: 'Zoek een boom', category: 'observatie' },
        { id: 17, text: 'Zoek een huis', category: 'observatie' },
        { id: 18, text: 'Zoek een brug', category: 'observatie' },
        { id: 19, text: 'Zoek een verkeerslicht', category: 'observatie' },
        { id: 20, text: 'Zoek een verkeersbord', category: 'observatie' },
        { id: 21, text: 'Zoek een fiets', category: 'observatie' },
        { id: 22, text: 'Zoek wolken', category: 'observatie' },
        { id: 23, text: 'Zoek een vogel', category: 'observatie' },
        { id: 24, text: 'Zoek een hond', category: 'observatie' },
        { id: 25, text: 'Zoek een kat', category: 'observatie' },

        // Categorie: Beweging (26-35)
        { id: 26, text: 'Draai je hoofd naar links', category: 'beweging' },
        { id: 27, text: 'Draai je hoofd naar rechts', category: 'beweging' },
        { id: 28, text: 'Beweeg je armen omhoog', category: 'beweging' },
        { id: 29, text: 'Stamp met je voeten', category: 'beweging' },
        { id: 30, text: 'Raak je neus aan', category: 'beweging' },
        { id: 31, text: 'Raak je oren aan', category: 'beweging' },
        { id: 32, text: 'Zwaai met beide handen', category: 'beweging' },
        { id: 33, text: 'Wijs naar het dak', category: 'beweging' },
        { id: 34, text: 'Wijs naar de vloer', category: 'beweging' },
        { id: 35, text: 'Maak een vuist', category: 'beweging' },

        // Categorie: Geluiden Maken (36-45)
        { id: 36, text: 'Maak auto geluid: VROEM!', category: 'geluiden' },
        { id: 37, text: 'Maak koe geluid: MOE!', category: 'geluiden' },
        { id: 38, text: 'Maak hond geluid: WAF WAF!', category: 'geluiden' },
        { id: 39, text: 'Maak kat geluid: MIAUW!', category: 'geluiden' },
        { id: 40, text: 'Maak schaap geluid: BAA!', category: 'geluiden' },
        { id: 41, text: 'Maak sirene geluid: TATUTA!', category: 'geluiden' },
        { id: 42, text: 'Fluister: SHHH!', category: 'geluiden' },
        { id: 43, text: 'Roep: HOERA!', category: 'geluiden' },
        { id: 44, text: 'Zeg HALLO heel luid', category: 'geluiden' },
        { id: 45, text: 'Zeg DAG DAG!', category: 'geluiden' },

        // Categorie: Liedjes (46-55)
        { id: 46, text: 'Zing: Altijd is Kortjakje ziek', category: 'liedjes' },
        { id: 47, text: 'Zing: Daar was laatst een meisje loos', category: 'liedjes' },
        { id: 48, text: 'Zing: Op een grote paddenstoel', category: 'liedjes' },
        { id: 49, text: 'Zing: Alle eendjes zwemmen', category: 'liedjes' },
        { id: 50, text: 'Zing: Hoofd schouders knie en teen', category: 'liedjes' },
        { id: 51, text: 'Neurie een liedje', category: 'liedjes' },
        { id: 52, text: 'Zing: La la la la la!', category: 'liedjes' },
        { id: 53, text: 'Zing het ABC-lied', category: 'liedjes' },
        { id: 54, text: 'Zing Happy Birthday', category: 'liedjes' },
        { id: 55, text: 'Zing Old MacDonald', category: 'liedjes' },

        // Categorie: Eten/Drinken (56-60)
        { id: 56, text: 'Eet een stukje fruit', category: 'eten' },
        { id: 57, text: 'Eet een rijstwafel', category: 'eten' },
        { id: 58, text: 'Eet een rozijntje', category: 'eten' },
        { id: 59, text: 'Proef iets nieuws', category: 'eten' },
        { id: 60, text: 'Drink uit je bekertje', category: 'eten' },

        // Categorie: Nadenken (61-70)
        { id: 61, text: 'Vertel over je ontbijt', category: 'nadenken' },
        { id: 62, text: 'Noem 3 kleuren', category: 'nadenken' },
        { id: 63, text: 'Wat is je lievelingsdier?', category: 'nadenken' },
        { id: 64, text: 'Waar gaan we naartoe?', category: 'nadenken' },
        { id: 65, text: 'Hoe oud ben je?', category: 'nadenken' },
        { id: 66, text: 'Wat is je lievelingseten?', category: 'nadenken' },
        { id: 67, text: 'Hoe heet je knuffel?', category: 'nadenken' },
        { id: 68, text: 'Wat is je naam?', category: 'nadenken' },
        { id: 69, text: 'Noem je familieleden', category: 'nadenken' },
        { id: 70, text: 'Wat deed je gisteren?', category: 'nadenken' },

        // Categorie: Interactie (71-80)
        { id: 71, text: 'Vertel een grapje', category: 'interactie' },
        { id: 72, text: 'Geef een high-five', category: 'interactie' },
        { id: 73, text: 'Knuffel je speeltje', category: 'interactie' },
        { id: 74, text: 'Vraag: Hoe gaat het?', category: 'interactie' },
        { id: 75, text: 'Zeg: Dank je wel!', category: 'interactie' },
        { id: 76, text: 'Zeg: Alsjeblieft!', category: 'interactie' },
        { id: 77, text: 'Vertel wat je leuk vindt', category: 'interactie' },
        { id: 78, text: 'Vraag: Waar zijn we?', category: 'interactie' },
        { id: 79, text: 'Zeg iets liefs', category: 'interactie' },
        { id: 80, text: 'Vraag om een verhaal', category: 'interactie' },

        // Categorie: Fantasie (81-90)
        { id: 81, text: 'Doe alsof je een olifant bent', category: 'fantasie' },
        { id: 82, text: 'Doe alsof je vliegt', category: 'fantasie' },
        { id: 83, text: 'Doe alsof je slaapt', category: 'fantasie' },
        { id: 84, text: 'Doe alsof je heel groot bent', category: 'fantasie' },
        { id: 85, text: 'Doe alsof je heel klein bent', category: 'fantasie' },
        { id: 86, text: 'Doe alsof je een robot bent', category: 'fantasie' },
        { id: 87, text: 'Doe alsof je een kat bent', category: 'fantasie' },
        { id: 88, text: 'Doe alsof je zwemt', category: 'fantasie' },
        { id: 89, text: 'Doe alsof je danst', category: 'fantasie' },
        { id: 90, text: 'Doe alsof je kookt', category: 'fantasie' },

        // Categorie: Rustig (91-100)
        { id: 91, text: 'Adem 5 keer diep in en uit', category: 'rustig' },
        { id: 92, text: 'Luister naar de muziek (30 sec)', category: 'rustig' },
        { id: 93, text: 'Kijk uit het raam (1 min)', category: 'rustig' },
        { id: 94, text: 'Zit stil als een standbeeld', category: 'rustig' },
        { id: 95, text: 'Sluit je ogen en luister', category: 'rustig' },
        { id: 96, text: 'Tel je vingers', category: 'rustig' },
        { id: 97, text: 'Voel aan je speeltje', category: 'rustig' },
        { id: 98, text: 'Ruik aan iets lekkers', category: 'rustig' },
        { id: 99, text: 'Denk aan iets leuks', category: 'rustig' },
        { id: 100, text: 'Glimlach naar je ouders', category: 'rustig' }
    ],

    // Category info for styling
    categories: {
        basis: { name: 'Basis', color: '#4CAF50' },
        observatie: { name: 'Zoeken', color: '#2196F3' },
        beweging: { name: 'Beweging', color: '#FF9800' },
        geluiden: { name: 'Geluiden', color: '#E91E63' },
        liedjes: { name: 'Liedjes', color: '#9C27B0' },
        eten: { name: 'Eten', color: '#795548' },
        nadenken: { name: 'Nadenken', color: '#607D8B' },
        interactie: { name: 'Interactie', color: '#00BCD4' },
        fantasie: { name: 'Fantasie', color: '#673AB7' },
        rustig: { name: 'Rustig', color: '#8BC34A' }
    },

    // Get all tasks
    getAllTasks() {
        return this.tasks;
    },

    // Get tasks by category
    getTasksByCategory(category) {
        return this.tasks.filter(task => task.category === category);
    },

    // Get a random task
    getRandomTask() {
        return this.tasks[Math.floor(Math.random() * this.tasks.length)];
    },

    // Get category info
    getCategoryInfo(category) {
        return this.categories[category];
    },

    // Populate the tasks grid in the modal
    populateTasksGrid(containerId, onTaskClick) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        this.tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            taskEl.textContent = task.text;
            taskEl.style.borderLeft = `4px solid ${this.categories[task.category].color}`;

            taskEl.addEventListener('click', () => {
                if (onTaskClick) onTaskClick(task);
            });

            container.appendChild(taskEl);
        });
    }
};

// Make globally available
window.TasksManager = TasksManager;
