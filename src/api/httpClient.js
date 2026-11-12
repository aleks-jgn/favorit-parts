import { ApiError, ERROR_KIND } from './errors.js';

/**
 * Собирает URL. Значения кодируются через encodeURIComponent: так «#», «&», «/» и пробелы
 * в номере или названии бренда (например, «Meat & Doria») не ломают запрос.
 */
export function buildUrl(baseUrl, path, params = {}) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return `${baseUrl}${path}${query ? `?${query}` : ''}`;
}

/**
 * GET-запрос с разбором JSON, таймаутом и единым набором ошибок.
 *
 * @param {string} url
 * @param {{ signal?: AbortSignal, timeoutMs?: number, fetchImpl?: typeof fetch }} [options]
 *   signal: внешняя отмена. Если запрос отменили снаружи, исходная AbortError пробрасывается как есть.
 * @returns {Promise<unknown>}
 * @throws {ApiError} kind: network | timeout | http | invalid_response
 */
export async function getJson(url, { signal, timeoutMs = 15_000, fetchImpl } = {}) {
  const doFetch = fetchImpl ?? ((...args) => globalThis.fetch(...args));
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abortFromOutside = () => controller.abort();

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', abortFromOutside, { once: true });
  }

  const toTransportError = (cause) => {
    if (timedOut) {
      return new ApiError(ERROR_KIND.TIMEOUT, `Request timed out after ${timeoutMs} ms`);
    }
    if (signal?.aborted) return cause;
    return new ApiError(ERROR_KIND.NETWORK, 'Network request failed');
  };

  try {
    let response;
    try {
      response = await doFetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
    } catch (cause) {
      throw toTransportError(cause);
    }

    if (!response.ok) {
      throw new ApiError(ERROR_KIND.HTTP, `HTTP ${response.status}`, { status: response.status });
    }

    try {
      return await response.json();
    } catch (cause) {
      if (timedOut || signal?.aborted) throw toTransportError(cause);
      throw new ApiError(ERROR_KIND.INVALID_RESPONSE, 'Response body is not valid JSON');
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abortFromOutside);
  }
}
