import { motion } from "framer-motion";
import { Flame, Timer, MapPin } from "lucide-react";

const ABOUT_IMG =
  "https://images.unsplash.com/photo-1614119068601-483274e9dcb7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxyZXN0YXVyYW50JTIwY2hlZiUyMGdyaWxsaW5nJTIwbWVhdHxlbnwwfHx8fDE3OTI3MDY0Mzd8MA&ixlib=rb-4.1.0&q=85";

const stats = [
  { icon: Flame, value: "Brasa de verdade", label: "carvão vegetal, todo dia" },
  { icon: Timer, value: "~30 min", label: "tempo médio de entrega" },
  { icon: MapPin, value: "12 bairros", label: "atendidos na Zona Oeste" },
];

export default function About() {
  return (
    <section id="sobre" className="py-24 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 relative"
        >
          <div className="rounded-3xl overflow-hidden border border-border h-[420px] lg:h-[520px]">
            <img src={ABOUT_IMG} alt="Carne na brasa" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-5 -right-3 sm:right-8 bg-ambar text-carvao rounded-3xl px-6 py-4 rotate-2">
            <p className="font-display font-black text-2xl leading-none">Desde 2019</p>
            <p className="text-xs font-semibold mt-1">na brasa, sem atalho</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 lg:pl-10"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brasa mb-4">A casa</p>
          <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tighter text-carvao leading-[1.05]">
            Nascemos numa churrasqueira de calçada.{" "}
            <span className="text-outline font-black">Crescemos sem perder o fogo.</span>
          </h2>
          <p className="mt-6 text-base text-carvao/60 leading-relaxed max-w-xl">
            O Espetinhos West começou como um point de espetinhos na Zona Oeste e virou a
            cozinha delivery que monta cada marmita como se fosse para a família: arroz
            soltinho, feijão de caldo grosso, carne selada na hora e farofa crocante.
            Sem mistério, sem enrolação — só comida de verdade, quente e no precinho.
          </p>

          <div className="mt-10 grid sm:grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="bg-blush rounded-3xl p-5"
              >
                <s.icon className="w-5 h-5 text-brasa" />
                <p className="font-display font-black text-lg mt-3 text-carvao">{s.value}</p>
                <p className="text-xs text-carvao/50 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
