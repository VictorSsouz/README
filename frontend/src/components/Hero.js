import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clock, Star, BadgePercent, ArrowDown, Flame } from "lucide-react";

const MARMITA_HERO = "/marmita-oficial.jpg";
const ESPETO_HERO = "/espetinhos/espetinho-carne.jpg";

const lines = [
  { text: "Marmitas caprichadas,", cls: "text-carvao" },
  { text: "espetinhos na brasa.", cls: "text-brasa" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.25 } },
};
const lineReveal = {
  hidden: { y: "115%", rotate: 3 },
  show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};
const tileReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 70]);

  const scrollToMenu = () =>
    document.querySelector("#cardapio")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="topo" ref={ref} className="pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={tileReveal} className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-blush text-brasa text-xs font-bold uppercase tracking-[0.18em] px-3.5 py-1.5 rounded-full">
              <Flame className="w-3.5 h-3.5" /> Delivery · Zona Oeste
            </span>
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.02]">
            {lines.map((l) => (
              <span key={l.text} className="block overflow-hidden pb-1">
                <motion.span variants={lineReveal} className={`block ${l.cls}`}>
                  {l.text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            variants={tileReveal}
            className="mt-6 text-base sm:text-lg text-carvao/60 max-w-md leading-relaxed"
          >
            A marmita mais bem montada da Zona Oeste, espetinhos selados na hora e
            bebida sempre gelada. Peça agora e receba quentinho.
          </motion.p>

          <motion.div variants={tileReveal} className="mt-9 flex flex-wrap items-center gap-4">
            <button
              data-testid="hero-cta-button"
              onClick={scrollToMenu}
              className="group inline-flex items-center gap-2.5 bg-brasa hover:bg-brasa-dark text-white font-bold px-8 py-4 rounded-full text-base transition-all duration-200 active:scale-95"
            >
              Ver cardápio
              <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" />
            </button>
            <div className="flex items-center gap-2 text-sm text-carvao/60">
              <span className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-ambar text-ambar" />
                ))}
              </span>
              <span data-testid="hero-rating"><strong className="text-carvao">4,9</strong> · 2.300+ pedidos</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 sm:gap-5"
        >
          <motion.div
            variants={tileReveal}
            style={{ y: imgY }}
            data-testid="hero-marmita-tile"
            className="col-span-2 relative rounded-3xl overflow-hidden h-64 sm:h-80 border border-border"
          >
            <img src={MARMITA_HERO} alt="Marmita da Casa West" className="w-full h-full object-cover scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-carvao/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-ambar">A queridinha</p>
              <p className="font-display text-2xl font-bold">Marmita da Casa West</p>
            </div>
            <span className="absolute top-4 right-4 bg-white text-carvao text-sm font-bold px-3.5 py-1.5 rounded-full">
              R$ 22,90
            </span>
          </motion.div>

          <motion.div
            variants={tileReveal}
            data-testid="hero-espeto-tile"
            className="relative rounded-3xl overflow-hidden h-40 sm:h-48 border border-border"
          >
            <img src={ESPETO_HERO} alt="Espetinhos na brasa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-carvao/30" />
            <p className="absolute bottom-4 left-4 text-white font-display font-bold text-lg leading-tight">
              Espetinhos<br />a partir de R$ 8,90
            </p>
          </motion.div>

          <div className="grid grid-rows-2 gap-4 sm:gap-5">
            <motion.div
              variants={tileReveal}
              data-testid="hero-delivery-tile"
              className="rounded-3xl bg-carvao text-white p-5 flex flex-col justify-between"
            >
              <Clock className="w-6 h-6 text-ambar" />
              <div>
                <p className="font-display text-2xl font-bold">~30 min</p>
                <p className="text-xs text-white/60">entrega média</p>
              </div>
            </motion.div>
            <motion.div
              variants={tileReveal}
              data-testid="hero-promo-tile"
              className="rounded-3xl bg-ambar text-carvao p-5 flex flex-col justify-between"
            >
              <BadgePercent className="w-6 h-6" />
              <div>
                <p className="font-display text-2xl font-bold">-15%</p>
                <p className="text-xs text-carvao/70">nos combos hoje</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
