import { describe, expect, it } from 'vitest';
import brandsResponse from '../test/fixtures/brands-01089.json';
import offersResponse from '../test/fixtures/offers-glaser.json';
import notFound from '../test/fixtures/not-found.json';
import emptyKey from '../test/fixtures/error-empty-key.json';
import { isPlaceholder, normalizePart, parseBrands, parseOffers } from './normalize.js';

function catchError(fn) {
  try {
    fn();
  } catch (error) {
    return error;
  }
  return null;
}

const goods = (overrides) => ({
  brand: 'TEST',
  count: 1,
  goodsID: 'id-1',
  name: 'Деталь',
  number: 'N1',
  price: 0,
  rate: 1,
  warehouses: [],
  ...overrides,
});

describe('isPlaceholder', () => {
  it('распознаёт заглушку «товар не найден»', () => {
    expect(isPlaceholder(notFound.goods[0])).toBe(true);
  });

  it('не принимает за позицию мусор', () => {
    expect(isPlaceholder(null)).toBe(true);
    expect(isPlaceholder('строка')).toBe(true);
    expect(isPlaceholder({})).toBe(true);
  });

  it('считает позицией запись с goodsID и брендом', () => {
    expect(isPlaceholder(goods())).toBe(false);
  });

  it('считает позицией запись с нулевым остатком', () => {
    expect(isPlaceholder(goods({ count: 0 }))).toBe(false);
  });
});

describe('normalizePart', () => {
  it('берёт цену из складов, а не из устаревшего поля price', () => {
    const ossca = brandsResponse.goods.find((item) => item.brand === 'OSSCA');
    const part = normalizePart(ossca);

    expect(ossca.price).toBe(1055.54);
    expect(part.minPrice).toBe(1005.06);
    expect(part.maxPrice).toBe(1061.4);
    expect(part.stock).toBe(50);
  });

  it('сортирует склады по цене', () => {
    const ossca = brandsResponse.goods.find((item) => item.brand === 'OSSCA');
    const prices = normalizePart(ossca).warehouses.map((warehouse) => warehouse.price);

    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('не показывает цену у позиции без складов, даже если price в ответе не нулевой', () => {
    const ap = brandsResponse.goods.find((item) => item.brand === 'AP');
    const part = normalizePart(ap);

    expect(ap.price).toBe(1505.8);
    expect(part.minPrice).toBeNull();
    expect(part.stock).toBe(0);
    expect(part.warehouses).toEqual([]);
  });

  it('не учитывает склады без остатка при расчёте цены', () => {
    const part = normalizePart(
      goods({
        warehouses: [
          { id: 'a', code: 'A', own: false, price: 10, stock: 0 },
          { id: 'b', code: 'B', own: true, price: 50, stock: 3 },
        ],
      }),
    );

    expect(part.minPrice).toBe(50);
    expect(part.maxPrice).toBe(50);
  });

  it('переживает пропущенные и некорректные поля', () => {
    const part = normalizePart({ goodsID: 'x', brand: 'B', count: 'abc', warehouses: 'нет' });

    expect(part.stock).toBe(0);
    expect(part.name).toBe('');
    expect(part.warehouses).toEqual([]);
  });

  it('подставляет идентификатор склада, если сервис его не вернул', () => {
    const part = normalizePart(goods({ warehouses: [{ code: 'X', price: 1, stock: 1 }] }));

    expect(part.warehouses[0].id).toBe('id-1:0');
  });
});

describe('parseBrands', () => {
  it('строит список производителей из реального ответа', () => {
    const brands = parseBrands(brandsResponse);

    expect(brands).toHaveLength(10);
    expect(brands.find((item) => item.brand === 'Meat & Doria')).toMatchObject({ stock: 9 });
    expect(brands.find((item) => item.brand === 'FEBI')).toMatchObject({ stock: 882 });
    expect(brands.find((item) => item.brand === 'AP')).toMatchObject({ stock: 0 });
  });

  it('объединяет повторяющиеся бренды и суммирует остатки', () => {
    const brands = parseBrands({
      goods: [
        goods({ goodsID: '1', brand: 'GOETZE', count: 2 }),
        goods({ goodsID: '2', brand: 'Goetze', count: 3 }),
      ],
    });

    expect(brands).toHaveLength(1);
    expect(brands[0].stock).toBe(5);
  });

  it('возвращает пустой список, если товар не найден', () => {
    expect(parseBrands(notFound)).toEqual([]);
  });

  it('бросает ошибку сервиса с кодом', () => {
    const error = catchError(() => parseBrands(emptyKey));

    expect(error).toMatchObject({ kind: 'api', code: 'empty_key' });
  });

  it('бросает invalid_response на неожиданной форме ответа', () => {
    expect(catchError(() => parseBrands(null))).toMatchObject({ kind: 'invalid_response' });
    expect(catchError(() => parseBrands([]))).toMatchObject({ kind: 'invalid_response' });
    expect(catchError(() => parseBrands({}))).toMatchObject({ kind: 'invalid_response' });
  });
});

describe('parseOffers', () => {
  it('разделяет искомую позицию и аналоги в реальном ответе', () => {
    const { requested, analogues } = parseOffers(offersResponse);

    expect(requested).toMatchObject({ brand: 'GLASER', number: 'H01089-00', stock: 29 });
    expect(analogues).toHaveLength(16);
    expect(analogues.some((part) => part.id === requested.id)).toBe(false);
  });

  it('убирает дубли аналогов по goodsID', () => {
    const analogue = goods({ goodsID: 'dup' });
    const { analogues } = parseOffers({
      goods: [goods({ goodsID: 'main', analogues: [analogue, analogue] })],
    });

    expect(analogues).toHaveLength(1);
  });

  it('не включает искомую позицию в список аналогов', () => {
    const main = goods({ goodsID: 'main' });
    const { analogues } = parseOffers({ goods: [{ ...main, analogues: [main] }] });

    expect(analogues).toHaveLength(0);
  });

  it('возвращает пустой результат, если товар не найден', () => {
    expect(parseOffers(notFound)).toEqual({ requested: null, analogues: [] });
  });

  it('работает, если аналогов нет', () => {
    const { requested, analogues } = parseOffers({ goods: [goods()] });

    expect(requested.id).toBe('id-1');
    expect(analogues).toEqual([]);
  });
});
