/**
 * Чистые функции представления: порядок в выдаче сервиса нестабилен
 * (один и тот же запрос с разным написанием номера возвращает те же позиции в другом порядке),
 * поэтому сортируем на клиенте.
 */

const byBrandName = (a, b) => a.brand.localeCompare(b.brand, 'ru');

/**
 * Производители: сначала те, у кого есть остаток, затем по алфавиту.
 * @template {{ brand: string, stock: number }} T
 * @param {T[]} brands
 * @returns {T[]}
 */
export function sortBrands(brands) {
  return [...brands].sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || byBrandName(a, b));
}

/**
 * Аналоги: в наличии выше, внутри группы по возрастанию цены, без остатка по алфавиту.
 * @param {import('../../api/normalize.js').Part[]} parts
 */
export function sortParts(parts) {
  return [...parts].sort((a, b) => {
    const inStockDiff = Number(b.stock > 0) - Number(a.stock > 0);
    if (inStockDiff !== 0) return inStockDiff;
    if (a.stock > 0) {
      return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity) || byBrandName(a, b);
    }
    return byBrandName(a, b) || a.number.localeCompare(b.number, 'ru');
  });
}

/**
 * Строки итоговой таблицы: искомая позиция всегда первая, затем отсортированные аналоги.
 * @param {{ requested: import('../../api/normalize.js').Part | null, analogues: import('../../api/normalize.js').Part[] }} offers
 * @returns {{ key: string, kind: 'requested' | 'analogue', part: import('../../api/normalize.js').Part }[]}
 */
export function buildOfferRows({ requested, analogues }) {
  const rows = sortParts(analogues).map((part) => ({
    key: part.id,
    kind: /** @type {const} */ ('analogue'),
    part,
  }));
  if (requested) {
    rows.unshift({ key: requested.id, kind: 'requested', part: requested });
  }
  return rows;
}
