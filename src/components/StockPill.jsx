import { formatStock } from '../utils/format.js';

/**
 * Остаток на складе. Цвет дублируется текстом, чтобы смысл не зависел от цвета.
 * @param {{ stock: number, withLabel?: boolean }} props
 */
export default function StockPill({ stock, withLabel = false }) {
  const inStock = stock > 0;
  const text = inStock ? formatStock(stock) : 'Нет в наличии';

  return (
    <span className="stock-pill" data-state={inStock ? 'in' : 'out'}>
      {withLabel && inStock ? `В наличии ${text}` : text}
    </span>
  );
}
