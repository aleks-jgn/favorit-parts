import { describe, expect, it, vi } from 'vitest';
import brandsResponse from '../test/fixtures/brands-01089.json';
import offersResponse from '../test/fixtures/offers-glaser.json';
import meatDoriaResponse from '../test/fixtures/offers-meat-doria.json';
import emptyKey from '../test/fixtures/error-empty-key.json';
import { searchBrands, searchOffers } from './favoritApi.js';

const settings = { apiBaseUrl: '/api', apiKey: 'demo-key', requestTimeoutMs: 1000 };
const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });

describe('searchBrands', () => {
  it('запрашивает только по ключу и номеру', async () => {
    const fetchImpl = vi.fn(async () => okResponse(brandsResponse));

    const brands = await searchBrands('01089', { settings, fetchImpl });

    expect(fetchImpl.mock.calls[0][0]).toBe('/api/hs/hsprice/?key=demo-key&number=01089');
    expect(brands).toHaveLength(10);
  });

  it('не отправляет запрос без ключа', async () => {
    const fetchImpl = vi.fn(async () => okResponse(brandsResponse));

    await expect(
      searchBrands('01089', { settings: { ...settings, apiKey: '' }, fetchImpl }),
    ).rejects.toMatchObject({ kind: 'config' });
    expect(fetchImpl.mock.calls).toHaveLength(0);
  });

  it('превращает ошибку из тела ответа в ApiError', async () => {
    const fetchImpl = async () => okResponse(emptyKey);

    await expect(searchBrands('01089', { settings, fetchImpl })).rejects.toMatchObject({
      kind: 'api',
      code: 'empty_key',
    });
  });
});

describe('searchOffers', () => {
  it('передаёт номер, бренд и analogues=on, кодируя бренд', async () => {
    const fetchImpl = vi.fn(async () => okResponse(meatDoriaResponse));

    const { requested, analogues } = await searchOffers(
      { number: '01089', brand: 'Meat & Doria' },
      { settings, fetchImpl },
    );

    expect(fetchImpl.mock.calls[0][0]).toBe(
      '/api/hs/hsprice/?key=demo-key&number=01089&brand=Meat%20%26%20Doria&analogues=on',
    );
    expect(requested.brand).toBe('Meat & Doria');
    expect(analogues).toEqual([]);
  });

  it('возвращает искомую позицию и аналоги', async () => {
    const fetchImpl = async () => okResponse(offersResponse);

    const { requested, analogues } = await searchOffers(
      { number: '01089', brand: 'GLASER' },
      { settings, fetchImpl },
    );

    expect(requested.brand).toBe('GLASER');
    expect(analogues).toHaveLength(16);
  });
});
