const priceFormatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });
const integerFormatter = new Intl.NumberFormat('ru-RU');

// Время отгрузки в данных API приходит со смещением +03:00, поэтому показываем московское время
// независимо от часового пояса пользователя и явно подписываем его в интерфейсе.
const MOSCOW = 'Europe/Moscow';
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  timeZone: MOSCOW,
});
const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: MOSCOW,
});

/** @param {number | null | undefined} value */
export function formatPrice(value) {
  return value === null || value === undefined ? '—' : priceFormatter.format(value);
}

/** @param {number} value */
export function formatStock(value) {
  return `${integerFormatter.format(value)} шт.`;
}

/**
 * @param {string | null | undefined} iso
 * @returns {{ date: string, orderBefore: string } | null}
 */
export function formatShipment(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return { date: dateFormatter.format(date), orderBefore: timeFormatter.format(date) };
}
