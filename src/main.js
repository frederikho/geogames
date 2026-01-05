/**
 * Main entry point
 */

import { loadGameData } from './data.js';
import { GameState } from './game.js';
import { UIManager, SettingsManager } from './ui.js';
import { MapRenderer } from './map.js';

class Game {
    constructor() {
        this.gameState = null;
        this.uiManager = null;
        this.mapRenderer = null;
        this.settingsManager = null;
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
                onNextRound: () => this.nextRound()
            });

            // Initialize settings manager
            this.settingsManager = new SettingsManager(this.gameState, {
                onRegionChange: (regionId) => this.handleRegionChange(regionId)
            });

            // Initialize map renderer (will be properly sized when first shown)
            this.mapRenderer = new MapRenderer();

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

            // Initialize map with correct dimensions (now that container is visible)
            this.mapRenderer.init();
            this.updateMap();

            // Next Round button is now visible, no modal needed
        } else {
            alert(result.error); // Simple error alert for edge cases
        }
    }

    showNextRoundModal(result) {
        const { newCorrect, newIncorrect, missed } = result;

        let message = '';
        if (newCorrect > 0) {
            message += `✅ Correct: ${newCorrect}\n`;
        }
        if (newIncorrect > 0) {
            message += `❌ Wrong guesses: ${newIncorrect}\n`;
        }
        if (missed > 0) {
            message += `⚠️ Missed neighbors: ${missed}\n`;
        }

        this.showModal(
            'Round Complete!',
            message || 'Round finished.',
            'Next Round',
            () => this.nextRound()
        );
    }

    showErrorModal(message) {
        this.showModal('Error', message, 'OK', () => {});
    }

    showModal(title, content, buttonText, onConfirm) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';

        modal.innerHTML = `
            <h3 class="modal-title">${title}</h3>
            <div class="modal-content">${content.replace(/\n/g, '<br>')}</div>
            <div class="modal-actions">
                <button class="modal-btn modal-btn-primary">${buttonText}</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Handle button click
        const button = modal.querySelector('.modal-btn-primary');
        button.addEventListener('click', () => {
            document.body.removeChild(overlay);
            onConfirm();
        });

        // Handle overlay click (close)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });

        // Focus the button
        setTimeout(() => button.focus(), 100);
    }

    updateMap() {
        const state = this.gameState.getState();

        // Only include neighbors the user actually guessed (not auto-revealed)
        const correctNeighbors = new Set(
            state.guesses
                .filter(g => g.correct && !g.revealed)
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

    handleRegionChange(regionId) {
        console.log('Region changed to:', regionId);
        this.gameState.changeRegion(regionId);
        this.uiManager.resetForNewRound();
        console.log('New round with region:', regionId, '- Country:', this.gameState.targetCountry.name);
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
