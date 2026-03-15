export const HTTP_CONFIG = {
  RETRY_COUNT: 2,
  RETRY_DELAY_MS: 1 * 1000,
  TIMEOUT_MS: 5 * 1000,
} as const;

export const VALIDATION = {
  MAX_TTL_MINUTES: 15,
  MIN_CONTENT_LENGTH: 1,
  MIN_PASSWORD_LENGTH: 4,
} as const;

export const HTTP_STORAGE = {
  // TODO: Should I make it configurable?
  API_KEY_STORAGE_KEY: 'APP_API_KEY',
};

export const ERROR_MESSAGE = {
  API_KEY_IS_EMPTY: 'API key cannot be empty.',
};
