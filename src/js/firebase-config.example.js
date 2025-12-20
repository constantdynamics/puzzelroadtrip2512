// Firebase configuration EXAMPLE
// 1. Copy this file to firebase-config.js
// 2. Replace the values with your own Firebase project credentials
// 3. firebase-config.js is in .gitignore and won't be committed

const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};

// To get your Firebase config:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing
// 3. Go to Project Settings > General
// 4. Scroll down to "Your apps" and add a Web app
// 5. Copy the firebaseConfig object
