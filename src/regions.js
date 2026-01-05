/**
 * Regional groupings for game modes
 */

export const REGIONS = {
    ALL: {
        id: 'ALL',
        name: 'All Regions',
        description: 'All 164 countries with land borders',
        countries: null // null means all countries
    },

    WESTERN_HEMISPHERE: {
        id: 'WESTERN_HEMISPHERE',
        name: 'Western Hemisphere',
        description: 'Countries in North and South America',
        countries: [
            // North America
            'CAN', 'USA', 'MEX',
            // Central America
            'GTM', 'BLZ', 'SLV', 'HND', 'NIC', 'CRI', 'PAN',
            // Caribbean
            'CUB', 'HTI', 'DOM', 'JAM', 'TTO', 'BHS',
            // South America
            'ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU', 'GUY',
            'PRY', 'PER', 'SUR', 'URY', 'VEN',
            // France (due to French Guiana bordering Brazil and Suriname)
            'FRA'
        ]
    },

    EUROPE: {
        id: 'EUROPE',
        name: 'Europe',
        description: 'European countries',
        countries: [
            // Northern Europe
            'NOR', 'SWE', 'FIN', 'ISL', 'IRL', 'GBR', 'DNK',
            // Western Europe
            'NLD', 'BEL', 'LUX', 'DEU', 'FRA', 'ESP', 'PRT',
            'ITA', 'CHE', 'AUT',
            // Central Europe
            'POL', 'CZE', 'SVK', 'HUN',
            // Southern Europe
            'SVN', 'HRV', 'BIH', 'SRB', 'MNE', 'MKD', 'ALB',
            'GRC', 'BGR', 'ROU',
            // Eastern Europe
            'MDA', 'UKR', 'BLR', 'LTU', 'LVA', 'EST', 'RUS'
        ]
    },

    AFRICA: {
        id: 'AFRICA',
        name: 'Africa',
        description: 'African countries',
        countries: [
            // North Africa
            'DZA', 'EGY', 'LBY', 'TUN', 'MAR', 'SDN',
            // West Africa
            'TCD', 'NER', 'MLI', 'MRT', 'SEN', 'GMB', 'GNB',
            'GIN', 'SLE', 'LBR', 'CIV', 'GHA', 'TGO', 'BEN', 'NGA',
            // Central Africa
            'CMR', 'CAF', 'COG', 'GAB', 'GNQ', 'COD', 'AGO',
            // East Africa
            'SOM', 'ETH', 'ERI', 'DJI', 'KEN', 'UGA', 'RWA',
            'BDI', 'TZA', 'MDG',
            // Southern Africa
            'ZMB', 'ZWE', 'BWA', 'NAM', 'ZAF', 'LSO', 'SWZ',
            'MOZ', 'MWI'
        ]
    },

    ASIA: {
        id: 'ASIA',
        name: 'Asia',
        description: 'Asian countries (including Middle East and Oceania)',
        countries: [
            // Middle East
            'TUR', 'SYR', 'LBN', 'ISR', 'JOR', 'IRQ', 'IRN',
            'SAU', 'YEM', 'OMN', 'ARE', 'QAT', 'KWT', 'CYP',
            // South Asia
            'AFG', 'PAK', 'IND', 'BGD', 'BTN', 'NPL', 'LKA',
            // Southeast Asia
            'MMR', 'THA', 'LAO', 'KHM', 'VNM', 'IDN', 'MYS',
            'BRN', 'TLS', 'PNG', 'PHL',
            // East Asia
            'CHN', 'MNG', 'PRK', 'KOR', 'JPN',
            // Central Asia
            'KAZ', 'UZB', 'TKM', 'TJK', 'KGZ', 'ARM', 'AZE', 'GEO',
            // Oceania
            'AUS', 'NZL', 'FJI', 'VUT', 'SLB'
        ]
    },

    MOST_DIFFICULT: {
        id: 'MOST_DIFFICULT',
        name: 'Most Difficult',
        description: 'Countries with 7 or more neighbors',
        countries: [
            'TZA', // 8 neighbors
            'COD', // 8 neighbors
            'RUS', // 14 neighbors
            'BRA', // 10 neighbors
            'FRA', // 8 neighbors
            'MLI', // 7 neighbors
            'NER', // 8 neighbors
            'CMR', // 7 neighbors
            'ZMB', // 8 neighbors
            'IRN', // 7 neighbors
            'UKR', // 7 neighbors
            'POL', // 7 neighbors
            'AUT', // 7 neighbors
            'HUN', // 7 neighbors
            'DEU', // 9 neighbors
            'TUR', // 8 neighbors
            'CHN', // 14 neighbors
            'SAU', // 7 neighbors
            'SRB'  // 7 neighbors
        ]
    }
};

/**
 * Get region by ID
 */
export function getRegion(regionId) {
    return REGIONS[regionId] || REGIONS.ALL;
}

/**
 * Get all available regions as an array
 */
export function getAllRegions() {
    return Object.values(REGIONS);
}

/**
 * Check if a country belongs to a specific region
 */
export function isCountryInRegion(countryCode, regionId) {
    const region = getRegion(regionId);

    // If region is ALL or has null countries list, all countries are included
    if (!region.countries) {
        return true;
    }

    return region.countries.includes(countryCode);
}

/**
 * Filter countries by region
 */
export function filterCountriesByRegion(countries, regionId) {
    const region = getRegion(regionId);

    // If region is ALL or has null countries list, return all countries
    if (!region.countries) {
        return countries;
    }

    // Filter countries object to only include those in the region
    const filtered = {};
    for (const [code, country] of Object.entries(countries)) {
        if (region.countries.includes(code)) {
            filtered[code] = country;
        }
    }

    return filtered;
}
