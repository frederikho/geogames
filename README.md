# Neighbor Countries 🗺️

A browser-based geography learning game that challenges you to name the land-border neighbors of countries. Built with vanilla JavaScript, D3.js, and TopoJSON - fully static, no server required!

![Neighbor Countries Game](design-prototype.html)

## Features

✨ **Clean, Playful Interface** - Vintage atlas aesthetic with warm colors and Comic Sans
🗺️ **Interactive Map Visualization** - See highlighted countries and neighbors on a world map
⌨️ **Full Keyboard Navigation** - Tab, arrows, enter, escape - all accessible
📱 **Mobile Responsive** - Touch-friendly with 44px minimum targets
🎯 **Smart Autocomplete** - Search with aliases, diacritics-insensitive, partial matching
📊 **Score Tracking** - Track correct answers and penalties across rounds
🌍 **193 UN Member States** - Accurate, up-to-date country data

## Quick Start

```bash
# Install dependencies
npm install

# Prepare geographic data (required first time)
npm run prepare-data

# Start development server
npm run dev

# Build for production
npm run build
```

Then open http://localhost:5173 in your browser!

## How to Play

1. **Question**: You're shown a country name
2. **Input**: Type neighbor country names in the search field
3. **Autocomplete**: Select from suggestions (supports aliases and partial matches)
4. **Chips**: Added countries appear as removable chips
5. **Submit**: Click "Submit Answers" to validate your guesses
   - ✅ Correct neighbors turn green and lock
   - ❌ Incorrect guesses turn red (can be removed)
   - Penalty of 1 point per new incorrect guess
6. **Map**: See the highlighted countries on a world map
7. **Continue**: Keep guessing or click "Reveal Remaining" to see all answers
8. **Next Round**: Start a new round with a different country!

## Game Rules

- **Land borders only** - Maritime/sea borders don't count
- **Includes enclaves/exclaves** - e.g., Kaliningrad (RUS), French Guiana (FRA)
- **UN member states only** - 193 countries, no disputed territories
- **Only countries with ≥1 neighbor** - No island nations as prompts

## Project Structure

```
neighbor-countries/
├── public/
│   └── data/              # Generated data files (after prepare-data)
│       ├── world.topo.json
│       ├── neighbors.json
│       └── countries.json
├── src/
│   ├── main.js           # Entry point
│   ├── game.js           # Game state management
│   ├── ui.js             # UI components (chips, autocomplete)
│   ├── map.js            # D3 map rendering
│   ├── data.js           # Data loading & search
│   └── styles.css        # Vintage atlas styling
├── scripts/
│   └── prepare-data.js   # Data preparation script
├── data/
│   └── raw/              # Downloaded source data
├── index.html            # Main HTML
└── package.json
```

## Data Pipeline

The `prepare-data` script:

1. **Downloads** Natural Earth country boundaries (110m resolution)
2. **Filters** to 193 UN member states (ISO 3166-1 alpha-3)
3. **Computes** land-border neighbors using geometric operations (Turf.js)
4. **Converts** GeoJSON → TopoJSON for smaller file size
5. **Simplifies** geometries for web performance
6. **Generates** countries.json with canonical names + aliases
7. **Outputs** to `public/data/` for static serving

### Neighbor Detection

Neighbors are detected using:
- **Geometric intersection** - Turf.js `booleanIntersects()`
- **Pre-computed offline** - No runtime calculation needed
- **Handles edge cases** - Enclaves, exclaves, multi-polygons

### Country Aliases

Aliases are defined in `scripts/prepare-data.js`:

```javascript
const COUNTRY_ALIASES = {
  'USA': ['United States', 'United States of America', 'America', 'US'],
  'GBR': ['United Kingdom', 'UK', 'Britain', 'Great Britain'],
  'COD': ['Democratic Republic of the Congo', 'DRC', 'DR Congo'],
  // ... and more
};
```

Add more aliases by editing this object and re-running `npm run prepare-data`.

## Technologies

- **Vite** - Fast build tool and dev server
- **D3.js** - Map rendering with `geoPath` and `geoProjection`
- **TopoJSON** - Compact topology-preserving format
- **Turf.js** - Geospatial operations for neighbor detection
- **Vanilla JavaScript** - No framework overhead
- **CSS Variables** - Theming and consistent colors

## Design Philosophy

**"Artisan Atlas"** - A vintage educational aesthetic that makes Comic Sans feel intentional:

- 📜 **Paper textures** - SVG noise filter for tactile feel
- 🎨 **Warm earthy palette** - Terracotta, sepia, sage, ochre
- ✏️ **Hand-lettered vibe** - Comic Sans as "specimen labels"
- 🏺 **Organic shadows** - Soft, layered depth (not harsh digital)
- 🎭 **Playful animations** - Shake on wrong, glow on correct
- ♿ **Accessible first** - Full keyboard nav, ARIA labels, color contrast

See [DESIGN_SPEC.md](DESIGN_SPEC.md) for complete design documentation.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

Requires ES2020+ and native fetch API.

## Attribution

Geographic data from [Natural Earth](https://www.naturalearthdata.com/)
License: Public Domain

See [ATTRIBUTION.md](ATTRIBUTION.md) for complete licensing information.

## Development

### Adding New Features

**Add a country alias:**
1. Edit `scripts/prepare-data.js` → `COUNTRY_ALIASES`
2. Run `npm run prepare-data`
3. Restart dev server

**Adjust map styling:**
1. Edit `src/map.js` → `render()` method
2. Modify fill colors, strokes, opacity

**Change difficulty:**
1. Edit `src/game.js` → `startNewRound()`
2. Add filtering logic (e.g., only countries with 3+ neighbors)

### Performance Optimization

- TopoJSON reduces file size ~80% vs GeoJSON
- Simplified geometries (adjustable in `prepare-data.js`)
- Lazy-load map only after first submission
- CSS animations use GPU-accelerated properties

## Troubleshooting

**Error: "Failed to load game data"**
- Run `npm run prepare-data` to generate data files
- Check that `public/data/` contains `world.topo.json`, `neighbors.json`, `countries.json`

**Map not showing:**
- Check browser console for D3/TopoJSON errors
- Verify `world.topo.json` is valid JSON
- Try increasing simplification quality in `prepare-data.js`

**Autocomplete not working:**
- Verify `countries.json` has proper aliases
- Check `src/data.js` normalization function

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please:

1. Ensure code follows existing style (Comic Sans is intentional! 😄)
2. Test with `npm run build` before submitting
3. Update tests and documentation as needed
4. Maintain accessibility standards (WCAG 2.1 AA)

## Credits

Built with ❤️ for geography enthusiasts everywhere.

Special thanks to:
- Natural Earth for public domain geographic data
- D3.js community for excellent mapping tools
- Comic Sans MS for being the most playful font
