import { getErrorView } from '../utils/errorView.js';
import { AlertIcon, RefreshIcon } from './Icons.jsx';

/**
 * Сообщение об ошибке API с понятным текстом и, если повтор имеет смысл, кнопкой «Повторить».
 * @param {{ error: object | null, onRetry: () => void }} props
 */
export default function ErrorAlert({ error, onRetry }) {
  const { title, description, canRetry } = getErrorView(error);

  return (
    <div className="alert alert-danger status-card" role="alert">
      <AlertIcon size={22} className="status-card__icon" />
      <div className="status-card__body">
        <p className="status-card__title">{title}</p>
        <p className="status-card__text">{description}</p>
        {canRetry && (
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
            <RefreshIcon size={16} /> Повторить
          </button>
        )}
      </div>
    </div>
  );
}
