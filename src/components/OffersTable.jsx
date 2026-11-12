import OfferRow from './OfferRow.jsx';

/**
 * Итоговая таблица: искомая позиция и аналоги.
 * @param {{ rows: { key: string, kind: 'requested' | 'analogue', part: import('../api/normalize.js').Part }[] }} props
 */
export default function OffersTable({ rows }) {
  return (
    <div className="panel table-responsive">
      <table className="table offers-table align-middle">
        <thead>
          <tr>
            <th scope="col">Название / Производитель</th>
            <th scope="col" className="text-end">
              Цена
            </th>
            <th scope="col" className="text-end">
              Остаток
            </th>
            <th scope="col" className="text-end">
              <span className="visually-hidden">Склады</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <OfferRow key={row.key} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
