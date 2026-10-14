import { buildWhatsAppLink } from '../utils/whatsapp';
import { CURRENCY, WHATSAPP_NUMBER } from '../config/store';

export default function WhatsAppButton({ product, quantity = 1, className = '' }) {
  if (product.stock < 1) {
    return (
      <button type="button" className={`btn btn-whatsapp ${className}`} disabled>
        Agotado
      </button>
    );
  }

  return (
    <a
      className={`btn btn-whatsapp ${className}`}
      href={buildWhatsAppLink(WHATSAPP_NUMBER, product, quantity, CURRENCY)}
      target="_blank"
      rel="noopener noreferrer"
    >
      Comprar por WhatsApp
    </a>
  );
}
