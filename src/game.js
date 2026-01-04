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
        this.userCorrectGuesses = new Set(); // Set of user's correct guesses (before auto-reveal)
        this.incorrectGuesses = new Set(); // Set of incorrect country codes
        this.submitted = false;
        this.revealed = false;
        this.score = 0;
        this.lastRoundGains = 0; // Points gained in last round
        this.lastRoundLosses = 0; // Points lost in last round
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
        this.userCorrectGuesses = new Set();
        this.incorrectGuesses = new Set(); // Reset for new round
        this.submitted = false;
        this.revealed = false;
        this.lastRoundGains = 0;
        this.lastRoundLosses = 0;
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
        this.revealed = true; // Mark as revealed after submission

        let gains = 0; // Points gained this round
        let losses = 0; // Points lost this round (incorrect + missed)

        // Process current guesses
        this.guesses.forEach(guess => {
            if (guess.correct) {
                if (!this.correctGuesses.has(guess.code)) {
                    this.correctGuesses.add(guess.code);
                    this.userCorrectGuesses.add(guess.code);
                    gains++;
                }
            } else {
                // Incorrect guess
                if (!this.incorrectGuesses.has(guess.code)) {
                    this.incorrectGuesses.add(guess.code);
                    losses++;
                }
            }
        });

        // Auto-reveal missing neighbors and count as losses
        const countries = getCountries();
        this.neighbors.forEach(code => {
            if (!this.guesses.find(g => g.code === code)) {
                // Missed this neighbor - count as loss
                losses++;

                // Add to guesses list as correct but revealed (not guessed by user)
                const country = countries[code];
                if (country) {
                    this.guesses.push({
                        code,
                        name: country.name,
                        correct: true,
                        revealed: true
                    });
                }
                this.correctGuesses.add(code);
            }
        });

        // Update score and store round delta
        this.score += (gains - losses);
        this.lastRoundGains = gains;
        this.lastRoundLosses = losses;

        return {
            success: true,
            gains,
            losses,
            totalCorrect: this.correctGuesses.size,
            totalNeighbors: this.neighbors.length,
            isComplete: true
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
            lastRoundGains: this.lastRoundGains,
            lastRoundLosses: this.lastRoundLosses,
            round: this.round,
            canSubmit: this.guesses.length > 0 && !this.revealed,
            progress: {
                found: this.userCorrectGuesses.size, // Only count user's actual guesses
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
