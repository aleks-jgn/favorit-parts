import { InboxIcon } from './Icons.jsx';

/**
 * Пустой результат: объясняет, что ничего не найдено, и подсказывает следующий шаг.
 * @param {{ title: string, children: import('react').ReactNode }} props
 */
export default function EmptyState({ title, children }) {
  return (
    <div className="empty-state">
      <InboxIcon size={30} />
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__text">{children}</p>
    </div>
  );
}
