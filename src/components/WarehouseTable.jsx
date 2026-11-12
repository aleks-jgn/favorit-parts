import { formatPrice, formatShipment, formatStock } from '../utils/format.js';

/**
 * Предложения по складам одной позиции: цена, остаток и ближайшая отгрузка.
 * @param {{ warehouses: import('../api/normalize.js').Warehouse[] }} props
 */
export default function WarehouseTable({ warehouses }) {
  return (
    <div className="warehouses table-responsive">
      <table className="table table-sm warehouses__table">
        <caption className="visually-hidden">Склады и условия отгрузки</caption>
        <thead>
          <tr>
            <th scope="col">Склад</th>
            <th scope="col" className="text-end">
              Цена
            </th>
            <th scope="col" className="text-end">
              Остаток
            </th>
            <th scope="col">Отгрузка</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((warehouse) => {
            const shipment = formatShipment(warehouse.shipmentDate);
            return (
              <tr key={warehouse.id}>
                <td>
                  <span className="warehouse-code">{warehouse.code || 'Склад'}</span>
                  {warehouse.own && <span className="tag tag--own">Свой склад</span>}
                </td>
                <td className="text-end price">{formatPrice(warehouse.price)}</td>
                <td className="text-end">{formatStock(warehouse.stock)}</td>
                <td>
                  {shipment ? (
                    <>
                      <span className="shipment__date">{shipment.date}</span>
                      <span className="shipment__note">заказ до {shipment.orderBefore} МСК</span>
                    </>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
