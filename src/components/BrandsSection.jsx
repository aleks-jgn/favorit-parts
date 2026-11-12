import { useDispatch, useSelector } from 'react-redux';
import {
  selectBrandsState,
  selectQuery,
  selectSelectedBrand,
  selectSortedBrands,
} from '../features/search/selectors.js';
import { fetchBrands, fetchOffers } from '../features/search/searchThunks.js';
import BrandList from './BrandList.jsx';
import EmptyState from './EmptyState.jsx';
import ErrorAlert from './ErrorAlert.jsx';
import { BrandsSkeleton } from './Loader.jsx';

/** Этап 1: результат поиска производителей. */
export default function BrandsSection() {
  const dispatch = useDispatch();
  const query = useSelector(selectQuery);
  const selectedBrand = useSelector(selectSelectedBrand);
  const { status, error } = useSelector(selectBrandsState);
  const brands = useSelector(selectSortedBrands);

  if (status === 'idle') return null;

  const handleSelect = (brand) => dispatch(fetchOffers({ number: query, brand }));
  const handleRetry = () => dispatch(fetchBrands(query));

  let content;
  if (status === 'loading') {
    content = <BrandsSkeleton />;
  } else if (status === 'failed') {
    content = <ErrorAlert error={error} onRetry={handleRetry} />;
  } else if (brands.length === 0) {
    content = (
      <EmptyState title="Ничего не найдено">
        По артикулу «{query}» производителей нет. Проверьте номер: уберите лишние пробелы или
        попробуйте другое написание.
      </EmptyState>
    );
  } else {
    content = <BrandList brands={brands} selectedBrand={selectedBrand} onSelect={handleSelect} />;
  }

  return (
    <section className="results" aria-labelledby="brands-title">
      <div className="section-head">
        <h2 id="brands-title" className="section-title">
          Производители
        </h2>
        {status === 'succeeded' && brands.length > 0 && (
          <p className="section-meta">
            Найдено: {brands.length}. Выберите производителя, чтобы увидеть аналоги.
          </p>
        )}
      </div>
      {content}
    </section>
  );
}
