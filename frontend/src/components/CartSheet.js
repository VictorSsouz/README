import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, Bike } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { useCart, brl } from "../context/CartContext";

export default function CartSheet() {
  const {
    items, cartOpen, setCartOpen, setQty, removeItem,
    subtotal, deliveryFee, total, freeDelivery, setCheckoutOpen,
  } = useCart();

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        data-testid="cart-sheet"
        className="w-full sm:max-w-md flex flex-col bg-white p-0"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="font-display text-2xl font-black tracking-tight">
            Sua sacola
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div data-testid="cart-empty-state" className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <Bike className="w-12 h-12 text-carvao/20" />
            <p className="font-display font-bold text-lg text-carvao">Sacola vazia</p>
            <p className="text-sm text-carvao/50">Adicione uma marmita caprichada ou um espetinho na brasa.</p>
            <button
              data-testid="cart-empty-cta"
              onClick={() => setCartOpen(false)}
              className="mt-3 bg-brasa hover:bg-brasa-dark text-white font-bold px-6 py-3 rounded-full text-sm transition-all active:scale-95"
            >
              Explorar cardápio
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    data-testid={`cart-item-${item.id}`}
                    className="flex gap-3.5 items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-carvao truncate">{item.name}</p>
                      <p className="text-xs text-carvao/50">{brl(item.price)} un.</p>
                      <div className="mt-1.5 inline-flex items-center gap-2.5 bg-areia rounded-full px-1.5 py-1">
                        <button
                          data-testid={`qty-minus-${item.id}`}
                          onClick={() => setQty(item.id, item.qty - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-carvao active:scale-90 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span data-testid={`qty-value-${item.id}`} className="text-sm font-bold w-4 text-center">{item.qty}</span>
                        <button
                          data-testid={`qty-plus-${item.id}`}
                          onClick={() => setQty(item.id, item.qty + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-carvao active:scale-90 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-sm">{brl(item.price * item.qty)}</p>
                      <button
                        data-testid={`remove-item-${item.id}`}
                        onClick={() => removeItem(item.id)}
                        className="mt-2 text-carvao/30 hover:text-brasa transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t border-border px-6 py-5 space-y-2.5 bg-areia/50">
              {!freeDelivery && (
                <p className="text-xs text-brasa font-semibold" data-testid="free-delivery-hint">
                  Faltam {brl(50 - subtotal)} para frete grátis
                </p>
              )}
              <div className="flex justify-between text-sm text-carvao/60">
                <span>Subtotal</span>
                <span data-testid="cart-subtotal">{brl(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-carvao/60">
                <span>Entrega</span>
                <span data-testid="cart-delivery-fee">{deliveryFee === 0 ? "Grátis" : brl(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-display font-black text-xl text-carvao pt-1">
                <span>Total</span>
                <span data-testid="cart-total">{brl(total)}</span>
              </div>
              <button
                data-testid="checkout-button"
                onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                className="w-full mt-2 bg-brasa hover:bg-brasa-dark text-white font-bold py-4 rounded-full transition-all duration-200 active:scale-95"
              >
                Finalizar pedido
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
