import { describe, expect, it } from 'vitest';
import { formatPrice, formatShipment, formatStock } from './format.js';

// Intl разделяет разряды и валюту неразрывными пробелами: для сравнения приводим их к обычным.
const plain = (text) => text.replace(/\s/g, ' ');

describe('formatPrice', () => {
  it('форматирует рубли с копейками', () => {
    expect(plain(formatPrice(1005.06))).toBe('1 005,06 ₽');
    expect(plain(formatPrice(344))).toBe('344,00 ₽');
  });

  it('показывает прочерк, если цены нет', () => {
    expect(formatPrice(null)).toBe('—');
    expect(formatPrice(undefined)).toBe('—');
  });
});

describe('formatStock', () => {
  it('добавляет единицу измерения и разделяет разряды', () => {
    expect(formatStock(882)).toBe('882 шт.');
    expect(plain(formatStock(1234))).toBe('1 234 шт.');
  });
});

describe('formatShipment', () => {
  it('показывает дату и время «заказать до» по Москве', () => {
    const result = formatShipment('2026-10-31T13:30:00+03:00');

    expect(result.date).toMatch(/^31 окт/);
    expect(result.orderBefore).toBe('13:30');
  });

  it('переводит время из других поясов в московское', () => {
    expect(formatShipment('2026-10-31T10:30:00Z').orderBefore).toBe('13:30');
  });

  it('возвращает null для пустого или некорректного значения', () => {
    expect(formatShipment(null)).toBeNull();
    expect(formatShipment('не дата')).toBeNull();
  });
});
