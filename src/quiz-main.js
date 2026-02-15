/**
 * Main Entry Point for Quiz Page
 * Initializes the quiz game with questionnaire ID
 */

import { QuizGame } from './components/QuizGame.js';

// Get questionnaire ID from URL
function getQuestionnaireId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const questionnaireId = getQuestionnaireId();

    if (!questionnaireId) {
        alert('No se especificó un cuestionario');
        window.location.href = 'index.html';
        return;
    }

    const quizGame = new QuizGame(questionnaireId);
    quizGame.init();
});
