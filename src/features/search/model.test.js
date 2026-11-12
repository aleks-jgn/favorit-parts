import { describe, expect, it } from 'vitest';
import { buildOfferRows, sortBrands, sortParts } from './model.js';

const part = (overrides) => ({
  id: 'id',
  brand: 'B',
  number: '1',
  name: 'Деталь',
  stock: 1,
  minPrice: 100,
  maxPrice: 100,
  warehouses: [],
  ...overrides,
});

describe('sortBrands', () => {
  it('ставит бренды с остатком выше, затем сортирует по алфавиту', () => {
    const sorted = sortBrands([
      { brand: 'Zeta', stock: 0 },
      { brand: 'Beta', stock: 5 },
      { brand: 'Alpha', stock: 0 },
      { brand: 'Alfa', stock: 2 },
    ]);

    expect(sorted.map((item) => item.brand)).toEqual(['Alfa', 'Beta', 'Alpha', 'Zeta']);
  });

  it('не изменяет исходный массив', () => {
    const source = [
      { brand: 'B', stock: 0 },
      { brand: 'A', stock: 1 },
    ];
    sortBrands(source);

    expect(source[0].brand).toBe('B');
  });
});

describe('sortParts', () => {
  it('сортирует позиции в наличии по цене, затем показывает позиции без остатка', () => {
    const sorted = sortParts([
      part({ id: 'out-b', brand: 'B', stock: 0, minPrice: null }),
      part({ id: 'dear', stock: 5, minPrice: 900 }),
      part({ id: 'out-a', brand: 'A', stock: 0, minPrice: null }),
      part({ id: 'cheap', stock: 1, minPrice: 100 }),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['cheap', 'dear', 'out-a', 'out-b']);
  });
});

describe('buildOfferRows', () => {
  it('ставит искомую позицию первой, даже если на неё нет остатка', () => {
    const rows = buildOfferRows({
      requested: part({ id: 'main', stock: 0, minPrice: null }),
      analogues: [part({ id: 'a1', stock: 3, minPrice: 50 })],
    });

    expect(rows.map((row) => [row.key, row.kind])).toEqual([
      ['main', 'requested'],
      ['a1', 'analogue'],
    ]);
  });

  it('возвращает только аналоги, если искомой позиции нет', () => {
    const rows = buildOfferRows({ requested: null, analogues: [part({ id: 'a1' })] });

    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe('analogue');
  });
});
