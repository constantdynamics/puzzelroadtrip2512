# Roadtrip Puzzel App

Een Progressive Web App (PWA) die peuters entertaint tijdens lange autoritten met een puzzel-gebaseerd beloningssysteem.

## Installatie op Android Tablet

### Methode 1: Lokale server (aanbevolen voor testen)

1. Installeer een simpele HTTP server (bijv. met Python):
   ```bash
   cd roadtrippuzzel2512
   python -m http.server 8080
   ```

2. Open Chrome op je tablet en ga naar: `http://[computer-ip]:8080`

3. Tik op het menu (drie puntjes) en kies "Toevoegen aan startscherm"

### Methode 2: GitHub Pages

1. Push de code naar een GitHub repository
2. Ga naar Settings > Pages
3. Selecteer "main" branch en klik Save
4. De app is beschikbaar op: `https://[username].github.io/[repo-name]/`

### Methode 3: Lokaal bestand (alleen voor testen)

Open `index.html` direct in Chrome. Let op: sommige PWA functies werken niet zonder server.

## Gebruik

### Basis functies

- **Timer**: Elke 15 minuten (instelbaar) krijg je automatisch een puzzelstukje
- **Taak knoppen**: Druk op een knop om direct een puzzelstukje te verdienen
- **Gespaarde stukjes**: Worden automatisch op de puzzel geplaatst met animatie

### Knoppen

- 🎵 **Liedje Gezongen** - Kind heeft een liedje gezongen
- 📖 **Boek Gelezen** - Kind heeft een boekje bekeken
- ✅ **Taak Gedaan** - Kind heeft een taak volbracht
- ⭐ **Extra Stukje** - Algemene beloning

### Instellingen (⚙️)

- Volume aanpassen
- Timer interval wijzigen (1-60 minuten)
- Huidige puzzel resetten
- Andere puzzel kiezen

### Meer Taken (📋)

100 verschillende taken verdeeld over categorieën:
- Basis activiteiten
- Observatie (dingen zoeken)
- Beweging
- Geluiden maken
- Liedjes
- Eten/Drinken
- Nadenken
- Interactie
- Fantasie
- Rustige activiteiten

## Technische Details

### Bestandsstructuur

```
roadtrippuzzel2512/
├── index.html          # Hoofdpagina
├── manifest.json       # PWA configuratie
├── sw.js              # Service Worker voor offline
├── src/
│   ├── css/
│   │   └── style.css  # Alle styling
│   ├── js/
│   │   ├── app.js     # Hoofdlogica
│   │   ├── audio.js   # Geluidssysteem
│   │   ├── puzzle.js  # Puzzel engine
│   │   ├── storage.js # Data opslag
│   │   ├── tasks.js   # Takenlijst
│   │   └── timer.js   # Timer systeem
│   └── assets/
│       └── images/    # Iconen
└── README.md
```

### Functies

- ✅ 25 puzzels met dierenthema
- ✅ 40 stukjes per puzzel
- ✅ Automatische timer met pauze functie
- ✅ 100 verschillende taken
- ✅ Geluidseffecten (Web Audio API)
- ✅ Voortgang opslaan (LocalStorage)
- ✅ Offline werken (Service Worker)
- ✅ Tablet landscape layout
- ✅ Touch-optimized interface
- ✅ Confetti bij voltooien puzzel

### Browser Ondersteuning

- Chrome (Android) ✅
- Safari (iOS) ✅
- Edge ✅
- Firefox ✅

## Ontwikkeling

De app is gebouwd met vanilla JavaScript, geen frameworks of dependencies nodig.

Om wijzigingen te testen:
1. Start een lokale server
2. Open de app in je browser
3. Open Developer Tools (F12) voor debugging

### Cache legen

Als je wijzigingen hebt gemaakt:
1. Open Developer Tools > Application
2. Klik op "Clear storage" en selecteer alles
3. Herlaad de pagina

## Licentie

MIT License - Vrij te gebruiken en aan te passen.
