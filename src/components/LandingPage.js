/**
 * Landing Page Component
 * Main entry point for the application
 */

import { questionnaireService } from '../services/QuestionnaireService.js';
import { storageService } from '../services/StorageService.js';
import { audioService } from '../services/AudioService.js';
import { themeService } from '../services/ThemeService.js';
import { errorHandler } from '../services/ErrorHandler.js';

export class LandingPage {
  constructor() {
    this.questionnaires = [];
    this.stats = null;
  }

  /**
   * Initializes the landing page
   */
  async init() {
    try {
      // Initialize services
      this.setupAudioControl();
      this.setupThemeControl();

      // Load questionnaires
      await this.loadQuestionnaires();

      // Load and display statistics
      this.loadStatistics();

      // Render the page
      this.render();

    } catch (error) {
      errorHandler.handleRuntimeError(error, 'LandingPage.init');
      errorHandler.showError('Error al iniciar la aplicación');
    }
  }

  /**
   * Sets up audio control button
   */
  setupAudioControl() {
    const audioBtn = document.getElementById('audio-control-btn');
    const bgMusic = document.getElementById('background-music');

    if (!audioBtn || !bgMusic) return;

    // Initialize audio service
    audioService.init(bgMusic);

    // Update button icon
    this.updateAudioButton(audioBtn);

    // Handle button click
    audioBtn.addEventListener('click', () => {
      audioService.toggleMute();
      this.updateAudioButton(audioBtn);
    });

    // Try to play music
    this.playMusicWithUserGesture(bgMusic);
  }

  /**
   * Plays music after user gesture
   */
  playMusicWithUserGesture(audio) {
    // Try to play immediately
    audioService.play();

    // If autoplay fails, wait for user gesture
    const playAudio = () => {
      audioService.play();
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };

    document.addEventListener('click', playAudio, { once: true });
    document.addEventListener('keydown', playAudio, { once: true });
  }

  /**
   * Updates audio button icon
   */
  updateAudioButton(button) {
    if (!button) return;
    button.textContent = audioService.isMutedState() ? '🔇' : '🔊';
    button.setAttribute('aria-label',
      audioService.isMutedState() ? 'Activar música' : 'Silenciar música'
    );
  }

  /**
   * Sets up theme control button
   */
  setupThemeControl() {
    const themeBtn = document.getElementById('theme-control-btn');
    if (!themeBtn) return;

    // Initialize theme
    themeService.init();

    // Update button icon
    this.updateThemeButton(themeBtn);

    // Handle button click
    themeBtn.addEventListener('click', () => {
      themeService.toggle();
      this.updateThemeButton(themeBtn);
    });
  }

  /**
   * Updates theme button icon
   */
  updateThemeButton(button) {
    if (!button) return;
    button.textContent = themeService.isDark() ? '☀️' : '🌙';
    button.setAttribute('aria-label',
      themeService.isDark() ? 'Modo claro' : 'Modo oscuro'
    );
  }

  /**
   * Loads questionnaires from local files
   */
  async loadQuestionnaires() {
    try {
      this.questionnaires = await questionnaireService.fetchQuestionnaires();

      if (this.questionnaires.length === 0) {
        errorHandler.showError('No se encontraron cuestionarios disponibles');
      }
    } catch (error) {
      errorHandler.handleQuestionnaireError(error);
      errorHandler.showError('Error al cargar cuestionarios');
    }
  }

  /**
   * Loads statistics
   */
  loadStatistics() {
    this.stats = storageService.getStatistics();
  }

  /**
   * Renders the landing page
   */
  render() {
    this.renderStatistics();
    this.renderQuestionnaires();
  }

  /**
   * Renders statistics dashboard
   */
  renderStatistics() {
    const statsContainer = document.getElementById('stats-dashboard');
    if (!statsContainer) return;

    const { totalQuizzesTaken, totalQuestionsAnswered, totalCorrectAnswers, averageAccuracy } = this.stats;

    statsContainer.innerHTML = `
      <h2>📊 Tus Estadísticas</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">${totalQuizzesTaken}</div>
          <div class="stat-label">Cuestionarios Completados</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❓</div>
          <div class="stat-value">${totalQuestionsAnswered}</div>
          <div class="stat-label">Preguntas Respondidas</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-value">${totalCorrectAnswers}</div>
          <div class="stat-label">Respuestas Correctas</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-value">${averageAccuracy}%</div>
          <div class="stat-label">Precisión Promedio</div>
        </div>
      </div>
    `;
  }

  /**
   * Renders questionnaires list
   */
  renderQuestionnaires() {
    const container = document.getElementById('questionnaires-list');
    if (!container) return;

    if (this.questionnaires.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No hay cuestionarios disponibles en este momento.</p>
          <button onclick="location.reload()" class="btn btn-primary">Reintentar</button>
        </div>
      `;
      return;
    }

    const questionnaireCards = this.questionnaires
      .map(q => this.createQuestionnaireCard(q))
      .join('');

    container.innerHTML = `
      <h2>📚 Cuestionarios Disponibles</h2>
      <div class="questionnaires-grid">
        ${questionnaireCards}
      </div>
    `;
  }

  /**
   * Creates a questionnaire card HTML
   * @param {QuestionnaireModel} questionnaire
   * @returns {string}
   */
  createQuestionnaireCard(questionnaire) {
    const metadata = questionnaire.getMetadata();
    const stats = storageService.getQuestionnaireStatsById(questionnaire.id);

    const lastCompletedText = stats.lastCompleted
      ? `Último intento: ${new Date(stats.lastCompleted).toLocaleDateString('es-ES')}`
      : 'No completado aún';

    const bestScoreText = stats.bestScore > 0 && stats.bestScoreMax > 0
      ? `Mejor puntuación: ${stats.bestScore}/${stats.bestScoreMax}`
      : '';

    return `
      <div class="questionnaire-card" data-id="${questionnaire.id}">
        <div class="card-header">
          <h3>${metadata.title}</h3>
          ${stats.timesCompleted > 0 ? `<span class="completion-badge">${stats.timesCompleted} ${stats.timesCompleted === 1 ? 'vez' : 'veces'}</span>` : ''}
        </div>
        <div class="card-body">
          ${metadata.description ? `<p class="description">${metadata.description}</p>` : ''}
          <div class="card-info">
            <span>📝 ${metadata.questionCount} preguntas</span>
            <span>💯 ${metadata.totalPoints} pts</span>
          </div>
          <div class="score-info">
            ${bestScoreText ? `<span class="best-score">${bestScoreText}</span>` : ''}
            <span class="last-completed">${lastCompletedText}</span>
          </div>
        </div>
        <button class="btn btn-primary start-quiz-btn" data-id="${questionnaire.id}">
          Comenzar Cuestionario
        </button>
      </div>
    `;
  }

  /**
   * Sets up event listeners after rendering
   */
  setupEventListeners() {
    // Questionnaire card clicks
    document.querySelectorAll('.start-quiz-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const questionnaireId = e.target.dataset.id;
        this.startQuiz(questionnaireId);
      });
    });
  }

  /**
   * Starts a quiz
   * @param {string} questionnaireId
   */
  startQuiz(questionnaireId) {
    // Stop music before navigating
    audioService.stop();

    // Navigate to quiz page with questionnaire ID
    window.location.href = `quiz.html?id=${questionnaireId}`;
  }
}
