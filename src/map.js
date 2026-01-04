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

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        // Setup projection
        this.projection = d3.geoNaturalEarth1()
            .fitSize([this.width, this.height], { type: 'Sphere' });

        this.path = d3.geoPath().projection(this.projection);
    }

    /**
     * Render the map with highlighted countries
     * @param {string} targetCountryCode - The target country code
     * @param {Set} correctNeighbors - Set of correctly guessed neighbor codes
     * @param {Set} allNeighbors - Set of all neighbor codes
     */
    render(targetCountryCode, correctNeighbors, allNeighbors) {
        const worldTopo = getWorldTopo();
        if (!worldTopo) {
            console.error('World topology data not loaded');
            return;
        }

        // Convert TopoJSON to GeoJSON
        const countries = topojson.feature(worldTopo, worldTopo.objects.countries);

        // Clear existing map
        this.svg.selectAll('*').remove();

        // Create container group
        const g = this.svg.append('g');

        // Draw all countries
        g.selectAll('path')
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
                    return 'var(--terracotta-dark)';
                } else if (allNeighbors.has(code)) {
                    return 'var(--sepia-dark)';
                } else {
                    return 'var(--sepia)';
                }
            })
            .attr('stroke-width', d => {
                const code = d.properties.iso_a3 || d.id;
                return (code === targetCountryCode || allNeighbors.has(code)) ? 2 : 0.5;
            })
            .attr('fill', d => {
                const code = d.properties.iso_a3 || d.id;

                if (code === targetCountryCode) {
                    return 'var(--terracotta)';
                } else if (correctNeighbors.has(code)) {
                    return 'var(--sage)';
                } else if (allNeighbors.has(code)) {
                    return 'white';
                } else {
                    return 'var(--parchment)';
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
            .style('font-family', 'Comic Sans MS, cursive')
            .style('font-size', '11px')
            .style('font-weight', d => {
                const code = d.properties.iso_a3 || d.id;
                return code === targetCountryCode ? 'bold' : 'normal';
            })
            .style('fill', d => {
                const code = d.properties.iso_a3 || d.id;
                return code === targetCountryCode ? 'white' : 'var(--ink)';
            })
            .style('pointer-events', 'none')
            .style('text-shadow', d => {
                const code = d.properties.iso_a3 || d.id;
                return code === targetCountryCode
                    ? '1px 1px 2px rgba(0,0,0,0.5)'
                    : '1px 1px 2px rgba(255,255,255,0.8)';
            })
            .text(d => d.properties.name || d.properties.iso_a3 || d.id);

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
