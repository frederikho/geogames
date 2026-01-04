/**
 * UI components and interactions
 */

import { searchCountries, getCountries } from './data.js';

export class UIManager {
    constructor(gameState, callbacks = {}) {
        this.gameState = gameState;
        this.callbacks = callbacks;

        // DOM elements
        this.elements = {
            loadingState: document.getElementById('loading-state'),
            questionCard: document.getElementById('question-card'),
            inputSection: document.getElementById('input-section'),
            actions: document.getElementById('actions'),
            input: document.getElementById('country-input'),
            chipsContainer: document.getElementById('chips-container'),
            dropdown: document.getElementById('autocomplete-dropdown'),
            submitBtn: document.getElementById('submit-btn'),
            revealBtn: document.getElementById('reveal-btn'),
            mapContainer: document.getElementById('map-container'),
            mapLegend: document.getElementById('map-legend'),
            targetCountry: document.getElementById('target-country'),
            neighborCount: document.getElementById('neighbor-count'),
            foundCount: document.getElementById('found-count'),
            totalCount: document.getElementById('total-count'),
            score: document.getElementById('score'),
            penalties: document.getElementById('penalties'),
            roundNumber: document.getElementById('round-number')
        };

        this.selectedDropdownIndex = -1;
        this.availableSuggestions = [];

        this.bindEvents();
    }

    /**
     * Bind UI event handlers
     */
    bindEvents() {
        // Input events
        this.elements.input.addEventListener('input', (e) => this.handleInput(e));
        this.elements.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.elements.input.addEventListener('blur', () => {
            // Delay hiding dropdown to allow click events
            setTimeout(() => this.hideDropdown(), 200);
        });

        // Button events
        this.elements.submitBtn.addEventListener('click', () => {
            if (this.callbacks.onSubmit) {
                this.callbacks.onSubmit();
            }
        });

        this.elements.revealBtn.addEventListener('click', () => {
            if (this.callbacks.onReveal) {
                this.callbacks.onReveal();
            }
        });

        // Click outside to close dropdown
        document.addEventListener('click', (e) => {
            if (!this.elements.input.contains(e.target) &&
                !this.elements.dropdown.contains(e.target)) {
                this.hideDropdown();
            }
        });
    }

