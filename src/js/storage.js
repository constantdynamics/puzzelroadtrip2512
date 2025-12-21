// Storage Manager - Handles all data persistence with LocalStorage

const StorageManager = {
    STORAGE_KEY: 'roadtrip_puzzle_data',
    PHOTO_LIBRARY_KEY: 'roadtrip_photo_library',

    // Default state
    defaultState: {
        currentPuzzleIndex: 0,
        piecesPlaced: 0,
        savedPieces: 0,
        timerRemaining: 15 * 60, // 15 minutes in seconds
        timerPaused: false,
        timerInterval: 15, // minutes per piece
        completedPuzzles: [],
        soundEnabled: true,
        volume: 50,
        lastSaveTime: null,
        pieceCount: 40, // Aantal stukjes (12, 20, 30, 40, 60)
        vehicle: '🏍️', // Voertuig voor timer animatie (wijst naar rechts)
        customImage: null // Base64 van eigen afbeelding
    },

    // Load state from LocalStorage
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with defaults to handle new properties
                return { ...this.defaultState, ...parsed };
            }
        } catch (e) {
            console.error('Error loading state:', e);
        }
        return { ...this.defaultState };
    },

    // Save state to LocalStorage
    save(state) {
        try {
            state.lastSaveTime = Date.now();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
            return true;
        } catch (e) {
            console.error('Error saving state:', e);
            // Handle quota exceeded
            if (e.name === 'QuotaExceededError') {
                // Try to clear old data and save again
                this.clearOldData();
                try {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
                    return true;
                } catch (e2) {
                    console.error('Still cannot save after cleanup:', e2);
                }
            }
            return false;
        }
    },

    // Update specific properties
    update(updates) {
        const state = this.load();
        Object.assign(state, updates);
        return this.save(state);
    },

    // Clear all data
    clear() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Error clearing state:', e);
            return false;
        }
    },

    // Reset current puzzle progress only
    resetPuzzle() {
        return this.update({
            piecesPlaced: 0,
            savedPieces: 0,
            timerRemaining: this.load().timerInterval * 60
        });
    },

    // Mark puzzle as completed
    completePuzzle(puzzleIndex) {
        const state = this.load();
        if (!state.completedPuzzles.includes(puzzleIndex)) {
            state.completedPuzzles.push(puzzleIndex);
        }
        return this.save(state);
    },

    // Check if puzzle is completed
    isPuzzleCompleted(puzzleIndex) {
        const state = this.load();
        return state.completedPuzzles.includes(puzzleIndex);
    },

    // Get next incomplete puzzle
    getNextIncompletePuzzle(totalPuzzles) {
        const state = this.load();
        for (let i = 0; i < totalPuzzles; i++) {
            if (!state.completedPuzzles.includes(i)) {
                return i;
            }
        }
        // All puzzles completed, return 0 to restart
        return 0;
    },

    // Clear old data if storage is full
    clearOldData() {
        // Keep only essential data
        const state = this.load();
        const minimal = {
            currentPuzzleIndex: state.currentPuzzleIndex,
            piecesPlaced: state.piecesPlaced,
            completedPuzzles: state.completedPuzzles.slice(-10), // Keep last 10
            soundEnabled: state.soundEnabled,
            volume: state.volume,
            timerInterval: state.timerInterval
        };
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(minimal));
        } catch (e) {
            // Last resort: clear everything
            localStorage.clear();
        }
    },

    // ============ Photo Library Functions ============

    // Get all photos from library
    getPhotoLibrary() {
        try {
            const saved = localStorage.getItem(this.PHOTO_LIBRARY_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('Error loading photo library:', e);
        }
        return [];
    },

    // Add photo to library
    addPhoto(photoData, name = null) {
        try {
            const library = this.getPhotoLibrary();
            const photo = {
                id: Date.now().toString(),
                name: name || `Foto ${library.length + 1}`,
                data: photoData,
                addedAt: Date.now()
            };
            library.push(photo);
            localStorage.setItem(this.PHOTO_LIBRARY_KEY, JSON.stringify(library));
            return photo;
        } catch (e) {
            console.error('Error adding photo:', e);
            if (e.name === 'QuotaExceededError') {
                alert('Opslag vol! Verwijder eerst enkele foto\'s.');
            }
            return null;
        }
    },

    // Remove photo from library
    removePhoto(photoId) {
        try {
            let library = this.getPhotoLibrary();
            library = library.filter(p => p.id !== photoId);
            localStorage.setItem(this.PHOTO_LIBRARY_KEY, JSON.stringify(library));
            return true;
        } catch (e) {
            console.error('Error removing photo:', e);
            return false;
        }
    },

    // Rename photo in library
    renamePhoto(photoId, newName) {
        try {
            const library = this.getPhotoLibrary();
            const photo = library.find(p => p.id === photoId);
            if (photo) {
                photo.name = newName;
                localStorage.setItem(this.PHOTO_LIBRARY_KEY, JSON.stringify(library));
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error renaming photo:', e);
            return false;
        }
    },

    // Get photo by ID
    getPhoto(photoId) {
        const library = this.getPhotoLibrary();
        return library.find(p => p.id === photoId) || null;
    },

    // Clear entire photo library
    clearPhotoLibrary() {
        try {
            localStorage.removeItem(this.PHOTO_LIBRARY_KEY);
            return true;
        } catch (e) {
            console.error('Error clearing photo library:', e);
            return false;
        }
    }
};

// Make globally available
window.StorageManager = StorageManager;
