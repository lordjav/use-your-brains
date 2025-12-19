class Game {
    constructor() {
        console.log('🎮 Iniciando constructor de Game...');
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
        this.questionsAnswered = 0; // Contador de preguntas contestadas
        this.questionsCorrect = 0; // Contador de preguntas correctas (para porcentaje)
        this.isAnswered = false;
        
        console.log('🔧 Inicializando elementos DOM...');
        this.initializeElements();
        console.log('📂 Cargando preguntas...');
        this.loadQuestions();
        
        // Configurar música para que se reproduzca con la primera interacción
        this.setupAudioInteraction();
    }

    initializeElements() {
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultsScreen = document.getElementById('results-screen');
        
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
        
        // Elementos de audio y configuración
        this.backgroundMusic = document.getElementById('background-music');
        this.questionCount = document.getElementById('question-count');
        
        // Elementos de explicación y navegación
        this.explanationContainer = document.getElementById('explanation-container');
        this.explanationText = document.getElementById('explanation-text');
        this.nextQuestionBtn = document.getElementById('next-question-btn');
        this.backToAnswerBtn = document.getElementById('back-to-answer-btn');
        this.possiblePointsEl = document.getElementById('possible-points');
        this.musicNotice = document.getElementById('music-notice');
        
        // Elementos para preguntas tipo lista
        this.listInputContainer = document.getElementById('list-input-container');
        this.listAnswerInput = document.getElementById('list-answer-input');
        this.submitListAnswer = document.getElementById('submit-list-answer');
        this.revealedAnswers = document.getElementById('revealed-answers');
        this.finishListQuestion = document.getElementById('finish-list-question');
        this.showAllAnswersBtn = document.getElementById('show-all-answers');
        this.expectedAnswersCount = document.getElementById('expected-answers-count');
        
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        this.submitListAnswer.addEventListener('click', () => this.submitListAnswerHandler());
        this.finishListQuestion.addEventListener('click', () => this.finishListQuestionHandler());
        this.showAllAnswersBtn.addEventListener('click', () => this.showAllAnswersAndFinish());
        this.nextQuestionBtn.addEventListener('click', () => this.nextQuestion());
        this.backToAnswerBtn.addEventListener('click', () => this.backToAnswer());
        this.listAnswerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitListAnswerHandler();
        });
    }
    
    setupAudioInteraction() {
        const startAudio = () => {
            console.log('🎵 Iniciando música con interacción del usuario');
            this.backgroundMusic.play().then(() => {
                console.log('🎵 Música iniciada exitosamente');
                // Ocultar el aviso de música cuando se reproduzca exitosamente
                if (this.musicNotice) {
                    this.musicNotice.style.display = 'none';
                }
            }).catch(e => {
                console.log('Error al reproducir música:', e);
            });
            
            // Remover event listeners después de la primera reproducción exitosa
            document.removeEventListener('click', startAudio);
            document.removeEventListener('keydown', startAudio);
            document.removeEventListener('touchstart', startAudio);
        };
        
        // Agregar listeners para diferentes tipos de interacción
        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('keydown', startAudio, { once: true });
        document.addEventListener('touchstart', startAudio, { once: true });
        
        console.log('🎵 Música configurada para reproducirse con la primera interacción');
    }

    async loadQuestions() {
        console.log('🔄 Iniciando carga de preguntas...');
        try {
            console.log('📡 Realizando fetch a ./preguntas.json...');
            const response = await fetch('./preguntas.json');
            console.log('📊 Response status:', response.status);
            console.log('📊 Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            console.log('📄 Parseando JSON...');
            const data = await response.json();
            console.log('✅ Datos cargados:', data);
            console.log('📝 Número total de preguntas encontradas:', data.questions ? data.questions.length : 'No se encontró array questions');
            
            if (!data.questions || !Array.isArray(data.questions)) {
                throw new Error('El archivo JSON no contiene un array válido de preguntas');
            }
            
            this.questions = this.shuffleArray(data.questions);
            // No limitamos aquí, se hace en startGame según la selección del usuario
            this.allQuestions = [...this.questions];
            
            console.log('🎯 Preguntas seleccionadas para el juego:', this.totalQuestions);
            console.log('🎲 Primera pregunta:', this.questions[0]);
            
        } catch (error) {
            console.error('❌ Error loading questions:', error);
            console.error('❌ Error details:', error.message);
            alert('Error al cargar las preguntas: ' + error.message + '. Por favor, recarga la página.');
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    startGame() {
        console.log('🎮 Iniciando juego...');
        console.log('📊 Cantidad de preguntas disponibles:', this.allQuestions?.length || 0);
        
        if (!this.allQuestions || this.allQuestions.length === 0) {
            console.log('⚠️ No hay preguntas disponibles');
            alert('Las preguntas aún se están cargando. Espera un momento.');
            return;
        }
        
        // Reiniciar todas las variables del juego
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
        
        // Limpiar variables de preguntas tipo lista
        this.foundAnswers = new Set();
        this.listAnswers = [];
        this.currentListQuestion = null;
        
        // Obtener número de preguntas seleccionado
        const selectedCount = parseInt(this.questionCount.value);
        this.totalQuestions = Math.min(selectedCount, this.allQuestions.length);
        this.questions = this.shuffleArray([...this.allQuestions]).slice(0, this.totalQuestions);
        
        // Calcular puntos totales posibles según dificultad
        this.totalPossiblePoints = this.questions.reduce((total, question) => total + question.points, 0);
        
        console.log(`🎯 Preguntas seleccionadas: ${this.totalQuestions}`);
        console.log(`💰 Puntos totales posibles: ${this.totalPossiblePoints}`);
        console.log('✅ Mostrando pantalla de juego');
        
        // Parar música al empezar el juego
        this.backgroundMusic.pause();
        
        this.showScreen('game');
        this.displayQuestion();
    }
    

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        switch(screenName) {
            case 'start':
                this.startScreen.classList.add('active');
                break;
            case 'game':
                this.gameScreen.classList.add('active');
                break;
            case 'results':
                this.resultsScreen.classList.add('active');
                break;
        }
    }

    displayQuestion() {
        console.log('📝 Mostrando pregunta número:', this.currentQuestionIndex + 1);
        
        if (this.currentQuestionIndex >= this.totalQuestions) {
            console.log('🏁 Juego terminado - no hay más preguntas');
            this.endGame();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        console.log('❓ Pregunta actual:', question);
        console.log('🎯 Tipo de pregunta:', question.type);
        console.log('⭐ Dificultad:', question.difficulty);
        
        this.isAnswered = false;
        
        this.updateGameStats();
        this.updateDifficultyIndicator(question.difficulty);
        this.questionTextEl.textContent = question.question;
        this.createAnswerButtons(question);
    }

    updateGameStats() {
        this.pointsEl.textContent = this.score;
        this.currentQuestionEl.textContent = `${this.currentQuestionIndex + 1}/${this.totalQuestions}`;
        
        // Calcular porcentaje basado en preguntas correctas vs preguntas contestadas
        const accuracy = this.questionsAnswered > 0 ? Math.round((this.questionsCorrect / this.questionsAnswered) * 100) : 0;
        this.accuracyEl.textContent = `${accuracy}%`;
        
        const progressPercentage = ((this.currentQuestionIndex) / this.totalQuestions) * 100;
        this.progressFillEl.style.width = `${progressPercentage}%`;
    }

    updateDifficultyIndicator(difficulty) {
        const stars = this.difficultyIndicator.querySelectorAll('.star');
        const difficultyLevels = {
            'easy': 1,
            'medium': 2,
            'hard': 3
        };
        
        const level = difficultyLevels[difficulty] || 1;
        
        stars.forEach((star, index) => {
            if (index < level) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    createAnswerButtons(question) {
        console.log('🔘 Creando botones de respuesta para tipo:', question.type);
        this.answersContainer.innerHTML = '';
        this.listInputContainer.style.display = 'none';
        this.explanationContainer.style.display = 'none';
        
        if (question.type === 'multiple_selection') {
            console.log('🔵 Creando botones de opción múltiple');
            this.createMultipleChoiceButtons(question);
        } else if (question.type === 'true_false') {
            console.log('✅ Creando botones verdadero/falso');
            this.createTrueFalseButtons(question);
        } else if (question.type === 'list') {
            console.log('📋 Creando display de lista');
            this.createListAnswerInput(question);
        } else {
            console.error('❌ Tipo de pregunta no reconocido:', question.type);
        }
    }

    createMultipleChoiceButtons(question) {
        console.log('🎯 Respuesta correcta:', question.correct);
        console.log('❌ Respuestas incorrectas:', question.incorrect_1, question.incorrect_2, question.incorrect_3);
        
        const answers = [
            question.correct,
            question.incorrect_1,
            question.incorrect_2,
            question.incorrect_3
        ];
        
        console.log('📝 Lista de respuestas:', answers);
        
        const shuffledAnswers = this.shuffleArray(answers.map((answer, index) => ({
            text: answer,
            isCorrect: index === 0
        })));

        console.log('🔀 Respuestas mezcladas:', shuffledAnswers);

        shuffledAnswers.forEach((answer, index) => {
            console.log(`🔘 Creando botón ${index + 1}:`, answer.text, answer.isCorrect ? '(CORRECTA)' : '(INCORRECTA)');
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer.text;
            button.addEventListener('click', () => this.selectAnswer(button, answer.isCorrect, question));
            this.answersContainer.appendChild(button);
        });
    }

    createTrueFalseButtons(question) {
        const answers = [
            { text: 'Verdadero', isCorrect: question.correct === true },
            { text: 'Falso', isCorrect: question.correct === false }
        ];

        answers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer.text;
            button.addEventListener('click', () => this.selectAnswer(button, answer.isCorrect, question));
            this.answersContainer.appendChild(button);
        });
    }

    createListAnswerInput(question) {
        this.answersContainer.style.display = 'none';
        this.listInputContainer.style.display = 'block';
        
        // Inicializar datos de la pregunta actual
        this.currentListQuestion = question;
        this.foundAnswers = new Set();
        this.listAnswers = [];
        
        // Extraer todas las respuestas de la pregunta
        Object.keys(question).forEach(key => {
            if (key.startsWith('answer_')) {
                this.listAnswers.push(question[key]);
            }
        });
        
        console.log('📝 Respuestas disponibles:', this.listAnswers);
        
        // Mostrar cuántas respuestas espera
        this.expectedAnswersCount.textContent = `Respuestas esperadas: ${this.listAnswers.length}`;
        
        // Limpiar interface
        this.revealedAnswers.innerHTML = '';
        this.listAnswerInput.value = '';
        this.listAnswerInput.focus();
        document.getElementById('finish-list-question').style.display = 'none';
        this.showAllAnswersBtn.style.display = 'inline-block'; // Mostrar desde el inicio
        
        // Mostrar instrucciones
        const instructions = document.createElement('div');
        instructions.className = 'list-score';
        instructions.innerHTML = `🎯 Encuentra todas las respuestas posibles`;
        this.revealedAnswers.appendChild(instructions);
    }
    
    submitListAnswerHandler() {
        const userInput = this.listAnswerInput.value.trim();
        if (!userInput) return;
        
        console.log('🔍 Buscando:', userInput);
        
        // Búsqueda flexible usando la nueva función
        const found = this.searchInAnswers(userInput, this.listAnswers);
        
        if (found && !this.foundAnswers.has(found)) {
            console.log('✅ Respuesta encontrada:', found);
            this.foundAnswers.add(found);
            this.addRevealedAnswer(found);
            this.listAnswerInput.value = '';
            
            // Si encontró todas las respuestas
            if (this.foundAnswers.size === this.listAnswers.length) {
                this.showAllAnswers();
                document.getElementById('finish-list-question').style.display = 'block';
                this.showAllAnswersBtn.style.display = 'none';
            }
        } else if (this.foundAnswers.has(found)) {
            console.log('⚠️ Respuesta ya encontrada');
            this.showMessage('Ya encontraste esa respuesta');
            this.listAnswerInput.value = '';
        } else {
            console.log('❌ Respuesta no encontrada');
            this.showMessage('Respuesta no encontrada, intenta otra');
            this.listAnswerInput.value = '';
        }
    }
    
    normalizeString(str) {
        return str.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^\w\s]/gi, '') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
    }
    
    // Función para búsqueda más flexible
    searchInAnswers(userInput, answersList) {
        const normalizedInput = this.normalizeString(userInput);
        
        // Si el input es muy corto, usar búsqueda exacta
        if (normalizedInput.length < 3) {
            return answersList.find(answer => {
                const normalizedAnswer = this.normalizeString(answer);
                return normalizedAnswer === normalizedInput;
            });
        }
        
        // Buscar por palabras clave
        const inputWords = normalizedInput.split(' ').filter(word => word.length > 1);
        
        return answersList.find(answer => {
            const normalizedAnswer = this.normalizeString(answer);
            
            // Búsqueda 1: Contiene el input completo
            if (normalizedAnswer.includes(normalizedInput)) {
                return true;
            }
            
            // Búsqueda 2: El input contiene la respuesta
            if (normalizedInput.includes(normalizedAnswer)) {
                return true;
            }
            
            // Búsqueda 3: Buscar por palabras clave significativas
            const answerWords = normalizedAnswer.split(' ').filter(word => word.length > 2);
            
            // Si encuentra al menos 50% de las palabras clave
            const matchingWords = inputWords.filter(inputWord => 
                answerWords.some(answerWord => 
                    answerWord.includes(inputWord) || inputWord.includes(answerWord)
                )
            );
            
            if (inputWords.length > 0 && matchingWords.length >= Math.ceil(inputWords.length * 0.5)) {
                return true;
            }
            
            // Búsqueda 4: Palabras similares (para casos como "palpacion" -> "palpación")
            return answerWords.some(answerWord => 
                inputWords.some(inputWord => {
                    // Si las palabras son similares (diferencia de 1-2 caracteres)
                    if (Math.abs(answerWord.length - inputWord.length) <= 2) {
                        let differences = 0;
                        const maxLength = Math.max(answerWord.length, inputWord.length);
                        for (let i = 0; i < maxLength; i++) {
                            if (answerWord[i] !== inputWord[i]) differences++;
                        }
                        return differences <= 2; // Permite hasta 2 diferencias
                    }
                    return false;
                })
            );
        });
    }
    
    addRevealedAnswer(answer) {
        const answerDiv = document.createElement('div');
        answerDiv.className = 'revealed-answer';
        answerDiv.textContent = answer;
        this.revealedAnswers.appendChild(answerDiv);
        
        // Actualizar puntuación
        this.updateListScore();
    }
    
    showAllAnswers() {
        this.listAnswers.forEach(answer => {
            if (!this.foundAnswers.has(answer)) {
                const answerDiv = document.createElement('div');
                answerDiv.className = 'revealed-answer';
                answerDiv.style.opacity = '0.6';
                answerDiv.textContent = answer + ' (no encontrada)';
                this.revealedAnswers.appendChild(answerDiv);
            }
        });
    }
    
    updateListScore() {
        const scoreDiv = this.revealedAnswers.querySelector('.list-score');
        if (scoreDiv) {
            const percentage = Math.round((this.foundAnswers.size / this.listAnswers.length) * 100);
            scoreDiv.innerHTML = `🎯 Encontradas: ${this.foundAnswers.size}/${this.listAnswers.length} (${percentage}%)`;
        }
    }
    
    showMessage(message) {
        // Crear mensaje temporal
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #7c3aed; color: white; padding: 10px 20px; border-radius: 10px; z-index: 1000;';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 2000);
    }
    
    finishListQuestionHandler() {
        console.log('🏁 Finalizando pregunta tipo lista');
        
        // Calcular puntos basado en respuestas encontradas
        const percentage = this.foundAnswers.size / this.listAnswers.length;
        const points = Math.round(this.currentListQuestion.points * percentage);
        
        console.log(`📊 Puntos obtenidos: ${points}/${this.currentListQuestion.points}`);
        
        this.score += points;
        this.correctAnswers += this.foundAnswers.size;
        this.incorrectAnswers += (this.listAnswers.length - this.foundAnswers.size);
        
        // Para el porcentaje, cada pregunta tipo lista cuenta como 1 pregunta
        this.questionsAnswered++;
        if (percentage >= 0.5) { // Si encontró al menos 50% de respuestas, cuenta como correcta
            this.questionsCorrect++;
        }
        
        this.stats[this.currentListQuestion.difficulty].correct += this.foundAnswers.size;
        this.stats[this.currentListQuestion.difficulty].total += this.listAnswers.length;
        
        // Mostrar explicación
        setTimeout(() => {
            this.showExplanation(this.currentListQuestion);
        }, 1000);
    }
    
    showAllAnswersAndFinish() {
        console.log('📋 Mostrando todas las respuestas y finalizando');
        
        // Mostrar todas las respuestas no encontradas
        this.showAllAnswers();
        
        // Calcular puntos solo por las respuestas encontradas
        const percentage = this.foundAnswers.size / this.listAnswers.length;
        const points = Math.round(this.currentListQuestion.points * percentage);
        
        console.log(`📊 Puntos obtenidos: ${points}/${this.currentListQuestion.points}`);
        
        this.score += points;
        this.correctAnswers += this.foundAnswers.size;
        this.incorrectAnswers += (this.listAnswers.length - this.foundAnswers.size);
        
        // Para el porcentaje, cada pregunta tipo lista cuenta como 1 pregunta
        this.questionsAnswered++;
        if (percentage >= 0.5) { // Si encontró al menos 50% de respuestas, cuenta como correcta
            this.questionsCorrect++;
        }
        
        this.stats[this.currentListQuestion.difficulty].correct += this.foundAnswers.size;
        this.stats[this.currentListQuestion.difficulty].total += this.listAnswers.length;
        
        // Ocultar botones y mostrar continuar
        this.showAllAnswersBtn.style.display = 'none';
        document.getElementById('finish-list-question').style.display = 'block';
        
        // Mostrar mensaje de finalización
        this.showMessage(`¡Pregunta finalizada! Encontraste ${this.foundAnswers.size}/${this.listAnswers.length} respuestas`);
        
        // Mostrar explicación después de un momento
        setTimeout(() => {
            this.showExplanation(this.currentListQuestion);
        }, 2000);
    }

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
        
        setTimeout(() => {
            this.showExplanation(question);
        }, 1500);
    }

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

    handleCorrectAnswer(question) {
        this.score += question.points; // Puntos según dificultad
        this.correctAnswers++;
        this.questionsAnswered++;
        this.questionsCorrect++; // Pregunta correcta para porcentaje
        this.stats[question.difficulty].correct++;
        this.stats[question.difficulty].total++;
    }

    handleIncorrectAnswer(question) {
        this.incorrectAnswers++;
        this.questionsAnswered++; // Incrementar contador para porcentaje
        this.stats[question.difficulty].total++;
    }


    showExplanation(question) {
        console.log('📖 Mostrando explicación para:', question.question);
        
        // Ocultar contenedores de respuestas
        this.answersContainer.style.display = 'none';
        this.listInputContainer.style.display = 'none';
        
        // Mostrar explicación (limpiar números entre llaves)
        let explanation = question.explanation || 'No hay explicación disponible para esta pregunta.';
        
        // Remover todas las referencias numéricas en corchetes:
        // [1], [2], [13], [1, 2], [3, 4, 5], etc.
        explanation = explanation.replace(/\[\d+(?:\s*,\s*\d+)*\]/g, '');
        
        // Remover cualquier espacio extra que quede al final
        explanation = explanation.replace(/\s+$/, '');
        explanation = explanation.trim();
        
        this.explanationText.textContent = explanation;
        this.explanationContainer.style.display = 'block';
    }
    
    backToAnswer() {
        console.log('🔙 Regresando a ver respuesta');
        
        const question = this.questions[this.currentQuestionIndex];
        
        // Ocultar explicación
        this.explanationContainer.style.display = 'none';
        
        // Mostrar la pantalla de respuesta correspondiente
        if (question.type === 'list') {
            this.listInputContainer.style.display = 'block';
            // Para preguntas tipo lista, mostrar el botón de continuar si ya terminó
            if (this.foundAnswers && this.foundAnswers.size >= 0) {
                document.getElementById('finish-list-question').style.display = 'block';
            }
        } else {
            this.answersContainer.style.display = 'grid';
            // Para preguntas normales, agregar un botón temporal para volver a la explicación
            this.addBackToExplanationButton(question);
        }
    }
    
    addBackToExplanationButton(question) {
        // Verificar si ya existe el botón
        if (document.getElementById('temp-back-explanation')) return;
        
        const tempButton = document.createElement('button');
        tempButton.id = 'temp-back-explanation';
        tempButton.className = 'btn btn-primary';
        tempButton.textContent = 'Ver Explicación';
        tempButton.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000;';
        
        tempButton.addEventListener('click', () => {
            // Remover el botón temporal
            tempButton.remove();
            // Mostrar explicación nuevamente
            this.showExplanation(question);
        });
        
        document.body.appendChild(tempButton);
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        // Limpiar botones temporales
        const tempButton = document.getElementById('temp-back-explanation');
        if (tempButton) tempButton.remove();
        
        // Restaurar interface
        this.answersContainer.style.display = 'grid';
        this.explanationContainer.style.display = 'none';
        
        this.displayQuestion();
    }

    endGame() {
        this.showScreen('results');
        this.displayResults();
    }

    displayResults() {
        this.finalPointsEl.textContent = `${this.score}/${this.totalPossiblePoints}`;
        this.possiblePointsEl.style.display = 'none'; // Ocultar el texto separado
        this.correctAnswersEl.textContent = this.correctAnswers;
        this.incorrectAnswersEl.textContent = this.incorrectAnswers;
        
        // Usar los nuevos contadores para el porcentaje - cada pregunta tiene el mismo peso
        const finalAccuracy = this.questionsAnswered > 0 ? Math.round((this.questionsCorrect / this.questionsAnswered) * 100) : 0;
        this.finalAccuracyEl.textContent = `${finalAccuracy}%`;
        
        this.easyStatsEl.textContent = `${this.stats.easy.correct}/${this.stats.easy.total}`;
        this.mediumStatsEl.textContent = `${this.stats.medium.correct}/${this.stats.medium.total}`;
        this.hardStatsEl.textContent = `${this.stats.hard.correct}/${this.stats.hard.total}`;
    }

    restartGame() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.questionsAnswered = 0;
        this.questionsCorrect = 0;
        this.totalPossiblePoints = 0;
        this.stats = {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 }
        };
        this.isAnswered = false;
        
        // Limpiar variables de preguntas tipo lista
        this.foundAnswers = new Set();
        this.listAnswers = [];
        this.currentListQuestion = null;
        
        // Restaurar interface
        this.answersContainer.style.display = 'grid';
        this.listInputContainer.style.display = 'none';
        this.explanationContainer.style.display = 'none';
        
        // Reiniciar música y mostrar aviso
        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.play().then(() => {
            if (this.musicNotice) {
                this.musicNotice.style.display = 'none';
            }
        }).catch(e => {
            console.log('No se pudo reproducir música:', e);
            // Si falla, mostrar el aviso nuevamente
            if (this.musicNotice) {
                this.musicNotice.style.display = 'inline-block';
            }
            // Reconfigurar la interacción de audio
            this.setupAudioInteraction();
        });
        
        this.showScreen('start');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, iniciando aplicación...');
    new Game();
});