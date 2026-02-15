/**
 * Questionnaire Data Model
 * Defines the structure and validation for questionnaires
 */

export class QuestionnaireModel {
    /**
     * @param {Object} data - Raw questionnaire data
     */
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description || '';
        this.read_time = data.read_time || 0;
        this.bibliography = data.bibliography || [];
        this.pdfPath = data.pdfPath || ''; // Preserve PDF path
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.questions = data.questions || [];
    }

    /**
     * Validates the questionnaire data structure
     * @returns {boolean} True if valid
     */
    isValid() {
        return !!(
            this.id &&
            this.title &&
            this.created_at &&
            this.updated_at &&
            Array.isArray(this.questions) &&
            this.questions.length > 0
        );
    }

    /**
     * Gets the total number of questions
     * @returns {number}
     */
    getQuestionCount() {
        return this.questions.length;
    }

    /**
     * Gets the total possible points
     * @returns {number}
     */
    getTotalPoints() {
        return this.questions.reduce((total, q) => total + (q.points || 0), 0);
    }

    /**
     * Gets questions by difficulty
     * @param {string} difficulty - 'easy', 'medium', or 'hard'
     * @returns {Array}
     */
    getQuestionsByDifficulty(difficulty) {
        return this.questions.filter(q => q.difficulty === difficulty);
    }

    /**
     * Gets metadata for display
     * @returns {Object}
     */
    getMetadata() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            read_time: this.read_time,
            questionCount: this.getQuestionCount(),
            totalPoints: this.getTotalPoints(),
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    /**
     * Converts to JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            read_time: this.read_time,
            bibliography: this.bibliography,
            pdfPath: this.pdfPath, // Include PDF path in serialization
            created_at: this.created_at,
            updated_at: this.updated_at,
            questions: this.questions
        };
    }

    /**
     * Creates a QuestionnaireModel from JSON data
     * @param {Object} json - JSON data
     * @returns {QuestionnaireModel}
     */
    static fromJSON(json) {
        return new QuestionnaireModel(json);
    }

    /**
     * Validates and creates a QuestionnaireModel
     * @param {Object} data - Raw data
     * @returns {QuestionnaireModel|null}
     */
    static create(data) {
        try {
            const questionnaire = new QuestionnaireModel(data);
            return questionnaire.isValid() ? questionnaire : null;
        } catch (error) {
            console.error('Error creating questionnaire model:', error);
            return null;
        }
    }
}

/**
 * Question type definitions
 */
export const QuestionType = {
    MULTIPLE_SELECTION: 'multiple_selection',
    TRUE_FALSE: 'true_false',
    LIST: 'list'
};

/**
 * Difficulty levels
 */
export const DifficultyLevel = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};
