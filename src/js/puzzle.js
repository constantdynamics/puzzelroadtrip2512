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

    // Piece configurations: pieceCount -> {rows, cols}
    pieceConfigs: {
        12: { rows: 3, cols: 4 },
        20: { rows: 4, cols: 5 },
        30: { rows: 5, cols: 6 },
        40: { rows: 5, cols: 8 },
        60: { rows: 6, cols: 10 }
    },

    // Kleurrijke scene puzzels - vol met leuke dingen voor 2-jarigen!
    puzzles: [
        {
            name: 'Dierentuin',
            emoji: '🦁',
            theme: 'zoo',
            bgColors: ['#87CEEB', '#90EE90'], // Lucht naar gras
            elements: [
                // Dieren
                { emoji: '🦁', x: 0.15, y: 0.5, size: 0.18 },
                { emoji: '🐘', x: 0.35, y: 0.55, size: 0.22 },
                { emoji: '🦒', x: 0.55, y: 0.4, size: 0.25 },
                { emoji: '🦓', x: 0.75, y: 0.55, size: 0.16 },
                { emoji: '🐒', x: 0.85, y: 0.35, size: 0.12 },
                { emoji: '🦜', x: 0.1, y: 0.25, size: 0.1 },
                { emoji: '🦩', x: 0.25, y: 0.7, size: 0.12 },
                { emoji: '🐧', x: 0.45, y: 0.75, size: 0.1 },
                { emoji: '🦘', x: 0.65, y: 0.7, size: 0.14 },
                { emoji: '🐻', x: 0.9, y: 0.6, size: 0.14 },
                // Decoratie
                { emoji: '🌳', x: 0.05, y: 0.4, size: 0.15 },
                { emoji: '🌴', x: 0.95, y: 0.45, size: 0.15 },
                { emoji: '🌺', x: 0.3, y: 0.85, size: 0.08 },
                { emoji: '🦋', x: 0.5, y: 0.2, size: 0.08 },
                { emoji: '☀️', x: 0.85, y: 0.1, size: 0.12 },
                { emoji: '☁️', x: 0.2, y: 0.08, size: 0.1 },
                { emoji: '☁️', x: 0.6, y: 0.12, size: 0.08 },
            ]
        },
        {
            name: 'Boerderij',
            emoji: '🐄',
            theme: 'farm',
            bgColors: ['#87CEEB', '#8B4513'], // Lucht naar aarde
            elements: [
                { emoji: '🏠', x: 0.15, y: 0.35, size: 0.2 },
                { emoji: '🐄', x: 0.4, y: 0.6, size: 0.16 },
                { emoji: '🐷', x: 0.55, y: 0.65, size: 0.12 },
                { emoji: '🐔', x: 0.7, y: 0.7, size: 0.1 },
                { emoji: '🐑', x: 0.3, y: 0.7, size: 0.12 },
                { emoji: '🐴', x: 0.8, y: 0.55, size: 0.18 },
                { emoji: '🐕', x: 0.6, y: 0.8, size: 0.1 },
                { emoji: '🐈', x: 0.25, y: 0.75, size: 0.08 },
                { emoji: '🐓', x: 0.85, y: 0.75, size: 0.1 },
                { emoji: '🦆', x: 0.45, y: 0.85, size: 0.08 },
                { emoji: '🚜', x: 0.75, y: 0.4, size: 0.15 },
                { emoji: '🌻', x: 0.1, y: 0.6, size: 0.1 },
                { emoji: '🌻', x: 0.9, y: 0.65, size: 0.08 },
                { emoji: '🌾', x: 0.5, y: 0.45, size: 0.1 },
                { emoji: '☀️', x: 0.9, y: 0.1, size: 0.12 },
                { emoji: '☁️', x: 0.3, y: 0.1, size: 0.1 },
            ]
        },
        {
            name: 'Kermis',
            emoji: '🎡',
            theme: 'fair',
            bgColors: ['#FF69B4', '#FFD700'], // Roze naar goud
            elements: [
                { emoji: '🎡', x: 0.2, y: 0.4, size: 0.3 },
                { emoji: '🎠', x: 0.6, y: 0.5, size: 0.2 },
                { emoji: '🎪', x: 0.85, y: 0.35, size: 0.2 },
                { emoji: '🎈', x: 0.1, y: 0.2, size: 0.1 },
                { emoji: '🎈', x: 0.4, y: 0.15, size: 0.08 },
                { emoji: '🎈', x: 0.7, y: 0.2, size: 0.1 },
                { emoji: '🍭', x: 0.5, y: 0.75, size: 0.1 },
                { emoji: '🍿', x: 0.3, y: 0.8, size: 0.08 },
                { emoji: '🎁', x: 0.75, y: 0.8, size: 0.1 },
                { emoji: '⭐', x: 0.15, y: 0.1, size: 0.08 },
                { emoji: '⭐', x: 0.55, y: 0.08, size: 0.06 },
                { emoji: '⭐', x: 0.9, y: 0.15, size: 0.07 },
                { emoji: '🤡', x: 0.45, y: 0.6, size: 0.12 },
                { emoji: '🎉', x: 0.65, y: 0.7, size: 0.1 },
                { emoji: '🌈', x: 0.5, y: 0.05, size: 0.15 },
            ]
        },
        {
            name: 'Onderwaterwereld',
            emoji: '🐠',
            theme: 'ocean',
            bgColors: ['#00CED1', '#000080'], // Lichtblauw naar donkerblauw
            elements: [
                { emoji: '🐋', x: 0.3, y: 0.25, size: 0.25 },
                { emoji: '🐬', x: 0.7, y: 0.2, size: 0.15 },
                { emoji: '🐠', x: 0.15, y: 0.5, size: 0.1 },
                { emoji: '🐟', x: 0.5, y: 0.45, size: 0.1 },
                { emoji: '🐡', x: 0.8, y: 0.5, size: 0.1 },
                { emoji: '🦈', x: 0.6, y: 0.65, size: 0.15 },
                { emoji: '🐙', x: 0.2, y: 0.7, size: 0.14 },
                { emoji: '🦀', x: 0.85, y: 0.85, size: 0.1 },
                { emoji: '🐚', x: 0.4, y: 0.9, size: 0.08 },
                { emoji: '🦐', x: 0.6, y: 0.85, size: 0.08 },
                { emoji: '🐢', x: 0.35, y: 0.6, size: 0.12 },
                { emoji: '🦑', x: 0.9, y: 0.35, size: 0.12 },
                { emoji: '🪸', x: 0.1, y: 0.85, size: 0.12 },
                { emoji: '🪸', x: 0.75, y: 0.9, size: 0.1 },
                { emoji: '🫧', x: 0.25, y: 0.35, size: 0.06 },
                { emoji: '🫧', x: 0.55, y: 0.3, size: 0.05 },
                { emoji: '🫧', x: 0.45, y: 0.15, size: 0.04 },
            ]
        },
        {
            name: 'Stad',
            emoji: '🏙️',
            theme: 'city',
            bgColors: ['#87CEEB', '#808080'], // Lucht naar straat
            elements: [
                { emoji: '🏢', x: 0.15, y: 0.35, size: 0.25 },
                { emoji: '🏠', x: 0.4, y: 0.45, size: 0.15 },
                { emoji: '🏪', x: 0.6, y: 0.45, size: 0.15 },
                { emoji: '🏥', x: 0.85, y: 0.35, size: 0.2 },
                { emoji: '🚗', x: 0.2, y: 0.75, size: 0.12 },
                { emoji: '🚌', x: 0.45, y: 0.7, size: 0.15 },
                { emoji: '🚕', x: 0.7, y: 0.75, size: 0.1 },
                { emoji: '🚲', x: 0.9, y: 0.8, size: 0.08 },
                { emoji: '🚦', x: 0.55, y: 0.55, size: 0.08 },
                { emoji: '🌳', x: 0.05, y: 0.55, size: 0.12 },
                { emoji: '🌳', x: 0.95, y: 0.55, size: 0.1 },
                { emoji: '☀️', x: 0.85, y: 0.08, size: 0.1 },
                { emoji: '☁️', x: 0.2, y: 0.1, size: 0.1 },
                { emoji: '🐕', x: 0.35, y: 0.85, size: 0.08 },
                { emoji: '🐈', x: 0.8, y: 0.6, size: 0.06 },
                { emoji: '🕊️', x: 0.5, y: 0.15, size: 0.08 },
            ]
        },
        {
            name: 'Supermarkt',
            emoji: '🛒',
            theme: 'shop',
            bgColors: ['#FFE4B5', '#FFA500'], // Licht oranje
            elements: [
                { emoji: '🛒', x: 0.5, y: 0.5, size: 0.2 },
                { emoji: '🍎', x: 0.1, y: 0.3, size: 0.1 },
                { emoji: '🍌', x: 0.25, y: 0.25, size: 0.1 },
                { emoji: '🍇', x: 0.15, y: 0.45, size: 0.08 },
                { emoji: '🥕', x: 0.3, y: 0.4, size: 0.08 },
                { emoji: '🥦', x: 0.1, y: 0.6, size: 0.08 },
                { emoji: '🍞', x: 0.7, y: 0.25, size: 0.1 },
                { emoji: '🧀', x: 0.85, y: 0.3, size: 0.08 },
                { emoji: '🥛', x: 0.8, y: 0.45, size: 0.1 },
                { emoji: '🍦', x: 0.9, y: 0.6, size: 0.1 },
                { emoji: '🍪', x: 0.75, y: 0.7, size: 0.08 },
                { emoji: '🧃', x: 0.2, y: 0.75, size: 0.1 },
                { emoji: '🍬', x: 0.35, y: 0.8, size: 0.08 },
                { emoji: '🛍️', x: 0.6, y: 0.75, size: 0.12 },
                { emoji: '💰', x: 0.9, y: 0.85, size: 0.08 },
                { emoji: '⭐', x: 0.5, y: 0.15, size: 0.08 },
            ]
        },
        {
            name: 'Speeltuin',
            emoji: '🛝',
            theme: 'playground',
            bgColors: ['#87CEEB', '#90EE90'], // Lucht naar gras
            elements: [
                { emoji: '🛝', x: 0.2, y: 0.45, size: 0.2 },
                { emoji: '🎢', x: 0.5, y: 0.4, size: 0.2 },
                { emoji: '⚽', x: 0.75, y: 0.7, size: 0.12 },
                { emoji: '🏀', x: 0.85, y: 0.6, size: 0.1 },
                { emoji: '🪁', x: 0.15, y: 0.15, size: 0.12 },
                { emoji: '🎈', x: 0.35, y: 0.2, size: 0.08 },
                { emoji: '🎈', x: 0.8, y: 0.15, size: 0.1 },
                { emoji: '🌳', x: 0.05, y: 0.5, size: 0.15 },
                { emoji: '🌳', x: 0.95, y: 0.45, size: 0.12 },
                { emoji: '🌸', x: 0.4, y: 0.8, size: 0.08 },
                { emoji: '🌼', x: 0.6, y: 0.85, size: 0.08 },
                { emoji: '🐕', x: 0.7, y: 0.8, size: 0.1 },
                { emoji: '🦋', x: 0.3, y: 0.6, size: 0.06 },
                { emoji: '🐿️', x: 0.9, y: 0.7, size: 0.08 },
                { emoji: '☀️', x: 0.85, y: 0.08, size: 0.12 },
                { emoji: '☁️', x: 0.25, y: 0.08, size: 0.1 },
            ]
        },
        {
            name: 'Bos',
            emoji: '🌲',
            theme: 'forest',
            bgColors: ['#228B22', '#006400'], // Groen bos
            elements: [
                { emoji: '🌲', x: 0.1, y: 0.3, size: 0.2 },
                { emoji: '🌳', x: 0.3, y: 0.35, size: 0.22 },
                { emoji: '🌲', x: 0.5, y: 0.25, size: 0.25 },
                { emoji: '🌳', x: 0.75, y: 0.3, size: 0.2 },
                { emoji: '🌲', x: 0.9, y: 0.35, size: 0.18 },
                { emoji: '🦊', x: 0.2, y: 0.65, size: 0.12 },
                { emoji: '🐰', x: 0.4, y: 0.7, size: 0.1 },
                { emoji: '🦌', x: 0.6, y: 0.55, size: 0.15 },
                { emoji: '🐿️', x: 0.35, y: 0.45, size: 0.08 },
                { emoji: '🦉', x: 0.55, y: 0.35, size: 0.1 },
                { emoji: '🐻', x: 0.8, y: 0.6, size: 0.15 },
                { emoji: '🍄', x: 0.15, y: 0.8, size: 0.08 },
                { emoji: '🍄', x: 0.7, y: 0.8, size: 0.06 },
                { emoji: '🌺', x: 0.45, y: 0.85, size: 0.08 },
                { emoji: '🦋', x: 0.25, y: 0.5, size: 0.06 },
                { emoji: '🐦', x: 0.65, y: 0.2, size: 0.08 },
            ]
        },
        {
            name: 'Strand',
            emoji: '🏖️',
            theme: 'beach',
            bgColors: ['#87CEEB', '#F4A460'], // Lucht naar zand
            elements: [
                { emoji: '🌊', x: 0.5, y: 0.35, size: 0.9 },
                { emoji: '🏖️', x: 0.2, y: 0.6, size: 0.15 },
                { emoji: '🏄', x: 0.4, y: 0.3, size: 0.12 },
                { emoji: '⛱️', x: 0.7, y: 0.55, size: 0.15 },
                { emoji: '🦀', x: 0.85, y: 0.75, size: 0.1 },
                { emoji: '🐚', x: 0.3, y: 0.8, size: 0.08 },
                { emoji: '🐚', x: 0.6, y: 0.85, size: 0.06 },
                { emoji: '⭐', x: 0.45, y: 0.75, size: 0.08 },
                { emoji: '🪣', x: 0.15, y: 0.75, size: 0.1 },
                { emoji: '🩴', x: 0.8, y: 0.85, size: 0.08 },
                { emoji: '🐬', x: 0.25, y: 0.25, size: 0.12 },
                { emoji: '🦅', x: 0.75, y: 0.15, size: 0.1 },
                { emoji: '☀️', x: 0.9, y: 0.08, size: 0.12 },
                { emoji: '☁️', x: 0.15, y: 0.1, size: 0.1 },
                { emoji: '⛵', x: 0.6, y: 0.2, size: 0.1 },
                { emoji: '🌴', x: 0.05, y: 0.5, size: 0.15 },
            ]
        },
        {
            name: 'Ruimte',
            emoji: '🚀',
            theme: 'space',
            bgColors: ['#000033', '#000000'], // Donkere ruimte
            elements: [
                { emoji: '🚀', x: 0.3, y: 0.4, size: 0.2 },
                { emoji: '🌍', x: 0.7, y: 0.6, size: 0.2 },
                { emoji: '🌙', x: 0.15, y: 0.25, size: 0.15 },
                { emoji: '⭐', x: 0.1, y: 0.1, size: 0.06 },
                { emoji: '⭐', x: 0.25, y: 0.65, size: 0.05 },
                { emoji: '⭐', x: 0.4, y: 0.15, size: 0.07 },
                { emoji: '⭐', x: 0.55, y: 0.8, size: 0.05 },
                { emoji: '⭐', x: 0.7, y: 0.2, size: 0.06 },
                { emoji: '⭐', x: 0.85, y: 0.45, size: 0.05 },
                { emoji: '⭐', x: 0.9, y: 0.75, size: 0.06 },
                { emoji: '🛸', x: 0.5, y: 0.25, size: 0.12 },
                { emoji: '🪐', x: 0.85, y: 0.15, size: 0.15 },
                { emoji: '☄️', x: 0.2, y: 0.8, size: 0.1 },
                { emoji: '👽', x: 0.6, y: 0.45, size: 0.1 },
                { emoji: '🌟', x: 0.45, y: 0.7, size: 0.08 },
            ]
        },
        {
            name: 'Feestje',
            emoji: '🎂',
            theme: 'party',
            bgColors: ['#FF69B4', '#9370DB'], // Roze naar paars
            elements: [
                { emoji: '🎂', x: 0.5, y: 0.5, size: 0.25 },
                { emoji: '🎈', x: 0.15, y: 0.25, size: 0.12 },
                { emoji: '🎈', x: 0.3, y: 0.2, size: 0.1 },
                { emoji: '🎈', x: 0.7, y: 0.2, size: 0.1 },
                { emoji: '🎈', x: 0.85, y: 0.25, size: 0.12 },
                { emoji: '🎁', x: 0.2, y: 0.7, size: 0.15 },
                { emoji: '🎁', x: 0.75, y: 0.65, size: 0.12 },
                { emoji: '🎉', x: 0.1, y: 0.45, size: 0.1 },
                { emoji: '🎊', x: 0.9, y: 0.45, size: 0.1 },
                { emoji: '🧁', x: 0.35, y: 0.75, size: 0.1 },
                { emoji: '🍭', x: 0.6, y: 0.8, size: 0.08 },
                { emoji: '🍬', x: 0.45, y: 0.85, size: 0.06 },
                { emoji: '⭐', x: 0.25, y: 0.1, size: 0.08 },
                { emoji: '⭐', x: 0.5, y: 0.08, size: 0.06 },
                { emoji: '⭐', x: 0.75, y: 0.1, size: 0.07 },
                { emoji: '🎵', x: 0.4, y: 0.35, size: 0.08 },
                { emoji: '🎶', x: 0.65, y: 0.35, size: 0.08 },
            ]
        },
        {
            name: 'Treinstation',
            emoji: '🚂',
            theme: 'train',
            bgColors: ['#87CEEB', '#D3D3D3'], // Lucht naar perron
            elements: [
                { emoji: '🚂', x: 0.25, y: 0.5, size: 0.2 },
                { emoji: '🚃', x: 0.45, y: 0.5, size: 0.15 },
                { emoji: '🚃', x: 0.6, y: 0.5, size: 0.15 },
                { emoji: '🚃', x: 0.75, y: 0.5, size: 0.15 },
                { emoji: '🏠', x: 0.1, y: 0.3, size: 0.15 },
                { emoji: '🏢', x: 0.85, y: 0.25, size: 0.18 },
                { emoji: '🚦', x: 0.5, y: 0.3, size: 0.08 },
                { emoji: '🌳', x: 0.05, y: 0.45, size: 0.12 },
                { emoji: '🌳', x: 0.95, y: 0.45, size: 0.1 },
                { emoji: '☀️', x: 0.85, y: 0.08, size: 0.1 },
                { emoji: '☁️', x: 0.2, y: 0.1, size: 0.1 },
                { emoji: '☁️', x: 0.5, y: 0.08, size: 0.08 },
                { emoji: '🐕', x: 0.7, y: 0.75, size: 0.08 },
                { emoji: '🧳', x: 0.3, y: 0.75, size: 0.1 },
                { emoji: '🎒', x: 0.55, y: 0.8, size: 0.08 },
            ]
        },
        {
            name: 'Vliegveld',
            emoji: '✈️',
            theme: 'airport',
            bgColors: ['#87CEEB', '#B0C4DE'], // Lucht
            elements: [
                { emoji: '✈️', x: 0.5, y: 0.25, size: 0.25 },
                { emoji: '🛩️', x: 0.15, y: 0.4, size: 0.12 },
                { emoji: '🚁', x: 0.85, y: 0.35, size: 0.15 },
                { emoji: '🏢', x: 0.3, y: 0.6, size: 0.2 },
                { emoji: '🗼', x: 0.7, y: 0.55, size: 0.18 },
                { emoji: '🚌', x: 0.45, y: 0.8, size: 0.1 },
                { emoji: '🚗', x: 0.6, y: 0.85, size: 0.08 },
                { emoji: '🧳', x: 0.2, y: 0.8, size: 0.1 },
                { emoji: '🎒', x: 0.8, y: 0.8, size: 0.08 },
                { emoji: '☁️', x: 0.25, y: 0.15, size: 0.1 },
                { emoji: '☁️', x: 0.7, y: 0.1, size: 0.08 },
                { emoji: '☀️', x: 0.9, y: 0.08, size: 0.1 },
                { emoji: '🕊️', x: 0.4, y: 0.45, size: 0.06 },
            ]
        },
        {
            name: 'Camping',
            emoji: '⛺',
            theme: 'camping',
            bgColors: ['#228B22', '#90EE90'], // Groen
            elements: [
                { emoji: '⛺', x: 0.3, y: 0.5, size: 0.2 },
                { emoji: '⛺', x: 0.7, y: 0.55, size: 0.15 },
                { emoji: '🔥', x: 0.5, y: 0.65, size: 0.12 },
                { emoji: '🌲', x: 0.1, y: 0.35, size: 0.2 },
                { emoji: '🌲', x: 0.9, y: 0.4, size: 0.18 },
                { emoji: '🌳', x: 0.2, y: 0.3, size: 0.15 },
                { emoji: '🦊', x: 0.15, y: 0.7, size: 0.1 },
                { emoji: '🐰', x: 0.85, y: 0.75, size: 0.08 },
                { emoji: '🦉', x: 0.25, y: 0.25, size: 0.1 },
                { emoji: '🌙', x: 0.85, y: 0.1, size: 0.12 },
                { emoji: '⭐', x: 0.15, y: 0.1, size: 0.06 },
                { emoji: '⭐', x: 0.4, y: 0.08, size: 0.05 },
                { emoji: '⭐', x: 0.6, y: 0.12, size: 0.06 },
                { emoji: '⭐', x: 0.75, y: 0.08, size: 0.05 },
                { emoji: '🎒', x: 0.45, y: 0.8, size: 0.08 },
                { emoji: '🔦', x: 0.6, y: 0.75, size: 0.06 },
            ]
        },
        {
            name: 'Sneeuwpret',
            emoji: '⛷️',
            theme: 'snow',
            bgColors: ['#B0E0E6', '#FFFFFF'], // Lichtblauw naar wit
            elements: [
                { emoji: '⛷️', x: 0.3, y: 0.4, size: 0.15 },
                { emoji: '🏂', x: 0.6, y: 0.35, size: 0.15 },
                { emoji: '⛄', x: 0.15, y: 0.6, size: 0.18 },
                { emoji: '🎿', x: 0.8, y: 0.55, size: 0.12 },
                { emoji: '🛷', x: 0.5, y: 0.7, size: 0.12 },
                { emoji: '🌲', x: 0.05, y: 0.4, size: 0.15 },
                { emoji: '🌲', x: 0.9, y: 0.35, size: 0.18 },
                { emoji: '🌲', x: 0.45, y: 0.25, size: 0.12 },
                { emoji: '❄️', x: 0.2, y: 0.15, size: 0.08 },
                { emoji: '❄️', x: 0.4, y: 0.1, size: 0.06 },
                { emoji: '❄️', x: 0.7, y: 0.12, size: 0.07 },
                { emoji: '❄️', x: 0.85, y: 0.2, size: 0.06 },
                { emoji: '🏔️', x: 0.5, y: 0.15, size: 0.2 },
                { emoji: '🐧', x: 0.75, y: 0.75, size: 0.1 },
                { emoji: '🐻‍❄️', x: 0.35, y: 0.8, size: 0.1 },
            ]
        },
        {
            name: 'Jungle',
            emoji: '🦜',
            theme: 'jungle',
            bgColors: ['#228B22', '#006400'], // Donkergroen
            elements: [
                { emoji: '🦁', x: 0.5, y: 0.55, size: 0.18 },
                { emoji: '🐘', x: 0.2, y: 0.6, size: 0.2 },
                { emoji: '🦒', x: 0.8, y: 0.45, size: 0.22 },
                { emoji: '🐒', x: 0.35, y: 0.3, size: 0.12 },
                { emoji: '🐒', x: 0.65, y: 0.25, size: 0.1 },
                { emoji: '🦜', x: 0.15, y: 0.25, size: 0.1 },
                { emoji: '🦜', x: 0.85, y: 0.2, size: 0.08 },
                { emoji: '🐍', x: 0.4, y: 0.75, size: 0.12 },
                { emoji: '🦎', x: 0.7, y: 0.8, size: 0.08 },
                { emoji: '🌴', x: 0.05, y: 0.35, size: 0.2 },
                { emoji: '🌴', x: 0.95, y: 0.35, size: 0.18 },
                { emoji: '🌺', x: 0.25, y: 0.85, size: 0.1 },
                { emoji: '🌺', x: 0.6, y: 0.9, size: 0.08 },
                { emoji: '🦋', x: 0.45, y: 0.4, size: 0.08 },
                { emoji: '🌿', x: 0.1, y: 0.7, size: 0.1 },
            ]
        },
        {
            name: 'Circus',
            emoji: '🎪',
            theme: 'circus',
            bgColors: ['#FF4500', '#FFD700'], // Rood naar goud
            elements: [
                { emoji: '🎪', x: 0.5, y: 0.35, size: 0.35 },
                { emoji: '🤡', x: 0.2, y: 0.6, size: 0.15 },
                { emoji: '🎭', x: 0.75, y: 0.55, size: 0.12 },
                { emoji: '🦁', x: 0.35, y: 0.7, size: 0.12 },
                { emoji: '🐘', x: 0.65, y: 0.65, size: 0.15 },
                { emoji: '🎈', x: 0.1, y: 0.25, size: 0.1 },
                { emoji: '🎈', x: 0.9, y: 0.25, size: 0.1 },
                { emoji: '🎈', x: 0.3, y: 0.15, size: 0.08 },
                { emoji: '🎈', x: 0.7, y: 0.15, size: 0.08 },
                { emoji: '⭐', x: 0.15, y: 0.1, size: 0.06 },
                { emoji: '⭐', x: 0.5, y: 0.08, size: 0.07 },
                { emoji: '⭐', x: 0.85, y: 0.1, size: 0.06 },
                { emoji: '🍿', x: 0.15, y: 0.8, size: 0.1 },
                { emoji: '🍭', x: 0.85, y: 0.8, size: 0.08 },
                { emoji: '🎵', x: 0.4, y: 0.5, size: 0.06 },
            ]
        },
        {
            name: 'Restaurant',
            emoji: '🍕',
            theme: 'food',
            bgColors: ['#FFDAB9', '#FFE4B5'], // Warm beige
            elements: [
                { emoji: '🍕', x: 0.3, y: 0.4, size: 0.18 },
                { emoji: '🍔', x: 0.55, y: 0.35, size: 0.15 },
                { emoji: '🍟', x: 0.75, y: 0.4, size: 0.12 },
                { emoji: '🌭', x: 0.15, y: 0.55, size: 0.1 },
                { emoji: '🍦', x: 0.45, y: 0.6, size: 0.12 },
                { emoji: '🧁', x: 0.65, y: 0.55, size: 0.1 },
                { emoji: '🍰', x: 0.85, y: 0.6, size: 0.12 },
                { emoji: '🥤', x: 0.2, y: 0.75, size: 0.1 },
                { emoji: '🧃', x: 0.4, y: 0.8, size: 0.08 },
                { emoji: '🍩', x: 0.6, y: 0.75, size: 0.1 },
                { emoji: '🍪', x: 0.8, y: 0.8, size: 0.08 },
                { emoji: '⭐', x: 0.15, y: 0.15, size: 0.08 },
                { emoji: '⭐', x: 0.5, y: 0.12, size: 0.06 },
                { emoji: '⭐', x: 0.85, y: 0.15, size: 0.07 },
                { emoji: '❤️', x: 0.35, y: 0.2, size: 0.08 },
                { emoji: '❤️', x: 0.7, y: 0.18, size: 0.06 },
            ]
        },
        {
            name: 'Muziek',
            emoji: '🎸',
            theme: 'music',
            bgColors: ['#9370DB', '#FF69B4'], // Paars naar roze
            elements: [
                { emoji: '🎸', x: 0.2, y: 0.45, size: 0.2 },
                { emoji: '🎹', x: 0.5, y: 0.5, size: 0.25 },
                { emoji: '🥁', x: 0.8, y: 0.55, size: 0.18 },
                { emoji: '🎺', x: 0.15, y: 0.7, size: 0.12 },
                { emoji: '🎻', x: 0.65, y: 0.7, size: 0.12 },
                { emoji: '🎤', x: 0.4, y: 0.75, size: 0.1 },
                { emoji: '🎵', x: 0.1, y: 0.25, size: 0.1 },
                { emoji: '🎶', x: 0.3, y: 0.2, size: 0.08 },
                { emoji: '🎵', x: 0.5, y: 0.15, size: 0.1 },
                { emoji: '🎶', x: 0.7, y: 0.2, size: 0.08 },
                { emoji: '🎵', x: 0.9, y: 0.25, size: 0.1 },
                { emoji: '⭐', x: 0.15, y: 0.1, size: 0.06 },
                { emoji: '⭐', x: 0.45, y: 0.08, size: 0.07 },
                { emoji: '⭐', x: 0.75, y: 0.1, size: 0.06 },
                { emoji: '⭐', x: 0.9, y: 0.08, size: 0.05 },
            ]
        },
        {
            name: 'Tuin',
            emoji: '🌷',
            theme: 'garden',
            bgColors: ['#87CEEB', '#90EE90'], // Lucht naar groen
            elements: [
                { emoji: '🌷', x: 0.15, y: 0.5, size: 0.12 },
                { emoji: '🌻', x: 0.3, y: 0.45, size: 0.15 },
                { emoji: '🌹', x: 0.5, y: 0.5, size: 0.12 },
                { emoji: '🌺', x: 0.7, y: 0.45, size: 0.12 },
                { emoji: '🌸', x: 0.85, y: 0.5, size: 0.1 },
                { emoji: '🌼', x: 0.2, y: 0.65, size: 0.1 },
                { emoji: '💐', x: 0.45, y: 0.7, size: 0.12 },
                { emoji: '🌼', x: 0.65, y: 0.65, size: 0.1 },
                { emoji: '🦋', x: 0.25, y: 0.3, size: 0.1 },
                { emoji: '🦋', x: 0.6, y: 0.25, size: 0.08 },
                { emoji: '🐝', x: 0.4, y: 0.35, size: 0.08 },
                { emoji: '🐞', x: 0.75, y: 0.7, size: 0.08 },
                { emoji: '🐌', x: 0.1, y: 0.8, size: 0.08 },
                { emoji: '☀️', x: 0.85, y: 0.1, size: 0.12 },
                { emoji: '☁️', x: 0.2, y: 0.1, size: 0.1 },
                { emoji: '🌈', x: 0.5, y: 0.08, size: 0.15 },
            ]
        },
        {
            name: 'Sportveld',
            emoji: '⚽',
            theme: 'sports',
            bgColors: ['#228B22', '#32CD32'], // Groen gras
            elements: [
                { emoji: '⚽', x: 0.5, y: 0.5, size: 0.2 },
                { emoji: '🏀', x: 0.2, y: 0.4, size: 0.15 },
                { emoji: '🎾', x: 0.75, y: 0.35, size: 0.12 },
                { emoji: '⚾', x: 0.35, y: 0.7, size: 0.1 },
                { emoji: '🏈', x: 0.65, y: 0.65, size: 0.12 },
                { emoji: '🥅', x: 0.1, y: 0.5, size: 0.15 },
                { emoji: '🥅', x: 0.9, y: 0.5, size: 0.15 },
                { emoji: '🏆', x: 0.5, y: 0.2, size: 0.15 },
                { emoji: '🥇', x: 0.35, y: 0.25, size: 0.08 },
                { emoji: '🥈', x: 0.65, y: 0.25, size: 0.08 },
                { emoji: '⭐', x: 0.2, y: 0.15, size: 0.06 },
                { emoji: '⭐', x: 0.8, y: 0.15, size: 0.06 },
                { emoji: '🎉', x: 0.15, y: 0.8, size: 0.1 },
                { emoji: '🎊', x: 0.85, y: 0.8, size: 0.1 },
            ]
        },
        {
            name: 'Kasteel',
            emoji: '🏰',
            theme: 'castle',
            bgColors: ['#87CEEB', '#90EE90'], // Lucht naar gras
            elements: [
                { emoji: '🏰', x: 0.5, y: 0.4, size: 0.35 },
                { emoji: '👑', x: 0.5, y: 0.15, size: 0.1 },
                { emoji: '🦄', x: 0.15, y: 0.6, size: 0.15 },
                { emoji: '🐉', x: 0.85, y: 0.5, size: 0.18 },
                { emoji: '🧚', x: 0.25, y: 0.35, size: 0.1 },
                { emoji: '🧙', x: 0.75, y: 0.35, size: 0.1 },
                { emoji: '🌳', x: 0.05, y: 0.55, size: 0.15 },
                { emoji: '🌳', x: 0.95, y: 0.6, size: 0.12 },
                { emoji: '🌺', x: 0.3, y: 0.8, size: 0.08 },
                { emoji: '🌷', x: 0.7, y: 0.8, size: 0.08 },
                { emoji: '⭐', x: 0.2, y: 0.1, size: 0.06 },
                { emoji: '⭐', x: 0.4, y: 0.08, size: 0.05 },
                { emoji: '⭐', x: 0.6, y: 0.08, size: 0.05 },
                { emoji: '⭐', x: 0.8, y: 0.1, size: 0.06 },
                { emoji: '🦋', x: 0.4, y: 0.7, size: 0.06 },
            ]
        },
        {
            name: 'Piraten',
            emoji: '🏴‍☠️',
            theme: 'pirates',
            bgColors: ['#87CEEB', '#4169E1'], // Lucht naar zee
            elements: [
                { emoji: '🚢', x: 0.5, y: 0.55, size: 0.3 },
                { emoji: '🏴‍☠️', x: 0.5, y: 0.3, size: 0.12 },
                { emoji: '🦜', x: 0.35, y: 0.4, size: 0.1 },
                { emoji: '💰', x: 0.65, y: 0.65, size: 0.1 },
                { emoji: '🗺️', x: 0.2, y: 0.7, size: 0.12 },
                { emoji: '⚓', x: 0.8, y: 0.7, size: 0.1 },
                { emoji: '🏝️', x: 0.1, y: 0.5, size: 0.15 },
                { emoji: '🌴', x: 0.08, y: 0.4, size: 0.12 },
                { emoji: '🐙', x: 0.85, y: 0.85, size: 0.1 },
                { emoji: '🐬', x: 0.25, y: 0.85, size: 0.1 },
                { emoji: '☀️', x: 0.9, y: 0.1, size: 0.12 },
                { emoji: '☁️', x: 0.2, y: 0.1, size: 0.1 },
                { emoji: '☁️', x: 0.55, y: 0.12, size: 0.08 },
                { emoji: '🦈', x: 0.6, y: 0.85, size: 0.1 },
            ]
        },
        {
            name: 'Bouwplaats',
            emoji: '🏗️',
            theme: 'construction',
            bgColors: ['#87CEEB', '#D2691E'], // Lucht naar zand
            elements: [
                { emoji: '🏗️', x: 0.5, y: 0.4, size: 0.25 },
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

    // Resize canvas to fit container
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;

        // Calculate puzzle dimensions maintaining aspect ratio
        const aspectRatio = this.cols / this.rows;
        let width = containerWidth;
        let height = width / aspectRatio;

        if (height > containerHeight) {
            height = containerHeight;
            width = height * aspectRatio;
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.puzzleWidth = width;
        this.puzzleHeight = height;
        this.pieceWidth = width / this.cols;
        this.pieceHeight = height / this.rows;

        this.redraw();
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

    // Draw background grid showing where pieces go
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        this.ctx.lineWidth = 1;

        // Draw grid lines
        for (let col = 0; col <= this.cols; col++) {
            const x = col * this.pieceWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.puzzleHeight);
            this.ctx.stroke();
        }

        for (let row = 0; row <= this.rows; row++) {
            const y = row * this.pieceHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.puzzleWidth, y);
            this.ctx.stroke();
        }

        // Draw puzzle outline
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(0, 0, this.puzzleWidth, this.puzzleHeight);
    },

    // Draw a single piece
    drawPiece(pieceIndex) {
        if (!this.puzzleImage) return;

        const pos = this.getPiecePosition(pieceIndex);
        const sourceScale = 2; // Because we create image at 2x resolution

        // Draw the piece from the puzzle image
        this.ctx.drawImage(
            this.puzzleImage,
            pos.x * sourceScale, pos.y * sourceScale,
            this.pieceWidth * sourceScale, this.pieceHeight * sourceScale,
            pos.x, pos.y,
            this.pieceWidth, this.pieceHeight
        );

        // Draw jigsaw-style border for visual effect
        this.drawPieceBorder(pos.x, pos.y, this.pieceWidth, this.pieceHeight, pieceIndex);
    },

    // Draw jigsaw piece border
    drawPieceBorder(x, y, width, height, pieceIndex) {
        const col = pieceIndex % this.cols;
        const row = Math.floor(pieceIndex / this.cols);

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;

        // Draw the border with tabs/notches for jigsaw effect
        this.ctx.beginPath();

        // Top edge
        this.ctx.moveTo(x, y);
        if (row > 0) {
            this.ctx.lineTo(x + width * 0.35, y);
            this.ctx.arc(x + width * 0.5, y, width * 0.08, Math.PI, 0, pieceIndex % 2 === 0);
            this.ctx.lineTo(x + width, y);
        } else {
            this.ctx.lineTo(x + width, y);
        }

        // Right edge
        if (col < this.cols - 1) {
            this.ctx.lineTo(x + width, y + height * 0.35);
            this.ctx.arc(x + width, y + height * 0.5, height * 0.08, -Math.PI/2, Math.PI/2, (pieceIndex + 1) % 2 === 0);
            this.ctx.lineTo(x + width, y + height);
        } else {
            this.ctx.lineTo(x + width, y + height);
        }

        // Bottom edge
        if (row < this.rows - 1) {
            this.ctx.lineTo(x + width * 0.65, y + height);
            this.ctx.arc(x + width * 0.5, y + height, width * 0.08, 0, Math.PI, (pieceIndex + row) % 2 === 0);
            this.ctx.lineTo(x, y + height);
        } else {
            this.ctx.lineTo(x, y + height);
        }

        // Left edge
        if (col > 0) {
            this.ctx.lineTo(x, y + height * 0.65);
            this.ctx.arc(x, y + height * 0.5, height * 0.08, Math.PI/2, -Math.PI/2, (pieceIndex + col) % 2 === 0);
            this.ctx.lineTo(x, y);
        } else {
            this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();
        this.ctx.restore();
    },

    // Draw the animating piece
    drawAnimatingPiece() {
        if (!this.animatingPiece || !this.puzzleImage) return;

        const { pieceIndex, currentX, currentY, targetX, targetY, scale, opacity } = this.animatingPiece;
        const sourceScale = 2;
        const pos = this.getPiecePosition(pieceIndex);

        this.ctx.save();
        this.ctx.globalAlpha = opacity;

        // Draw piece at current animation position
        const drawWidth = this.pieceWidth * scale;
        const drawHeight = this.pieceHeight * scale;
        const drawX = currentX - drawWidth / 2;
        const drawY = currentY - drawHeight / 2;

        // Shadow
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetY = 5;

        this.ctx.drawImage(
            this.puzzleImage,
            pos.x * sourceScale, pos.y * sourceScale,
            this.pieceWidth * sourceScale, this.pieceHeight * sourceScale,
            drawX, drawY,
            drawWidth, drawHeight
        );

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

            // Flash effect
            this.flashEffect();

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
