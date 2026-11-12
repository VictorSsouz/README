import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, MapPin, Phone, User, StickyNote, MessageCircle, Bike } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useCart, brl } from "../context/CartContext";
import { buildWhatsAppUrl } from "../utils/whatsapp";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CheckoutDialog() {
  const { items, subtotal, deliveryFee, total, checkoutOpen, setCheckoutOpen, clearCart, setTrackingCode, setTrackingOpen } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.name.trim() && form.phone.trim() && form.address.trim() && items.length > 0;

  const confirmOrder = async () => {
    if (!valid || sending) return;
    setSending(true);
    try {
      const res = await axios.post(`${API}/orders`, {
        customer: form,
        items: items.map((i) => ({ product_id: i.id, name: i.name, price: i.price, qty: i.qty })),
        subtotal, delivery_fee: deliveryFee, total,
      });
      setConfirmed(res.data);
      clearCart();
    } catch {
      setSending(false);
    }
  };

  const close = (open) => {
    setCheckoutOpen(open);
    if (!open) setTimeout(() => { setConfirmed(null); setSending(false); }, 300);
  };

  return (
    <Dialog open={checkoutOpen} onOpenChange={close}>
      <DialogContent data-testid="checkout-dialog" className="sm:max-w-lg bg-white rounded-3xl max-h-[90vh] overflow-y-auto">
        {!confirmed ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl font-black tracking-tight">
                Revisar pedido
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2.5 mt-2">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-carvao/70">
                    <strong className="text-carvao">{i.qty}×</strong> {i.name}
                  </span>
                  <span className="font-semibold">{brl(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-border pt-2.5 flex justify-between text-sm text-carvao/60">
                <span>Entrega</span>
                <span>{deliveryFee === 0 ? "Grátis" : brl(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-display font-black text-xl">
                <span>Total</span>
                <span data-testid="checkout-total">{brl(total)}</span>
              </div>
            </div>

            <div className="space-y-3 mt-5">
              <label className="flex items-center gap-3 bg-areia rounded-2xl px-4 py-3">
                <User className="w-4 h-4 text-carvao/40 shrink-0" />
                <input data-testid="checkout-name-input" value={form.name} onChange={set("name")}
                  placeholder="Seu nome" className="bg-transparent outline-none text-sm w-full" />
              </label>
              <label className="flex items-center gap-3 bg-areia rounded-2xl px-4 py-3">
                <Phone className="w-4 h-4 text-carvao/40 shrink-0" />
                <input data-testid="checkout-phone-input" value={form.phone} onChange={set("phone")}
                  placeholder="Telefone / WhatsApp" className="bg-transparent outline-none text-sm w-full" />
              </label>
              <label className="flex items-center gap-3 bg-areia rounded-2xl px-4 py-3">
                <MapPin className="w-4 h-4 text-carvao/40 shrink-0" />
                <input data-testid="checkout-address-input" value={form.address} onChange={set("address")}
                  placeholder="Endereço de entrega" className="bg-transparent outline-none text-sm w-full" />
              </label>
              <label className="flex items-center gap-3 bg-areia rounded-2xl px-4 py-3">
                <StickyNote className="w-4 h-4 text-carvao/40 shrink-0" />
                <input data-testid="checkout-notes-input" value={form.notes} onChange={set("notes")}
                  placeholder="Observações (ponto da carne, sem cebola...)" className="bg-transparent outline-none text-sm w-full" />
              </label>
            </div>

            <button
              data-testid="confirm-order-button"
              onClick={confirmOrder}
              disabled={!valid || sending}
              className="w-full mt-5 bg-brasa hover:bg-brasa-dark disabled:bg-carvao/20 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
            >
              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
              {sending ? "Enviando pedido..." : "Confirmar pedido"}
            </button>
            <p className="text-[11px] text-center text-carvao/40 mt-2">
              Esboço demonstrativo — nenhum pagamento é cobrado.
            </p>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            data-testid="order-success"
            className="py-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
              className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-11 h-11 text-green-500" />
            </motion.div>
            <h3 className="font-display text-3xl font-black tracking-tight mt-6">Pedido recebido!</h3>
            <p className="text-sm text-carvao/55 mt-2">
              Valeu, <strong>{confirmed.customer.name.split(" ")[0]}</strong>! Seu pedido já está na brasa.
            </p>
            <div className="mt-6 inline-flex flex-col items-center bg-areia rounded-2xl px-8 py-5">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-carvao/40">Código</span>
              <span data-testid="order-code" className="font-display text-3xl font-black text-brasa tracking-tight">
                {confirmed.code}
              </span>
              <span className="text-xs text-carvao/50 mt-1">Previsão: 30–45 min</span>
            </div>
            <div className="mt-6 text-left bg-white border border-border rounded-2xl p-4 space-y-1.5">
              {confirmed.items.map((i) => (
                <div key={i.product_id} className="flex justify-between text-sm">
                  <span className="text-carvao/70"><strong>{i.qty}×</strong> {i.name}</span>
                  <span className="font-semibold">{brl(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-border pt-1.5 flex justify-between font-display font-black">
                <span>Total</span>
                <span>{brl(confirmed.total)}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                data-testid="whatsapp-order-button"
                onClick={() => window.open(buildWhatsAppUrl(confirmed), "_blank")}
                className="w-full bg-[#25D366] hover:bg-[#1EBE59] text-white font-bold py-3.5 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Enviar pedido no WhatsApp
              </button>
              <button
                data-testid="track-order-button-success"
                onClick={() => { setTrackingCode(confirmed.code); setTrackingOpen(true); close(false); }}
                className="w-full bg-carvao text-white font-bold py-3.5 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <Bike className="w-4 h-4" /> Acompanhar pedido
              </button>
              <button
                data-testid="order-done-button"
                onClick={() => close(false)}
                className="text-sm font-semibold text-carvao/50 hover:text-carvao transition-colors py-1"
              >
                Voltar ao cardápio
              </button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
