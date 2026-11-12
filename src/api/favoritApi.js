import { config } from '../config.js';
import { ApiError, ERROR_KIND } from './errors.js';
import { buildUrl, getJson } from './httpClient.js';
import { parseBrands, parseOffers } from './normalize.js';

const PRICE_PATH = '/hs/hsprice/';

/**
 * @typedef {object} RequestOptions
 * @property {AbortSignal} [signal]
 * @property {typeof config} [settings]  подменяется в тестах
 * @property {typeof fetch} [fetchImpl]  подменяется в тестах
 */

async function request(params, { signal, settings = config, fetchImpl } = {}) {
  if (!settings.apiKey) {
    throw new ApiError(ERROR_KIND.CONFIG, 'API key is not configured');
  }
  const url = buildUrl(settings.apiBaseUrl, PRICE_PATH, { key: settings.apiKey, ...params });
  return getJson(url, { signal, timeoutMs: settings.requestTimeoutMs, fetchImpl });
}

/**
 * Этап 1: производители, выпускающие деталь с таким номером.
 * @param {string} number
 * @param {RequestOptions} [options]
 * @returns {Promise<import('./normalize.js').BrandOption[]>}
 */
export async function searchBrands(number, options) {
  return parseBrands(await request({ number }, options));
}

/**
 * Этап 2: искомая позиция выбранного производителя и её аналоги.
 * @param {{ number: string, brand: string }} query
 * @param {RequestOptions} [options]
 */
export async function searchOffers({ number, brand }, options) {
  return parseOffers(await request({ number, brand, analogues: 'on' }, options));
}
