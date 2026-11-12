import { describe, expect, it } from 'vitest';
import { getErrorView } from './errorView.js';

describe('getErrorView', () => {
  it('разрешает повтор при сетевых сбоях и таймауте', () => {
    expect(getErrorView({ kind: 'network' }).canRetry).toBe(true);
    expect(getErrorView({ kind: 'timeout' }).canRetry).toBe(true);
  });

  it('показывает статус при HTTP-ошибке', () => {
    expect(getErrorView({ kind: 'http', status: 502 }).title).toContain('502');
  });

  it('подсказывает, как исправить ошибки настройки, и не предлагает повтор', () => {
    const view = getErrorView({ kind: 'config' });

    expect(view.canRetry).toBe(false);
    expect(view.description).toContain('VITE_FAVORIT_API_KEY');
  });

  it('различает ошибки сервиса по коду', () => {
    expect(getErrorView({ kind: 'api', code: 'invalid_key' }).title).toContain('ключ');
    expect(getErrorView({ kind: 'api', code: 'quota_exceeded' }).title).toContain('Лимит');
    expect(getErrorView({ kind: 'api', code: 'quota_exceeded' }).canRetry).toBe(false);
  });

  it('показывает текст неизвестной ошибки сервиса', () => {
    const view = getErrorView({ kind: 'api', code: 'unknown', message: 'Что-то новое' });

    expect(view.description).toBe('Что-то новое');
  });

  it('возвращает запасной вариант для неизвестных и пустых ошибок', () => {
    expect(getErrorView(null).canRetry).toBe(true);
    expect(getErrorView({ kind: 'unknown' }).title).toBeTruthy();
  });
});
