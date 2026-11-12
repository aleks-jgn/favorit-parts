import { ApiError, ERROR_KIND, createApiErrorFromPayload } from './errors.js';

/**
 * @typedef {object} Warehouse
 * @property {string} id        внутренний идентификатор склада (уникален, в отличие от code)
 * @property {string} code      сокращённое название склада, может повторяться
 * @property {boolean} own      товар лежит на собственном складе поставщика
 * @property {number} price
 * @property {number} stock
 * @property {string | null} shipmentDate  ISO-дата; время означает, до скольки можно заказать
 *
 * @typedef {object} Part
 * @property {string} id        goodsID
 * @property {string} brand
 * @property {string} number
 * @property {string} name
 * @property {number} stock     общий остаток по всем складам (поле count)
 * @property {number | null} minPrice  минимальная цена среди складов с остатком
 * @property {number | null} maxPrice
 * @property {Warehouse[]} warehouses  отсортированы по цене, затем по дате отгрузки
 *
 * @typedef {object} BrandOption
 * @property {string} key
 * @property {string} brand
 * @property {string} number
 * @property {string} name
 * @property {number} stock
 */

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

const toText = (value) => (typeof value === 'string' ? value.trim() : '');

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

/**
 * Если товар не найден, сервис возвращает один элемент с пустой структурой
 * (пустые brand/name, нулевой goodsID). Такой элемент не является позицией.
 */
export function isPlaceholder(raw) {
  if (!raw || typeof raw !== 'object') return true;
  const goodsId = toText(raw.goodsID);
  if (!goodsId || goodsId === NIL_UUID) return true;
  return !toText(raw.brand) && !toText(raw.name);
}

function normalizeWarehouse(raw, fallbackId) {
  return {
    id: toText(raw?.id) || fallbackId,
    code: toText(raw?.code),
    own: Boolean(raw?.own),
    price: toNumber(raw?.price),
    stock: toNumber(raw?.stock),
    shipmentDate: toText(raw?.shipmentDate) || null,
  };
}

function compareWarehouses(a, b) {
  return a.price - b.price || (a.shipmentDate ?? '').localeCompare(b.shipmentDate ?? '');
}

/**
 * Приводит позицию из ответа сервиса к удобной форме.
 * Цену верхнего уровня (`price`) сервис помечает как устаревшую, поэтому цена берётся только из складов.
 *
 * @returns {Part}
 */
export function normalizePart(raw) {
  const id = toText(raw.goodsID);
  const rawWarehouses = Array.isArray(raw.warehouses) ? raw.warehouses : [];
  const warehouses = rawWarehouses
    .map((warehouse, index) => normalizeWarehouse(warehouse, `${id}:${index}`))
    .sort(compareWarehouses);
  const prices = warehouses.filter((w) => w.stock > 0 && w.price > 0).map((w) => w.price);

  return {
    id,
    brand: toText(raw.brand),
    number: toText(raw.number),
    name: toText(raw.name),
    stock: Math.max(0, toNumber(raw.count)),
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    warehouses,
  };
}

/** Достаёт массив goods или бросает ApiError, если сервис вернул ошибку или неожиданный формат. */
function extractGoods(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new ApiError(ERROR_KIND.INVALID_RESPONSE, 'Unexpected response shape');
  }
  if (payload.error) throw createApiErrorFromPayload(payload.error);
  if (!Array.isArray(payload.goods)) {
    throw new ApiError(ERROR_KIND.INVALID_RESPONSE, 'Response has no "goods" array');
  }
  return payload.goods;
}

/**
 * Этап 1. Ответ на запрос только по номеру: по одной позиции на производителя.
 * Строим список брендов; если один бренд встретился несколько раз, остатки суммируются.
 *
 * @returns {BrandOption[]}
 */
export function parseBrands(payload) {
  const byBrand = new Map();

  for (const raw of extractGoods(payload)) {
    if (isPlaceholder(raw)) continue;
    const part = normalizePart(raw);
    const key = part.brand.toLowerCase();
    const existing = byBrand.get(key);
    if (existing) {
      existing.stock += part.stock;
    } else {
      byBrand.set(key, {
        key,
        brand: part.brand,
        number: part.number,
        name: part.name,
        stock: part.stock,
      });
    }
  }

  return [...byBrand.values()];
}

/**
 * Этап 2. Ответ на запрос с брендом и analogues=on: искомая позиция и вложенный массив аналогов.
 *
 * @returns {{ requested: Part | null, analogues: Part[] }}
 */
export function parseOffers(payload) {
  const goods = extractGoods(payload).filter((raw) => !isPlaceholder(raw));
  const requested = goods.length > 0 ? normalizePart(goods[0]) : null;

  const seen = new Set(requested ? [requested.id] : []);
  const analogues = [];
  for (const good of goods) {
    const rawAnalogues = Array.isArray(good.analogues) ? good.analogues : [];
    for (const raw of rawAnalogues) {
      if (isPlaceholder(raw) || seen.has(toText(raw.goodsID))) continue;
      seen.add(toText(raw.goodsID));
      analogues.push(normalizePart(raw));
    }
  }

  return { requested, analogues };
}
