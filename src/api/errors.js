/** Категории ошибок, с которыми работает интерфейс. */
export const ERROR_KIND = Object.freeze({
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  HTTP: 'http',
  INVALID_RESPONSE: 'invalid_response',
  API: 'api',
  CONFIG: 'config',
  UNKNOWN: 'unknown',
});

/** Коды ошибок web-сервиса «Проценка» (см. таблицу «Возможные ошибки» в документации). */
export const API_ERROR_CODE = Object.freeze({
  EMPTY_KEY: 'empty_key',
  INVALID_KEY: 'invalid_key',
  EMPTY_NUMBER: 'empty_number',
  QUOTA_EXCEEDED: 'quota_exceeded',
  UNKNOWN: 'unknown',
});

const API_ERROR_PATTERNS = [
  [API_ERROR_CODE.EMPTY_KEY, /empty key/i],
  [API_ERROR_CODE.INVALID_KEY, /invalid key/i],
  [API_ERROR_CODE.EMPTY_NUMBER, /empty number/i],
  [API_ERROR_CODE.QUOTA_EXCEEDED, /quota exceeded/i],
];

export class ApiError extends Error {
  /**
   * @param {string} kind одно из значений ERROR_KIND
   * @param {string} message техническое описание (для логов и отладки)
   * @param {{ code?: string | null, status?: number | null }} [details]
   */
  constructor(kind, message, { code = null, status = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.code = code;
    this.status = status;
  }
}

/**
 * Превращает поле `error` из ответа сервиса в ApiError.
 * Сервис может вернуть одну ошибку или несколько, поэтому принимаем строку и массив.
 */
export function createApiErrorFromPayload(rawError) {
  const text = [rawError].flat().map(String).join('; ');
  const match = API_ERROR_PATTERNS.find(([, pattern]) => pattern.test(text));
  return new ApiError(ERROR_KIND.API, text, {
    code: match ? match[0] : API_ERROR_CODE.UNKNOWN,
  });
}

/** Redux-экшены должны содержать только сериализуемые данные, поэтому класс ошибки разбираем. */
export function toSerializableError(error) {
  if (error instanceof ApiError) {
    return { kind: error.kind, code: error.code, status: error.status, message: error.message };
  }
  return {
    kind: ERROR_KIND.UNKNOWN,
    code: null,
    status: null,
    message: error instanceof Error ? error.message : String(error),
  };
}
