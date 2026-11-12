import { useId, useState } from 'react';
import { formatPrice } from '../utils/format.js';
import { ChevronIcon } from './Icons.jsx';
import StockPill from './StockPill.jsx';
import WarehouseTable from './WarehouseTable.jsx';

/**
 * Строка таблицы предложений. Раскрывается и показывает склады, если они есть.
 * @param {{ row: { kind: 'requested' | 'analogue', part: import('../api/normalize.js').Part } }} props
 */
export default function OfferRow({ row }) {
  const { part, kind } = row;
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const hasWarehouses = part.warehouses.length > 0;
  const hasPriceRange = part.maxPrice !== null && part.maxPrice > part.minPrice;

  return (
    <>
      <tr className="offer-row" data-kind={kind} data-open={open}>
        <td>
          <div className="offer-name">{part.name || 'Без названия'}</div>
          <div className="offer-meta">
            <span className="offer-brand">{part.brand}</span>
            <span className="part-number">{part.number}</span>
            {kind === 'requested' ? (
              <span className="tag tag--accent">Искомая позиция</span>
            ) : (
              <span className="tag">Аналог</span>
            )}
          </div>
        </td>
        <td className="text-end">
          <span className="price">
            {hasPriceRange && <span className="price__from">от </span>}
            {formatPrice(part.minPrice)}
          </span>
        </td>
        <td className="text-end">
          <StockPill stock={part.stock} />
        </td>
        <td className="text-end offer-toggle-cell">
          {hasWarehouses && (
            <button
              type="button"
              className="row-toggle"
              aria-expanded={open}
              aria-controls={open ? detailsId : undefined}
              aria-label={`${open ? 'Скрыть' : 'Показать'} склады: ${part.brand} ${part.number}`}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="row-toggle__label">Склады: {part.warehouses.length}</span>
              <ChevronIcon size={18} />
            </button>
          )}
        </td>
      </tr>
      {open && hasWarehouses && (
        <tr className="offer-details" id={detailsId}>
          <td colSpan={4}>
            <WarehouseTable warehouses={part.warehouses} />
          </td>
        </tr>
      )}
    </>
  );
}
