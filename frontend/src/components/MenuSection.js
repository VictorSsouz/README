import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { id: "todas", label: "Tudo" },
  { id: "marmitas", label: "Marmitas" },
  { id: "combos", label: "Combos" },
  { id: "espetinhos", label: "Espetinhos" },
  { id: "bebidas", label: "Bebidas" },
];

export default function MenuSection() {
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState("todas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/products`)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = active === "todas" ? products : products.filter((p) => p.category === active);

  return (
    <section id="cardapio" className="py-24 sm:py-28 bg-areia/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brasa mb-3">Cardápio</p>
            <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tighter text-carvao">
              O que vai ser hoje?
            </h2>
          </div>
          <p className="text-sm text-carvao/50 max-w-xs">
            Tudo feito na hora, embalado com capricho e entregue quentinho na sua porta.
          </p>
        </div>

        <div
          data-testid="category-chips"
          className="flex gap-2.5 overflow-x-auto pb-2 mb-10 -mx-5 px-5 sm:mx-0 sm:px-0"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              data-testid={`category-${c.id}`}
              onClick={() => setActive(c.id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 active:scale-95 ${
                active === c.id
                  ? "bg-carvao text-white"
                  : "bg-white text-carvao/60 border border-border hover:border-carvao/30"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-white border border-border animate-pulse" />
            ))}
          </div>
        ) : (
          <div data-testid="products-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
