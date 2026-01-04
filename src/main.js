/**
 * Main entry point
 */

import { loadGameData } from './data.js';
import { GameState } from './game.js';
import { UIManager } from './ui.js';
import { MapRenderer } from './map.js';

class Game {
    constructor() {
        this.gameState = null;
        this.uiManager = null;
        this.mapRenderer = null;
    }

    async init() {
        try {
            // Load game data
            console.log('Loading game data...');
            await loadGameData();
            console.log('Game data loaded successfully');

            // Initialize game state
            this.gameState = new GameState();

            // Initialize UI manager with callbacks
            this.uiManager = new UIManager(this.gameState, {
                onAddGuess: (countryName) => this.handleAddGuess(countryName),
                onRemoveGuess: (countryCode) => this.handleRemoveGuess(countryCode),
                onSubmit: () => this.handleSubmit(),
                onReveal: () => this.handleReveal()
            });

            // Initialize map renderer
            this.mapRenderer = new MapRenderer();
            this.mapRenderer.init();

            // Start first round
            this.startNewRound();

            // Hide loading, show game
            this.uiManager.hideLoading();
            this.uiManager.init();

            // Handle window resize
            window.addEventListener('resize', () => {
                this.mapRenderer.resize();
                if (this.gameState.submitted || this.gameState.revealed) {
                    this.updateMap();
                }
            });

        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError(error.message);
        }
    }

    startNewRound() {
        this.gameState.startNewRound();
        this.uiManager.resetForNewRound();
        console.log('New round started:', this.gameState.targetCountry.name);
    }

    handleAddGuess(countryName) {
        const result = this.gameState.addGuess(countryName);

        if (result.success) {
            console.log(`Added guess: ${countryName} - ${result.isCorrect ? 'Correct' : 'Incorrect'}`);
        } else {
            console.warn(`Failed to add guess: ${result.error}`);
        }

        return result;
    }

    handleRemoveGuess(countryCode) {
        const success = this.gameState.removeGuess(countryCode);
        if (success) {
            console.log(`Removed guess: ${countryCode}`);
        }
        return success;
    }

    handleSubmit() {
        const result = this.gameState.submit();

        if (result.success) {
            console.log('Submit result:', result);

            // Update UI
            this.uiManager.renderChips();
            this.uiManager.updateScores();
            this.uiManager.updateButtons();

            // Show map
            this.uiManager.showMap();
            this.updateMap();

            // Check if round is complete
            if (result.totalCorrect === result.totalNeighbors) {
                console.log('Round complete! All neighbors found.');
                setTimeout(() => {
                    if (confirm('Congratulations! All neighbors found. Start next round?')) {
                        this.nextRound();
                    }
                }, 1000);
            }
        } else {
            alert(result.error);
        }
    }

    handleReveal() {
        const result = this.gameState.reveal();
        console.log('Revealed remaining neighbors:', result);

        // Update UI
        this.uiManager.renderChips();
        this.uiManager.updateScores();
        this.uiManager.updateButtons();

        // Show/update map
        this.uiManager.showMap();
        this.updateMap();

        // Offer to continue
        setTimeout(() => {
            if (confirm('Round revealed. Start next round?')) {
                this.nextRound();
            }
        }, 1500);
    }

    updateMap() {
        const state = this.gameState.getState();

        const correctNeighbors = new Set(
            state.guesses
                .filter(g => g.correct)
                .map(g => g.code)
        );

        const allNeighbors = new Set(
            state.neighbors.map(n => n.code)
        );

        this.mapRenderer.render(
            state.targetCountryCode,
            correctNeighbors,
            allNeighbors
        );
    }

    nextRound() {
        this.gameState.nextRound();
        this.uiManager.resetForNewRound();
        console.log('Next round:', this.gameState.targetCountry.name);
    }

    showError(message) {
        const loadingState = document.getElementById('loading-state');
        loadingState.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p style="color: var(--rust); font-size: 1.2rem; margin-bottom: 1rem;">
                    ⚠️ Error Loading Game
                </p>
                <p style="color: var(--ink-light); margin-bottom: 1.5rem;">
                    ${message}
                </p>
                <p style="color: var(--sepia); font-size: 0.9rem;">
                    Please run <code style="background: var(--parchment); padding: 0.2rem 0.5rem; border-radius: 4px;">npm run prepare-data</code> to generate the required data files.
                </p>
            </div>
        `;
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const game = new Game();
        game.init();
    });
} else {
    const game = new Game();
    game.init();
}
