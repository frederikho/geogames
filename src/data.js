/**
 * Data loading and management
 */

let countriesData = null;
let neighborsData = null;
let worldTopoData = null;

/**
 * Load all game data
 */
export async function loadGameData() {
    try {
        const [countries, neighbors, worldTopo] = await Promise.all([
            fetch('/data/countries.json').then(r => r.json()),
            fetch('/data/neighbors.json').then(r => r.json()),
            fetch('/data/world.topo.json').then(r => r.json())
        ]);

        countriesData = countries;
        neighborsData = neighbors;
        worldTopoData = worldTopo;

        return { countries, neighbors, worldTopo };
    } catch (error) {
        console.error('Error loading game data:', error);
        throw new Error('Failed to load game data. Please ensure data files are generated.');
    }
}

/**
 * Get all countries data
 */
export function getCountries() {
    return countriesData;
}

/**
 * Get neighbors for a specific country
 */
export function getNeighbors(countryCode) {
    return neighborsData[countryCode] || [];
}

/**
 * Get world topology data
 */
export function getWorldTopo() {
    return worldTopoData;
}

/**
 * Find a country by name or alias (case-insensitive, diacritic-insensitive)
 */
export function findCountryByName(name, countries = countriesData) {
    if (!countries) return null;

    const normalized = normalizeName(name);

    for (const country of Object.values(countries)) {
        // Check canonical name
        if (normalizeName(country.name) === normalized) {
            return country;
        }

        // Check aliases
        if (country.aliases) {
            for (const alias of country.aliases) {
                if (normalizeName(alias) === normalized) {
                    return country;
                }
            }
        }
    }

    return null;
}

/**
 * Get all countries that have at least one land neighbor
 */
export function getCountriesWithNeighbors() {
    if (!neighborsData || !countriesData) return [];

    return Object.entries(neighborsData)
        .filter(([code, neighbors]) => neighbors.length > 0)
        .map(([code]) => countriesData[code])
        .filter(Boolean);
}

/**
 * Search countries by partial name (for autocomplete)
 */
export function searchCountries(query, excludeCodes = []) {
    if (!countriesData || !query) return [];

    const normalized = normalizeName(query);
    const results = [];

    for (const [code, country] of Object.entries(countriesData)) {
        if (excludeCodes.includes(code)) continue;

        // Check if canonical name matches
        if (normalizeName(country.name).includes(normalized)) {
            results.push({ ...country, code, matchType: 'name' });
            continue;
        }

        // Check aliases
        if (country.aliases) {
            for (const alias of country.aliases) {
                if (normalizeName(alias).includes(normalized)) {
                    results.push({ ...country, code, matchType: 'alias' });
                    break;
                }
            }
        }
    }

    // Sort by match quality: exact matches first, then by length
    results.sort((a, b) => {
        const aName = normalizeName(a.name);
        const bName = normalizeName(b.name);

        const aExact = aName === normalized;
        const bExact = bName === normalized;

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        return aName.length - bName.length;
    });

    return results;
}

/**
 * Normalize a string for comparison (lowercase, remove diacritics, remove punctuation)
 */
function normalizeName(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

/**
 * Get a random country with neighbors
 */
export function getRandomCountryWithNeighbors() {
    const candidates = getCountriesWithNeighbors();
    if (candidates.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
}
