import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { adminApi } from "../../utils/adminApi";
import { brl } from "../../context/CartContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  { id: "marmitas", label: "Marmitas" },
  { id: "combos", label: "Combos" },
  { id: "espetinhos", label: "Espetinhos" },
  { id: "bebidas", label: "Bebidas" },
];

const EMPTY = { name: "", description: "", price: "", category: "marmitas", image: "", badge: "", serves: "1 pessoa" };

export default function ProductsTab({ token, onUnauthorized }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await axios.get(`${API}/products`);
    setProducts(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setForm(EMPTY); setEditing("new"); setError(""); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, image: p.image, badge: p.badge || "", serves: p.serves });
    setEditing(p.id);
    setError("");
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim() || !form.price || !form.image.trim()) {
      setError("Preencha nome, preço e imagem.");
      return;
    }
    setSaving(true);
    const payload = { ...form, price: parseFloat(String(form.price).replace(",", ".")), badge: form.badge.trim() || null };
    try {
      if (editing === "new") await adminApi(token).post("/admin/products", payload);
      else await adminApi(token).put(`/admin/products/${editing}`, payload);
      setEditing(null);
      load();
    } catch (e) {
      if (e?.response?.status === 401) return onUnauthorized();
      setError("Não foi possível salvar. Confira os dados.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Remover "${p.name}" do cardápio?`)) return;
    try {
      await adminApi(token).delete(`/admin/products/${p.id}`);
      load();
    } catch (e) {
      if (e?.response?.status === 401) onUnauthorized();
    }
  };

  if (loading) return <div className="py-20 text-center text-carvao/40 text-sm">Carregando cardápio...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-carvao/50">{products.length} itens no cardápio</p>
        <button
          data-testid="admin-new-product-button"
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-brasa hover:bg-brasa-dark text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Novo item
        </button>
      </div>

      <div data-testid="admin-products-list" className="space-y-3">
        {products.map((p) => (
          <div key={p.id} data-testid={`admin-product-${p.id}`} className="bg-white border border-border rounded-2xl p-3.5 flex items-center gap-4">
            <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover border border-border shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-carvao truncate">{p.name}</p>
              <p className="text-xs text-carvao/50">
                {CATEGORIES.find((c) => c.id === p.category)?.label} · <span className="font-bold text-carvao">{brl(p.price)}</span>
              </p>
            </div>
            <button
              data-testid={`admin-edit-${p.id}`}
              onClick={() => openEdit(p)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-areia text-carvao/60 hover:text-brasa transition-colors active:scale-95"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              data-testid={`admin-delete-${p.id}`}
              onClick={() => remove(p)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-areia text-carvao/60 hover:text-brasa transition-colors active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent data-testid="product-form-dialog" className="sm:max-w-md bg-white rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-black tracking-tight">
              {editing === "new" ? "Novo item" : "Editar item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Field label="Nome"><input data-testid="product-name-input" value={form.name} onChange={set("name")} className={inputCls} placeholder="Marmita de..." /></Field>
            <Field label="Descrição"><textarea data-testid="product-description-input" value={form.description} onChange={set("description")} rows={2} className={inputCls} placeholder="Arroz, feijão..." /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço (R$)"><input data-testid="product-price-input" value={form.price} onChange={set("price")} inputMode="decimal" className={inputCls} placeholder="22,90" /></Field>
              <Field label="Serve"><input data-testid="product-serves-input" value={form.serves} onChange={set("serves")} className={inputCls} placeholder="1 pessoa" /></Field>
            </div>
            <Field label="Categoria">
              <select data-testid="product-category-select" value={form.category} onChange={set("category")} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="URL da imagem"><input data-testid="product-image-input" value={form.image} onChange={set("image")} className={inputCls} placeholder="https://..." /></Field>
            <Field label="Selo (opcional)"><input data-testid="product-badge-input" value={form.badge} onChange={set("badge")} className={inputCls} placeholder="Mais pedida, -15%, Novo..." /></Field>
          </div>
          {error && <p data-testid="product-form-error" className="text-sm text-brasa font-semibold mt-3">{error}</p>}
          <button
            data-testid="product-save-button"
            onClick={save}
            disabled={saving}
            className="w-full mt-5 bg-brasa hover:bg-brasa-dark disabled:bg-carvao/20 text-white font-bold py-3.5 rounded-full transition-all active:scale-95"
          >
            {saving ? "Salvando..." : "Salvar item"}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const inputCls = "w-full bg-areia rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brasa/30";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-[0.12em] text-carvao/45 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
