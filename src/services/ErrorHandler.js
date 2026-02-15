/**
 * Centralized Error Handler
 * Manages all application errors with user-friendly messages
 */

export class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 50;
    }

    /**
     * Logs an error
     * @param {Error} error - Error object
     * @param {string} context - Context where error occurred
     */
    log(error, context = 'Unknown') {
        const errorEntry = {
            timestamp: new Date().toISOString(),
            context,
            message: error.message,
            stack: error.stack
        };

        this.errorLog.push(errorEntry);

        // Keep log size manageable
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        console.error(`[${context}]`, error);
    }

    /**
     * Handles network errors
     * @param {Error} error 
     * @returns {string} User-friendly message
     */
    handleNetworkError(error) {
        this.log(error, 'Network');
        return 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet y recarga la página.';
    }

    /**
     * Handles JSON parse errors
     * @param {Error} error 
     * @returns {string} User-friendly message
     */
    handleParseError(error) {
        this.log(error, 'JSON Parse');
        return 'Error al procesar los datos del cuestionario. El archivo puede estar corrupto.';
    }

    /**
     * Handles validation errors
     * @param {Error} error 
     * @returns {string} User-friendly message
     */
    handleValidationError(error) {
        this.log(error, 'Validation');
        return 'El cuestionario no tiene el formato correcto. Algunos datos pueden faltar.';
    }

    /**
     * Handles questionnaire loading errors
     * @param {Error} error
     * @returns {string} User-friendly message
     */
    handleQuestionnaireError(error) {
        this.log(error, 'Questionnaire');
        return 'Error al cargar los cuestionarios. Intentando usar datos en caché...';
    }

    /**
     * Handles storage errors
     * @param {Error} error 
     * @returns {string} User-friendly message
     */
    handleStorageError(error) {
        this.log(error, 'LocalStorage');
        return 'Error al guardar datos localmente. Tu navegador puede tener el almacenamiento lleno o deshabilitado.';
    }

    /**
     * Handles runtime errors
     * @param {Error} error 
     * @param {string} context
     * @returns {string} User-friendly message
     */
    handleRuntimeError(error, context = '') {
        this.log(error, `Runtime: ${context}`);
        return 'Ocurrió un error inesperado. Por favor, recarga la página e intenta nuevamente.';
    }

    /**
     * Shows error message to user
     * @param {string} message - Error message
     * @param {number} duration - Duration in milliseconds
     */
    showError(message, duration = 5000) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
        <button class="error-close" aria-label="Cerrar">×</button>
      </div>
    `;

        document.body.appendChild(errorDiv);

        // Add close button functionality
        const closeBtn = errorDiv.querySelector('.error-close');
        closeBtn.addEventListener('click', () => {
            errorDiv.remove();
        });

        // Auto-remove after duration
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, duration);
    }

    /**
     * Shows success message to user
     * @param {string} message - Success message
     * @param {number} duration - Duration in milliseconds
     */
    showSuccess(message, duration = 3000) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.innerHTML = `
      <div class="success-content">
        <span class="success-icon">✅</span>
        <span class="success-message">${message}</span>
      </div>
    `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, duration);
    }

    /**
     * Gets error log
     * @returns {Array}
     */
    getErrorLog() {
        return [...this.errorLog];
    }

    /**
     * Clears error log
     */
    clearLog() {
        this.errorLog = [];
    }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();
