import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Phone, MapPin, StickyNote } from "lucide-react";
import { adminApi } from "../../utils/adminApi";
import { brl } from "../../context/CartContext";

const STATUS = [
  { id: "recebido", label: "Recebido" },
  { id: "na brasa", label: "Na brasa" },
  { id: "saiu para entrega", label: "Saiu p/ entrega" },
  { id: "entregue", label: "Entregue" },
];

const fmtTime = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function OrdersTab({ token, onUnauthorized }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await adminApi(token).get("/admin/orders");
      setOrders(res.data);
    } catch (e) {
      if (e?.response?.status === 401) onUnauthorized();
    } finally {
      setLoading(false);
    }
  }, [token, onUnauthorized]);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (code, status) => {
    try {
      await adminApi(token).patch(`/admin/orders/${code}/status`, { status });
      load();
    } catch (e) {
      if (e?.response?.status === 401) onUnauthorized();
    }
  };

  if (loading) return <div className="py-20 text-center text-carvao/40 text-sm">Carregando pedidos...</div>;

  if (orders.length === 0)
    return (
      <div data-testid="admin-orders-empty" className="py-20 text-center">
        <p className="font-display font-bold text-lg">Nenhum pedido ainda</p>
        <p className="text-sm text-carvao/50 mt-1">Os pedidos feitos no site aparecem aqui em tempo real.</p>
      </div>
    );

  return (
    <div data-testid="admin-orders-list" className="space-y-4">
      {orders.map((o) => (
        <motion.div
          key={o.code}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          data-testid={`admin-order-${o.code}`}
          className="bg-white border border-border rounded-3xl p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <span className="font-display font-black text-lg text-brasa">{o.code}</span>
              <span className="text-xs text-carvao/40">{fmtTime(o.created_at)}</span>
            </div>
            <span className="font-display font-black text-lg">{brl(o.total)}</span>
          </div>

          <div className="text-sm text-carvao/70 space-y-0.5 mb-3">
            <p><strong className="text-carvao">{o.customer.name}</strong></p>
            <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-carvao/35" /> {o.customer.phone}</p>
            <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-carvao/35" /> {o.customer.address}</p>
            {o.customer.notes && (
              <p className="flex items-center gap-1.5"><StickyNote className="w-3.5 h-3.5 text-carvao/35" /> {o.customer.notes}</p>
            )}
          </div>

          <div className="text-sm text-carvao/60 mb-4">
            {o.items.map((i) => `${i.qty}× ${i.name}`).join(" · ")}
          </div>

          <div className="flex flex-wrap gap-2" data-testid={`status-control-${o.code}`}>
            {STATUS.map((s) => (
              <button
                key={s.id}
                data-testid={`status-${s.id.replace(/\s/g, "-")}-${o.code}`}
                onClick={() => setStatus(o.code, s.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
                  o.status === s.id
                    ? "bg-brasa text-white"
                    : "bg-areia text-carvao/50 hover:bg-blush hover:text-brasa"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function OrdersRefresh({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 text-sm font-semibold text-carvao/60 hover:text-brasa">
      <RefreshCw className="w-4 h-4" /> Atualizar
    </button>
  );
}