    /**
     * Handle input field changes
     */
    handleInput(e) {
        const value = e.target.value.trim();

        if (!value) {
            this.hideDropdown();
            return;
        }

        // Get already guessed country codes
        const excludeCodes = this.gameState.guesses.map(g => g.code);

        // Search for matching countries
        const results = searchCountries(value, excludeCodes);

        // Show dropdown
        this.showDropdown(results);
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(e) {
        const dropdownItems = this.elements.dropdown.querySelectorAll('.autocomplete-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedDropdownIndex = Math.min(
                this.selectedDropdownIndex + 1,
                dropdownItems.length - 1
            );
            this.updateDropdownSelection(dropdownItems);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedDropdownIndex = Math.max(this.selectedDropdownIndex - 1, -1);
            this.updateDropdownSelection(dropdownItems);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.selectedDropdownIndex >= 0 && dropdownItems[this.selectedDropdownIndex]) {
                const countryName = dropdownItems[this.selectedDropdownIndex].textContent;
                this.addChipFromInput(countryName);
            } else if (this.availableSuggestions.length === 1) {
                // Auto-select if only one suggestion
                this.addChipFromInput(this.availableSuggestions[0].name);
            }
        } else if (e.key === 'Escape') {
            this.hideDropdown();
        } else if (e.key === 'Backspace' && !e.target.value) {
            // Remove last chip on backspace when input is empty
            if (this.gameState.guesses.length > 0) {
                const lastGuess = this.gameState.guesses[this.gameState.guesses.length - 1];
                // Only remove if not locked (correct)
                if (!lastGuess.correct || !this.gameState.submitted) {
                    this.removeChip(lastGuess.code);
                }
            }
        }
    }

    /**
     * Update dropdown selection highlighting
     */
    updateDropdownSelection(items) {
        items.forEach((item, index) => {
            if (index === this.selectedDropdownIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    /**
     * Show autocomplete dropdown
     */
    showDropdown(suggestions) {
        this.availableSuggestions = suggestions;
        this.elements.dropdown.innerHTML = '';

        if (suggestions.length === 0) {
            this.hideDropdown();
            return;
        }

        // Limit to first 10 suggestions
        const displaySuggestions = suggestions.slice(0, 10);

        displaySuggestions.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = result.name;
            item.setAttribute('role', 'option');
            item.setAttribute('data-code', result.code);

            item.addEventListener('click', () => {
                this.addChipFromInput(result.name);
            });

            this.elements.dropdown.appendChild(item);
        });

        this.elements.dropdown.classList.remove('hidden');
        this.elements.input.setAttribute('aria-expanded', 'true');
        this.selectedDropdownIndex = -1;
    }

    /**
     * Hide autocomplete dropdown
     */
    hideDropdown() {
        this.elements.dropdown.classList.add('hidden');
        this.elements.input.setAttribute('aria-expanded', 'false');
        this.selectedDropdownIndex = -1;
    }

    /**
     * Add chip from input field
     */
    addChipFromInput(countryName) {
        if (this.callbacks.onAddGuess) {
            const result = this.callbacks.onAddGuess(countryName);
            if (result.success) {
                this.elements.input.value = '';
                this.hideDropdown();
                this.renderChips();
                this.updateScores();
            }
        }
    }

    /**
     * Remove a chip
     */
    removeChip(countryCode) {
        if (this.callbacks.onRemoveGuess) {
            this.callbacks.onRemoveGuess(countryCode);
            this.renderChips();
            this.updateScores();
        }
    }

    /**
     * Render chips
     */
    renderChips() {
        this.elements.chipsContainer.innerHTML = '';

        this.gameState.guesses.forEach(guess => {
            const chip = document.createElement('div');
            chip.className = 'chip';

            // Add state classes
            if (this.gameState.submitted || this.gameState.revealed) {
                if (guess.correct) {
                    chip.classList.add('correct');
                } else {
                    chip.classList.add('incorrect');
                }
            }

            const text = document.createElement('span');
            text.textContent = guess.name;
            chip.appendChild(text);

            // Add remove button (if not locked)
            const isLocked = this.gameState.revealed ||
                            (this.gameState.submitted && guess.correct);

            if (!isLocked) {
                const removeBtn = document.createElement('button');
                removeBtn.className = 'chip-remove';
                removeBtn.innerHTML = '×';
                removeBtn.setAttribute('aria-label', `Remove ${guess.name}`);
                removeBtn.onclick = () => this.removeChip(guess.code);
                chip.appendChild(removeBtn);
            }

            this.elements.chipsContainer.appendChild(chip);
        });

        // Update submit button state
        this.updateButtons();
    }

    /**
     * Update button states
     */
    updateButtons() {
        const state = this.gameState.getState();
        this.elements.submitBtn.disabled = !state.canSubmit;
        this.elements.revealBtn.disabled = state.revealed;
        this.elements.input.disabled = state.revealed;
    }

    /**
     * Update score displays
     */
    updateScores() {
        const state = this.gameState.getState();
        this.elements.foundCount.textContent = state.progress.found;
        this.elements.score.textContent = state.score;
        this.elements.penalties.textContent = state.penalties;
        this.elements.roundNumber.textContent = state.round;
    }

    /**
     * Show loading state
     */
    showLoading() {
        this.elements.loadingState.classList.remove('hidden');
        this.elements.questionCard.classList.add('hidden');
        this.elements.inputSection.classList.add('hidden');
        this.elements.actions.classList.add('hidden');
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.elements.loadingState.classList.add('hidden');
        this.elements.questionCard.classList.remove('hidden');
        this.elements.inputSection.classList.remove('hidden');
        this.elements.actions.classList.remove('hidden');
    }

    /**
     * Update question display
     */
    updateQuestion() {
        const state = this.gameState.getState();
        this.elements.targetCountry.textContent = state.targetCountry.name;
        this.elements.neighborCount.textContent = state.neighborCount;
        this.elements.totalCount.textContent = state.neighborCount;
        this.elements.foundCount.textContent = state.progress.found;
    }

    /**
     * Show map container
     */
    showMap() {
        this.elements.mapContainer.classList.remove('hidden');
        this.elements.mapLegend.classList.remove('hidden');
    }

    /**
     * Hide map container
     */
    hideMap() {
        this.elements.mapContainer.classList.add('hidden');
        this.elements.mapLegend.classList.add('hidden');
    }

    /**
     * Reset UI for new round
     */
    resetForNewRound() {
        this.elements.input.value = '';
        this.hideDropdown();
        this.hideMap();
        this.renderChips();
        this.updateQuestion();
        this.updateScores();
        this.updateButtons();
        this.elements.input.focus();
    }

    /**
     * Initialize UI
     */
    init() {
        this.updateQuestion();
        this.updateScores();
        this.renderChips();
        this.updateButtons();
        this.elements.input.focus();
    }
}
