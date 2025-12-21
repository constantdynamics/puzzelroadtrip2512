// Puzzle Engine - Handles puzzle rendering, pieces, and animations

const PuzzleEngine = {
    canvas: null,
    ctx: null,
    puzzleImage: null,
    pieces: [],
    placedPieces: [],
    animatingPiece: null,
    totalPieces: 40,
    cols: 8,
    rows: 5,
    pieceWidth: 0,
    pieceHeight: 0,
    puzzleWidth: 0,
    puzzleHeight: 0,
    offsetX: 0,
    offsetY: 0,
    customImageData: null, // Voor eigen afbeelding
    showPuzzleLines: true, // Show jigsaw lines overlay on puzzle

    // Puzzle piece style: 'simple' (rectangles), 'geometric' (basic shapes), 'jigsaw' (classic)
    pieceStyle: 'simple',

    // Piece configurations: pieceCount -> {rows, cols}
    pieceConfigs: {
        4: { rows: 2, cols: 2 },
        12: { rows: 3, cols: 4 },
        20: { rows: 4, cols: 5 },
        30: { rows: 5, cols: 6 },
        40: { rows: 5, cols: 8 },
        60: { rows: 6, cols: 10 }
    },

    // Kleurrijke scene puzzels - SUPERVOL met leuke dingen voor 2-jarigen!
    // Elk puzzelstukje moet minimaal 25% gevuld zijn met elementen
    puzzles: [
        {
            name: 'Dierentuin',
            emoji: '🦁',
            theme: 'zoo',
            bgColors: ['#87CEEB', '#90EE90'],
            elements: [
                // Grote dieren - goed verspreid over het hele canvas
                { emoji: '🦁', x: 0.12, y: 0.45, size: 0.22 },
                { emoji: '🐘', x: 0.35, y: 0.50, size: 0.28 },
                { emoji: '🦒', x: 0.58, y: 0.35, size: 0.32 },
                { emoji: '🦓', x: 0.82, y: 0.50, size: 0.22 },
                { emoji: '🐻', x: 0.15, y: 0.75, size: 0.20 },
                { emoji: '🦘', x: 0.40, y: 0.78, size: 0.18 },
                { emoji: '🐒', x: 0.65, y: 0.72, size: 0.16 },
                { emoji: '🦛', x: 0.88, y: 0.75, size: 0.18 },
                // Vogels en kleinere dieren
                { emoji: '🦜', x: 0.08, y: 0.25, size: 0.14 },
                { emoji: '🦩', x: 0.28, y: 0.28, size: 0.16 },
                { emoji: '🐧', x: 0.48, y: 0.65, size: 0.14 },
                { emoji: '🦚', x: 0.72, y: 0.25, size: 0.16 },
                { emoji: '🦉', x: 0.92, y: 0.28, size: 0.14 },
                // Bomen en planten - groot en prominent
                { emoji: '🌳', x: 0.05, y: 0.55, size: 0.20 },
                { emoji: '🌴', x: 0.25, y: 0.55, size: 0.18 },
                { emoji: '🌲', x: 0.95, y: 0.55, size: 0.18 },
                { emoji: '🌳', x: 0.75, y: 0.58, size: 0.16 },
                // Bloemen onderaan
                { emoji: '🌺', x: 0.10, y: 0.92, size: 0.12 },
                { emoji: '🌸', x: 0.30, y: 0.95, size: 0.10 },
                { emoji: '🌼', x: 0.50, y: 0.92, size: 0.12 },
                { emoji: '🌺', x: 0.70, y: 0.95, size: 0.10 },
                { emoji: '🌸', x: 0.90, y: 0.92, size: 0.12 },
                // Lucht elementen
                { emoji: '☀️', x: 0.88, y: 0.08, size: 0.16 },
                { emoji: '☁️', x: 0.15, y: 0.08, size: 0.14 },
                { emoji: '☁️', x: 0.40, y: 0.05, size: 0.12 },
                { emoji: '☁️', x: 0.65, y: 0.10, size: 0.14 },
                { emoji: '🦋', x: 0.22, y: 0.18, size: 0.10 },
                { emoji: '🦋', x: 0.55, y: 0.15, size: 0.08 },
                { emoji: '🐦', x: 0.78, y: 0.12, size: 0.10 },
            ]
        },
        {
            name: 'Boerderij',
            emoji: '🐄',
            theme: 'farm',
            bgColors: ['#87CEEB', '#8B4513'],
            elements: [
                // Gebouwen - groot en prominent
                { emoji: '🏠', x: 0.15, y: 0.32, size: 0.28 },
                { emoji: '🏚️', x: 0.85, y: 0.35, size: 0.24 },
                // Voertuigen
                { emoji: '🚜', x: 0.50, y: 0.38, size: 0.22 },
                // Grote dieren
                { emoji: '🐄', x: 0.12, y: 0.62, size: 0.20 },
                { emoji: '🐄', x: 0.32, y: 0.58, size: 0.18 },
                { emoji: '🐴', x: 0.72, y: 0.55, size: 0.22 },
                { emoji: '🐷', x: 0.52, y: 0.68, size: 0.18 },
                { emoji: '🐑', x: 0.88, y: 0.62, size: 0.16 },
                { emoji: '🐑', x: 0.08, y: 0.82, size: 0.14 },
                // Kleinere dieren
                { emoji: '🐔', x: 0.28, y: 0.78, size: 0.14 },
                { emoji: '🐓', x: 0.42, y: 0.85, size: 0.12 },
                { emoji: '🐥', x: 0.55, y: 0.88, size: 0.10 },
                { emoji: '🦆', x: 0.68, y: 0.82, size: 0.14 },
                { emoji: '🐕', x: 0.82, y: 0.78, size: 0.14 },
                { emoji: '🐈', x: 0.92, y: 0.85, size: 0.12 },
                // Zonnebloemen veld
                { emoji: '🌻', x: 0.05, y: 0.45, size: 0.16 },
                { emoji: '🌻', x: 0.18, y: 0.48, size: 0.14 },
                { emoji: '🌻', x: 0.95, y: 0.50, size: 0.14 },
                // Graan
                { emoji: '🌾', x: 0.35, y: 0.45, size: 0.12 },
                { emoji: '🌾', x: 0.65, y: 0.42, size: 0.14 },
                // Hekken visueel gesuggereerd met emoji
                { emoji: '🪵', x: 0.22, y: 0.70, size: 0.08 },
                { emoji: '🪵', x: 0.78, y: 0.68, size: 0.08 },
                // Lucht
                { emoji: '☀️', x: 0.88, y: 0.08, size: 0.18 },
                { emoji: '☁️', x: 0.12, y: 0.08, size: 0.16 },
                { emoji: '☁️', x: 0.38, y: 0.05, size: 0.14 },
                { emoji: '☁️', x: 0.62, y: 0.10, size: 0.12 },
                { emoji: '🐦', x: 0.25, y: 0.18, size: 0.10 },
                { emoji: '🐦', x: 0.75, y: 0.15, size: 0.08 },
            ]
        },
        {
            name: 'Kermis',
            emoji: '🎡',
            theme: 'fair',
            bgColors: ['#FF69B4', '#FFD700'],
            elements: [
                // Grote attracties
                { emoji: '🎡', x: 0.18, y: 0.42, size: 0.38 },
                { emoji: '🎠', x: 0.55, y: 0.48, size: 0.28 },
                { emoji: '🎪', x: 0.85, y: 0.38, size: 0.28 },
                // Ballonnen overal
                { emoji: '🎈', x: 0.05, y: 0.18, size: 0.14 },
                { emoji: '🎈', x: 0.18, y: 0.12, size: 0.12 },
                { emoji: '🎈', x: 0.35, y: 0.15, size: 0.14 },
                { emoji: '🎈', x: 0.52, y: 0.10, size: 0.12 },
                { emoji: '🎈', x: 0.68, y: 0.14, size: 0.14 },
                { emoji: '🎈', x: 0.82, y: 0.10, size: 0.12 },
                { emoji: '🎈', x: 0.95, y: 0.18, size: 0.14 },
                // Snoep en eten onderaan
                { emoji: '🍭', x: 0.08, y: 0.75, size: 0.16 },
                { emoji: '🍿', x: 0.22, y: 0.82, size: 0.14 },
                { emoji: '🍬', x: 0.38, y: 0.78, size: 0.12 },
                { emoji: '🧁', x: 0.52, y: 0.85, size: 0.14 },
                { emoji: '🍩', x: 0.68, y: 0.80, size: 0.14 },
                { emoji: '🍦', x: 0.82, y: 0.75, size: 0.16 },
                { emoji: '🥤', x: 0.95, y: 0.82, size: 0.12 },
                // Cadeaus en feest
                { emoji: '🎁', x: 0.12, y: 0.58, size: 0.14 },
                { emoji: '🎉', x: 0.42, y: 0.65, size: 0.14 },
                { emoji: '🎊', x: 0.72, y: 0.62, size: 0.14 },
                { emoji: '🤡', x: 0.28, y: 0.55, size: 0.16 },
                // Sterren bovenaan
                { emoji: '⭐', x: 0.08, y: 0.05, size: 0.10 },
                { emoji: '⭐', x: 0.28, y: 0.02, size: 0.08 },
                { emoji: '⭐', x: 0.48, y: 0.05, size: 0.10 },
                { emoji: '⭐', x: 0.72, y: 0.02, size: 0.08 },
                { emoji: '⭐', x: 0.92, y: 0.05, size: 0.10 },
                { emoji: '🌈', x: 0.50, y: 0.22, size: 0.20 },
            ]
        },
        {
            name: 'Onderwaterwereld',
            emoji: '🐠',
            theme: 'ocean',
            bgColors: ['#00CED1', '#000080'],
            elements: [
                // Grote zeedieren
                { emoji: '🐋', x: 0.25, y: 0.22, size: 0.32 },
                { emoji: '🦈', x: 0.72, y: 0.28, size: 0.26 },
                { emoji: '🐬', x: 0.12, y: 0.45, size: 0.22 },
                { emoji: '🐢', x: 0.48, y: 0.42, size: 0.20 },
                { emoji: '🐙', x: 0.82, y: 0.52, size: 0.22 },
                // Vissen - verspreid
                { emoji: '🐠', x: 0.08, y: 0.28, size: 0.14 },
                { emoji: '🐟', x: 0.35, y: 0.35, size: 0.12 },
                { emoji: '🐡', x: 0.58, y: 0.55, size: 0.14 },
                { emoji: '🐠', x: 0.92, y: 0.35, size: 0.12 },
                { emoji: '🐟', x: 0.22, y: 0.58, size: 0.14 },
                { emoji: '🐠', x: 0.68, y: 0.48, size: 0.12 },
                // Bodem dieren
                { emoji: '🦑', x: 0.15, y: 0.72, size: 0.18 },
                { emoji: '🦀', x: 0.35, y: 0.82, size: 0.16 },
                { emoji: '🦐', x: 0.52, y: 0.78, size: 0.14 },
                { emoji: '🦞', x: 0.70, y: 0.85, size: 0.16 },
                { emoji: '🐚', x: 0.88, y: 0.80, size: 0.14 },
                // Koraal en zeewier
                { emoji: '🪸', x: 0.05, y: 0.88, size: 0.18 },
                { emoji: '🪸', x: 0.25, y: 0.92, size: 0.14 },
                { emoji: '🪸', x: 0.45, y: 0.88, size: 0.16 },
                { emoji: '🪸', x: 0.65, y: 0.92, size: 0.14 },
                { emoji: '🪸', x: 0.85, y: 0.92, size: 0.16 },
                // Bubbels
                { emoji: '🫧', x: 0.18, y: 0.12, size: 0.10 },
                { emoji: '🫧', x: 0.42, y: 0.08, size: 0.08 },
                { emoji: '🫧', x: 0.65, y: 0.12, size: 0.10 },
                { emoji: '🫧', x: 0.88, y: 0.08, size: 0.08 },
                { emoji: '🫧', x: 0.55, y: 0.18, size: 0.08 },
            ]
        },
        {
            name: 'Stad',
            emoji: '🏙️',
            theme: 'city',
            bgColors: ['#87CEEB', '#808080'],
            elements: [
                // Gebouwen - groot en prominent
                { emoji: '🏢', x: 0.10, y: 0.32, size: 0.30 },
                { emoji: '🏠', x: 0.35, y: 0.42, size: 0.22 },
                { emoji: '🏪', x: 0.55, y: 0.40, size: 0.20 },
                { emoji: '🏥', x: 0.78, y: 0.35, size: 0.26 },
                { emoji: '🏫', x: 0.92, y: 0.45, size: 0.18 },
                // Voertuigen
                { emoji: '🚗', x: 0.08, y: 0.72, size: 0.16 },
                { emoji: '🚌', x: 0.28, y: 0.68, size: 0.20 },
                { emoji: '🚕', x: 0.48, y: 0.75, size: 0.14 },
                { emoji: '🚙', x: 0.68, y: 0.70, size: 0.16 },
                { emoji: '🚲', x: 0.88, y: 0.78, size: 0.12 },
                { emoji: '🚦', x: 0.40, y: 0.55, size: 0.10 },
                { emoji: '🚦', x: 0.70, y: 0.58, size: 0.10 },
                // Bomen en natuur
                { emoji: '🌳', x: 0.05, y: 0.55, size: 0.16 },
                { emoji: '🌲', x: 0.22, y: 0.58, size: 0.14 },
                { emoji: '🌳', x: 0.95, y: 0.52, size: 0.14 },
                // Dieren en mensen
                { emoji: '🐕', x: 0.15, y: 0.85, size: 0.12 },
                { emoji: '🐈', x: 0.58, y: 0.85, size: 0.10 },
                { emoji: '🕊️', x: 0.35, y: 0.18, size: 0.10 },
                { emoji: '🕊️', x: 0.65, y: 0.15, size: 0.08 },
                // Lucht
                { emoji: '☀️', x: 0.88, y: 0.08, size: 0.16 },
                { emoji: '☁️', x: 0.15, y: 0.08, size: 0.14 },
                { emoji: '☁️', x: 0.45, y: 0.05, size: 0.12 },
                // Onderaan
                { emoji: '🛒', x: 0.82, y: 0.88, size: 0.12 },
                { emoji: '🧳', x: 0.38, y: 0.88, size: 0.10 },
            ]
        },
        {
            name: 'Supermarkt',
            emoji: '🛒',
            theme: 'shop',
            bgColors: ['#FFE4B5', '#FFA500'],
            elements: [
                // Winkelwagen centraal
                { emoji: '🛒', x: 0.50, y: 0.45, size: 0.28 },
                // Fruit links boven
                { emoji: '🍎', x: 0.08, y: 0.18, size: 0.16 },
                { emoji: '🍌', x: 0.22, y: 0.15, size: 0.14 },
                { emoji: '🍇', x: 0.08, y: 0.35, size: 0.14 },
                { emoji: '🍊', x: 0.22, y: 0.32, size: 0.12 },
                { emoji: '🍓', x: 0.15, y: 0.48, size: 0.12 },
                // Groenten
                { emoji: '🥕', x: 0.08, y: 0.62, size: 0.14 },
                { emoji: '🥦', x: 0.22, y: 0.58, size: 0.14 },
                { emoji: '🌽', x: 0.08, y: 0.78, size: 0.12 },
                // Brood en zuivel rechts boven
                { emoji: '🍞', x: 0.78, y: 0.18, size: 0.16 },
                { emoji: '🧀', x: 0.92, y: 0.22, size: 0.14 },
                { emoji: '🥛', x: 0.78, y: 0.35, size: 0.14 },
                { emoji: '🥚', x: 0.92, y: 0.38, size: 0.12 },
                // Snoep en snacks
                { emoji: '🍦', x: 0.78, y: 0.55, size: 0.16 },
                { emoji: '🍩', x: 0.92, y: 0.58, size: 0.14 },
                { emoji: '🍪', x: 0.78, y: 0.72, size: 0.14 },
                { emoji: '🍬', x: 0.92, y: 0.75, size: 0.12 },
                // Drinken onderaan
                { emoji: '🧃', x: 0.32, y: 0.78, size: 0.14 },
                { emoji: '🥤', x: 0.48, y: 0.75, size: 0.14 },
                { emoji: '🧋', x: 0.65, y: 0.78, size: 0.12 },
                // Decoratie
                { emoji: '🛍️', x: 0.35, y: 0.28, size: 0.14 },
                { emoji: '💰', x: 0.65, y: 0.25, size: 0.12 },
                { emoji: '⭐', x: 0.50, y: 0.08, size: 0.12 },
                { emoji: '⭐', x: 0.35, y: 0.92, size: 0.10 },
                { emoji: '⭐', x: 0.65, y: 0.92, size: 0.10 },
            ]
        },
        {
            name: 'Speeltuin',
            emoji: '🛝',
            theme: 'playground',
            bgColors: ['#87CEEB', '#90EE90'],
            elements: [
                // Speeltoestellen groot
                { emoji: '🛝', x: 0.18, y: 0.42, size: 0.28 },
                { emoji: '🎢', x: 0.50, y: 0.38, size: 0.26 },
                { emoji: '🎠', x: 0.82, y: 0.45, size: 0.22 },
                // Ballen en speelgoed
                { emoji: '⚽', x: 0.12, y: 0.72, size: 0.16 },
                { emoji: '🏀', x: 0.30, y: 0.68, size: 0.14 },
                { emoji: '🪁', x: 0.08, y: 0.18, size: 0.16 },
                // Ballonnen
                { emoji: '🎈', x: 0.25, y: 0.15, size: 0.12 },
                { emoji: '🎈', x: 0.42, y: 0.12, size: 0.14 },
                { emoji: '🎈', x: 0.62, y: 0.15, size: 0.12 },
                { emoji: '🎈', x: 0.78, y: 0.12, size: 0.14 },
                { emoji: '🎈', x: 0.92, y: 0.18, size: 0.12 },
                // Bomen
                { emoji: '🌳', x: 0.05, y: 0.55, size: 0.18 },
                { emoji: '🌲', x: 0.95, y: 0.50, size: 0.16 },
                // Bloemen onderaan
                { emoji: '🌸', x: 0.15, y: 0.88, size: 0.12 },
                { emoji: '🌼', x: 0.35, y: 0.92, size: 0.10 },
                { emoji: '🌺', x: 0.55, y: 0.88, size: 0.12 },
                { emoji: '🌷', x: 0.75, y: 0.92, size: 0.10 },
                // Dieren
                { emoji: '🐕', x: 0.48, y: 0.75, size: 0.14 },
                { emoji: '🐿️', x: 0.88, y: 0.72, size: 0.12 },
                { emoji: '🦋', x: 0.68, y: 0.62, size: 0.10 },
                // Lucht
                { emoji: '☀️', x: 0.88, y: 0.08, size: 0.16 },
                { emoji: '☁️', x: 0.15, y: 0.05, size: 0.14 },
            ]
        },
        {
            name: 'Bos',
            emoji: '🌲',
            theme: 'forest',
            bgColors: ['#228B22', '#006400'],
            elements: [
                // Bomen - veel en groot
                { emoji: '🌲', x: 0.08, y: 0.25, size: 0.26 },
                { emoji: '🌳', x: 0.28, y: 0.28, size: 0.28 },
                { emoji: '🌲', x: 0.50, y: 0.22, size: 0.30 },
                { emoji: '🌳', x: 0.72, y: 0.25, size: 0.26 },
                { emoji: '🌲', x: 0.92, y: 0.30, size: 0.24 },
                // Dieren - goed verspreid
                { emoji: '🦊', x: 0.15, y: 0.58, size: 0.18 },
                { emoji: '🐰', x: 0.35, y: 0.62, size: 0.14 },
                { emoji: '🦌', x: 0.55, y: 0.52, size: 0.22 },
                { emoji: '🐻', x: 0.78, y: 0.55, size: 0.20 },
                { emoji: '🐿️', x: 0.40, y: 0.40, size: 0.12 },
                { emoji: '🦉', x: 0.22, y: 0.15, size: 0.14 },
                { emoji: '🐦', x: 0.65, y: 0.12, size: 0.12 },
                // Paddenstoelen en bloemen onderaan
                { emoji: '🍄', x: 0.08, y: 0.78, size: 0.14 },
                { emoji: '🍄', x: 0.28, y: 0.82, size: 0.12 },
                { emoji: '🍄', x: 0.68, y: 0.78, size: 0.14 },
                { emoji: '🍄', x: 0.88, y: 0.82, size: 0.12 },
                { emoji: '🌺', x: 0.18, y: 0.92, size: 0.12 },
                { emoji: '🌼', x: 0.48, y: 0.88, size: 0.14 },
                { emoji: '🌸', x: 0.78, y: 0.92, size: 0.12 },
                // Vlinders
                { emoji: '🦋', x: 0.12, y: 0.45, size: 0.10 },
                { emoji: '🦋', x: 0.62, y: 0.38, size: 0.08 },
                { emoji: '🦋', x: 0.85, y: 0.45, size: 0.10 },
            ]
        },
        {
            name: 'Strand',
            emoji: '🏖️',
            theme: 'beach',
            bgColors: ['#87CEEB', '#F4A460'],
            elements: [
                // Zee/golven
                { emoji: '🌊', x: 0.50, y: 0.28, size: 0.95 },
                // Strandattributen
                { emoji: '🏖️', x: 0.15, y: 0.55, size: 0.22 },
                { emoji: '⛱️', x: 0.45, y: 0.52, size: 0.20 },
                { emoji: '⛱️', x: 0.75, y: 0.55, size: 0.18 },
                { emoji: '🏄', x: 0.32, y: 0.25, size: 0.18 },
                { emoji: '🏄', x: 0.68, y: 0.22, size: 0.16 },
                // Zeedieren
                { emoji: '🦀', x: 0.08, y: 0.75, size: 0.14 },
                { emoji: '🦀', x: 0.88, y: 0.78, size: 0.12 },
                { emoji: '🐚', x: 0.22, y: 0.82, size: 0.12 },
                { emoji: '🐚', x: 0.52, y: 0.85, size: 0.10 },
                { emoji: '🐚', x: 0.72, y: 0.82, size: 0.12 },
                { emoji: '🐬', x: 0.18, y: 0.18, size: 0.16 },
                { emoji: '🐬', x: 0.82, y: 0.15, size: 0.14 },
                // Speelgoed
                { emoji: '🪣', x: 0.35, y: 0.72, size: 0.14 },
                { emoji: '🩴', x: 0.58, y: 0.75, size: 0.12 },
                // Palmboom en boot
                { emoji: '🌴', x: 0.05, y: 0.45, size: 0.20 },
                { emoji: '🌴', x: 0.95, y: 0.48, size: 0.18 },
                { emoji: '⛵', x: 0.50, y: 0.12, size: 0.16 },
                // Lucht
                { emoji: '☀️', x: 0.88, y: 0.05, size: 0.18 },
                { emoji: '☁️', x: 0.12, y: 0.05, size: 0.14 },
                { emoji: '🦅', x: 0.35, y: 0.08, size: 0.12 },
                // Zeester
                { emoji: '⭐', x: 0.42, y: 0.92, size: 0.12 },
                { emoji: '⭐', x: 0.62, y: 0.90, size: 0.10 },
            ]
        },
        {
            name: 'Ruimte',
            emoji: '🚀',
            theme: 'space',
            bgColors: ['#000033', '#000000'],
            elements: [
                // Grote objecten
                { emoji: '🚀', x: 0.25, y: 0.38, size: 0.28 },
                { emoji: '🌍', x: 0.72, y: 0.55, size: 0.28 },
                { emoji: '🌙', x: 0.12, y: 0.22, size: 0.22 },
                { emoji: '🪐', x: 0.85, y: 0.18, size: 0.22 },
                { emoji: '🛸', x: 0.52, y: 0.22, size: 0.18 },
                { emoji: '👽', x: 0.45, y: 0.58, size: 0.16 },
                { emoji: '☄️', x: 0.18, y: 0.75, size: 0.16 },
                // Sterren overal
                { emoji: '⭐', x: 0.05, y: 0.08, size: 0.10 },
                { emoji: '⭐', x: 0.22, y: 0.12, size: 0.08 },
                { emoji: '⭐', x: 0.38, y: 0.05, size: 0.10 },
                { emoji: '⭐', x: 0.58, y: 0.08, size: 0.08 },
                { emoji: '⭐', x: 0.75, y: 0.05, size: 0.10 },
                { emoji: '⭐', x: 0.92, y: 0.10, size: 0.08 },
                { emoji: '⭐', x: 0.08, y: 0.45, size: 0.08 },
                { emoji: '⭐', x: 0.35, y: 0.68, size: 0.10 },
                { emoji: '⭐', x: 0.58, y: 0.75, size: 0.08 },
                { emoji: '⭐', x: 0.78, y: 0.82, size: 0.10 },
                { emoji: '⭐', x: 0.92, y: 0.68, size: 0.08 },
                { emoji: '🌟', x: 0.28, y: 0.55, size: 0.12 },
                { emoji: '🌟', x: 0.65, y: 0.38, size: 0.10 },
                { emoji: '🌟', x: 0.45, y: 0.88, size: 0.12 },
                { emoji: '🌟', x: 0.88, y: 0.42, size: 0.10 },
            ]
        },
        {
            name: 'Feestje',
            emoji: '🎂',
            theme: 'party',
            bgColors: ['#FF69B4', '#9370DB'],
            elements: [
                // Taart centraal
                { emoji: '🎂', x: 0.50, y: 0.48, size: 0.32 },
                // Ballonnen overal
                { emoji: '🎈', x: 0.08, y: 0.18, size: 0.16 },
                { emoji: '🎈', x: 0.22, y: 0.12, size: 0.14 },
                { emoji: '🎈', x: 0.38, y: 0.15, size: 0.16 },
                { emoji: '🎈', x: 0.62, y: 0.12, size: 0.14 },
                { emoji: '🎈', x: 0.78, y: 0.18, size: 0.16 },
                { emoji: '🎈', x: 0.92, y: 0.15, size: 0.14 },
                // Cadeaus
                { emoji: '🎁', x: 0.12, y: 0.65, size: 0.20 },
                { emoji: '🎁', x: 0.32, y: 0.72, size: 0.16 },
                { emoji: '🎁', x: 0.68, y: 0.70, size: 0.18 },
                { emoji: '🎁', x: 0.88, y: 0.65, size: 0.16 },
                // Feestartikelen
                { emoji: '🎉', x: 0.08, y: 0.42, size: 0.14 },
                { emoji: '🎊', x: 0.92, y: 0.42, size: 0.14 },
                { emoji: '🎉', x: 0.25, y: 0.35, size: 0.12 },
                { emoji: '🎊', x: 0.75, y: 0.35, size: 0.12 },
                // Snoep en taartjes
                { emoji: '🧁', x: 0.22, y: 0.85, size: 0.14 },
                { emoji: '🍭', x: 0.42, y: 0.88, size: 0.12 },
                { emoji: '🍬', x: 0.58, y: 0.85, size: 0.12 },
                { emoji: '🍰', x: 0.78, y: 0.88, size: 0.14 },
                // Muziek en sterren
                { emoji: '🎵', x: 0.35, y: 0.28, size: 0.12 },
                { emoji: '🎶', x: 0.65, y: 0.25, size: 0.10 },
                { emoji: '⭐', x: 0.15, y: 0.05, size: 0.12 },
                { emoji: '⭐', x: 0.50, y: 0.02, size: 0.10 },
                { emoji: '⭐', x: 0.85, y: 0.05, size: 0.12 },
            ]
        },
        {
            name: 'Treinstation',
            emoji: '🚂',
            theme: 'train',
            bgColors: ['#87CEEB', '#D3D3D3'],
            elements: [
                // Trein - groot en lang
                { emoji: '🚂', x: 0.15, y: 0.48, size: 0.26 },
                { emoji: '🚃', x: 0.38, y: 0.48, size: 0.20 },
                { emoji: '🚃', x: 0.55, y: 0.48, size: 0.20 },
                { emoji: '🚃', x: 0.72, y: 0.48, size: 0.20 },
                { emoji: '🚃', x: 0.88, y: 0.48, size: 0.18 },
                // Gebouwen
                { emoji: '🏠', x: 0.08, y: 0.25, size: 0.20 },
                { emoji: '🏢', x: 0.92, y: 0.22, size: 0.22 },
                { emoji: '🏪', x: 0.28, y: 0.28, size: 0.16 },
                // Signalen
                { emoji: '🚦', x: 0.45, y: 0.28, size: 0.12 },
                { emoji: '🚦', x: 0.75, y: 0.28, size: 0.10 },
                // Bomen
                { emoji: '🌳', x: 0.05, y: 0.40, size: 0.16 },
                { emoji: '🌲', x: 0.95, y: 0.38, size: 0.14 },
                // Reizigers en bagage
                { emoji: '🧳', x: 0.18, y: 0.75, size: 0.16 },
                { emoji: '🎒', x: 0.38, y: 0.78, size: 0.12 },
                { emoji: '🧳', x: 0.58, y: 0.75, size: 0.14 },
                { emoji: '🎒', x: 0.78, y: 0.78, size: 0.12 },
                { emoji: '🐕', x: 0.48, y: 0.82, size: 0.14 },
                // Lucht
                { emoji: '☀️', x: 0.88, y: 0.05, size: 0.16 },
                { emoji: '☁️', x: 0.15, y: 0.05, size: 0.14 },
                { emoji: '☁️', x: 0.45, y: 0.08, size: 0.12 },
                { emoji: '☁️', x: 0.68, y: 0.05, size: 0.10 },
                { emoji: '🐦', x: 0.55, y: 0.12, size: 0.10 },
            ]
        },
        {
            name: 'Vliegveld',
            emoji: '✈️',
            theme: 'airport',
            bgColors: ['#87CEEB', '#B0C4DE'],
            elements: [
                // Vliegtuigen groot
                { emoji: '✈️', x: 0.50, y: 0.22, size: 0.32 },
                { emoji: '🛩️', x: 0.12, y: 0.35, size: 0.18 },
                { emoji: '🚁', x: 0.88, y: 0.32, size: 0.20 },
                // Gebouwen
                { emoji: '🏢', x: 0.25, y: 0.55, size: 0.26 },
                { emoji: '🗼', x: 0.75, y: 0.50, size: 0.24 },
                // Voertuigen
                { emoji: '🚌', x: 0.12, y: 0.75, size: 0.16 },
                { emoji: '🚗', x: 0.32, y: 0.78, size: 0.12 },
                { emoji: '🚕', x: 0.52, y: 0.75, size: 0.14 },
                { emoji: '🚙', x: 0.72, y: 0.78, size: 0.12 },
                // Bagage
                { emoji: '🧳', x: 0.15, y: 0.88, size: 0.14 },
                { emoji: '🎒', x: 0.38, y: 0.92, size: 0.12 },
                { emoji: '🧳', x: 0.62, y: 0.88, size: 0.14 },
                { emoji: '🎒', x: 0.85, y: 0.92, size: 0.12 },
                // Wolken en zon
                { emoji: '☁️', x: 0.08, y: 0.08, size: 0.14 },
                { emoji: '☁️', x: 0.28, y: 0.05, size: 0.12 },
                { emoji: '☁️', x: 0.68, y: 0.08, size: 0.14 },
                { emoji: '☀️', x: 0.92, y: 0.05, size: 0.16 },
                { emoji: '🕊️', x: 0.42, y: 0.42, size: 0.10 },
                { emoji: '🕊️', x: 0.58, y: 0.38, size: 0.08 },
            ]
        },
        {
            name: 'Camping',
            emoji: '⛺',
            theme: 'camping',
            bgColors: ['#191970', '#228B22'],
            elements: [
                // Tenten
                { emoji: '⛺', x: 0.22, y: 0.48, size: 0.26 },
                { emoji: '⛺', x: 0.58, y: 0.52, size: 0.22 },
                { emoji: '⛺', x: 0.85, y: 0.48, size: 0.20 },
                // Kampvuur
                { emoji: '🔥', x: 0.42, y: 0.65, size: 0.18 },
                // Bomen
                { emoji: '🌲', x: 0.05, y: 0.32, size: 0.26 },
                { emoji: '🌲', x: 0.22, y: 0.28, size: 0.22 },
                { emoji: '🌳', x: 0.72, y: 0.30, size: 0.24 },
                { emoji: '🌲', x: 0.95, y: 0.35, size: 0.22 },
                // Dieren
                { emoji: '🦊', x: 0.12, y: 0.68, size: 0.16 },
                { emoji: '🐰', x: 0.75, y: 0.72, size: 0.12 },
                { emoji: '🦉', x: 0.35, y: 0.22, size: 0.14 },
                { emoji: '🦉', x: 0.88, y: 0.25, size: 0.12 },
                // Nachtlucht
                { emoji: '🌙', x: 0.85, y: 0.08, size: 0.18 },
                { emoji: '⭐', x: 0.08, y: 0.05, size: 0.10 },
                { emoji: '⭐', x: 0.22, y: 0.08, size: 0.08 },
                { emoji: '⭐', x: 0.38, y: 0.05, size: 0.10 },
                { emoji: '⭐', x: 0.55, y: 0.08, size: 0.08 },
                { emoji: '⭐', x: 0.68, y: 0.05, size: 0.10 },
                // Kampeerbenodigdheden
                { emoji: '🎒', x: 0.08, y: 0.85, size: 0.14 },
                { emoji: '🔦', x: 0.28, y: 0.82, size: 0.10 },
                { emoji: '🧭', x: 0.55, y: 0.85, size: 0.12 },
                { emoji: '🪵', x: 0.32, y: 0.75, size: 0.10 },
                { emoji: '🪵', x: 0.52, y: 0.72, size: 0.08 },
            ]
        },
        {
            name: 'Sneeuwpret',
            emoji: '⛷️',
            theme: 'snow',
            bgColors: ['#B0E0E6', '#FFFFFF'],
            elements: [
                // Berg
                { emoji: '🏔️', x: 0.50, y: 0.15, size: 0.32 },
                // Wintersporters
                { emoji: '⛷️', x: 0.22, y: 0.38, size: 0.22 },
                { emoji: '🏂', x: 0.55, y: 0.35, size: 0.20 },
                { emoji: '⛷️', x: 0.82, y: 0.40, size: 0.18 },
                { emoji: '🛷', x: 0.38, y: 0.62, size: 0.18 },
                // Sneeuwpop en ski's
                { emoji: '⛄', x: 0.12, y: 0.55, size: 0.24 },
                { emoji: '🎿', x: 0.72, y: 0.58, size: 0.16 },
                // Dennenbomen
                { emoji: '🌲', x: 0.05, y: 0.35, size: 0.20 },
                { emoji: '🌲', x: 0.18, y: 0.25, size: 0.16 },
                { emoji: '🌲', x: 0.85, y: 0.28, size: 0.18 },
                { emoji: '🌲', x: 0.95, y: 0.40, size: 0.16 },
                // Sneeuwvlokken overal
                { emoji: '❄️', x: 0.08, y: 0.08, size: 0.12 },
                { emoji: '❄️', x: 0.25, y: 0.12, size: 0.10 },
                { emoji: '❄️', x: 0.42, y: 0.08, size: 0.12 },
                { emoji: '❄️', x: 0.60, y: 0.12, size: 0.10 },
                { emoji: '❄️', x: 0.78, y: 0.08, size: 0.12 },
                { emoji: '❄️', x: 0.92, y: 0.12, size: 0.10 },
                // Dieren
                { emoji: '🐧', x: 0.62, y: 0.72, size: 0.16 },
                { emoji: '🐻‍❄️', x: 0.28, y: 0.78, size: 0.18 },
                { emoji: '🐰', x: 0.85, y: 0.75, size: 0.12 },
                // Sneeuwballen
                { emoji: '⚪', x: 0.48, y: 0.82, size: 0.10 },
                { emoji: '⚪', x: 0.15, y: 0.88, size: 0.08 },
                { emoji: '⚪', x: 0.75, y: 0.88, size: 0.08 },
            ]
        },
        {
            name: 'Jungle',
            emoji: '🦜',
            theme: 'jungle',
            bgColors: ['#228B22', '#006400'],
            elements: [
                // Grote dieren
                { emoji: '🦁', x: 0.50, y: 0.50, size: 0.26 },
                { emoji: '🐘', x: 0.18, y: 0.55, size: 0.28 },
                { emoji: '🦒', x: 0.82, y: 0.42, size: 0.30 },
                { emoji: '🦛', x: 0.35, y: 0.72, size: 0.20 },
                { emoji: '🦓', x: 0.68, y: 0.68, size: 0.18 },
                // Apen
                { emoji: '🐒', x: 0.28, y: 0.28, size: 0.16 },
                { emoji: '🐒', x: 0.55, y: 0.25, size: 0.14 },
                { emoji: '🐒', x: 0.75, y: 0.22, size: 0.16 },
                // Vogels
                { emoji: '🦜', x: 0.08, y: 0.22, size: 0.16 },
                { emoji: '🦜', x: 0.92, y: 0.18, size: 0.14 },
                { emoji: '🦩', x: 0.12, y: 0.75, size: 0.14 },
                // Reptiel
                { emoji: '🐍', x: 0.45, y: 0.78, size: 0.16 },
                { emoji: '🦎', x: 0.88, y: 0.72, size: 0.12 },
                // Palmbomen
                { emoji: '🌴', x: 0.05, y: 0.38, size: 0.24 },
                { emoji: '🌴', x: 0.95, y: 0.35, size: 0.22 },
                { emoji: '🌴', x: 0.42, y: 0.12, size: 0.18 },
                // Bloemen en planten
                { emoji: '🌺', x: 0.08, y: 0.88, size: 0.14 },
                { emoji: '🌺', x: 0.28, y: 0.92, size: 0.12 },
                { emoji: '🌸', x: 0.55, y: 0.88, size: 0.14 },
                { emoji: '🌺', x: 0.78, y: 0.92, size: 0.12 },
                { emoji: '🌿', x: 0.18, y: 0.42, size: 0.12 },
                { emoji: '🦋', x: 0.62, y: 0.38, size: 0.10 },
            ]
        },
        {
            name: 'Circus',
            emoji: '🎪',
            theme: 'circus',
            bgColors: ['#FF4500', '#FFD700'],
            elements: [
                // Circustent groot
                { emoji: '🎪', x: 0.50, y: 0.35, size: 0.42 },
                // Artiesten en dieren
                { emoji: '🤡', x: 0.15, y: 0.55, size: 0.22 },
                { emoji: '🎭', x: 0.85, y: 0.52, size: 0.18 },
                { emoji: '🦁', x: 0.28, y: 0.68, size: 0.18 },
                { emoji: '🐘', x: 0.72, y: 0.65, size: 0.20 },
                { emoji: '🐒', x: 0.50, y: 0.62, size: 0.14 },
                // Ballonnen overal
                { emoji: '🎈', x: 0.05, y: 0.18, size: 0.14 },
                { emoji: '🎈', x: 0.18, y: 0.12, size: 0.12 },
                { emoji: '🎈', x: 0.32, y: 0.08, size: 0.14 },
                { emoji: '🎈', x: 0.68, y: 0.08, size: 0.14 },
                { emoji: '🎈', x: 0.82, y: 0.12, size: 0.12 },
                { emoji: '🎈', x: 0.95, y: 0.18, size: 0.14 },
                // Snoep
                { emoji: '🍿', x: 0.08, y: 0.78, size: 0.16 },
                { emoji: '🍭', x: 0.22, y: 0.85, size: 0.12 },
                { emoji: '🍬', x: 0.42, y: 0.82, size: 0.10 },
                { emoji: '🍦', x: 0.58, y: 0.85, size: 0.12 },
                { emoji: '🥤', x: 0.78, y: 0.82, size: 0.12 },
                { emoji: '🍿', x: 0.92, y: 0.78, size: 0.14 },
                // Sterren en muziek
                { emoji: '⭐', x: 0.12, y: 0.02, size: 0.10 },
                { emoji: '⭐', x: 0.50, y: 0.02, size: 0.12 },
                { emoji: '⭐', x: 0.88, y: 0.02, size: 0.10 },
                { emoji: '🎵', x: 0.38, y: 0.48, size: 0.10 },
                { emoji: '🎶', x: 0.62, y: 0.45, size: 0.08 },
            ]
        },
        {
            name: 'Restaurant',
            emoji: '🍕',
            theme: 'food',
            bgColors: ['#FFDAB9', '#FFE4B5'],
            elements: [
                // Hoofdgerechten groot
                { emoji: '🍕', x: 0.18, y: 0.35, size: 0.26 },
                { emoji: '🍔', x: 0.50, y: 0.32, size: 0.24 },
                { emoji: '🍟', x: 0.82, y: 0.38, size: 0.20 },
                // Meer eten
                { emoji: '🌭', x: 0.12, y: 0.58, size: 0.18 },
                { emoji: '🍝', x: 0.35, y: 0.55, size: 0.16 },
                { emoji: '🌮', x: 0.58, y: 0.58, size: 0.16 },
                { emoji: '🥪', x: 0.82, y: 0.55, size: 0.18 },
                // Desserts
                { emoji: '🍦', x: 0.08, y: 0.78, size: 0.18 },
                { emoji: '🧁', x: 0.28, y: 0.75, size: 0.16 },
                { emoji: '🍰', x: 0.50, y: 0.78, size: 0.18 },
                { emoji: '🍩', x: 0.72, y: 0.75, size: 0.16 },
                { emoji: '🍪', x: 0.92, y: 0.78, size: 0.14 },
                // Drinken
                { emoji: '🥤', x: 0.18, y: 0.92, size: 0.14 },
                { emoji: '🧃', x: 0.42, y: 0.90, size: 0.12 },
                { emoji: '🥛', x: 0.62, y: 0.92, size: 0.12 },
                { emoji: '☕', x: 0.85, y: 0.90, size: 0.14 },
                // Decoratie
                { emoji: '⭐', x: 0.08, y: 0.12, size: 0.12 },
                { emoji: '⭐', x: 0.32, y: 0.08, size: 0.10 },
                { emoji: '⭐', x: 0.68, y: 0.08, size: 0.10 },
                { emoji: '⭐', x: 0.92, y: 0.12, size: 0.12 },
                { emoji: '❤️', x: 0.50, y: 0.12, size: 0.14 },
                { emoji: '❤️', x: 0.22, y: 0.18, size: 0.10 },
                { emoji: '❤️', x: 0.78, y: 0.18, size: 0.10 },
            ]
        },
        {
            name: 'Muziek',
            emoji: '🎸',
            theme: 'music',
            bgColors: ['#9370DB', '#FF69B4'],
            elements: [
                // Grote instrumenten
                { emoji: '🎸', x: 0.15, y: 0.42, size: 0.28 },
                { emoji: '🎹', x: 0.50, y: 0.48, size: 0.32 },
                { emoji: '🥁', x: 0.85, y: 0.50, size: 0.26 },
                // Meer instrumenten
                { emoji: '🎺', x: 0.08, y: 0.72, size: 0.18 },
                { emoji: '🎷', x: 0.28, y: 0.68, size: 0.16 },
                { emoji: '🎤', x: 0.50, y: 0.72, size: 0.16 },
                { emoji: '🎻', x: 0.72, y: 0.68, size: 0.16 },
                { emoji: '🪘', x: 0.92, y: 0.72, size: 0.14 },
                // Muzieknoten overal
                { emoji: '🎵', x: 0.05, y: 0.18, size: 0.14 },
                { emoji: '🎶', x: 0.22, y: 0.12, size: 0.12 },
                { emoji: '🎵', x: 0.38, y: 0.08, size: 0.14 },
                { emoji: '🎶', x: 0.55, y: 0.12, size: 0.12 },
                { emoji: '🎵', x: 0.72, y: 0.08, size: 0.14 },
                { emoji: '🎶', x: 0.88, y: 0.15, size: 0.12 },
                { emoji: '🎵', x: 0.12, y: 0.28, size: 0.10 },
                { emoji: '🎶', x: 0.88, y: 0.32, size: 0.10 },
                // Sterren
                { emoji: '⭐', x: 0.18, y: 0.88, size: 0.12 },
                { emoji: '⭐', x: 0.42, y: 0.92, size: 0.10 },
                { emoji: '⭐', x: 0.62, y: 0.88, size: 0.12 },
                { emoji: '⭐', x: 0.85, y: 0.92, size: 0.10 },
                { emoji: '🌟', x: 0.50, y: 0.22, size: 0.14 },
            ]
        },
        {
            name: 'Tuin',
            emoji: '🌷',
            theme: 'garden',
            bgColors: ['#87CEEB', '#90EE90'],
            elements: [
                // Bloemen groot en veel - hele tuin vol
                { emoji: '🌷', x: 0.08, y: 0.45, size: 0.18 },
                { emoji: '🌻', x: 0.25, y: 0.42, size: 0.22 },
                { emoji: '🌹', x: 0.45, y: 0.48, size: 0.20 },
                { emoji: '🌺', x: 0.65, y: 0.42, size: 0.18 },
                { emoji: '🌸', x: 0.85, y: 0.45, size: 0.20 },
                // Tweede rij bloemen
                { emoji: '🌼', x: 0.12, y: 0.65, size: 0.16 },
                { emoji: '💐', x: 0.32, y: 0.62, size: 0.18 },
                { emoji: '🌼', x: 0.52, y: 0.68, size: 0.16 },
                { emoji: '🌷', x: 0.72, y: 0.62, size: 0.18 },
                { emoji: '🌻', x: 0.92, y: 0.65, size: 0.16 },
                // Onderste rand bloemen
                { emoji: '🌸', x: 0.08, y: 0.85, size: 0.14 },
                { emoji: '🌺', x: 0.28, y: 0.88, size: 0.12 },
                { emoji: '🌼', x: 0.48, y: 0.85, size: 0.14 },
                { emoji: '🌹', x: 0.68, y: 0.88, size: 0.12 },
                { emoji: '🌷', x: 0.88, y: 0.85, size: 0.14 },
                // Insecten
                { emoji: '🦋', x: 0.18, y: 0.28, size: 0.14 },
                { emoji: '🦋', x: 0.55, y: 0.25, size: 0.12 },
                { emoji: '🦋', x: 0.82, y: 0.28, size: 0.14 },
                { emoji: '🐝', x: 0.35, y: 0.32, size: 0.12 },
                { emoji: '🐝', x: 0.75, y: 0.35, size: 0.10 },
                { emoji: '🐞', x: 0.42, y: 0.78, size: 0.10 },
                { emoji: '🐌', x: 0.62, y: 0.78, size: 0.10 },
                // Lucht
                { emoji: '☀️', x: 0.88, y: 0.08, size: 0.18 },
                { emoji: '🌈', x: 0.50, y: 0.08, size: 0.22 },
                { emoji: '☁️', x: 0.12, y: 0.08, size: 0.14 },
            ]
        },
        {
            name: 'Sportveld',
            emoji: '⚽',
            theme: 'sports',
            bgColors: ['#228B22', '#32CD32'],
            elements: [
                // Grote ballen centraal
                { emoji: '⚽', x: 0.50, y: 0.45, size: 0.28 },
                { emoji: '🏀', x: 0.18, y: 0.38, size: 0.22 },
                { emoji: '🏈', x: 0.82, y: 0.40, size: 0.20 },
                // Meer sportballen
                { emoji: '🎾', x: 0.32, y: 0.58, size: 0.16 },
                { emoji: '⚾', x: 0.68, y: 0.55, size: 0.16 },
                { emoji: '🏐', x: 0.12, y: 0.62, size: 0.14 },
                { emoji: '🎱', x: 0.88, y: 0.60, size: 0.14 },
                // Goals
                { emoji: '🥅', x: 0.05, y: 0.45, size: 0.20 },
                { emoji: '🥅', x: 0.95, y: 0.45, size: 0.20 },
                // Trofee en medailles
                { emoji: '🏆', x: 0.50, y: 0.15, size: 0.22 },
                { emoji: '🥇', x: 0.32, y: 0.18, size: 0.12 },
                { emoji: '🥈', x: 0.68, y: 0.18, size: 0.12 },
                { emoji: '🥉', x: 0.18, y: 0.22, size: 0.10 },
                { emoji: '🥉', x: 0.82, y: 0.22, size: 0.10 },
                // Onderaan: feest
                { emoji: '🎉', x: 0.08, y: 0.78, size: 0.16 },
                { emoji: '🎊', x: 0.25, y: 0.82, size: 0.14 },
                { emoji: '⭐', x: 0.42, y: 0.78, size: 0.12 },
                { emoji: '⭐', x: 0.58, y: 0.82, size: 0.10 },
                { emoji: '🎊', x: 0.75, y: 0.78, size: 0.14 },
                { emoji: '🎉', x: 0.92, y: 0.82, size: 0.16 },
            ]
        },
        {
            name: 'Kasteel',
            emoji: '🏰',
            theme: 'castle',
            bgColors: ['#87CEEB', '#90EE90'],
            elements: [
                // Groot kasteel centraal
                { emoji: '🏰', x: 0.50, y: 0.38, size: 0.45 },
                { emoji: '👑', x: 0.50, y: 0.10, size: 0.16 },
                // Magische wezens
                { emoji: '🦄', x: 0.12, y: 0.55, size: 0.22 },
                { emoji: '🐉', x: 0.88, y: 0.48, size: 0.24 },
                { emoji: '🧚', x: 0.22, y: 0.32, size: 0.14 },
                { emoji: '🧙', x: 0.78, y: 0.28, size: 0.14 },
                { emoji: '🧝', x: 0.35, y: 0.62, size: 0.12 },
                { emoji: '🧜', x: 0.65, y: 0.65, size: 0.12 },
                // Bomen aan de zijkanten
                { emoji: '🌳', x: 0.05, y: 0.50, size: 0.20 },
                { emoji: '🌲', x: 0.95, y: 0.55, size: 0.18 },
                // Bloemen onderaan
                { emoji: '🌺', x: 0.12, y: 0.82, size: 0.14 },
                { emoji: '🌷', x: 0.28, y: 0.85, size: 0.12 },
                { emoji: '🌸', x: 0.48, y: 0.82, size: 0.14 },
                { emoji: '🌼', x: 0.68, y: 0.85, size: 0.12 },
                { emoji: '🌹', x: 0.88, y: 0.82, size: 0.14 },
                // Sterren en vlinders
                { emoji: '⭐', x: 0.15, y: 0.08, size: 0.10 },
                { emoji: '⭐', x: 0.32, y: 0.05, size: 0.08 },
                { emoji: '⭐', x: 0.68, y: 0.05, size: 0.08 },
                { emoji: '⭐', x: 0.85, y: 0.08, size: 0.10 },
                { emoji: '🦋', x: 0.25, y: 0.72, size: 0.10 },
                { emoji: '🦋', x: 0.75, y: 0.75, size: 0.08 },
            ]
        },
        {
            name: 'Piraten',
            emoji: '🏴‍☠️',
            theme: 'pirates',
            bgColors: ['#87CEEB', '#4169E1'],
            elements: [
                // Groot schip
                { emoji: '🚢', x: 0.50, y: 0.52, size: 0.38 },
                { emoji: '🏴‍☠️', x: 0.50, y: 0.25, size: 0.18 },
                // Piratenschat en attributen
                { emoji: '💰', x: 0.35, y: 0.65, size: 0.14 },
                { emoji: '💎', x: 0.65, y: 0.62, size: 0.12 },
                { emoji: '🗺️', x: 0.22, y: 0.72, size: 0.16 },
                { emoji: '⚓', x: 0.78, y: 0.70, size: 0.14 },
                { emoji: '🦜', x: 0.38, y: 0.38, size: 0.14 },
                // Eiland links
                { emoji: '🏝️', x: 0.08, y: 0.48, size: 0.22 },
                { emoji: '🌴', x: 0.05, y: 0.35, size: 0.18 },
                { emoji: '🌴', x: 0.15, y: 0.42, size: 0.14 },
                // Zeedieren
                { emoji: '🦈', x: 0.25, y: 0.85, size: 0.16 },
                { emoji: '🐙', x: 0.50, y: 0.88, size: 0.14 },
                { emoji: '🐬', x: 0.75, y: 0.85, size: 0.16 },
                { emoji: '🐳', x: 0.88, y: 0.78, size: 0.14 },
                // Lucht
                { emoji: '☀️', x: 0.92, y: 0.08, size: 0.16 },
                { emoji: '☁️', x: 0.15, y: 0.08, size: 0.14 },
                { emoji: '☁️', x: 0.40, y: 0.05, size: 0.12 },
                { emoji: '☁️', x: 0.72, y: 0.08, size: 0.14 },
                { emoji: '🦅', x: 0.60, y: 0.12, size: 0.12 },
            ]
        },
        {
            name: 'Bouwplaats',
            emoji: '🏗️',
            theme: 'construction',
            bgColors: ['#87CEEB', '#D2691E'],
            elements: [
                // Grote bouwkraan
                { emoji: '🏗️', x: 0.50, y: 0.35, size: 0.35 },
                { emoji: '🚜', x: 0.15, y: 0.6, size: 0.18 },
                { emoji: '🚧', x: 0.35, y: 0.7, size: 0.1 },
                { emoji: '🚧', x: 0.65, y: 0.7, size: 0.1 },
                { emoji: '🏠', x: 0.8, y: 0.5, size: 0.15 },
                { emoji: '🔨', x: 0.25, y: 0.45, size: 0.1 },
                { emoji: '🪚', x: 0.7, y: 0.4, size: 0.08 },
                { emoji: '🧱', x: 0.4, y: 0.8, size: 0.1 },
                { emoji: '🪵', x: 0.55, y: 0.85, size: 0.08 },
                { emoji: '👷', x: 0.3, y: 0.55, size: 0.1 },
                { emoji: '☀️', x: 0.9, y: 0.1, size: 0.1 },
                { emoji: '☁️', x: 0.15, y: 0.1, size: 0.1 },
                { emoji: '☁️', x: 0.5, y: 0.08, size: 0.08 },
                { emoji: '🐕', x: 0.85, y: 0.75, size: 0.08 },
            ]
        },
    ],

    currentPuzzleIndex: 0,

    // Initialize the puzzle engine
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    },

    // Set piece count and update grid
    setPieceCount(count) {
        const config = this.pieceConfigs[count];
        if (config) {
            this.totalPieces = count;
            this.rows = config.rows;
            this.cols = config.cols;
            this.resizeCanvas();
        }
    },

    // Set custom image from base64 data
    setCustomImage(base64Data) {
        this.customImageData = base64Data;
    },

    // Clear custom image
    clearCustomImage() {
        this.customImageData = null;
    },

    // Set puzzle lines visibility
    setShowPuzzleLines(show) {
        this.showPuzzleLines = show;
        this.redraw();
    },

    // Set puzzle piece style
    setPieceStyle(style) {
        this.pieceStyle = style;
        this.redraw();
    },

    // Resize canvas to fit container
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;

        // Ensure minimum size
        if (containerWidth <= 0 || containerHeight <= 0) {
            return; // Container not ready yet
        }

        // Calculate puzzle dimensions maintaining aspect ratio
        const aspectRatio = this.cols / this.rows;
        let width = containerWidth;
        let height = width / aspectRatio;

        if (height > containerHeight) {
            height = containerHeight;
            width = height * aspectRatio;
        }

        // Check if size actually changed significantly
        const oldWidth = this.puzzleWidth;
        const sizeChanged = Math.abs(width - oldWidth) > 10;

        this.canvas.width = width;
        this.canvas.height = height;
        this.puzzleWidth = width;
        this.puzzleHeight = height;
        this.pieceWidth = width / this.cols;
        this.pieceHeight = height / this.rows;

        // Regenerate puzzle image if size changed and we have a puzzle loaded
        if (sizeChanged && this.puzzles[this.currentPuzzleIndex]) {
            this.createPuzzleImage(this.puzzles[this.currentPuzzleIndex]).then(() => {
                this.redraw();
            });
        } else {
            this.redraw();
        }
    },

    // Load a puzzle by index
    async loadPuzzle(index) {
        this.currentPuzzleIndex = index;
        this.placedPieces = [];
        this.pieces = this.generatePieceOrder();

        // Create puzzle image
        await this.createPuzzleImage(this.puzzles[index]);
        this.redraw();
    },

    // Generate puzzle image using canvas - nu met kleurrijke scenes!
    async createPuzzleImage(puzzle) {
        return new Promise((resolve) => {
            // Check if we should use custom image
            if (this.customImageData) {
                const customImg = new Image();
                customImg.onload = () => {
                    const img = document.createElement('canvas');
                    img.width = this.puzzleWidth * 2;
                    img.height = this.puzzleHeight * 2;
                    const ctx = img.getContext('2d');

                    // Draw custom image scaled to fit
                    const scale = Math.max(img.width / customImg.width, img.height / customImg.height);
                    const scaledWidth = customImg.width * scale;
                    const scaledHeight = customImg.height * scale;
                    const offsetX = (img.width - scaledWidth) / 2;
                    const offsetY = (img.height - scaledHeight) / 2;

                    ctx.drawImage(customImg, offsetX, offsetY, scaledWidth, scaledHeight);
                    this.puzzleImage = img;
                    resolve();
                };
                customImg.src = this.customImageData;
                return;
            }

            const img = document.createElement('canvas');
            img.width = this.puzzleWidth * 2; // Higher resolution
            img.height = this.puzzleHeight * 2;
            const ctx = img.getContext('2d');

            // Draw gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, img.height);
            gradient.addColorStop(0, puzzle.bgColors[0]);
            gradient.addColorStop(1, puzzle.bgColors[1]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, img.width, img.height);

            // Draw all elements (emoji's) from the scene
            puzzle.elements.forEach(element => {
                const x = element.x * img.width;
                const y = element.y * img.height;
                const size = element.size * img.height;

                ctx.font = `${size}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(element.emoji, x, y);
            });

            this.puzzleImage = img;
            resolve();
        });
    },

    // Generate random order for pieces
    generatePieceOrder() {
        const pieces = [];
        for (let i = 0; i < this.totalPieces; i++) {
            pieces.push(i);
        }
        // Shuffle using Fisher-Yates
        for (let i = pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
        }
        return pieces;
    },

    // Get piece position from index
    getPiecePosition(pieceIndex) {
        const col = pieceIndex % this.cols;
        const row = Math.floor(pieceIndex / this.cols);
        return {
            x: col * this.pieceWidth,
            y: row * this.pieceHeight,
            col,
            row
        };
    },

    // Draw the puzzle
    redraw() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background grid
        this.drawGrid();

        // Draw placed pieces
        this.placedPieces.forEach(pieceIndex => {
            this.drawPiece(pieceIndex);
        });

        // Draw animating piece if any
        if (this.animatingPiece) {
            this.drawAnimatingPiece();
        }
    },

    // Draw background grid showing where pieces go with jigsaw shapes
    drawGrid() {
        // Draw puzzle outline first
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this.puzzleWidth, this.puzzleHeight);

        // Only draw jigsaw lines if enabled
        if (!this.showPuzzleLines) return;

        // Draw jigsaw piece outlines for each piece position
        this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.4)';
        this.ctx.lineWidth = 1.5;

        for (let pieceIndex = 0; pieceIndex < this.totalPieces; pieceIndex++) {
            // Skip if piece is already placed
            if (this.placedPieces.includes(pieceIndex)) continue;

            const pos = this.getPiecePosition(pieceIndex);
            const edges = this.getEdgePattern(pieceIndex);

            // Draw piece outline
            this.createPiecePath(pos.x, pos.y, this.pieceWidth, this.pieceHeight, edges);
            this.ctx.stroke();
        }
    },

    // Generate edge pattern for a piece based on style
    // For jigsaw: edges must match neighbors (if piece A has right=1, piece B to its right has left=-1)
    getEdgePattern(pieceIndex) {
        const col = pieceIndex % this.cols;
        const row = Math.floor(pieceIndex / this.cols);

        // Simple style: all edges are flat (rectangles)
        if (this.pieceStyle === 'simple') {
            return { top: 0, right: 0, bottom: 0, left: 0 };
        }

        // For jigsaw/geometric: generate consistent interlocking edges
        // We store the "right" and "bottom" edge direction for each piece
        // The neighboring piece's "left" and "top" are the opposite

        // Use deterministic pattern based on position
        // Horizontal edges (between rows): determined by the piece above
        // Vertical edges (between cols): determined by the piece to the left

        // For horizontal edge at row boundary: use (col + row) to determine direction
        // For vertical edge at col boundary: use (col + row + 1) to determine direction

        const getHorizontalEdge = (r, c) => {
            // Edge between row r-1 and row r at column c
            // Returns 1 if piece above has tab going down, -1 if slot going up
            return ((r + c) % 2 === 0) ? 1 : -1;
        };

        const getVerticalEdge = (r, c) => {
            // Edge between col c-1 and col c at row r
            return ((r + c) % 2 === 0) ? 1 : -1;
        };

        return {
            // Top edge: if not first row, opposite of what piece above has as bottom
            top: row === 0 ? 0 : -getHorizontalEdge(row, col),
            // Right edge: if not last col, we decide the direction
            right: col === this.cols - 1 ? 0 : getVerticalEdge(row, col + 1),
            // Bottom edge: if not last row, we decide the direction
            bottom: row === this.rows - 1 ? 0 : getHorizontalEdge(row + 1, col),
            // Left edge: if not first col, opposite of what piece to left has as right
            left: col === 0 ? 0 : -getVerticalEdge(row, col)
        };
    },

    // Create piece path based on current style
    createPiecePath(x, y, width, height, edges) {
        if (this.pieceStyle === 'simple') {
            // Simple rectangles
            this.ctx.beginPath();
            this.ctx.rect(x, y, width, height);
        } else if (this.pieceStyle === 'geometric') {
            // Geometric style with rounded corners and simple bumps
            this.createGeometricPath(x, y, width, height, edges);
        } else {
            // Classic jigsaw with bezier curves
            this.createJigsawPath(x, y, width, height, edges);
        }
    },

    // Geometric style: rounded rectangles with semicircle bumps
    createGeometricPath(x, y, width, height, edges) {
        const bumpSize = Math.min(width, height) * 0.12;
        const cornerRadius = Math.min(width, height) * 0.05;

        this.ctx.beginPath();

        // Start at top-left (after corner)
        this.ctx.moveTo(x + cornerRadius, y);

        // Top edge
        if (edges.top === 0) {
            this.ctx.lineTo(x + width - cornerRadius, y);
        } else {
            const midX = x + width / 2;
            this.ctx.lineTo(midX - bumpSize, y);
            this.ctx.arc(midX, y, bumpSize, Math.PI, 0, edges.top > 0);
            this.ctx.lineTo(x + width - cornerRadius, y);
        }

        // Top-right corner
        this.ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);

        // Right edge
        if (edges.right === 0) {
            this.ctx.lineTo(x + width, y + height - cornerRadius);
        } else {
            const midY = y + height / 2;
            this.ctx.lineTo(x + width, midY - bumpSize);
            this.ctx.arc(x + width, midY, bumpSize, -Math.PI/2, Math.PI/2, edges.right < 0);
            this.ctx.lineTo(x + width, y + height - cornerRadius);
        }

        // Bottom-right corner
        this.ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);

        // Bottom edge
        if (edges.bottom === 0) {
            this.ctx.lineTo(x + cornerRadius, y + height);
        } else {
            const midX = x + width / 2;
            this.ctx.lineTo(midX + bumpSize, y + height);
            this.ctx.arc(midX, y + height, bumpSize, 0, Math.PI, edges.bottom < 0);
            this.ctx.lineTo(x + cornerRadius, y + height);
        }

        // Bottom-left corner
        this.ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);

        // Left edge
        if (edges.left === 0) {
            this.ctx.lineTo(x, y + cornerRadius);
        } else {
            const midY = y + height / 2;
            this.ctx.lineTo(x, midY + bumpSize);
            this.ctx.arc(x, midY, bumpSize, Math.PI/2, -Math.PI/2, edges.left > 0);
            this.ctx.lineTo(x, y + cornerRadius);
        }

        // Top-left corner
        this.ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);

        this.ctx.closePath();
    },

    // Classic jigsaw style with bezier curves
    createJigsawPath(x, y, width, height, edges) {
        const tabSize = Math.min(width, height) * 0.15;
        const neckWidth = tabSize * 0.4;

        this.ctx.beginPath();
        this.ctx.moveTo(x, y);

        // Top edge
        if (edges.top === 0) {
            this.ctx.lineTo(x + width, y);
        } else {
            const dir = edges.top;
            const midX = x + width / 2;
            this.ctx.lineTo(midX - tabSize, y);
            this.ctx.bezierCurveTo(
                midX - neckWidth, y,
                midX - neckWidth, y - dir * tabSize * 0.4,
                midX - neckWidth, y - dir * tabSize * 0.6
            );
            this.ctx.bezierCurveTo(
                midX - tabSize * 0.9, y - dir * tabSize,
                midX + tabSize * 0.9, y - dir * tabSize,
                midX + neckWidth, y - dir * tabSize * 0.6
            );
            this.ctx.bezierCurveTo(
                midX + neckWidth, y - dir * tabSize * 0.4,
                midX + neckWidth, y,
                midX + tabSize, y
            );
            this.ctx.lineTo(x + width, y);
        }

        // Right edge
        if (edges.right === 0) {
            this.ctx.lineTo(x + width, y + height);
        } else {
            const dir = edges.right;
            const midY = y + height / 2;
            this.ctx.lineTo(x + width, midY - tabSize);
            this.ctx.bezierCurveTo(
                x + width, midY - neckWidth,
                x + width + dir * tabSize * 0.4, midY - neckWidth,
                x + width + dir * tabSize * 0.6, midY - neckWidth
            );
            this.ctx.bezierCurveTo(
                x + width + dir * tabSize, midY - tabSize * 0.9,
                x + width + dir * tabSize, midY + tabSize * 0.9,
                x + width + dir * tabSize * 0.6, midY + neckWidth
            );
            this.ctx.bezierCurveTo(
                x + width + dir * tabSize * 0.4, midY + neckWidth,
                x + width, midY + neckWidth,
                x + width, midY + tabSize
            );
            this.ctx.lineTo(x + width, y + height);
        }

        // Bottom edge
        if (edges.bottom === 0) {
            this.ctx.lineTo(x, y + height);
        } else {
            const dir = edges.bottom;
            const midX = x + width / 2;
            this.ctx.lineTo(midX + tabSize, y + height);
            this.ctx.bezierCurveTo(
                midX + neckWidth, y + height,
                midX + neckWidth, y + height + dir * tabSize * 0.4,
                midX + neckWidth, y + height + dir * tabSize * 0.6
            );
            this.ctx.bezierCurveTo(
                midX + tabSize * 0.9, y + height + dir * tabSize,
                midX - tabSize * 0.9, y + height + dir * tabSize,
                midX - neckWidth, y + height + dir * tabSize * 0.6
            );
            this.ctx.bezierCurveTo(
                midX - neckWidth, y + height + dir * tabSize * 0.4,
                midX - neckWidth, y + height,
                midX - tabSize, y + height
            );
            this.ctx.lineTo(x, y + height);
        }

        // Left edge
        if (edges.left === 0) {
            this.ctx.lineTo(x, y);
        } else {
            const dir = edges.left;
            const midY = y + height / 2;
            this.ctx.lineTo(x, midY + tabSize);
            this.ctx.bezierCurveTo(
                x, midY + neckWidth,
                x - dir * tabSize * 0.4, midY + neckWidth,
                x - dir * tabSize * 0.6, midY + neckWidth
            );
            this.ctx.bezierCurveTo(
                x - dir * tabSize, midY + tabSize * 0.9,
                x - dir * tabSize, midY - tabSize * 0.9,
                x - dir * tabSize * 0.6, midY - neckWidth
            );
            this.ctx.bezierCurveTo(
                x - dir * tabSize * 0.4, midY - neckWidth,
                x, midY - neckWidth,
                x, midY - tabSize
            );
            this.ctx.lineTo(x, y);
        }

        this.ctx.closePath();
    },

    // Draw a single piece with jigsaw shape clipping
    drawPiece(pieceIndex) {
        if (!this.puzzleImage) return;

        const pos = this.getPiecePosition(pieceIndex);
        const sourceScale = 2; // Because we create image at 2x resolution
        const edges = this.getEdgePattern(pieceIndex);
        const tabSize = Math.min(this.pieceWidth, this.pieceHeight) * 0.18;

        this.ctx.save();

        // Create clipping path with jigsaw shape
        this.createPiecePath(pos.x, pos.y, this.pieceWidth, this.pieceHeight, edges);
        this.ctx.clip();

        // Draw the piece from the puzzle image (slightly larger to account for tabs)
        const margin = tabSize;
        this.ctx.drawImage(
            this.puzzleImage,
            (pos.x - margin) * sourceScale, (pos.y - margin) * sourceScale,
            (this.pieceWidth + margin * 2) * sourceScale, (this.pieceHeight + margin * 2) * sourceScale,
            pos.x - margin, pos.y - margin,
            this.pieceWidth + margin * 2, this.pieceHeight + margin * 2
        );

        this.ctx.restore();

        // Draw jigsaw-style border for visual effect
        this.drawPieceBorder(pos.x, pos.y, this.pieceWidth, this.pieceHeight, edges);
    },

    // Draw jigsaw piece border using edge pattern
    drawPieceBorder(x, y, width, height, edges) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;

        // Use the same path as clipping for border
        this.createPiecePath(x, y, width, height, edges);
        this.ctx.stroke();

        this.ctx.restore();
    },

    // Draw the animating piece with jigsaw shape
    drawAnimatingPiece() {
        if (!this.animatingPiece || !this.puzzleImage) return;

        const { pieceIndex, currentX, currentY, scale, opacity } = this.animatingPiece;
        const sourceScale = 2;
        const pos = this.getPiecePosition(pieceIndex);
        const edges = this.getEdgePattern(pieceIndex);
        const tabSize = Math.min(this.pieceWidth, this.pieceHeight) * 0.18;

        // Calculate scaled dimensions and position
        const drawWidth = this.pieceWidth * scale;
        const drawHeight = this.pieceHeight * scale;
        const drawX = currentX - drawWidth / 2;
        const drawY = currentY - drawHeight / 2;

        this.ctx.save();
        this.ctx.globalAlpha = opacity;

        // Shadow effect
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetY = 8;

        // Create scaled clipping path
        this.ctx.translate(drawX, drawY);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-pos.x, -pos.y);

        // Create jigsaw clipping path
        this.createPiecePath(pos.x, pos.y, this.pieceWidth, this.pieceHeight, edges);
        this.ctx.clip();

        // Draw the piece from the puzzle image
        const margin = tabSize;
        this.ctx.drawImage(
            this.puzzleImage,
            (pos.x - margin) * sourceScale, (pos.y - margin) * sourceScale,
            (this.pieceWidth + margin * 2) * sourceScale, (this.pieceHeight + margin * 2) * sourceScale,
            pos.x - margin, pos.y - margin,
            this.pieceWidth + margin * 2, this.pieceHeight + margin * 2
        );

        this.ctx.restore();

        // Draw border with jigsaw shape
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.lineWidth = 3 / scale;

        this.ctx.translate(drawX, drawY);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-pos.x, -pos.y);

        this.createPiecePath(pos.x, pos.y, this.pieceWidth, this.pieceHeight, edges);
        this.ctx.stroke();

        this.ctx.restore();
    },

    // Animate placing a piece
    placePiece(callback) {
        if (this.pieces.length === 0 || this.animatingPiece) {
            if (callback) callback(false);
            return;
        }

        const pieceIndex = this.pieces.shift();
        const targetPos = this.getPiecePosition(pieceIndex);

        // Start position (from top of canvas)
        const startX = this.puzzleWidth / 2;
        const startY = -this.pieceHeight;

        // Target position (center of piece slot)
        const targetX = targetPos.x + this.pieceWidth / 2;
        const targetY = targetPos.y + this.pieceHeight / 2;

        this.animatingPiece = {
            pieceIndex,
            currentX: startX,
            currentY: startY,
            targetX,
            targetY,
            scale: 1.3,
            opacity: 0.8,
            startTime: performance.now(),
            duration: 800 // milliseconds
        };

        this.animatePiece(callback);
    },

    // Animation loop for piece placement
    animatePiece(callback) {
        if (!this.animatingPiece) return;

        const now = performance.now();
        const elapsed = now - this.animatingPiece.startTime;
        const progress = Math.min(elapsed / this.animatingPiece.duration, 1);

        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        // Update position
        const { currentX, currentY, targetX, targetY, pieceIndex } = this.animatingPiece;
        const startX = this.puzzleWidth / 2;
        const startY = -this.pieceHeight;

        this.animatingPiece.currentX = startX + (targetX - startX) * easeProgress;
        this.animatingPiece.currentY = startY + (targetY - startY) * easeProgress;
        this.animatingPiece.scale = 1.3 - 0.3 * easeProgress;
        this.animatingPiece.opacity = 0.8 + 0.2 * easeProgress;

        this.redraw();

        if (progress < 1) {
            requestAnimationFrame(() => this.animatePiece(callback));
        } else {
            // Animation complete
            this.placedPieces.push(pieceIndex);
            this.animatingPiece = null;
            this.redraw();

            if (callback) callback(true);
        }
    },

    // Flash effect when piece is placed
    flashEffect() {
        const flash = document.createElement('div');
        flash.className = 'piece-flash';
        this.canvas.parentElement.appendChild(flash);

        setTimeout(() => flash.remove(), 300);
    },

    // Check if puzzle is complete
    isComplete() {
        return this.placedPieces.length >= this.totalPieces;
    },

    // Get progress
    getProgress() {
        return {
            placed: this.placedPieces.length,
            total: this.totalPieces,
            percent: (this.placedPieces.length / this.totalPieces) * 100
        };
    },

    // Get remaining pieces to place
    getRemainingPieces() {
        return this.pieces.length;
    },

    // Set placed pieces (for loading saved state)
    setPlacedPieces(count) {
        this.placedPieces = [];
        const allPieces = [...Array(this.totalPieces).keys()];

        // Shuffle to get random order
        for (let i = allPieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allPieces[i], allPieces[j]] = [allPieces[j], allPieces[i]];
        }

        // Place the specified count
        for (let i = 0; i < Math.min(count, this.totalPieces); i++) {
            this.placedPieces.push(allPieces[i]);
        }

        // Remaining pieces are the ones not placed
        this.pieces = allPieces.slice(count);

        this.redraw();
    },

    // Reset puzzle
    reset() {
        this.placedPieces = [];
        this.pieces = this.generatePieceOrder();
        this.animatingPiece = null;
        this.redraw();
    },

    // Get puzzle list for selection
    getPuzzleList() {
        return this.puzzles.map((puzzle, index) => ({
            index,
            name: puzzle.name,
            emoji: puzzle.emoji,
            color: puzzle.bgColors[0]
        }));
    }
};

// Make globally available
window.PuzzleEngine = PuzzleEngine;
