/**
 * Theme Service
 * Manages dark/light mode with persistence
 */

import { storageService } from './StorageService.js';
import { config } from '../config/config.js';

export class ThemeService {
    constructor() {
        this.currentTheme = config.theme.default;
        this.isInitialized = false;
    }

    /**
     * Initializes the theme service
     */
    init() {
        if (this.isInitialized) return;

        // Load saved theme
        this.currentTheme = storageService.getThemePreference();

        // Apply theme
        this.applyTheme(this.currentTheme);

        this.isInitialized = true;
    }

    /**
     * Applies a theme to the document
     * @param {string} theme - 'light' or 'dark'
     */
    applyTheme(theme) {
        // Remove existing theme class
        document.documentElement.classList.remove('theme-light', 'theme-dark');

        // Add new theme class
        document.documentElement.classList.add(`theme-${theme}`);

        // Set data attribute for CSS
        document.documentElement.setAttribute('data-theme', theme);

        this.currentTheme = theme;
    }

    /**
     * Toggles between light and dark theme
     * @returns {string} New theme
     */
    toggle() {
        const newTheme = this.currentTheme === config.theme.light
            ? config.theme.dark
            : config.theme.light;

        this.setTheme(newTheme);
        return newTheme;
    }

    /**
     * Sets a specific theme
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        if (theme !== config.theme.light && theme !== config.theme.dark) {
            console.warn(`Invalid theme: ${theme}`);
            return;
        }

        this.applyTheme(theme);
        storageService.saveThemePreference(theme);
    }

    /**
     * Gets current theme
     * @returns {string}
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Checks if current theme is dark
     * @returns {boolean}
     */
    isDark() {
        return this.currentTheme === config.theme.dark;
    }

    /**
     * Checks if current theme is light
     * @returns {boolean}
     */
    isLight() {
        return this.currentTheme === config.theme.light;
    }
}

// Export singleton instance
export const themeService = new ThemeService();
