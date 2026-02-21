/**
 * Questionnaire Service
 * Fetches questionnaires from local files
 */

import { config } from '../config/config.js';
import { QuestionnaireModel } from '../models/QuestionnaireModel.js';
import { errorHandler } from './ErrorHandler.js';
import { storageService } from './StorageService.js';

export class QuestionnaireService {
    constructor() {
        this.questionnaires = [];
        this.isLoading = false;
        this.hasLoaded = false;
    }

    /**
     * Builds a URL for a questionnaire file
     * @param {string} filename - File name
     * @returns {string} Full URL path
     */
    buildPath(filename) {
        return `${config.questionnaires.basePath}${filename}`;
    }

    /**
     * Fetches JSON content from a local file
     * @param {string} filename - File name
     * @returns {Promise<Object>} Parsed JSON data
     */
    async fetchJson(filename) {
        const url = this.buildPath(filename);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Fetches questionnaires from local files
     * @returns {Promise<Array<QuestionnaireModel>>}
     */
    async fetchQuestionnaires() {
        // Check cache only if it matches the current manifest (so new questionnaires appear)
        const cached = storageService.getCachedQuestionnaires();
        if (cached && cached.length > 0) {
            try {
                const manifest = await this.fetchJson(config.questionnaires.manifestFile);
                if (manifest.questionnaires && manifest.questionnaires.length === cached.length) {
                    console.log('Using cached questionnaires');
                    this.questionnaires = cached.map(q => QuestionnaireModel.fromJSON(q));
                    this.hasLoaded = true;
                    return this.questionnaires;
                }
            } catch (_) {
                // If manifest fails, continue to load from cache or fetch
            }
        }

        if (this.isLoading) {
            return this.questionnaires;
        }

        this.isLoading = true;

        try {
            // Fetch questionnaires from local files
            const questionnaireFiles = await this.fetchFromLocalFiles();

            this.questionnaires = questionnaireFiles
                .map(q => QuestionnaireModel.create(q))
                .filter(q => q !== null);

            // Cache the questionnaires
            if (this.questionnaires.length > 0) {
                storageService.cacheQuestionnaires(
                    this.questionnaires.map(q => q.toJSON())
                );
            }

            this.hasLoaded = true;
            return this.questionnaires;

        } catch (error) {
            errorHandler.handleQuestionnaireError(error);

            // Try to use cached data
            const cached = storageService.getCachedQuestionnaires();
            if (cached) {
                this.questionnaires = cached.map(q => QuestionnaireModel.fromJSON(q));
            }

            return this.questionnaires;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Fetches questionnaires from local files using manifest
     * @returns {Promise<Array>}
     */
    async fetchFromLocalFiles() {
        // First, fetch the manifest that contains all questionnaire metadata
        const manifest = await this.fetchJson(config.questionnaires.manifestFile);

        const questionnaires = [];

        for (const item of manifest.questionnaires) {
            try {
                // Fetch the questionnaire JSON
                const data = await this.fetchJson(item.jsonFile);

                // Add PDF path if available
                if (item.pdfFile) {
                    data.pdfPath = this.buildPath(item.pdfFile);
                }

                questionnaires.push(data);
            } catch (error) {
                console.error(`Failed to load questionnaire: ${item.id}`, error);
            }
        }

        return questionnaires;
    }

    /**
     * Gets a questionnaire by ID
     * @param {string} id - Questionnaire ID
     * @returns {QuestionnaireModel|null}
     */
    getQuestionnaireById(id) {
        return this.questionnaires.find(q => q.id === id) || null;
    }

    /**
     * Gets all questionnaires
     * @returns {Array<QuestionnaireModel>}
     */
    getAllQuestionnaires() {
        return [...this.questionnaires];
    }

    /**
     * Reloads questionnaires (bypasses cache)
     * @returns {Promise<Array<QuestionnaireModel>>}
     */
    async reloadQuestionnaires() {
        // Clear cache
        storageService.remove(config.storage.keys.cachedQuestionnaires);
        storageService.remove(config.storage.keys.cacheTimestamp);

        this.hasLoaded = false;
        return this.fetchQuestionnaires();
    }

    /**
     * Checks if questionnaires are loaded
     * @returns {boolean}
     */
    isLoaded() {
        return this.hasLoaded;
    }
}

// Export singleton instance
export const questionnaireService = new QuestionnaireService();
