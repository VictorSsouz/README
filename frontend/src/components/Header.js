import { motion } from "framer-motion";
import { Search, ShoppingBag, Bike } from "lucide-react";
import { LogoFull } from "./Logo";
import { useCart } from "../context/CartContext";

const links = [
  { label: "Marmitas", href: "#cardapio" },
  { label: "Espetinhos", href: "#cardapio" },
  { label: "Combos", href: "#cardapio" },
  { label: "Sobre", href: "#sobre" },
];

export default function Header() {
  const { count, setCartOpen, setTrackingOpen } = useCart();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/85 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        <LogoFull />

        <nav className="hidden md:flex items-center gap-7" data-testid="main-nav">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className="text-sm font-medium text-carvao/70 hover:text-brasa transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            data-testid="track-order-nav-button"
            onClick={() => setTrackingOpen(true)}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold text-carvao/70 hover:text-brasa transition-colors"
          >
            <Bike className="w-4 h-4" />
            Acompanhar
          </button>
          <div className="hidden lg:flex items-center gap-2 bg-areia rounded-full px-4 py-2 w-56">
            <Search className="w-4 h-4 text-carvao/40" />
            <input
              data-testid="search-input"
              placeholder="Buscar no cardápio..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-carvao/40"
            />
          </div>

          <button
            data-testid="cart-trigger-button"
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 bg-brasa hover:bg-brasa-dark text-white rounded-full pl-4 pr-5 py-2.5 font-semibold text-sm transition-all duration-200 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Sacola</span>
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                data-testid="cart-count-badge"
                className="absolute -top-1.5 -right-1.5 bg-carvao text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
              >
                {count}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
