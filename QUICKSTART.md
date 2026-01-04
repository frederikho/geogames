# Quick Start Guide

Get up and running in 2 minutes!

## First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate game data (downloads Natural Earth data)
npm run prepare-data

# 3. Start development server
npm run dev
```

The game will open automatically at http://localhost:5173

## What Just Happened?

1. **npm install** - Downloaded D3, TopoJSON, Turf.js, and Vite
2. **prepare-data** - Downloaded Natural Earth country boundaries, computed neighbors, generated TopoJSON
3. **npm run dev** - Started Vite dev server with hot-reload

## Project Overview

```
neighbor-countries/
├── public/data/           ← Generated data (163 countries)
├── src/                   ← Game code (vanilla JS modules)
├── index.html            ← Entry point
└── design-prototype.html ← Standalone UI demo
```

## Available Commands

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Build for production → dist/
npm run preview    # Preview production build
npm run prepare-data  # Regenerate geographic data
```

## How It Works

### Data Flow

1. **Natural Earth** (GeoJSON) → Script downloads country boundaries
2. **Filter** → Keep only 193 UN member states (163 found in 110m dataset)
3. **Compute Neighbors** → Turf.js finds geometric intersections
4. **Convert** → GeoJSON → TopoJSON (80% smaller)
5. **Simplify** → Reduce vertices for web performance
6. **Output** → `public/data/*.json` ready for static serving

### Game Flow

1. User loads page → Fetch data files
2. Pick random country with ≥1 neighbor
3. User types country name → Autocomplete searches with aliases
4. User adds chips → Tracked in game state
5. User submits → Validate against precomputed neighbors
6. Show map → D3 renders TopoJSON with highlights
7. Next round → Repeat!

## Customization Quick Tips

### Add Country Aliases

Edit `scripts/prepare-data.js`:

```javascript
const COUNTRY_ALIASES = {
  'USA': ['United States', 'America', 'US'],
  // Add more here
};
```

Then run: `npm run prepare-data`

### Change Colors

Edit `src/styles.css`:

```css
:root {
  --cream: #F5E6D3;        /* Background */
  --terracotta: #C97064;   /* Primary accent */
  --sage: #9CAF88;         /* Correct answers */
  --rust: #B85C50;         /* Incorrect answers */
}
```

### Adjust Map Detail

Edit `scripts/prepare-data.js` line ~280:

```javascript
// Lower = simpler (smaller file, less detail)
// Higher = more detail (larger file, better shapes)
const result = toposimplify.simplify(simplified, 0.5);
```

### Filter Countries by Difficulty

Edit `src/data.js` → `getCountriesWithNeighbors()`:

```javascript
return Object.entries(neighborsData)
  .filter(([code, neighbors]) => neighbors.length >= 3) // Easy mode: 3+ neighbors
  .map(([code]) => countriesData[code])
  .filter(Boolean);
```

## Troubleshooting

**"Failed to load game data"**
- Run `npm run prepare-data` first
- Check `public/data/` has 3 JSON files

**Map not showing**
- Open browser console (F12)
- Look for TopoJSON/D3 errors
- Verify `world.topo.json` is valid JSON

**Port 5173 already in use**
- Edit `vite.config.js` → change `port: 5173` to another port
- Or kill the process: `lsof -ti:5173 | xargs kill`

**TypeScript errors**
- This project uses vanilla JS, not TypeScript
- If you want TS, rename files to `.ts` and add types

## Development Tips

### Hot Reload

Vite watches files and auto-reloads on changes:
- Edit `src/*.js` → Instant reload
- Edit `src/styles.css` → Instant style update
- Edit `index.html` → Full page reload

### Debug Mode

Add to `src/main.js`:

```javascript
// Enable debug logging
window.DEBUG = true;

// Expose game state for console inspection
window.game = game;
```

Then in browser console:
```javascript
window.game.gameState.getState() // Inspect current state
```

### Testing Specific Countries

In `src/game.js` → `startNewRound()`:

```javascript
// Force a specific country for testing
const country = getCountries()['CHN']; // Force China
// const country = getRandomCountryWithNeighbors(); // Normal
```

## Performance

Current build size (gzipped):
- HTML: 1.25 KB
- CSS: 2.77 KB
- JS: 29.31 KB
- **Total: ~33 KB** (excluding data)

Data files:
- countries.json: 14 KB
- neighbors.json: 8.6 KB
- world.topo.json: 250 KB
- **Total: ~273 KB**

**Overall: ~306 KB** for entire game (gzipped: ~150 KB)

## Next Steps

- Play the game and test different countries
- Try adding more country aliases
- Experiment with color themes
- Add difficulty levels (filter by neighbor count)
- Implement round timer
- Add statistics/achievements
- Deploy to Netlify/Vercel/GitHub Pages

## Resources

- [D3.js Docs](https://d3js.org/)
- [TopoJSON Spec](https://github.com/topojson/topojson-specification)
- [Natural Earth Data](https://www.naturalearthdata.com/)
- [Vite Guide](https://vitejs.dev/guide/)

---

Happy mapping! 🗺️
