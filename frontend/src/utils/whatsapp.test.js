import test from 'node:test';
import assert from 'node:assert';
import { buildWhatsAppLink, formatPrice } from './whatsapp.js';

test('formatPrice usa moneda y dos decimales', () => {
  assert.strictEqual(formatPrice(15, '$'), '$15,00');
});

test('buildWhatsAppLink limpia el n??mero y codifica el mensaje', () => {
  const url = new URL(buildWhatsAppLink('+52 (123) 456-7890', { name: 'Camiseta & Co', price: 10 }, 3, '$'));
  assert.strictEqual(url.origin + url.pathname, 'https://wa.me/521234567890');
  const text = url.searchParams.get('text');
  assert.match(text, /Camiseta & Co/);
  assert.match(text, /Cantidad: 3/);
  assert.match(text, /Total: \$30,00/);
});

