import { Badge, statusTone } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { OrderDto } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/format";

function OrderCard({ order }: { order: OrderDto }) {
  // El listado de la API no eager-loadea `items` ni `payment`: el recurso omite
  // ambas claves cuando las relaciones no vienen cargadas.
  const items = order.items ?? [];
  const payment = order.payment ?? null;

  return (
    <Card>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900">{order.order_number}</h2>
          <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusTone(order.status)}>{order.status_label}</Badge>
          {payment ? (
            <Badge tone={statusTone(payment.status)}>Pago: {payment.status_label}</Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs tracking-wide text-slate-500 uppercase">Subtotal</dt>
            <dd className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-slate-500 uppercase">Impuestos</dt>
            <dd className="font-semibold text-slate-900">{formatCurrency(order.tax)}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-slate-500 uppercase">Total</dt>
            <dd className="font-bold text-slate-900">{formatCurrency(order.total)}</dd>
          </div>
        </dl>

        {items.length > 0 ? (
          <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">
              Ver {items.length} articulo{items.length === 1 ? "" : "s"}
            </summary>
            <ul className="mt-3 divide-y divide-slate-200 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-2">
                  <span className="min-w-0 truncate text-slate-700">
                    {item.product_name}
                    <span className="text-slate-400"> x{item.quantity}</span>
                  </span>
                  <span className="shrink-0 font-medium text-slate-900">
                    {formatCurrency(item.line_total)}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {payment?.failure_reason ? (
          <p className="text-xs font-medium text-rose-600">{payment.failure_reason}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function OrderList({ orders }: { orders: OrderDto[] }) {
  return (
    <ul className="space-y-5">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} />
        </li>
      ))}
    </ul>
  );
}

export function OrdersSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="space-y-5" data-testid="orders-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="wv-skeleton h-4 w-40" />
            <div className="wv-skeleton h-6 w-24 rounded-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="wv-skeleton h-4 w-24" />
            <div className="wv-skeleton h-4 w-24" />
            <div className="wv-skeleton h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
