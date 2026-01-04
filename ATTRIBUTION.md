# Attribution & Licensing

## Geographic Data

### Natural Earth

This project uses geographic boundary data from **Natural Earth**.

- **Source**: [Natural Earth](https://www.naturalearthdata.com/)
- **Dataset**: Admin 0 – Countries (1:110m)
- **License**: Public Domain
- **Version**: Latest from GitHub repository

#### Natural Earth License

Natural Earth is a public domain dataset available for any purpose without restriction.

From the Natural Earth website:
> "Natural Earth is a public domain map dataset available at 1:10m, 1:50m, and 1:110m scales. Featuring tightly integrated vector and raster data, with Natural Earth you can make a variety of visually pleasing, well-crafted maps with cartography or GIS software."

**Credits**: Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com.

#### Specific Attribution

The country boundary data is derived from:
- Repository: https://github.com/nvkelso/natural-earth-vector
- File: `ne_110m_admin_0_countries.geojson`
- No attribution required, but appreciated

## Software Dependencies

### Runtime Dependencies

#### D3.js
- **License**: ISC License
- **Website**: https://d3js.org/
- **Purpose**: Map rendering and visualization
- **Copyright**: Copyright 2010-2023 Mike Bostock

#### TopoJSON Client
- **License**: ISC License
- **Website**: https://github.com/topojson/topojson-client
- **Purpose**: TopoJSON format parsing
- **Copyright**: Copyright 2012-2023 Mike Bostock

### Development Dependencies

#### Vite
- **License**: MIT License
- **Website**: https://vitejs.dev/
- **Purpose**: Build tool and development server

#### TopoJSON Server
- **License**: ISC License
- **Purpose**: GeoJSON to TopoJSON conversion

#### TopoJSON Simplify
- **License**: ISC License
- **Purpose**: Geometry simplification

#### Turf.js
- **License**: MIT License
- **Website**: https://turfjs.org/
- **Purpose**: Geospatial analysis for neighbor detection

## Fonts

### Comic Sans MS

- **License**: Proprietary font included with Microsoft Windows and Apple macOS
- **Fallback**: System `cursive` generic family
- **Usage**: Display and body text

This project does not distribute the font itself; it references the font by name and relies on it being installed on the user's system. If unavailable, the browser will fall back to the default cursive font.

## Project Code

All original code in this project (excluding dependencies) is available under the MIT License.

### MIT License

```
Copyright (c) 2026 Neighbor Countries Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Country Data Sources

Country names and ISO codes conform to:
- **ISO 3166-1 alpha-3**: International standard for country codes
- **UN Member States**: List of 193 United Nations member states as of 2024

Country aliases and alternative names are derived from common usage and may include:
- Common English names
- Official names in English
- Historical names in common use
- Abbreviations and acronyms

## Disclaimer

### Geographic Accuracy

This project uses geographic data for educational purposes. Borders and territorial definitions:

- Are derived from Natural Earth public domain data
- May not reflect current political situations
- Should not be used for legal or authoritative purposes
- Are simplified for web performance

For authoritative geographic information, consult official sources such as:
- United Nations Cartographic Section
- National mapping agencies
- International boundary commissions

### Political Neutrality

This project:
- Includes only UN member states (193 countries)
- Does not include disputed territories
- Does not make political claims about sovereignty
- Uses commonly accepted English names for countries

The inclusion or exclusion of any entity is based solely on UN membership status and not on any political position.

## Updates and Corrections

Geographic data and country information may change over time. If you notice:
- Incorrect borders
- Missing neighbors
- Outdated country names
- Inaccurate aliases

Please open an issue on the project repository with:
- Description of the issue
- Authoritative source for the correction
- Suggested fix

## Acknowledgments

Special thanks to:

- **Natural Earth** team for maintaining high-quality public domain geographic data
- **D3.js** and **Mike Bostock** for exceptional visualization tools
- **TopoJSON** format for efficient geographic data encoding
- **Turf.js** team for powerful geospatial operations
- The open-source community for all supporting libraries

## Contact

For licensing questions or attribution concerns, please open an issue on the project repository.

---

*Last updated: January 2026*
