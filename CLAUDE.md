# Neighbor Countries - Built with Claude

A fully static, browser-based geography learning game built entirely through conversation with Claude (Sonnet 4.5).

## Project Overview

**Neighbor Countries** is an educational geography game that challenges players to name the land-border neighbors of countries. The entire application runs in the browser with no server required - all data is precomputed and shipped as static assets.

## Development Journey

This project was built iteratively through natural language conversations, with Claude handling:
- UI/UX design with the frontend-design skill
- Full-stack implementation (data pipeline + game logic + rendering)
- Real-time debugging and optimization
- Responsive design and accessibility

### Key Milestones

1. **Initial Design** - Used frontend-design skill to create "Artisan Atlas" aesthetic
2. **Data Pipeline** - Built Node.js script to process Natural Earth geodata
3. **Game Implementation** - Vanilla JS with D3.js for map rendering
4. **Iterative Refinement** - User feedback → immediate fixes
   - Fixed map rendering (0 width bug)
   - Simplified scoring system
   - Removed modal popups
   - Added visual distinction for missed vs guessed countries

## Technical Architecture

### Stack
- **Build Tool**: Vite
- **Runtime**: Vanilla JavaScript (ES modules)
- **Map Rendering**: D3.js + TopoJSON
- **Geospatial Processing**: Turf.js (build-time only)
- **Data Source**: Natural Earth (110m resolution)

### Data Pipeline

```
Natural Earth GeoJSON (177 countries)
    ↓
Filter to UN Member States (164 countries)
    ↓
Compute neighbors via geometric intersection (Turf.js)
    ↓
Convert to TopoJSON + simplify (80% size reduction)
    ↓
Output static JSON files (countries, neighbors, world map)
    ↓
Ship as static assets (~280KB total)
```

### Game Architecture

```
main.js (orchestrator)
    ├── game.js (state management)
    ├── ui.js (DOM manipulation, chips, autocomplete)
    ├── map.js (D3 rendering)
    └── data.js (data loading, search, aliases)
```

## Design Philosophy

### "Artisan Atlas" Aesthetic

The user requested:
- Warm colors
- Beige background
- Comic Sans font (initially)

Claude designed a cohesive vintage educational aesthetic inspired by:
- Hand-tinted maps
- Library card catalogs
- Botanical specimen labels
- Vintage postage stamps

**Final Design** (after user feedback):
- System fonts (more readable than Comic Sans)
- Warm earthy palette (terracotta, sage, ochre, sepia)
- Paper grain texture overlay
- Organic shadows (not harsh digital)
- Tactile, vintage feel

### Color-Coded Feedback

- 🟢 **Green** - Correct guesses
- 🟠 **Orange** - Missed neighbors (auto-revealed)
- 🔴 **Red** - Wrong guesses

Applied consistently across chips and map visualization.

## Notable Challenges & Solutions

### Challenge 1: Map Not Rendering

**Problem**: SVG showing white space, only labels visible

**Debug Process**:
```javascript
console.log('[MAP] Initializing map:', { width: 0, height: 400 })
//                                              ↑ Found it!
```

**Root Cause**: Map initialized while container was `display: none` → width calculated as 0

**Solution**: Initialize map AFTER showing container
```javascript
this.uiManager.showMap();     // Make visible first
this.mapRenderer.init();       // Now width > 0
this.updateMap();              // Render
```

### Challenge 2: CSS Variables in SVG

