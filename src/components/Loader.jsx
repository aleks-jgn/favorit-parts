/** Маленький индикатор для кнопок. Декоративный: смысл передаёт текст рядом. */
export function Spinner() {
  return <span className="spinner-border spinner-border-sm" aria-hidden="true" />;
}

const SKELETON_BRANDS = 6;
const SKELETON_ROWS = 5;

/** Заглушка списка производителей на время загрузки. */
export function BrandsSkeleton() {
  return (
    <div role="status">
      <span className="visually-hidden">Ищем производителей…</span>
      <ul className="brand-grid placeholder-glow" aria-hidden="true">
        {Array.from({ length: SKELETON_BRANDS }, (_, index) => (
          <li key={index}>
            <div className="brand-option brand-option--skeleton">
              <span className="placeholder skeleton-line" style={{ width: '45%' }} />
              <span className="placeholder skeleton-line" style={{ width: '90%' }} />
              <span className="placeholder skeleton-line" style={{ width: '60%' }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Заглушка таблицы предложений на время загрузки. */
export function OffersSkeleton() {
  return (
    <div role="status">
      <span className="visually-hidden">Загружаем аналоги и предложения…</span>
      <div className="panel placeholder-glow" aria-hidden="true">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <div key={index} className="skeleton-row">
            <span className="placeholder skeleton-line skeleton-row__name" />
            <span className="placeholder skeleton-line skeleton-row__price" />
            <span className="placeholder skeleton-line skeleton-row__stock" />
          </div>
        ))}
      </div>
    </div>
  );
}
