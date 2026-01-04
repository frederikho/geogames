/**
 * Map rendering with D3 and TopoJSON
 */

import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { getWorldTopo } from './data.js';

export class MapRenderer {
    constructor(svgElementId = 'map-svg') {
        this.svgElement = document.getElementById(svgElementId);
        this.svg = d3.select(`#${svgElementId}`);
        this.width = 0;
        this.height = 0;
        this.projection = null;
        this.path = null;
    }

    /**
     * Initialize the map
     */
    init() {
        // Set dimensions
        const container = this.svgElement.parentElement;
        this.width = container.clientWidth;
        this.height = Math.max(400, Math.min(600, this.width * 0.6));

        console.log('[MAP] Initializing map:', {
            width: this.width,
            height: this.height,
            container: container
        });

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        // Setup projection
        this.projection = d3.geoNaturalEarth1()
            .fitSize([this.width, this.height], { type: 'Sphere' });

        this.path = d3.geoPath().projection(this.projection);

        console.log('[MAP] Projection and path generator created');
    }

    /**
     * Render the map with highlighted countries
     * @param {string} targetCountryCode - The target country code
     * @param {Set} correctNeighbors - Set of correctly guessed neighbor codes
     * @param {Set} allNeighbors - Set of all neighbor codes
     */
    render(targetCountryCode, correctNeighbors, allNeighbors) {
        console.log('[MAP] Render called with:', {
            targetCountryCode,
            correctNeighbors: Array.from(correctNeighbors),
            allNeighbors: Array.from(allNeighbors)
        });

        const worldTopo = getWorldTopo();
        if (!worldTopo) {
            console.error('[MAP] World topology data not loaded');
            return;
        }

        console.log('[MAP] WorldTopo loaded:', {
            type: worldTopo.type,
            objects: Object.keys(worldTopo.objects),
            arcs: worldTopo.arcs ? worldTopo.arcs.length : 0
        });

        // Convert TopoJSON to GeoJSON
        const countries = topojson.feature(worldTopo, worldTopo.objects.countries);

        console.log('[MAP] Converted to GeoJSON:', {
            type: countries.type,
            featureCount: countries.features.length,
            firstFeature: countries.features[0]
        });

        // Filter to only relevant countries (target + neighbors)
        const relevantCodes = new Set([targetCountryCode, ...Array.from(allNeighbors)]);
        const relevantCountries = countries.features.filter(d => {
            const code = d.properties.iso_a3 || d.id;
            return relevantCodes.has(code);
        });

        console.log('[MAP] Relevant countries:', {
            codes: Array.from(relevantCodes),
            count: relevantCountries.length
        });

        // Create a feature collection of just relevant countries for bounds calculation
        const relevantFeatureCollection = {
            type: 'FeatureCollection',
            features: relevantCountries
        };

        // Recalculate projection to fit relevant countries
        this.projection = d3.geoNaturalEarth1()
            .fitSize([this.width, this.height], relevantFeatureCollection);
        this.path = d3.geoPath().projection(this.projection);

        console.log('[MAP] Projection updated to fit relevant countries');

        // Clear existing map
        this.svg.selectAll('*').remove();

        // Create container group
        const g = this.svg.append('g');

        // Draw all countries
        const paths = g.selectAll('path')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('class', d => {
                const code = d.properties.iso_a3 || d.id;

                if (code === targetCountryCode) {
                    return 'map-country map-target';
                } else if (correctNeighbors.has(code)) {
                    return 'map-country map-correct';
                } else if (allNeighbors.has(code)) {
                    return 'map-country map-missing';
                } else {
                    return 'map-country map-other';
                }
            })
            .attr('stroke', d => {
                const code = d.properties.iso_a3 || d.id;

                if (code === targetCountryCode) {
                    return '#A85A4F'; // terracotta-dark
                } else if (allNeighbors.has(code)) {
                    return '#6B5845'; // sepia-dark
                } else {
                    return '#8B7355'; // sepia
                }
            })
            .attr('stroke-width', d => {
                const code = d.properties.iso_a3 || d.id;
                return (code === targetCountryCode || allNeighbors.has(code)) ? 2 : 0.5;
            })
            .attr('fill', d => {
                const code = d.properties.iso_a3 || d.id;

                if (code === targetCountryCode) {
                    return '#C97064'; // terracotta
                } else if (correctNeighbors.has(code)) {
                    return '#9CAF88'; // sage (user guessed correctly)
                } else if (allNeighbors.has(code)) {
                    return '#D4A574'; // ochre (missed/revealed)
                } else {
                    return '#EDD9C0'; // parchment
                }
            })
            .attr('fill-opacity', d => {
                const code = d.properties.iso_a3 || d.id;

                if (code === targetCountryCode || allNeighbors.has(code)) {
                    return 1;
                } else {
                    return 0.3;
                }
            })
            .attr('stroke-dasharray', d => {
                const code = d.properties.iso_a3 || d.id;

                // Dashed border for missing neighbors
                if (allNeighbors.has(code) && !correctNeighbors.has(code) && code !== targetCountryCode) {
                    return '4,4';
                }
                return null;
            });

        console.log('[MAP] Paths created:', {
            pathCount: paths.size(),
            samplePath: paths.nodes()[0] ? {
                d: paths.nodes()[0].getAttribute('d'),
                fill: paths.nodes()[0].getAttribute('fill'),
                stroke: paths.nodes()[0].getAttribute('stroke')
            } : null
        });

        // Add country labels for target and neighbors
        const labelCountries = countries.features.filter(d => {
            const code = d.properties.iso_a3 || d.id;
            return code === targetCountryCode || allNeighbors.has(code);
        });

        g.selectAll('text')
            .data(labelCountries)
            .enter()
            .append('text')
            .attr('transform', d => {
                const centroid = this.path.centroid(d);
                return `translate(${centroid})`;
            })
            .attr('text-anchor', 'middle')
            .attr('class', 'map-label')
            .style('font-family', 'sans-serif')
            .style('font-size', '11px')
            .style('font-weight', d => {
                const code = d.properties.iso_a3 || d.id;
                return code === targetCountryCode ? 'bold' : 'normal';
            })
            .style('fill', d => {
                const code = d.properties.iso_a3 || d.id;
                return code === targetCountryCode ? 'white' : '#3D3226'; // ink color
            })
            .style('pointer-events', 'none')
            .style('text-shadow', d => {
                const code = d.properties.iso_a3 || d.id;
                return code === targetCountryCode
                    ? '1px 1px 2px rgba(0,0,0,0.5)'
                    : '1px 1px 2px rgba(255,255,255,0.8)';
            })
            .text(d => d.properties.name || d.properties.iso_a3 || d.id);

        console.log('[MAP] Labels created:', {
            labelCount: labelCountries.length
        });

        // Add zoom behavior (optional enhancement)
        this.addZoomBehavior(g, targetCountryCode, allNeighbors);
    }

    /**
     * Add zoom/pan behavior to the map
     */
    addZoomBehavior(g, targetCountryCode, neighbors) {
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        this.svg.call(zoom);

        // Auto-zoom to target country and neighbors
        // This provides a better view of the relevant area
        // For now, keep the default view
        // Future enhancement: calculate bounding box and zoom to fit
    }

    /**
     * Clear the map
     */
    clear() {
        this.svg.selectAll('*').remove();
    }

    /**
     * Resize handler
     */
    resize() {
        this.init();
    }
}
