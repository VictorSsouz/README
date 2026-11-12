import Marquee from "react-fast-marquee";
import { Flame, UtensilsCrossed, Snowflake, Bike, Star } from "lucide-react";

const items = [
  { icon: Flame, text: "Espetinhos na brasa" },
  { icon: UtensilsCrossed, text: "Marmitas caprichadas" },
  { icon: Snowflake, text: "Bebidas geladas" },
  { icon: Bike, text: "Entrega em ~30 min" },
  { icon: Star, text: "Nota 4,9" },
];

export default function EditorialMarquee() {
  return (
    <div className="bg-brasa py-4 -rotate-1 scale-[1.02] my-4" data-testid="editorial-marquee">
      <Marquee speed={35} gradient={false} pauseOnHover>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-3 mx-8 text-white font-display font-bold text-lg tracking-tight">
            <item.icon className="w-5 h-5" />
            {item.text}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
