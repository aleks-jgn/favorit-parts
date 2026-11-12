import { describe, expect, it, vi } from 'vitest';
import { buildUrl, getJson } from './httpClient.js';

const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });

/** fetch, который завершается ошибкой только при отмене через AbortSignal. */
function hangingFetch(_url, { signal }) {
  return new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => {
      reject(Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }));
    });
  });
}

describe('buildUrl', () => {
  it('кодирует спецсимволы в значениях', () => {
    const url = buildUrl('/api', '/hs/hsprice/', {
      key: 'k',
      number: 'A#1&2',
      brand: 'Meat & Doria',
      analogues: 'on',
    });

    expect(url).toBe(
      '/api/hs/hsprice/?key=k&number=A%231%262&brand=Meat%20%26%20Doria&analogues=on',
    );
  });

  it('кодирует косую черту и кириллицу', () => {
    expect(buildUrl('/api', '/x/', { brand: 'NGK/NTK', number: 'ключ' })).toBe(
      '/api/x/?brand=NGK%2FNTK&number=%D0%BA%D0%BB%D1%8E%D1%87',
    );
  });

  it('пропускает пустые значения', () => {
    expect(buildUrl('/api', '/x/', { a: '1', b: '', c: undefined, d: null })).toBe('/api/x/?a=1');
  });

  it('не добавляет «?» без параметров', () => {
    expect(buildUrl('/api', '/x/', {})).toBe('/api/x/');
  });
});

describe('getJson', () => {
  it('возвращает разобранный JSON', async () => {
    const fetchImpl = vi.fn(async () => okResponse({ goods: [] }));

    expect(await getJson('/u', { fetchImpl })).toEqual({ goods: [] });
    expect(fetchImpl.mock.calls[0][0]).toBe('/u');
  });

  it('превращает не-2xx в ошибку http со статусом', async () => {
    const fetchImpl = async () => ({ ok: false, status: 503, json: async () => ({}) });

    await expect(getJson('/u', { fetchImpl })).rejects.toMatchObject({ kind: 'http', status: 503 });
  });

  it('превращает сбой fetch в сетевую ошибку', async () => {
    const fetchImpl = async () => {
      throw new TypeError('Failed to fetch');
    };

    await expect(getJson('/u', { fetchImpl })).rejects.toMatchObject({ kind: 'network' });
  });

  it('превращает тело, которое не JSON, в invalid_response', async () => {
    const fetchImpl = async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    });

    await expect(getJson('/u', { fetchImpl })).rejects.toMatchObject({ kind: 'invalid_response' });
  });

  it('прерывает запрос по таймауту', async () => {
    await expect(getJson('/u', { fetchImpl: hangingFetch, timeoutMs: 20 })).rejects.toMatchObject({
      kind: 'timeout',
    });
  });

  it('пробрасывает AbortError, если запрос отменили снаружи', async () => {
    const controller = new AbortController();
    const promise = getJson('/u', {
      fetchImpl: hangingFetch,
      timeoutMs: 5000,
      signal: controller.signal,
    });
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });
});
