/**
 * Game state management
 */

import { getNeighbors, getCountries, getRandomCountryWithNeighbors, findCountryByName } from './data.js';

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.targetCountry = null;
        this.targetCountryCode = null;
        this.neighbors = []; // Array of country codes
        this.neighborCountries = []; // Array of country objects
        this.guesses = []; // Array of { code, name, correct }
        this.correctGuesses = new Set(); // Set of correct country codes
        this.incorrectGuesses = new Set(); // Set of incorrect country codes (for penalties)
        this.submitted = false;
        this.revealed = false;
        this.score = 0;
        this.penalties = 0;
        this.round = 1;
    }

    /**
     * Start a new round with a random country
     */
    startNewRound() {
        const country = getRandomCountryWithNeighbors();
        if (!country) {
            throw new Error('No countries with neighbors available');
        }

        this.targetCountry = country;
        this.targetCountryCode = country.code;
        this.neighbors = getNeighbors(country.code);

        const countries = getCountries();
        this.neighborCountries = this.neighbors.map(code => ({
            ...countries[code],
            code
        }));

        // Reset round-specific state
        this.guesses = [];
        this.correctGuesses = new Set();
        // Keep incorrectGuesses for cumulative penalty tracking
        this.submitted = false;
        this.revealed = false;
    }

    /**
     * Add a guess
     */
    addGuess(countryName) {
        // Find the country
        const country = findCountryByName(countryName);
        if (!country) {
            return { success: false, error: 'Country not found' };
        }

        // Check for duplicates
        const existing = this.guesses.find(g => g.code === country.code);
        if (existing) {
            return { success: false, error: 'Already guessed' };
        }

        // Check if it's a valid neighbor
        const isCorrect = this.neighbors.includes(country.code);

        this.guesses.push({
            code: country.code,
            name: country.name,
            correct: isCorrect
        });

        return { success: true, country, isCorrect };
    }

    /**
     * Remove a guess
     */
    removeGuess(countryCode) {
        const index = this.guesses.findIndex(g => g.code === countryCode);
        if (index !== -1) {
            this.guesses.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Submit current guesses for validation
     */
    submit() {
        if (this.guesses.length === 0) {
            return { success: false, error: 'No guesses to submit' };
        }

        this.submitted = true;

        let newCorrect = 0;
        let newIncorrect = 0;

        this.guesses.forEach(guess => {
            if (guess.correct) {
                if (!this.correctGuesses.has(guess.code)) {
                    this.correctGuesses.add(guess.code);
                    this.score++;
                    newCorrect++;
                }
            } else {
                // Only penalize new incorrect guesses
                if (!this.incorrectGuesses.has(guess.code)) {
                    this.incorrectGuesses.add(guess.code);
                    this.penalties++;
                    newIncorrect++;
                }
            }
        });

        return {
            success: true,
            newCorrect,
            newIncorrect,
            totalCorrect: this.correctGuesses.size,
            totalNeighbors: this.neighbors.length
        };
    }

    /**
     * Reveal all remaining neighbors
     */
    reveal() {
        this.revealed = true;

        // Add all neighbors as guesses (correct ones only)
        this.neighbors.forEach(code => {
            if (!this.guesses.find(g => g.code === code)) {
                const countries = getCountries();
                const country = countries[code];
                if (country) {
                    this.guesses.push({
                        code,
                        name: country.name,
                        correct: true
                    });
                }
            }
            this.correctGuesses.add(code);
        });

        return {
            totalNeighbors: this.neighbors.length,
            revealed: this.neighbors.length - (this.correctGuesses.size - this.neighbors.length + this.correctGuesses.size)
        };
    }

    /**
     * Get current game state for UI
     */
    getState() {
        return {
            targetCountry: this.targetCountry,
            targetCountryCode: this.targetCountryCode,
            neighbors: this.neighborCountries,
            neighborCount: this.neighbors.length,
            guesses: this.guesses,
            correctCount: this.correctGuesses.size,
            submitted: this.submitted,
            revealed: this.revealed,
            score: this.score,
            penalties: this.penalties,
            round: this.round,
            canSubmit: this.guesses.length > 0 && !this.revealed,
            progress: {
                found: this.correctGuesses.size,
                total: this.neighbors.length
            }
        };
    }

    /**
     * Check if a country code is a valid neighbor
     */
    isValidNeighbor(countryCode) {
        return this.neighbors.includes(countryCode);
    }

    /**
     * Get remaining neighbors (not yet correctly guessed)
     */
    getRemainingNeighbors() {
        return this.neighbors.filter(code => !this.correctGuesses.has(code));
    }

    /**
     * Check if guess is already made
     */
    hasGuess(countryCode) {
        return this.guesses.some(g => g.code === countryCode);
    }

    /**
     * Advance to next round
     */
    nextRound() {
        this.round++;
        this.startNewRound();
    }
}
