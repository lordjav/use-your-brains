/**
 * LocalStorage Service
 * Manages all localStorage operations with error handling
 */

import { config } from '../config/config.js';
import { errorHandler } from './ErrorHandler.js';

export class StorageService {
    constructor() {
        this.keys = config.storage.keys;
    }

    /**
     * Gets an item from localStorage
     * @param {string} key - Storage key
     * @returns {any|null} Parsed value or null
     */
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            errorHandler.log(error, 'StorageService.get');
            return null;
        }
    }

    /**
     * Sets an item in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} Success status
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            errorHandler.handleStorageError(error);
            return false;
        }
    }

    /**
     * Removes an item from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            errorHandler.log(error, 'StorageService.remove');
        }
    }

    /**
     * Clears all app data from localStorage
     */
    clearAll() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            errorHandler.log(error, 'StorageService.clearAll');
        }
    }

    // ===== Statistics =====

    /**
     * Gets statistics
     * @returns {Object}
     */
    getStatistics() {
        return this.get(this.keys.statistics) || {
            totalQuizzesTaken: 0,
            totalQuestionsAnswered: 0,
            totalCorrectAnswers: 0,
            averageAccuracy: 0,
            quizHistory: []
        };
    }

    /**
     * Saves statistics
     * @param {Object} stats - Statistics object
     */
    saveStatistics(stats) {
        this.set(this.keys.statistics, stats);
    }

    /**
   * Adds a quiz result to history
   * @param {Object} result - Quiz result
   */
    addQuizResult(result) {
        const stats = this.getStatistics();

        stats.totalQuizzesTaken++;

        // Ensure we don't exceed 100% accuracy by capping values
        const correctAnswers = Math.min(result.correctAnswers || 0, result.totalQuestions || 0);
        const totalQuestions = result.totalQuestions || 0;

        stats.totalQuestionsAnswered += totalQuestions;
        stats.totalCorrectAnswers += correctAnswers;

        // Calculate new average - cap at 100%
        if (stats.totalQuestionsAnswered > 0) {
            stats.averageAccuracy = Math.min(100, Math.round(
                (stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100
            ));
        }

        // Add to history
        stats.quizHistory.push({
            questionnaireId: result.questionnaireId,
            date: new Date().toISOString(),
            score: result.score,
            totalPoints: result.totalPoints,
            accuracy: Math.min(100, result.accuracy || 0),
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions
        });

        // Keep only last 50 results
        if (stats.quizHistory.length > 50) {
            stats.quizHistory = stats.quizHistory.slice(-50);
        }

        this.saveStatistics(stats);
        this.updateQuestionnaireStats(result);
    }

    // ===== Questionnaire Stats =====

    /**
     * Gets all questionnaire stats
     * @returns {Object}
     */
    getQuestionnaireStats() {
        return this.get(this.keys.questionnaireStats) || {};
    }

    /**
     * Gets stats for a specific questionnaire
     * @param {string} questionnaireId
     * @returns {Object}
     */
    getQuestionnaireStatsById(questionnaireId) {
        const allStats = this.getQuestionnaireStats();
        return allStats[questionnaireId] || {
            timesCompleted: 0,
            bestScore: 0,
            bestScoreMax: 0, // Maximum possible score in best attempt
            averageScore: 0,
            totalScores: 0, // Added totalScores for average calculation
            lastCompleted: null
        };
    }

    /**
     * Saves all questionnaire stats
     * @param {Object} allStats - Object containing all questionnaire stats
     */
    saveAllQuestionnaireStats(allStats) {
        this.set(this.keys.questionnaireStats, allStats);
    }

    /**
     * Updates questionnaire-specific statistics
     * @param {Object} result - Quiz result
     */
    updateQuestionnaireStats(result) {
        const allStats = this.getQuestionnaireStats();
        const questionnaireId = result.questionnaireId;
        const stats = this.getQuestionnaireStatsById(questionnaireId); // This gets a copy or default

        stats.timesCompleted++;
        stats.lastCompleted = new Date().toISOString();

        // Update best score (comparing actual points earned, not question count)
        if (result.score > stats.bestScore) {
            stats.bestScore = result.score;
            stats.bestScoreMax = result.maxPossibleScore; // Track max possible for this attempt
        }

        // Calculate average score
        stats.totalScores += result.score; // Use totalScores for cumulative sum
        stats.averageScore = Math.round(stats.totalScores / stats.timesCompleted);

        allStats[questionnaireId] = stats; // Update the specific questionnaire's stats in the overall object
        this.saveAllQuestionnaireStats(allStats); // Save the entire object back
    }

    // ===== Audio Preferences =====

    /**
     * Gets audio preferences
     * @returns {Object}
     */
    getAudioPreferences() {
        return this.get(this.keys.audioPreferences) || {
            isMuted: false
        };
    }

    /**
     * Saves audio preferences
     * @param {Object} preferences
     */
    saveAudioPreferences(preferences) {
        this.set(this.keys.audioPreferences, preferences);
    }

    // ===== Theme Preferences =====

    /**
     * Gets theme preference
     * @returns {string} 'light' or 'dark'
     */
    getThemePreference() {
        const prefs = this.get(this.keys.themePreferences);
        return prefs?.theme || config.theme.default;
    }

    /**
     * Saves theme preference
     * @param {string} theme - 'light' or 'dark'
     */
    saveThemePreference(theme) {
        this.set(this.keys.themePreferences, { theme });
    }

    // ===== Questionnaire Cache =====

    /**
     * Gets cached questionnaires
     * @returns {Array|null}
     */
    getCachedQuestionnaires() {
        const timestamp = this.get(this.keys.cacheTimestamp);
        const cacheVersion = this.get(this.keys.cacheVersion);
        const now = Date.now();

        // Invalidate cache if version changed
        if (cacheVersion !== config.app.cacheVersion) {
            console.log('Cache version changed, invalidating cache');
            this.remove(this.keys.cachedQuestionnaires);
            this.remove(this.keys.cacheTimestamp);
            this.set(this.keys.cacheVersion, config.app.cacheVersion);
            return null;
        }

        // Check if cache is expired
        if (timestamp && (now - timestamp) < config.app.questionnaireCacheDuration) {
            return this.get(this.keys.cachedQuestionnaires);
        }

        return null;
    }

    /**
     * Caches questionnaires
     * @param {Array} questionnaires
     */
    cacheQuestionnaires(questionnaires) {
        this.set(this.keys.cachedQuestionnaires, questionnaires);
        this.set(this.keys.cacheTimestamp, Date.now());
        this.set(this.keys.cacheVersion, config.app.cacheVersion);
    }
}

// Export singleton instance
export const storageService = new StorageService();
