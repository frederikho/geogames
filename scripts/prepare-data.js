#!/usr/bin/env node

/**
 * Data preparation script
 *
 * This script:
 * 1. Downloads Natural Earth country boundaries (or reads from data/raw/)
 * 2. Filters to UN member states only
 * 3. Converts to TopoJSON and simplifies
 * 4. Computes land-border neighbors
 * 5. Generates countries.json with aliases
 * 6. Outputs to public/data/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as topojson from 'topojson-server';
import * as toposimplify from 'topojson-simplify';
import * as turf from '@turf/turf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DATA_RAW_DIR = path.join(rootDir, 'data', 'raw');
const DATA_OUTPUT_DIR = path.join(rootDir, 'public', 'data');

// UN Member States (193 countries) - ISO 3166-1 alpha-3 codes
const UN_MEMBER_STATES = new Set([
    'AFG', 'ALB', 'DZA', 'AND', 'AGO', 'ATG', 'ARG', 'ARM', 'AUS', 'AUT',
    'AZE', 'BHS', 'BHR', 'BGD', 'BRB', 'BLR', 'BEL', 'BLZ', 'BEN', 'BTN',
    'BOL', 'BIH', 'BWA', 'BRA', 'BRN', 'BGR', 'BFA', 'BDI', 'CPV', 'KHM',
    'CMR', 'CAN', 'CAF', 'TCD', 'CHL', 'CHN', 'COL', 'COM', 'COG', 'COD',
    'CRI', 'CIV', 'HRV', 'CUB', 'CYP', 'CZE', 'DNK', 'DJI', 'DMA', 'DOM',
    'ECU', 'EGY', 'SLV', 'GNQ', 'ERI', 'EST', 'SWZ', 'ETH', 'FJI', 'FIN',
    'FRA', 'GAB', 'GMB', 'GEO', 'DEU', 'GHA', 'GRC', 'GRD', 'GTM', 'GIN',
    'GNB', 'GUY', 'HTI', 'HND', 'HUN', 'ISL', 'IND', 'IDN', 'IRN', 'IRQ',
    'IRL', 'ISR', 'ITA', 'JAM', 'JPN', 'JOR', 'KAZ', 'KEN', 'KIR', 'PRK',
    'KOR', 'KWT', 'KGZ', 'LAO', 'LVA', 'LBN', 'LSO', 'LBR', 'LBY', 'LIE',
    'LTU', 'LUX', 'MDG', 'MWI', 'MYS', 'MDV', 'MLI', 'MLT', 'MHL', 'MRT',
    'MUS', 'MEX', 'FSM', 'MDA', 'MCO', 'MNG', 'MNE', 'MAR', 'MOZ', 'MMR',
    'NAM', 'NRU', 'NPL', 'NLD', 'NZL', 'NIC', 'NER', 'NGA', 'MKD', 'NOR',
    'OMN', 'PAK', 'PLW', 'PAN', 'PNG', 'PRY', 'PER', 'PHL', 'POL', 'PRT',
    'QAT', 'ROU', 'RUS', 'RWA', 'KNA', 'LCA', 'VCT', 'WSM', 'SMR', 'STP',
    'SAU', 'SEN', 'SRB', 'SYC', 'SLE', 'SGP', 'SVK', 'SVN', 'SLB', 'SOM',
    'ZAF', 'SSD', 'ESP', 'LKA', 'SDN', 'SUR', 'SWE', 'CHE', 'SYR', 'TJK',
    'TZA', 'THA', 'TLS', 'TGO', 'TON', 'TTO', 'TUN', 'TUR', 'TKM', 'TUV',
    'UGA', 'UKR', 'ARE', 'GBR', 'USA', 'URY', 'UZB', 'VUT', 'VEN', 'VNM',
    'YEM', 'ZMB', 'ZWE'
]);

// Country name aliases and alternative names
const COUNTRY_ALIASES = {
    'USA': ['United States', 'United States of America', 'America', 'US', 'U.S.A.', 'U.S.'],
    'GBR': ['United Kingdom', 'UK', 'Britain', 'Great Britain'],
    'RUS': ['Russia', 'Russian Federation'],
    'CHN': ['China', 'People\'s Republic of China', 'PRC'],
    'PRK': ['North Korea', 'Democratic People\'s Republic of Korea', 'DPRK'],
    'KOR': ['South Korea', 'Republic of Korea', 'ROK'],
    'COD': ['Democratic Republic of the Congo', 'DRC', 'DR Congo', 'Congo-Kinshasa'],
    'COG': ['Republic of the Congo', 'Congo', 'Congo-Brazzaville'],
    'CIV': ['Ivory Coast', 'Côte d\'Ivoire'],
    'MKD': ['North Macedonia', 'Macedonia', 'FYROM'],
    'LAO': ['Laos', 'Lao People\'s Democratic Republic'],
    'VNM': ['Vietnam', 'Viet Nam'],
    'SYR': ['Syria', 'Syrian Arab Republic'],
    'BOL': ['Bolivia', 'Plurinational State of Bolivia'],
    'VEN': ['Venezuela', 'Bolivarian Republic of Venezuela'],
    'TZA': ['Tanzania', 'United Republic of Tanzania'],
    'IRN': ['Iran', 'Islamic Republic of Iran'],
    'BRN': ['Brunei', 'Brunei Darussalam'],
    'FSM': ['Micronesia', 'Federated States of Micronesia'],
    'MDA': ['Moldova', 'Republic of Moldova'],
    'PSE': ['Palestine', 'State of Palestine'], // Note: Not UN member but often referenced
};

/**
 * Ensure directories exist
 */
