/**
 * Application Configuration
 * The MANIFEST_FILE_ID placeholder is replaced during GitHub Actions build
 */

export const config = {
  googleDrive: {
    // This placeholder is replaced by GitHub Actions with the secret value
    manifestFileId: '__MANIFEST_FILE_ID__',
    // Google Apps Script proxy endpoint (avoids CORS issues)
    downloadEndpoint: 'https://script.google.com/macros/s/AKfycbwYbktN4wk9UesNGnE4QjPtu2aaMsnSGYJETmvTmJ_JLWMOca3gM3rN1-ZTXw3DkE7d4Q/exec?id='
  },
  app: {
    questionnaireCacheDuration: 3600000, // 1 hour in milliseconds
    defaultQuestionCount: 20,
    cacheVersion: 3, // Bump this to invalidate old caches
    appTitle: 'Use sus Sesos',
    appVersion: '2.0.0'
  },
  storage: {
    keys: {
      statistics: 'uyb_statistics',
      questionnaireStats: 'uyb_questionnaire_stats',
      audioPreferences: 'uyb_audio_prefs',
      themePreferences: 'uyb_theme_prefs',
      cachedQuestionnaires: 'uyb_cached_questionnaires',
      cacheTimestamp: 'uyb_cache_timestamp',
      cacheVersion: 'uyb_cache_version'
    }
  },
  theme: {
    light: 'light',
    dark: 'dark',
    default: 'light'
  }
};
