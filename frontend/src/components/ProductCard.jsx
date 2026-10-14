import { Link } from 'react-router-dom';
import { CURRENCY } from '../config/store';
import { assetUrl } from '../services/api';
import { formatPrice } from '../utils/whatsapp';
import WhatsAppButton from './WhatsAppButton';

export default function ProductCard({ product }) {
  const image = assetUrl(product.image_url);
  const soldOut = product.stock < 1;

  return (
    <article className="product-card">
      <Link to={`/producto/${product.id}`} className="product-card-media" aria-label={product.name}>
        {image ? <img src={image} alt={product.name} loading="lazy" /> : <span>Sin imagen</span>}
        {soldOut && <span className="badge badge-soldout">Agotado</span>}
        <span className="product-card-view" aria-hidden="true">Ver detalle</span>
      </Link>
      <div className="product-card-body">
        {product.category && <span className="product-card-category">{product.category}</span>}
        <h3><Link to={`/producto/${product.id}`}>{product.name}</Link></h3>
        <p className="product-card-price">{formatPrice(product.price, CURRENCY)}</p>
        <WhatsAppButton product={product} />
      </div>
    </article>
  );
}
