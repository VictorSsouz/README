import { Clock, Instagram, MapPin, Phone } from "lucide-react";
import { LogoMark } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-carvao text-white pt-20 pb-10 overflow-hidden" data-testid="footer">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center gap-3 mb-12">
          <LogoMark className="w-10 h-10" />
          <span className="font-display font-black text-2xl tracking-tight">
            Espetinhos <span className="text-brasa">West</span>
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-10 pb-14 border-b border-white/10">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">
              <MapPin className="w-4 h-4" /> Onde estamos
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Rua das Palmeiras, 450<br />
              Vila Oeste — São Paulo/SP
            </p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">
              <Clock className="w-4 h-4" /> Horários
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Terça a domingo<br />
              11h às 23h — almoço e jantar
            </p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-4">
              <Phone className="w-4 h-4" /> Contato
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              (11) 4002-8922<br />
              @espetinhoswest
            </p>
            <a
              href="#topo"
              data-testid="footer-instagram"
              className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-ambar hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4" /> Segue a gente
            </a>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="font-display font-black text-[13vw] leading-none tracking-tighter text-white/[0.06] whitespace-nowrap select-none mt-10 -mb-4"
        >
          ESPETINHOS WEST
        </p>

        <p className="text-xs text-white/30 relative">
          © 2026 Espetinhos West — esboço demonstrativo de app de delivery.
        </p>
      </div>
    </footer>
  );
}
