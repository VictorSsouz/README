import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock, LogOut, ClipboardList, UtensilsCrossed, ArrowLeft } from "lucide-react";
import { LogoMark } from "../components/Logo";
import OrdersTab from "../components/admin/OrdersTab";
import ProductsTab from "../components/admin/ProductsTab";
import { formatApiError } from "../utils/adminApi";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem("ew_admin_token") || "");
  const [tab, setTab] = useState("pedidos");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("ew_admin_token", res.data.token);
      setToken(res.data.token);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("ew_admin_token");
    setToken("");
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-areia flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm bg-white border border-border rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <LogoMark className="w-10 h-10" />
            <div>
              <p className="font-display font-black text-lg leading-none">Painel do Dono</p>
              <p className="text-xs text-carvao/45 mt-1">Espetinhos West</p>
            </div>
          </div>
          <form onSubmit={login} className="space-y-3">
            <input
              data-testid="admin-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email do dono"
              className="w-full bg-areia rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-brasa/30"
            />
            <input
              data-testid="admin-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full bg-areia rounded-2xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-brasa/30"
            />
            {error && <p data-testid="admin-login-error" className="text-sm text-brasa font-semibold">{error}</p>}
            <button
              data-testid="admin-login-button"
              type="submit"
              disabled={loading}
              className="w-full bg-brasa hover:bg-brasa-dark disabled:bg-carvao/20 text-white font-bold py-3.5 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <a href="/" data-testid="admin-back-link" className="flex items-center justify-center gap-1.5 mt-5 text-xs font-semibold text-carvao/45 hover:text-brasa transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-areia">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 border-b border-border">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoMark className="w-8 h-8" />
            <p className="font-display font-black tracking-tight">Painel do Dono</p>
          </div>
          <button
            data-testid="admin-logout-button"
            onClick={logout}
            className="flex items-center gap-2 text-sm font-semibold text-carvao/60 hover:text-brasa transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        <div className="flex gap-2.5 mb-8" data-testid="admin-tabs">
          <TabButton active={tab === "pedidos"} onClick={() => setTab("pedidos")} icon={ClipboardList} testid="admin-tab-pedidos">
            Pedidos
          </TabButton>
          <TabButton active={tab === "cardapio"} onClick={() => setTab("cardapio")} icon={UtensilsCrossed} testid="admin-tab-cardapio">
            Cardápio
          </TabButton>
        </div>

        {tab === "pedidos" ? (
          <OrdersTab token={token} onUnauthorized={logout} />
        ) : (
          <ProductsTab token={token} onUnauthorized={logout} />
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, testid, children }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all active:scale-95 ${
        active ? "bg-carvao text-white" : "bg-white text-carvao/55 border border-border hover:border-carvao/30"
      }`}
    >
      <Icon className="w-4 h-4" /> {children}
    </button>
  );
}
