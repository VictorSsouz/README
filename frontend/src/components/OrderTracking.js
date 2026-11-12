import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle2, Flame, Bike, Home, Search, MessageCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useCart, brl } from "../context/CartContext";
import { buildWhatsAppUrl } from "../utils/whatsapp";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEPS = [
  { id: "recebido", label: "Recebido", desc: "A cozinha confirmou seu pedido", icon: CheckCircle2 },
  { id: "na brasa", label: "Na brasa", desc: "Tudo sendo preparado na churrasqueira", icon: Flame },
  { id: "saiu para entrega", label: "Saiu para entrega", desc: "O entregador está a caminho", icon: Bike },
  { id: "entregue", label: "Entregue", desc: "Bom apetite!", icon: Home },
];

export default function OrderTracking() {
  const { trackingOpen, setTrackingOpen, trackingCode, setTrackingCode } = useCart();
  const [codeInput, setCodeInput] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async (code) => {
    try {
      const res = await axios.get(`${API}/orders/${code}`);
      setOrder(res.data);
      setError("");
      return res.data;
    } catch {
      setError("Pedido não encontrado. Confira o código (ex.: EW-1234).");
      setOrder(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (trackingOpen && trackingCode) {
      setLoading(true);
      fetchOrder(trackingCode).finally(() => setLoading(false));
    }
  }, [trackingOpen, trackingCode, fetchOrder]);

  useEffect(() => {
    if (!trackingOpen || !order || order.status === "entregue") return;
    const t = setInterval(() => fetchOrder(order.code), 8000);
    return () => clearInterval(t);
  }, [trackingOpen, order, fetchOrder]);

  const search = async () => {
    if (!codeInput.trim()) return;
    setLoading(true);
    await fetchOrder(codeInput.trim().toUpperCase());
    setLoading(false);
  };

  const close = (open) => {
    setTrackingOpen(open);
    if (!open)
      setTimeout(() => {
        setOrder(null);
        setCodeInput("");
        setError("");
        setTrackingCode("");
      }, 300);
  };

  const stepIndex = order ? STEPS.findIndex((s) => s.id === order.status) : -1;

  return (
    <Dialog open={trackingOpen} onOpenChange={close}>
      <DialogContent data-testid="tracking-dialog" className="sm:max-w-md bg-white rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-black tracking-tight">
            Acompanhar pedido
          </DialogTitle>
        </DialogHeader>

        {!order && !loading && (
          <div className="mt-2">
            <p className="text-sm text-carvao/55 mb-4">
              Digite o código que apareceu na confirmação do seu pedido.
            </p>
            <div className="flex gap-2.5">
              <input
                data-testid="tracking-code-input"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="EW-1234"
                className="flex-1 bg-areia rounded-2xl px-4 py-3.5 text-sm font-bold uppercase outline-none placeholder:text-carvao/35 placeholder:font-normal placeholder:normal-case"
              />
              <button
                data-testid="tracking-search-button"
                onClick={search}
                className="bg-brasa hover:bg-brasa-dark text-white font-bold px-5 rounded-2xl transition-all active:scale-95 flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Buscar
              </button>
            </div>
            {error && (
              <p data-testid="tracking-error" className="text-sm text-brasa font-semibold mt-3">{error}</p>
            )}
          </div>
        )}

        {loading && (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-brasa" />
          </div>
        )}

        {order && !loading && (
          <div className="mt-1">
            <div className="flex items-center justify-between mb-6">
              <span data-testid="tracking-order-code" className="font-display font-black text-xl text-brasa tracking-tight">
                {order.code}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.15em] bg-blush text-brasa px-3 py-1.5 rounded-full">
                {STEPS[stepIndex]?.label}
              </span>
            </div>

            <div className="h-1.5 bg-areia rounded-full overflow-hidden mb-8">
              <motion.div
                data-testid="tracking-progress-bar"
                className="h-full bg-brasa rounded-full"
                initial={false}
                animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="space-y-1">
              {STEPS.map((step, i) => {
                const done = i < stepIndex;
                const current = i === stepIndex;
                return (
                  <div key={step.id} data-testid={`tracking-step-${step.id.replace(/\s/g, "-")}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{ scale: current ? [1, 1.08, 1] : 1 }}
                        transition={current && order.status !== "entregue" ? { repeat: Infinity, duration: 1.6 } : {}}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                          done || current ? "bg-brasa text-white" : "bg-areia text-carvao/30"
                        }`}
                      >
                        <step.icon className="w-5 h-5" />
                      </motion.div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 my-1 rounded-full transition-colors duration-300 ${done ? "bg-brasa" : "bg-areia"}`} />
                      )}
                    </div>
                    <div className="pt-1.5 pb-3">
                      <p className={`font-display font-bold ${done || current ? "text-carvao" : "text-carvao/35"}`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${done || current ? "text-carvao/55" : "text-carvao/30"}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 bg-areia/70 rounded-2xl p-4 space-y-1.5">
              {order.items.map((i) => (
                <div key={i.product_id} className="flex justify-between text-sm">
                  <span className="text-carvao/70"><strong>{i.qty}×</strong> {i.name}</span>
                  <span className="font-semibold">{brl(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-border pt-1.5 flex justify-between font-display font-black">
                <span>Total</span>
                <span>{brl(order.total)}</span>
              </div>
            </div>

            <button
              data-testid="tracking-whatsapp-button"
              onClick={() => window.open(buildWhatsAppUrl(order), "_blank")}
              className="w-full mt-4 bg-[#25D366] hover:bg-[#1EBE59] text-white font-bold py-3.5 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Reenviar pedido no WhatsApp
            </button>
            <p className="text-[11px] text-center text-carvao/40 mt-3">
              Status atualizado automaticamente — esboço demonstrativo.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