function ensureDirectories() {
    if (!fs.existsSync(DATA_RAW_DIR)) {
        fs.mkdirSync(DATA_RAW_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_OUTPUT_DIR)) {
        fs.mkdirSync(DATA_OUTPUT_DIR, { recursive: true });
    }
}

/**
 * Download Natural Earth data
 */
async function downloadNaturalEarth() {
    const url = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
    const outputPath = path.join(DATA_RAW_DIR, 'countries.geojson');

    console.log('Downloading Natural Earth country boundaries...');
    console.log(`URL: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`✓ Downloaded to ${outputPath}`);

        return data;
    } catch (error) {
        console.error('Error downloading Natural Earth data:', error.message);
        console.log('\nAlternatively, you can manually download from:');
        console.log('https://www.naturalearthdata.com/downloads/110m-cultural-vectors/');
        console.log('And place the GeoJSON file at: data/raw/countries.geojson\n');
        throw error;
    }
}

/**
 * Load source data
 */
async function loadSourceData() {
    const filePath = path.join(DATA_RAW_DIR, 'countries.geojson');

    if (fs.existsSync(filePath)) {
        console.log('Loading existing GeoJSON data...');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return data;
    } else {
        return await downloadNaturalEarth();
    }
}

/**
 * Filter to UN member states
 */
function filterToUNMembers(geojson) {
    console.log('Filtering to UN member states...');

    const filtered = {
        type: 'FeatureCollection',
        features: geojson.features.filter(feature => {
            // Use ADM0_A3 as primary (more reliable than ISO_A3 in Natural Earth data)
            const iso3 = feature.properties.ADM0_A3 || feature.properties.ISO_A3;
            return iso3 && UN_MEMBER_STATES.has(iso3);
        })
    };

    // Normalize properties
    filtered.features = filtered.features.map(feature => {
        // Use ADM0_A3 as primary, fallback to ISO_A3 (Natural Earth has some -99 values for ISO_A3)
        const iso3 = feature.properties.ADM0_A3 || feature.properties.ISO_A3;
        return {
            ...feature,
            id: iso3,
            properties: {
                iso_a3: iso3,
                name: feature.properties.NAME || feature.properties.ADMIN,
                name_long: feature.properties.NAME_LONG || feature.properties.ADMIN,
            }
        };
    });

    console.log(`✓ Filtered to ${filtered.features.length} countries`);
    return filtered;
}

/**
 * Convert to TopoJSON and simplify
 */
function convertToTopoJSON(geojson) {
    console.log('Converting to TopoJSON and simplifying...');

    // Convert to TopoJSON
    const topology = topojson.topology({ countries: geojson });

    // Simplify (reduce file size while maintaining shape)
    const simplified = toposimplify.presimplify(topology);
    const result = toposimplify.simplify(simplified, 0.5); // Adjust for quality vs size

    console.log('✓ Converted and simplified');
    return result;
}

/**
 * Compute land-border neighbors using geometric operations
 */
function computeNeighbors(geojson) {
    console.log('Computing land-border neighbors...');

    const neighbors = {};
    const features = geojson.features;

    // Initialize empty neighbor lists
    features.forEach(feature => {
        const code = feature.id || feature.properties.iso_a3;
        neighbors[code] = [];
    });

    // Check all pairs of countries
    for (let i = 0; i < features.length; i++) {
        const feature1 = features[i];
        const code1 = feature1.id || feature1.properties.iso_a3;

        for (let j = i + 1; j < features.length; j++) {
            const feature2 = features[j];
            const code2 = feature2.id || feature2.properties.iso_a3;

            try {
                // Check if geometries intersect (share a border)
                // We use a small buffer to catch borders that are very close
                const intersects = turf.booleanIntersects(feature1, feature2);

                if (intersects) {
                    // They share a border
                    neighbors[code1].push(code2);
                    neighbors[code2].push(code1);
                }
            } catch (error) {
                // Some geometries might be invalid, skip them
                console.warn(`Warning: Could not check intersection between ${code1} and ${code2}`);
            }
        }

        // Progress indicator
        if ((i + 1) % 20 === 0) {
            console.log(`  Processed ${i + 1}/${features.length} countries`);
        }
    }

    console.log('✓ Computed neighbors');
    return neighbors;
}

/**
 * Generate countries metadata
 */
function generateCountriesMetadata(geojson) {
    console.log('Generating countries metadata...');

    const countries = {};

    geojson.features.forEach(feature => {
        const code = feature.id || feature.properties.iso_a3;
        const name = feature.properties.name;

        countries[code] = {
            code,
            name,
            aliases: COUNTRY_ALIASES[code] || []
        };
    });

    console.log(`✓ Generated metadata for ${Object.keys(countries).length} countries`);
    return countries;
}

/**
 * Write output files
 */
function writeOutputFiles(worldTopo, neighbors, countries) {
    console.log('Writing output files...');

    const files = [
        { name: 'world.topo.json', data: worldTopo },
        { name: 'neighbors.json', data: neighbors },
        { name: 'countries.json', data: countries }
    ];

    files.forEach(({ name, data }) => {
        const filePath = path.join(DATA_OUTPUT_DIR, name);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✓ Wrote ${filePath}`);
    });
}

