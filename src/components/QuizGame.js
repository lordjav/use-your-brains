/**
 * Quiz Game Component
 * Manages the quiz gameplay, questions, answers, and scoring (refactored from script.js)
 */

import { googleDriveService } from '../services/GoogleDriveService.js';
import { storageService } from '../services/StorageService.js';
import { themeService } from '../services/ThemeService.js';
import { errorHandler } from '../services/ErrorHandler.js';

export class QuizGame {
    constructor(questionnaireId) {
        this.questionnaireId = questionnaireId;
        this.questionnaire = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.totalPossiblePoints = 0;
        this.stats = {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 }
        };
        this.totalQuestions = 0;
        this.questionsAnswered = 0;
        this.questionsCorrect = 0;
        this.isAnswered = false;

        // List question variables
        this.foundAnswers = new Set();
        this.listAnswers = [];
        this.currentListQuestion = null;
    }

    /**
     * Initializes the quiz
     */
    async init() {
        try {
            // Initialize elements first
            this.initializeElements();

            // Setup theme control after DOM is ready
            this.setupThemeControl();

            // Load questionnaire
            await this.loadQuestionnaire();

            // Show start screen
            this.showScreen('start');

        } catch (error) {
            errorHandler.handleRuntimeError(error, 'QuizGame.init');
            errorHandler.showError('Error al iniciar el cuestionario');
        }
    }

    /**
     * Sets up theme control
     */
    setupThemeControl() {
        // Apply the saved theme (don't use init() as it might be already initialized)
        const savedTheme = storageService.getThemePreference();
        themeService.applyTheme(savedTheme || 'light');

        const themeBtn = document.getElementById('theme-control-btn');
        if (!themeBtn) return;

        this.updateThemeButton(themeBtn);

        themeBtn.addEventListener('click', () => {
            themeService.toggle();
            this.updateThemeButton(themeBtn);
        });
    }

    /**
     * Updates theme button
     */
    updateThemeButton(button) {
        button.textContent = themeService.isDark() ? '☀️' : '🌙';
    }

    /**
     * Initializes DOM elements
     */
    initializeElements() {
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultsScreen = document.getElementById('results-screen');

        this.questionnaireInfoEl = document.getElementById('questionnaire-info');
        this.pointsEl = document.getElementById('points');
        this.currentQuestionEl = document.getElementById('current-question');
        this.accuracyEl = document.getElementById('accuracy');
        this.progressFillEl = document.getElementById('progress-fill');
        this.difficultyIndicator = document.getElementById('difficulty-indicator');
        this.questionTextEl = document.getElementById('question-text');
        this.answersContainer = document.getElementById('answers-container');

        this.finalPointsEl = document.getElementById('final-points');
        this.correctAnswersEl = document.getElementById('correct-answers');
        this.incorrectAnswersEl = document.getElementById('incorrect-answers');
        this.finalAccuracyEl = document.getElementById('final-accuracy');
        this.easyStatsEl = document.getElementById('easy-stats');
        this.mediumStatsEl = document.getElementById('medium-stats');
        this.hardStatsEl = document.getElementById('hard-stats');

        this.questionCount = document.getElementById('question-count');

        this.explanationContainer = document.getElementById('explanation-container');
        this.explanationText = document.getElementById('explanation-text');
        this.nextQuestionBtn = document.getElementById('next-question-btn');

        // List question elements
        this.listInputContainer = document.getElementById('list-input-container');
        this.listAnswerInput = document.getElementById('list-answer-input');
        this.submitListAnswer = document.getElementById('submit-list-answer');
        this.revealedAnswers = document.getElementById('revealed-answers');
        this.finishListQuestion = document.getElementById('finish-list-question');
        this.showAllAnswersBtn = document.getElementById('show-all-answers');
        this.expectedAnswersCount = document.getElementById('expected-answers-count');

        // Event listeners
        const endQuizBtn = document.getElementById('end-quiz-btn');
        if (endQuizBtn) {
            endQuizBtn.addEventListener('click', () => {
                this.confirmEndQuiz();
            });
        }

        document.getElementById('start-btn')?.addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn')?.addEventListener('click', () => this.restartGame());
        document.getElementById('back-to-home-btn')?.addEventListener('click', () => this.backToHome());
        document.getElementById('back-to-home-start-btn')?.addEventListener('click', () => this.backToHome());

        this.submitListAnswer?.addEventListener('click', () => this.submitListAnswerHandler());
        this.finishListQuestion?.addEventListener('click', () => this.finishListQuestionHandler());
        this.showAllAnswersBtn?.addEventListener('click', () => this.showAllAnswersAndFinish());
        this.nextQuestionBtn?.addEventListener('click', () => this.nextQuestion());

        this.listAnswerInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitListAnswerHandler();
        });
    }

    /**
     * Confirms and ends quiz early without saving results
     */
    confirmEndQuiz() {
        if (confirm('¿Estás seguro de que quieres terminar el cuestionario?\n\n⚠️ Tu progreso se perderá y no se guardará ningún resultado.')) {
            this.backToHome();
        }
    }

    /**
     * Loads the questionnaire
     */
    async loadQuestionnaire() {
        try {
            const questionnaires = await googleDriveService.fetchQuestionnaires();
            this.questionnaire = questionnaires.find(q => q.id === this.questionnaireId);

            if (!this.questionnaire) {
                throw new Error('Cuestionario no encontrado');
            }

            // Display metadata
            this.displayQuestionnaireInfo();

            // Populate question selector dynamically
            this.populateQuestionSelector();

        } catch (error) {
            errorHandler.handleGoogleDriveError(error);
            errorHandler.showError('No se pudo cargar el cuestionario');
            setTimeout(() => window.location.href = 'index.html', 3000);
        }
    }

    /**
     * Displays questionnaire metadata
     */
    displayQuestionnaireInfo() {
        if (!this.questionnaireInfoEl || !this.questionnaire) return;

        const metadata = this.questionnaire.getMetadata();
        const pdfPath = this.questionnaire.pdfPath || '';

        this.questionnaireInfoEl.innerHTML = `
      <h2>📚 ${metadata.title}</h2>
      <p>${metadata.description || ''}</p>
      <div class="metadata">
        <span>📝 ${metadata.questionCount} preguntas</span>
        <span>💯 ${metadata.totalPoints} puntos</span>
      </div>
      ${pdfPath ? `
        <div class="pdf-download">
          <a href="${pdfPath}" download class="btn btn-download">
            📄 Descargar Texto
          </a>
          <p class="read-time">⏱️ Tiempo de lectura: ${this.formatReadTime(metadata.read_time)}</p>
        </div>
      ` : ''}
    `;
    }

    /**
     * Formats read time from minutes to hours and minutes
     * @param {number} minutes - Time in minutes
     * @returns {string} Formatted time string
     */
    formatReadTime(minutes) {
        if (!minutes) return '0 minutos';

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours === 0) {
            return `${mins} minutos`;
        } else if (mins === 0) {
            return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        } else {
            return `${hours} ${hours === 1 ? 'hora' : 'horas'} ${mins} minutos`;
        }
    }

    /**
     * Starts the game
     */
    startGame() {
        if (!this.questionnaire) {
            errorHandler.showError('Cuestionario no disponible');
            return;
        }

        // Reset state
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.questionsAnswered = 0;
        this.questionsCorrect = 0;
        this.stats = {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 }
        };
        this.isAnswered = false;
        this.foundAnswers = new Set();
        this.listAnswers = [];
        this.currentListQuestion = null;

        // Get question count
        const selectedCount = parseInt(this.questionCount?.value || 20);
        const allQuestions = this.questionnaire.questions;
        this.totalQuestions = Math.min(selectedCount, allQuestions.length);
        this.questions = this.shuffleArray([...allQuestions]).slice(0, this.totalQuestions);

        // Calculate total points
        this.totalPossiblePoints = this.questions.reduce((total, q) => total + (q.points || 0), 0);

        // Track game start time
        this.gameStartTime = Date.now();

        this.showScreen('game');
        this.displayQuestion();
    }

    /**
     * Populates the question count selector based on available questions
     */
    populateQuestionSelector() {
        if (!this.questionCount || !this.questionnaire) return;

        const totalQuestions = this.questionnaire.questions.length;
        const options = [10, 20, 30, 40, 50];

        // Only show options that are <= total questions, plus "All" option
        const validOptions = options.filter(opt => opt <= totalQuestions);

        // Only add "All" option if there are more than 50 questions
        if (totalQuestions > 50) {
            validOptions.push(totalQuestions);
        }

        this.questionCount.innerHTML = '';
        validOptions.forEach((count, index) => {
            const option = document.createElement('option');
            option.value = count;
            option.textContent = `${count} preguntas`;
            if (count === 20 || (count < 20 && index === validOptions.length - 1)) {
                option.selected = true;
            }
            this.questionCount.appendChild(option);
        });
    }

    /**
     * Shuffles an array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Shows a screen
     */
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        switch (screenName) {
            case 'start':
                this.startScreen?.classList.add('active');
                break;
            case 'game':
                this.gameScreen?.classList.add('active');
                break;
            case 'results':
                this.resultsScreen?.classList.add('active');
                break;
        }
    }

    /**
     * Displays current question
     */
    displayQuestion() {
        if (this.currentQuestionIndex >= this.totalQuestions) {
            this.endGame();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        this.isAnswered = false;

        this.updateGameStats();
        this.updateDifficultyIndicator(question.difficulty);
        this.questionTextEl.textContent = question.question;
        this.createAnswerButtons(question);
    }

    /**
     * Updates game statistics display
     */
    updateGameStats() {
        if (this.pointsEl) this.pointsEl.textContent = this.score;
        if (this.currentQuestionEl) {
            this.currentQuestionEl.textContent = `${this.currentQuestionIndex + 1}/${this.totalQuestions}`;
        }

        const accuracy = this.questionsAnswered > 0
            ? Math.round((this.questionsCorrect / this.questionsAnswered) * 100)
            : 0;
        if (this.accuracyEl) this.accuracyEl.textContent = `${accuracy}%`;

        const progressPercentage = (this.currentQuestionIndex / this.totalQuestions) * 100;
        if (this.progressFillEl) this.progressFillEl.style.width = `${progressPercentage}%`;
    }

    /**
     * Updates difficulty indicator
     */
    updateDifficultyIndicator(difficulty) {
        if (!this.difficultyIndicator) return;

        const stars = this.difficultyIndicator.querySelectorAll('.star');
        const levels = { easy: 1, medium: 2, hard: 3 };
        const level = levels[difficulty] || 1;

        stars.forEach((star, index) => {
            if (index < level) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    /**
     * Creates answer buttons based on question type
     */
    createAnswerButtons(question) {
        if (!this.answersContainer) return;

        this.answersContainer.innerHTML = '';
        if (this.listInputContainer) this.listInputContainer.style.display = 'none';
        if (this.explanationContainer) this.explanationContainer.style.display = 'none';

        switch (question.type) {
            case 'multiple_selection':
                this.createMultipleChoiceButtons(question);
                break;
            case 'true_false':
                this.createTrueFalseButtons(question);
                break;
            case 'list':
                this.createListAnswerInput(question);
                break;
        }
    }

    /**
     * Creates multiple choice buttons
     */
    createMultipleChoiceButtons(question) {
        const answers = [
            { text: question.correct, isCorrect: true },
            { text: question.incorrect_1, isCorrect: false },
            { text: question.incorrect_2, isCorrect: false },
            { text: question.incorrect_3, isCorrect: false }
        ];

        const shuffled = this.shuffleArray(answers);

        shuffled.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer.text;
            button.addEventListener('click', () =>
                this.selectAnswer(button, answer.isCorrect, question)
            );
            this.answersContainer.appendChild(button);
        });
    }

    /**
     * Creates true/false buttons
     */
    createTrueFalseButtons(question) {
        const answers = [
            { text: 'Verdadero', isCorrect: question.correct === true },
            { text: 'Falso', isCorrect: question.correct === false }
        ];

        answers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer.text;
            button.addEventListener('click', () =>
                this.selectAnswer(button, answer.isCorrect, question)
            );
            this.answersContainer.appendChild(button);
        });
    }

    /**
     * Creates list answer input
     */
    createListAnswerInput(question) {
        if (!this.answersContainer || !this.listInputContainer) return;

        this.answersContainer.style.display = 'none';
        this.listInputContainer.style.display = 'block';

        this.currentListQuestion = question;
        this.foundAnswers = new Set();
        this.listAnswers = [];

        // Extract answers
        Object.keys(question).forEach(key => {
            if (key.startsWith('answer_')) {
                this.listAnswers.push(question[key]);
            }
        });

        if (this.expectedAnswersCount) {
            this.expectedAnswersCount.textContent = `Respuestas esperadas: ${this.listAnswers.length}`;
        }

        if (this.revealedAnswers) this.revealedAnswers.innerHTML = '';
        if (this.listAnswerInput) this.listAnswerInput.value = '';
        if (this.finishListQuestion) this.finishListQuestion.style.display = 'none';
        if (this.showAllAnswersBtn) this.showAllAnswersBtn.style.display = 'inline-block';
    }

    /**
     * Handles answer selection for multiple choice/true-false
     */
    selectAnswer(button, isCorrect, question) {
        if (this.isAnswered) return;

        this.isAnswered = true;

        const allButtons = this.answersContainer.querySelectorAll('.answer-btn');
        allButtons.forEach(btn => btn.disabled = true);

        if (isCorrect) {
            button.classList.add('correct');
            this.handleCorrectAnswer(question);
        } else {
            button.classList.add('incorrect');
            this.highlightCorrectAnswer(question);
            this.handleIncorrectAnswer(question);
        }

        setTimeout(() => this.showExplanation(question), 1500);
    }

    /**
     * Highlights the correct answer
     */
    highlightCorrectAnswer(question) {
        const allButtons = this.answersContainer.querySelectorAll('.answer-btn');

        if (question.type === 'multiple_selection') {
            allButtons.forEach(btn => {
                if (btn.textContent === question.correct) {
                    btn.classList.add('correct');
                }
            });
        } else if (question.type === 'true_false') {
            const correctText = question.correct === true ? 'Verdadero' : 'Falso';
            allButtons.forEach(btn => {
                if (btn.textContent === correctText) {
                    btn.classList.add('correct');
                }
            });
        }
    }

    /**
     * Handles correct answer
     */
    handleCorrectAnswer(question) {
        this.score += question.points;
        this.correctAnswers++;
        this.questionsAnswered++;
        this.questionsCorrect++;
        this.stats[question.difficulty].correct++;
        this.stats[question.difficulty].total++;
    }

    /**
     * Handles incorrect answer
     */
    handleIncorrectAnswer(question) {
        this.incorrectAnswers++;
        this.questionsAnswered++;
        this.stats[question.difficulty].total++;
    }

    /**
     * Submits list answer
     */
    submitListAnswerHandler() {
        if (!this.listAnswerInput) return;

        const userInput = this.listAnswerInput.value.trim();
        if (!userInput) return;

        const found = this.searchInAnswers(userInput, this.listAnswers);

        if (found && !this.foundAnswers.has(found)) {
            this.foundAnswers.add(found);
            this.addRevealedAnswer(found);
            this.listAnswerInput.value = '';

            if (this.foundAnswers.size === this.listAnswers.length) {
                this.showAllAnswers();
                if (this.finishListQuestion) this.finishListQuestion.style.display = 'block';
                if (this.showAllAnswersBtn) this.showAllAnswersBtn.style.display = 'none';
            }
        } else if (this.foundAnswers.has(found)) {
            errorHandler.showError('Ya encontraste esa respuesta', 2000);
            this.listAnswerInput.value = '';
        } else {
            errorHandler.showError('Respuesta no encontrada, intenta otra', 2000);
            this.listAnswerInput.value = '';
        }
    }

    /**
     * Normalizes a string for comparison
     */
    normalizeString(str) {
        return str.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Searches for a matching answer
     */
    searchInAnswers(userInput, answersList) {
        const normalizedInput = this.normalizeString(userInput);

        if (normalizedInput.length < 3) {
            return answersList.find(answer =>
                this.normalizeString(answer) === normalizedInput
            );
        }

        const inputWords = normalizedInput.split(' ').filter(word => word.length > 1);

        return answersList.find(answer => {
            const normalizedAnswer = this.normalizeString(answer);

            if (normalizedAnswer.includes(normalizedInput) ||
                normalizedInput.includes(normalizedAnswer)) {
                return true;
            }

            const answerWords = normalizedAnswer.split(' ').filter(word => word.length > 2);
            const matchingWords = inputWords.filter(inputWord =>
                answerWords.some(answerWord =>
                    answerWord.includes(inputWord) || inputWord.includes(answerWord)
                )
            );

            return inputWords.length > 0 && matchingWords.length >= Math.ceil(inputWords.length * 0.5);
        });
    }

    /**
     * Adds a revealed answer to the display
     */
    addRevealedAnswer(answer) {
        if (!this.revealedAnswers) return;

        const answerDiv = document.createElement('div');
        answerDiv.className = 'revealed-answer';
        answerDiv.textContent = answer;
        this.revealedAnswers.appendChild(answerDiv);
    }

    /**
     * Shows all answers
     */
    showAllAnswers() {
        if (!this.revealedAnswers) return;

        this.listAnswers.forEach(answer => {
            if (!this.foundAnswers.has(answer)) {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'revealed-answer not-found';
                answerDiv.textContent = answer + ' (no encontrada)';
                answerDiv.style.opacity = '0.6';
                this.revealedAnswers.appendChild(answerDiv);
            }
        });
    }

    /**
     * Shows all answers and finishes question
     */
    showAllAnswersAndFinish() {
        this.showAllAnswers();

        const percentage = this.foundAnswers.size / this.listAnswers.length;
        const points = Math.round(this.currentListQuestion.points * percentage);

        this.score += points;
        this.correctAnswers += this.foundAnswers.size;
        this.incorrectAnswers += (this.listAnswers.length - this.foundAnswers.size);

        this.questionsAnswered++;
        if (percentage >= 0.5) {
            this.questionsCorrect++;
        }

        this.stats[this.currentListQuestion.difficulty].correct += this.foundAnswers.size;
        this.stats[this.currentListQuestion.difficulty].total += this.listAnswers.length;

        if (this.showAllAnswersBtn) this.showAllAnswersBtn.style.display = 'none';
        if (this.finishListQuestion) this.finishListQuestion.style.display = 'block';

        setTimeout(() => this.showExplanation(this.currentListQuestion), 2000);
    }

    /**
     * Finishes list question
     */
    finishListQuestionHandler() {
        const percentage = this.foundAnswers.size / this.listAnswers.length;
        const points = Math.round(this.currentListQuestion.points * percentage);

        this.score += points;
        this.correctAnswers += this.foundAnswers.size;
        this.incorrectAnswers += (this.listAnswers.length - this.foundAnswers.size);

        this.questionsAnswered++;
        if (percentage >= 0.5) {
            this.questionsCorrect++;
        }

        this.stats[this.currentListQuestion.difficulty].correct += this.foundAnswers.size;
        this.stats[this.currentListQuestion.difficulty].total += this.listAnswers.length;

        setTimeout(() => this.showExplanation(this.currentListQuestion), 1000);
    }

    /**
     * Shows explanation
     */
    showExplanation(question) {
        if (!this.explanationContainer || !this.explanationText) return;

        // Show correct answer feedback
        const isCorrect = question.userAnswer === question.correctAnswer;
        this.explanationText.className = isCorrect ? 'correct' : 'incorrect';

        let explanation = question.explanation || 'No hay explicación disponible.';

        // Remove citations like [1, 2] or [17]
        explanation = explanation.replace(/\s*\[[\d,\s]+\]\s*/g, '').trim();

        this.explanationText.textContent = explanation;
        this.explanationContainer.style.display = 'flex';
    }

    /**
     * Goes to next question
     */
    nextQuestion() {
        this.currentQuestionIndex++;

        if (this.answersContainer) this.answersContainer.style.display = 'grid';
        if (this.explanationContainer) this.explanationContainer.style.display = 'none';

        this.displayQuestion();
    }

    /**
     * Ends the game and shows results
     */
    endGame() {
        const result = {
            questionnaireId: this.questionnaire.id,
            date: new Date().toISOString(),
            score: this.score,
            maxPossibleScore: this.totalPossiblePoints, // Max possible points in this attempt
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            totalQuestions: this.questionsAnswered,
            timeSpent: this.gameStartTime ? Math.round((Date.now() - this.gameStartTime) / 1000) : 0,
            difficulty: {
                easy: { ...this.stats.easy },
                medium: { ...this.stats.medium },
                hard: { ...this.stats.hard }
            },
            accuracy: this.questionsAnswered > 0
                ? Math.round((this.questionsCorrect / this.questionsAnswered) * 100)
                : 0
        };

        storageService.addQuizResult(result);

        this.showScreen('results');
        this.displayResults();
    }

    /**
     * Displays results
     */
    displayResults() {
        if (this.finalPointsEl) {
            this.finalPointsEl.textContent = `${this.score}/${this.totalPossiblePoints}`;
        }
        if (this.correctAnswersEl) this.correctAnswersEl.textContent = this.correctAnswers;
        if (this.incorrectAnswersEl) this.incorrectAnswersEl.textContent = this.incorrectAnswers;

        const finalAccuracy = this.questionsAnswered > 0
            ? Math.round((this.questionsCorrect / this.questionsAnswered) * 100)
            : 0;
        if (this.finalAccuracyEl) this.finalAccuracyEl.textContent = `${finalAccuracy}%`;

        if (this.easyStatsEl) {
            this.easyStatsEl.textContent = `${this.stats.easy.correct}/${this.stats.easy.total}`;
        }
        if (this.mediumStatsEl) {
            this.mediumStatsEl.textContent = `${this.stats.medium.correct}/${this.stats.medium.total}`;
        }
        if (this.hardStatsEl) {
            this.hardStatsEl.textContent = `${this.stats.hard.correct}/${this.stats.hard.total}`;
        }
    }

    /**
     * Restarts the quiz
     */
    restartGame() {
        window.location.reload();
    }

    /**
     * Goes back to home
     */
    backToHome() {
        window.location.href = 'index.html';
    }
}
