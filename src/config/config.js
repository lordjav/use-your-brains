/**
 * Application Configuration
 */

export const config = {
  questionnaires: {
    // Base path for questionnaire files
    basePath: 'questionnaires/',
    // Manifest file name
    manifestFile: 'manifest.json'
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
