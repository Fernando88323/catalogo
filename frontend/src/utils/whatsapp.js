export const formatPrice = (value, currency = '$') =>
  `${currency}${Number(value).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function buildWhatsAppLink(phone, product, quantity = 1, currency = '$') {
  const digits = String(phone || '').replace(/\D/g, '');
  const total = formatPrice(product.price * quantity, currency);
  const text =
    `Hola, quiero comprar:\n` +
    `• ${product.name}\n` +
    `• Cantidad: ${quantity}\n` +
    `• Precio unitario: ${formatPrice(product.price, currency)}\n` +
    `• Total: ${total}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
