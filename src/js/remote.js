// Remote Control System - Firebase Realtime sync
// Allows parents to control the puzzle from another device

const RemoteControl = {
    // Firebase configuration
    // Falls back to hosted config if firebase-config.js is not present
    firebaseConfig: typeof FIREBASE_CONFIG !== 'undefined' ? FIREBASE_CONFIG : {
        apiKey: "AIzaSyA1wG9GHJBwVPlLw-E00aVhoN5cIb4wqrg",
        authDomain: "roadtrip-puzzel.firebaseapp.com",
        databaseURL: "https://roadtrip-puzzel-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "roadtrip-puzzel",
        storageBucket: "roadtrip-puzzel.firebasestorage.app",
        messagingSenderId: "314636515478",
        appId: "1:314636515478:web:456718ddc2fe41437f2ab7"
    },

    database: null,
    roomCode: null,
    roomRef: null,
    isHost: false, // true = tablet (child), false = remote (parent)
    onPieceReceived: null,
    lastCommandId: null,
    pollInterval: null,

    // Initialize - using localStorage polling as fallback (works on same network)
    async init() {
        // Try Firebase first, fall back to BroadcastChannel/localStorage
        try {
            await this.initFirebase();
        } catch (e) {
            console.log('Firebase unavailable, using local sync');
            this.useLocalSync = true;
        }
    },

    // Initialize Firebase
    async initFirebase() {
        if (typeof firebase === 'undefined') {
            await this.loadFirebaseSDK();
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(this.firebaseConfig);
        }
        this.database = firebase.database();
        this.useLocalSync = false;
        console.log('RemoteControl: Firebase initialized');
    },

    // Load Firebase SDK from CDN
    loadFirebaseSDK() {
        return new Promise((resolve, reject) => {
            const appScript = document.createElement('script');
            appScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
            appScript.onload = () => {
                const dbScript = document.createElement('script');
                dbScript.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
                dbScript.onload = resolve;
                dbScript.onerror = reject;
                document.head.appendChild(dbScript);
            };
            appScript.onerror = reject;
            document.head.appendChild(appScript);
        });
    },

    // Generate a random 4-digit room code
    generateRoomCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    },

    // Create a room (called by tablet/host)
    async createRoom() {
        await this.init();

        this.roomCode = this.generateRoomCode();
        this.isHost = true;

        if (this.useLocalSync) {
            // Use localStorage for same-device/network sync
            localStorage.setItem('puzzel_room_' + this.roomCode, JSON.stringify({
                created: Date.now(),
                lastCommand: null
            }));
            this.startLocalPolling();
        } else {
            // Use Firebase
            this.roomRef = this.database.ref('rooms/' + this.roomCode);
            await this.roomRef.set({
                created: Date.now(),
                lastActivity: Date.now(),
                commands: {}
            });

            // Listen for commands from parent
            this.roomRef.child('commands').on('child_added', (snapshot) => {
                const command = snapshot.val();
                if (command && command.id !== this.lastCommandId) {
                    this.lastCommandId = command.id;
                    console.log('RemoteControl: Command received', command);
                    if (command.type === 'piece' && this.onPieceReceived) {
                        this.onPieceReceived();
                    }
                }
            });

            this.startHeartbeat();
        }

        window.addEventListener('beforeunload', () => {
            this.disconnect();
        });

        console.log('RemoteControl: Room created with code', this.roomCode);
        return this.roomCode;
    },

    // Start polling localStorage for local sync
    startLocalPolling() {
        this.pollInterval = setInterval(() => {
            const data = localStorage.getItem('puzzel_room_' + this.roomCode);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed.lastCommand && parsed.lastCommand !== this.lastCommandId) {
                    this.lastCommandId = parsed.lastCommand;
                    if (this.onPieceReceived) {
                        this.onPieceReceived();
                    }
                }
            }
        }, 500); // Poll every 500ms
    },

    // Join a room (called by parent's phone)
    async joinRoom(code) {
        await this.init();

        this.roomCode = code;
        this.isHost = false;

        if (this.useLocalSync) {
            const data = localStorage.getItem('puzzel_room_' + code);
            if (!data) {
                throw new Error('Kamer niet gevonden');
            }
        } else {
            this.roomRef = this.database.ref('rooms/' + code);
            const snapshot = await this.roomRef.once('value');
            if (!snapshot.exists()) {
                throw new Error('Kamer niet gevonden');
            }
            await this.roomRef.update({ lastActivity: Date.now() });

            // Listen for game state updates (Colors, Counting, etc.)
            this.roomRef.child('gameState').on('value', (snapshot) => {
                const gameState = snapshot.val();
                if (gameState && this.onGameStateUpdate) {
                    this.onGameStateUpdate(gameState);
                }
            });
        }

        console.log('RemoteControl: Joined room', code);
        return true;
    },

    // Callback for game state updates
    onGameStateUpdate: null,

    // Send a piece command (called by parent)
    async sendPiece() {
        if (!this.roomCode) {
            throw new Error('Niet verbonden');
        }

        const commandId = Date.now().toString();

        if (this.useLocalSync) {
            const data = localStorage.getItem('puzzel_room_' + this.roomCode);
            if (data) {
                const parsed = JSON.parse(data);
                parsed.lastCommand = commandId;
                localStorage.setItem('puzzel_room_' + this.roomCode, JSON.stringify(parsed));
            }
        } else {
            await this.roomRef.child('commands').push({
                type: 'piece',
                id: commandId,
                timestamp: Date.now()
            });
        }

        console.log('RemoteControl: Piece command sent');
    },

    // Keep room alive
    startHeartbeat() {
        setInterval(() => {
            if (this.roomRef && this.isHost) {
                this.roomRef.update({ lastActivity: Date.now() });
            }
        }, 30000);
    },

    // Disconnect
    disconnect() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }

        if (this.useLocalSync && this.isHost) {
            localStorage.removeItem('puzzel_room_' + this.roomCode);
        }

        if (this.roomRef) {
            if (this.isHost) {
                this.roomRef.remove();
            }
            this.roomRef.off();
            this.roomRef = null;
        }
        this.roomCode = null;
    },

    // Check if connected
    isConnected() {
        return this.roomCode !== null;
    },

    // Get room code
    getRoomCode() {
        return this.roomCode;
    }
};

// Make globally available
window.RemoteControl = RemoteControl;
