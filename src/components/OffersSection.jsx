import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectOfferRows,
  selectOffersState,
  selectQuery,
  selectSelectedBrand,
} from '../features/search/selectors.js';
import { fetchOffers } from '../features/search/searchThunks.js';
import EmptyState from './EmptyState.jsx';
import ErrorAlert from './ErrorAlert.jsx';
import { OffersSkeleton } from './Loader.jsx';
import OffersTable from './OffersTable.jsx';

/** Этап 2: искомая позиция выбранного производителя, аналоги и предложения по складам. */
export default function OffersSection() {
  const dispatch = useDispatch();
  const query = useSelector(selectQuery);
  const selectedBrand = useSelector(selectSelectedBrand);
  const { status, error, requested, analogues } = useSelector(selectOffersState);
  const rows = useSelector(selectOfferRows);
  const sectionRef = useRef(null);

  // После выбора производителя подводим пользователя к результату: на телефоне он ниже экрана.
  useEffect(() => {
    if (!selectedBrand) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    sectionRef.current?.scrollIntoView?.({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [selectedBrand]);

  if (!selectedBrand) return null;

  const handleRetry = () => dispatch(fetchOffers({ number: query, brand: selectedBrand }));

  let content;
  if (status === 'loading') {
    content = <OffersSkeleton />;
  } else if (status === 'failed') {
    content = <ErrorAlert error={error} onRetry={handleRetry} />;
  } else if (!requested) {
    content = (
      <EmptyState title="Позиция не найдена">
        У производителя {selectedBrand} нет предложений по артикулу «{query}». Выберите другого
        производителя в списке выше.
      </EmptyState>
    );
  } else {
    content = <OffersTable rows={rows} />;
  }

  return (
    <section ref={sectionRef} className="results results--offers" aria-labelledby="offers-title">
      <div className="section-head">
        <h2 id="offers-title" className="section-title">
          Аналоги и предложения
        </h2>
        <p className="section-meta">
          Производитель <strong>{selectedBrand}</strong>, артикул{' '}
          <span className="part-number">{query}</span>
        </p>
      </div>
      {content}
      {status === 'succeeded' && requested && (
        <p className="section-note" role="status">
          {analogues.length > 0
            ? `Найдено аналогов: ${analogues.length}. В таблице минимальная цена среди складов с остатком, цены по каждому складу открываются в строке «Склады».`
            : 'Аналоги для этой позиции не найдены.'}
        </p>
      )}
    </section>
  );
}
