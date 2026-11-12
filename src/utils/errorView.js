import { API_ERROR_CODE, ERROR_KIND } from '../api/errors.js';

/**
 * Текст для пользователя по сериализованной ошибке из Redux-состояния.
 * Каждое сообщение говорит, что произошло и что делать дальше.
 *
 * @param {{ kind?: string, code?: string | null, status?: number | null, message?: string } | null} error
 * @returns {{ title: string, description: string, canRetry: boolean }}
 */
export function getErrorView(error) {
  const kind = error?.kind ?? ERROR_KIND.UNKNOWN;

  if (kind === ERROR_KIND.NETWORK) {
    return {
      title: 'Нет связи с сервисом',
      description: 'Проверьте подключение к интернету и повторите запрос.',
      canRetry: true,
    };
  }
  if (kind === ERROR_KIND.TIMEOUT) {
    return {
      title: 'Сервис не ответил вовремя',
      description: 'Запрос прерван по таймауту. Повторите его через несколько секунд.',
      canRetry: true,
    };
  }
  if (kind === ERROR_KIND.HTTP) {
    const status = error.status ? ` (${error.status})` : '';
    return {
      title: `Сервис ответил ошибкой${status}`,
      description: 'Скорее всего, это временный сбой. Повторите запрос через несколько секунд.',
      canRetry: true,
    };
  }
  if (kind === ERROR_KIND.INVALID_RESPONSE) {
    return {
      title: 'Не удалось прочитать ответ сервиса',
      description: 'Данные пришли в неожиданном формате. Повторите запрос позже.',
      canRetry: true,
    };
  }
  if (kind === ERROR_KIND.CONFIG) {
    return {
      title: 'Не задан ключ доступа',
      description: 'Укажите VITE_FAVORIT_API_KEY в файле .env и перезапустите приложение.',
      canRetry: false,
    };
  }
  if (kind === ERROR_KIND.API) {
    if (error.code === API_ERROR_CODE.EMPTY_KEY || error.code === API_ERROR_CODE.INVALID_KEY) {
      return {
        title: 'Сервис не принял ключ доступа',
        description: 'Проверьте значение VITE_FAVORIT_API_KEY в файле .env.',
        canRetry: false,
      };
    }
    if (error.code === API_ERROR_CODE.EMPTY_NUMBER) {
      return {
        title: 'Не указан артикул',
        description: 'Введите номер детали и повторите поиск.',
        canRetry: false,
      };
    }
    if (error.code === API_ERROR_CODE.QUOTA_EXCEEDED) {
      return {
        title: 'Лимит запросов исчерпан',
        description:
          'Для этого ключа достигнут лимит поиска по грузовому ассортименту. Повторите позже.',
        canRetry: false,
      };
    }
    return {
      title: 'Сервис вернул ошибку',
      description: error.message || 'Повторите запрос позже.',
      canRetry: true,
    };
  }

  return {
    title: 'Не удалось выполнить запрос',
    description: 'Повторите попытку. Если ошибка повторяется, перезагрузите страницу.',
    canRetry: true,
  };
}