/**
 * Print summary statistics
 */
function printSummary(countries, neighbors) {
    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log('='.repeat(60));

    const totalCountries = Object.keys(countries).length;
    const countriesWithNeighbors = Object.entries(neighbors)
        .filter(([_, n]) => n.length > 0)
        .length;

    console.log(`Total countries: ${totalCountries}`);
    console.log(`Countries with land neighbors: ${countriesWithNeighbors}`);
    console.log(`Countries without land neighbors: ${totalCountries - countriesWithNeighbors}`);

    // Find country with most neighbors
    const mostNeighbors = Object.entries(neighbors)
        .reduce((max, [code, n]) => {
            return n.length > max.count ? { code, count: n.length } : max;
        }, { code: null, count: 0 });

    if (mostNeighbors.code) {
        const countryName = countries[mostNeighbors.code].name;
        console.log(`\nMost neighbors: ${countryName} (${mostNeighbors.count})`);
    }

    console.log('\nExample neighbors:');
    const examples = ['USA', 'CHN', 'BRA', 'DEU', 'CHE'];
    examples.forEach(code => {
        if (neighbors[code]) {
            const name = countries[code].name;
            const neighborNames = neighbors[code]
                .map(n => countries[n].name)
                .join(', ');
            console.log(`  ${name}: ${neighborNames}`);
        }
    });

    console.log('='.repeat(60) + '\n');
}

/**
 * Main execution
 */
async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('Neighbor Countries - Data Preparation');
    console.log('='.repeat(60) + '\n');

    try {
        // Step 1: Ensure directories exist
        ensureDirectories();

        // Step 2: Load source data
        const sourceData = await loadSourceData();

        // Step 3: Filter to UN member states
        const filtered = filterToUNMembers(sourceData);

        // Step 4: Compute neighbors (before simplification for accuracy)
        const neighbors = computeNeighbors(filtered);

        // Step 5: Convert to TopoJSON and simplify
        const worldTopo = convertToTopoJSON(filtered);

        // Step 6: Generate countries metadata
        const countries = generateCountriesMetadata(filtered);

        // Step 7: Write output files
        writeOutputFiles(worldTopo, neighbors, countries);

        // Step 8: Print summary
        printSummary(countries, neighbors);

        console.log('✓ Data preparation complete!\n');
        console.log('You can now run: npm run dev\n');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run main function
main();