**Problem**: Map colors not showing (CSS `var(--color)` doesn't work in SVG attributes)

**Solution**: Use hex colors directly in SVG attributes
```javascript
// Before: .attr('fill', 'var(--terracotta)')  ❌
// After:  .attr('fill', '#C97064')             ✅
```

### Challenge 3: Missing Countries (France!)

**Problem**: France missing from 164-country dataset

**Debug Process**:
```javascript
// Natural Earth data has invalid ISO_A3 codes for some countries:
France: { ISO_A3: '-99', ADM0_A3: 'FRA' }  // ← Use this instead!
```

**Solution**: Use `ADM0_A3` as primary field, fallback to `ISO_A3`
```javascript
const iso3 = feature.properties.ADM0_A3 || feature.properties.ISO_A3;
```

**Result**: Recovered France, Norway, and others → 164 countries

### Challenge 4: Score Confusion

**Evolution of Scoring System**:

**Version 1**: Separate Score + Penalties counters
- User feedback: "Too complicated"

**Version 2**: Single score with delta
- Score = Correct - (Wrong + Missed)
- Display: `14 (+3 -1)` with colored deltas
- User feedback: "Perfect!"

## User-Driven Refinements

### Iteration 1: Remove Popup Modal
**User**: "Round Complete should not show as a popup"

**Change**: Replace modal with "Next Round" button that appears after submission

### Iteration 2: Distinguish Missed Countries
**User**: "The missed countries should show not green"

**Change**:
- Correct guesses → Green
- Missed neighbors → Orange
- Wrong guesses → Red

### Iteration 3: Map Zoom
**User**: "Map should only show relevant countries and be centered around them"

**Change**: D3 projection recalculated to fit only target country + neighbors
```javascript
const relevantFeatureCollection = {
    type: 'FeatureCollection',
    features: relevantCountries
};
this.projection = d3.geoNaturalEarth1()
    .fitSize([this.width, this.height], relevantFeatureCollection);
```

## Key Features

### Smart Autocomplete
- Searches all 164 countries
- Alias support (USA/United States/America)
- Diacritics-insensitive
- Partial matching
- Keyboard navigation (arrows, enter, escape)

### Progressive Disclosure
- "Found X of N" hidden until first submission
- Map appears after submission
- Clear visual hierarchy

### Accessibility
- Full keyboard navigation
- ARIA labels
- Screen reader support
- Touch-friendly (44px minimum targets)
- Color + icons (not color alone)

### Performance
- TopoJSON: 80% smaller than GeoJSON
- Simplified geometries
- Precomputed neighbors (no runtime calculation)
- Total bundle: ~150KB gzipped

## Data Quality

### Coverage
- **164 countries** from Natural Earth 110m
- **149 countries** with land neighbors (eligible as prompts)
- **15 island nations** (no land borders)

### Known Limitations
- **Small countries missing**: Singapore, Malta, Bahrain
  - Reason: Not in Natural Earth 110m dataset (<1000 km² often excluded)
  - Solution: Would need 50m or 10m dataset (much larger files)

### Enclaves & Exclaves
- ✅ Correctly handles French Guiana (France-Brazil border)
- ✅ Correctly handles Kaliningrad (Russia-Poland/Lithuania borders)

## Code Quality

### Modular Design
- Clear separation of concerns
- Single responsibility principle
- Functional programming where appropriate
- Minimal framework overhead

### Debug-Friendly
- Console logging throughout (`[DATA]`, `[MAP]` prefixes)
- Detailed error messages
- State inspection via browser console

### Maintainable
- Clear naming conventions
- Comprehensive comments
- Design documentation (DESIGN_SPEC.md)
- Change log (CHANGES.md)

## Future Enhancements

From user's notes in README:

### Planned Features
- 📊 Shareable player stats (🟩🟩🟥🟩 Found 3/4)
- 🏆 Achievements & badges ("Perfect Africa run")
- 📱 Mobile testing & optimization
- 💾 Save stats in cookies
- 👤 User accounts for persistent stats
- 📧 Feedback function (would need serverless backend)

### Advanced Ideas
- 🌍 Historical countries mode
- 📰 Current events integration (Wikipedia API + LLM processing)
- 📍 "Locate the city" mode (click on map)
- 🎓 International relations learning mode

## Lessons Learned

### What Worked Well
1. **Iterative development** - Small changes, immediate testing
2. **Debug logging** - Caught bugs faster with detailed console output
3. **User feedback loop** - Real-time adjustments based on actual usage
4. **Static-first approach** - No server complexity, easy deployment

### What Could Be Improved
1. **Data source** - Natural Earth 110m missing small countries
2. **Alias coverage** - Could add more country name variations
3. **Testing** - Automated tests would catch regressions

### Claude's Strengths
- **Rapid prototyping** - Design to working code in minutes
- **Debugging** - Systematic approach with logging
- **Iteration** - Quick adjustments based on feedback
- **Documentation** - Comprehensive markdown files

## Deployment

### Build
```bash
npm run build
```

### Output
```
dist/
├── index.html           (4.38 KB)
├── assets/
│   ├── index-*.css     (10.53 KB)
│   └── index-*.js      (87.15 KB)
└── data/
    ├── countries.json   (14 KB)
    ├── neighbors.json   (8.6 KB)
    └── world.topo.json  (250 KB)
```

### Deploy Anywhere
- Netlify / Vercel / GitHub Pages
- Any static host
- CDN-friendly
- No environment variables needed

## Credits

**Built with**: Claude Sonnet 4.5 (January 2026)

**Data**: Natural Earth (Public Domain)

**Libraries**: D3.js, TopoJSON, Turf.js, Vite

**Design Philosophy**: User-centered, iterative, accessible

---

*This project demonstrates how conversational AI can assist in full-stack development - from design to deployment - while maintaining high code quality and user experience.*
