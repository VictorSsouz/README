import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useCart, brl } from "../context/CartContext";
import { toast } from "sonner";

export default function ProductCard({ product, index }) {
  const { addItem, setCartOpen } = useCart();

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} na sacola`, {
      action: { label: "Ver sacola", onClick: () => setCartOpen(true) },
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      data-testid={`product-card-${product.id}`}
      className="group h-full flex flex-col bg-white border border-border rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-sm"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-brasa text-white text-xs font-bold px-3 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        <span className="absolute bottom-3 right-3 bg-white/95 text-carvao text-xs font-semibold px-2.5 py-1 rounded-full">
          {product.serves}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display font-bold text-lg tracking-tight text-carvao">{product.name}</h3>
        <p className="mt-1.5 text-sm text-carvao/55 leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span data-testid={`product-price-${product.id}`} className="font-display font-black text-xl text-carvao">
            {brl(product.price)}
          </span>
          <button
            data-testid={`add-to-cart-${product.id}`}
            onClick={handleAdd}
            className="inline-flex items-center gap-1.5 bg-brasa hover:bg-brasa-dark text-white text-sm font-bold pl-4 pr-5 py-2.5 rounded-full transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
      </div>
    </motion.article>
  );
}
