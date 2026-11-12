import { brl } from "../context/CartContext";

export function buildWhatsAppUrl(order) {
  const number = process.env.REACT_APP_WHATSAPP_NUMBER;
  const lines = [
    `*Pedido ${order.code} — Espetinhos West*`,
    "",
    ...order.items.map((i) => `${i.qty}x ${i.name} — ${brl(i.price * i.qty)}`),
    `Entrega — ${order.delivery_fee === 0 ? "Grátis" : brl(order.delivery_fee)}`,
    `*Total: ${brl(order.total)}*`,
    "",
    `Nome: ${order.customer.name}`,
    `Endereço: ${order.customer.address}`,
  ];
  if (order.customer.phone) lines.push(`Telefone: ${order.customer.phone}`);
  if (order.customer.notes) lines.push(`Obs: ${order.customer.notes}`);
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
}
