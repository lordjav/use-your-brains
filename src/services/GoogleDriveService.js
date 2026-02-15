/**
 * Google Drive Service
 * Fetches questionnaires from a public Google Drive folder
 */

import { config } from '../config/config.js';
import { QuestionnaireModel } from '../models/QuestionnaireModel.js';
import { errorHandler } from './ErrorHandler.js';
import { storageService } from './StorageService.js';

export class GoogleDriveService {
    constructor() {
        this.questionnaires = [];
        this.isLoading = false;
        this.hasLoaded = false;
    }

    /**
     * Builds a Google Drive direct download URL from file ID
     * @param {string} fileId - Google Drive file ID
     * @returns {string} Direct download URL
     */
    buildDriveUrl(fileId) {
        return `${config.googleDrive.downloadEndpoint}${fileId}`;
    }

    /**
     * Fetches JSON content from Google Drive
     * @param {string} fileId - Google Drive file ID
     * @returns {Promise<Object>} Parsed JSON data
     */
    async fetchDriveJson(fileId) {
        const url = this.buildDriveUrl(fileId);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Fetches questionnaires from Google Drive
     * Uses CORS proxy or direct access for public folder
     * @returns {Promise<Array<QuestionnaireModel>>}
     */
    async fetchQuestionnaires() {
        // Check cache first
        const cached = storageService.getCachedQuestionnaires();
        if (cached && cached.length > 0) {
            console.log('Using cached questionnaires');
            this.questionnaires = cached.map(q => QuestionnaireModel.fromJSON(q));
            this.hasLoaded = true;
            return this.questionnaires;
        }

        if (this.isLoading) {
            return this.questionnaires;
        }

        this.isLoading = true;

        try {
            // Fetch questionnaires from Google Drive using manifest
            const questionnaireFiles = await this.fetchFromGoogleDrive();

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
            errorHandler.handleGoogleDriveError(error);

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
     * Fetches questionnaires from Google Drive using manifest file
     * @returns {Promise<Array>}
     */
    async fetchFromGoogleDrive() {
        // First, fetch the manifest that contains all questionnaire metadata
        const manifest = await this.fetchDriveJson(config.googleDrive.manifestFileId);

        const questionnaires = [];

        for (const item of manifest.questionnaires) {
            try {
                // Fetch the questionnaire JSON from Drive
                const data = await this.fetchDriveJson(item.jsonFileId);

                // Add PDF URL from Drive
                data.pdfPath = this.buildDriveUrl(item.pdfFileId);

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
export const googleDriveService = new GoogleDriveService();
