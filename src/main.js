/**
 * Main Entry Point for Landing Page
 * Initializes the landing page application
 */

import { LandingPage } from './components/LandingPage.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const landingPage = new LandingPage();
    landingPage.init().then(() => {
        // Setup event listeners after render
        landingPage.setupEventListeners();
    });
});
