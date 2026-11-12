import { afterEach, describe, expect, it, vi } from 'vitest';
import brandsResponse from '../../test/fixtures/brands-01089.json';
import offersResponse from '../../test/fixtures/offers-glaser.json';
import meatDoriaResponse from '../../test/fixtures/offers-meat-doria.json';
import notFound from '../../test/fixtures/not-found.json';
import emptyKey from '../../test/fixtures/error-empty-key.json';
import { createAppStore } from '../../app/store.js';
import { resetSearch } from './searchSlice.js';
import { fetchBrands, fetchOffers } from './searchThunks.js';
import { selectOfferRows, selectSortedBrands } from './selectors.js';

const jsonResponse = (body) => ({ ok: true, status: 200, json: async () => body });

function stubFetch(handler) {
  const fetchMock = vi.fn(handler);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('этап 1: производители', () => {
  it('загружает список и запоминает артикул', async () => {
    stubFetch(async () => jsonResponse(brandsResponse));
    const store = createAppStore();

    const promise = store.dispatch(fetchBrands('01089'));
    expect(store.getState().search.brands.status).toBe('loading');
    await promise;

    const { search } = store.getState();
    expect(search.query).toBe('01089');
    expect(search.brands.status).toBe('succeeded');
    expect(search.brands.items).toHaveLength(10);
    expect(search.selectedBrand).toBeNull();
  });

  it('селектор ставит бренды с остатком выше остальных', async () => {
    stubFetch(async () => jsonResponse(brandsResponse));
    const store = createAppStore();
    await store.dispatch(fetchBrands('01089'));

    const sorted = selectSortedBrands(store.getState());

    expect(sorted[0].stock).toBeGreaterThan(0);
    expect(sorted[sorted.length - 1].stock).toBe(0);
  });

  it('сохраняет пустой результат как успешный', async () => {
    stubFetch(async () => jsonResponse(notFound));
    const store = createAppStore();
    await store.dispatch(fetchBrands('нет-такого'));

    const { brands } = store.getState().search;
    expect(brands.status).toBe('succeeded');
    expect(brands.items).toEqual([]);
  });

  it('сохраняет ошибку сервиса', async () => {
    stubFetch(async () => jsonResponse(emptyKey));
    const store = createAppStore();
    await store.dispatch(fetchBrands('01089'));

    const { brands } = store.getState().search;
    expect(brands.status).toBe('failed');
    expect(brands.error).toMatchObject({ kind: 'api', code: 'empty_key' });
  });

  it('сохраняет сетевую ошибку', async () => {
    stubFetch(async () => {
      throw new TypeError('Failed to fetch');
    });
    const store = createAppStore();
    await store.dispatch(fetchBrands('01089'));

    expect(store.getState().search.brands.error).toMatchObject({ kind: 'network' });
  });

  it('не дублирует запрос того же артикула, пока он грузится', async () => {
    const resolvers = [];
    const fetchMock = stubFetch(() => new Promise((resolve) => resolvers.push(resolve)));
    const store = createAppStore();

    const first = store.dispatch(fetchBrands('01089'));
    store.dispatch(fetchBrands('01089'));
    await flush();
    expect(fetchMock.mock.calls).toHaveLength(1);

    resolvers[0](jsonResponse(notFound));
    await first;
  });

  it('новый поиск сбрасывает выбранного производителя и предложения', async () => {
    stubFetch(async () => jsonResponse(offersResponse));
    const store = createAppStore();
    await store.dispatch(fetchOffers({ number: '01089', brand: 'GLASER' }));
    expect(store.getState().search.offers.status).toBe('succeeded');

    stubFetch(async () => jsonResponse(brandsResponse));
    await store.dispatch(fetchBrands('7160500039S'));

    const { search } = store.getState();
    expect(search.selectedBrand).toBeNull();
    expect(search.offers.status).toBe('idle');
  });

  it('игнорирует ответ, пришедший после более нового поиска', async () => {
    const resolvers = [];
    stubFetch(() => new Promise((resolve) => resolvers.push(resolve)));
    const store = createAppStore();

    const first = store.dispatch(fetchBrands('111'));
    const second = store.dispatch(fetchBrands('222'));
    await flush();
    resolvers[1](jsonResponse(notFound));
    await second;
    resolvers[0](jsonResponse(brandsResponse));
    await first;

    const { search } = store.getState();
    expect(search.query).toBe('222');
    expect(search.brands.items).toEqual([]);
  });
});

describe('этап 2: аналоги и предложения', () => {
  it('запрашивает номер с брендом и аналогами', async () => {
    const fetchMock = stubFetch(async () => jsonResponse(offersResponse));
    const store = createAppStore();

    await store.dispatch(fetchOffers({ number: '01089', brand: 'GLASER' }));

    expect(fetchMock.mock.calls[0][0]).toBe(
      '/api/hs/hsprice/?key=test-key&number=01089&brand=GLASER&analogues=on',
    );
    const { search } = store.getState();
    expect(search.selectedBrand).toBe('GLASER');
    expect(search.offers.status).toBe('succeeded');
    expect(search.offers.requested.brand).toBe('GLASER');
    expect(search.offers.analogues).toHaveLength(16);
  });

  it('собирает строки таблицы: искомая позиция первая, затем аналоги', async () => {
    stubFetch(async () => jsonResponse(offersResponse));
    const store = createAppStore();
    await store.dispatch(fetchOffers({ number: '01089', brand: 'GLASER' }));

    const rows = selectOfferRows(store.getState());

    expect(rows).toHaveLength(17);
    expect(rows[0].kind).toBe('requested');
    expect(rows[1].kind).toBe('analogue');
  });

  it('сохраняет ошибку и позволяет повторить запрос', async () => {
    stubFetch(async () => ({ ok: false, status: 502, json: async () => ({}) }));
    const store = createAppStore();
    await store.dispatch(fetchOffers({ number: '01089', brand: 'GLASER' }));
    expect(store.getState().search.offers.error).toMatchObject({ kind: 'http', status: 502 });

    const fetchMock = stubFetch(async () => jsonResponse(offersResponse));
    await store.dispatch(fetchOffers({ number: '01089', brand: 'GLASER' }));

    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(store.getState().search.offers.status).toBe('succeeded');
  });

  it('не запрашивает повторно уже загруженного производителя', async () => {
    const fetchMock = stubFetch(async () => jsonResponse(offersResponse));
    const store = createAppStore();

    await store.dispatch(fetchOffers({ number: '01089', brand: 'GLASER' }));
    await store.dispatch(fetchOffers({ number: '01089', brand: 'GLASER' }));

    expect(fetchMock.mock.calls).toHaveLength(1);
  });

  it('игнорирует ответ по прошлому производителю, если пользователь выбрал другого', async () => {
    const resolvers = [];
    stubFetch(() => new Promise((resolve) => resolvers.push(resolve)));
    const store = createAppStore();

    const first = store.dispatch(fetchOffers({ number: '01089', brand: 'GLASER' }));
    const second = store.dispatch(fetchOffers({ number: '01089', brand: 'Meat & Doria' }));
    await flush();
    resolvers[1](jsonResponse(meatDoriaResponse));
    await second;
    resolvers[0](jsonResponse(offersResponse));
    await first;

    const { search } = store.getState();
    expect(search.selectedBrand).toBe('Meat & Doria');
    expect(search.offers.requested.brand).toBe('Meat & Doria');
    expect(search.offers.analogues).toEqual([]);
  });
});

describe('resetSearch', () => {
  it('возвращает начальное состояние', async () => {
    stubFetch(async () => jsonResponse(brandsResponse));
    const store = createAppStore();
    await store.dispatch(fetchBrands('01089'));

    store.dispatch(resetSearch());

    const { search } = store.getState();
    expect(search.query).toBe('');
    expect(search.brands.status).toBe('idle');
    expect(search.brands.items).toEqual([]);
  });
});
