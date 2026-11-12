import { CheckIcon } from './Icons.jsx';
import StockPill from './StockPill.jsx';

/**
 * Список производителей для выбора. Каждый вариант это кнопка-переключатель (aria-pressed).
 * @param {{
 *   brands: import('../api/normalize.js').BrandOption[],
 *   selectedBrand: string | null,
 *   onSelect: (brand: string) => void,
 * }} props
 */
export default function BrandList({ brands, selectedBrand, onSelect }) {
  return (
    <ul className="brand-grid">
      {brands.map((item, index) => {
        const selected = item.brand === selectedBrand;
        return (
          <li key={item.key} style={{ '--i': index }}>
            <button
              type="button"
              className="brand-option"
              data-in-stock={item.stock > 0}
              aria-pressed={selected}
              onClick={() => onSelect(item.brand)}
            >
              <span className="brand-option__head">
                <span className="brand-option__name">{item.brand}</span>
                {selected && <CheckIcon size={18} className="brand-option__check" />}
              </span>
              <span className="brand-option__part">{item.name || 'Без названия'}</span>
              <span className="brand-option__foot">
                <span className="part-number">{item.number}</span>
                <StockPill stock={item.stock} withLabel />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
