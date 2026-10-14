import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { CURRENCY, STORE_NAME } from '../config/store';
import { formatPrice } from '../utils/whatsapp';
import WhatsAppButton from '../components/WhatsAppButton';
import ProductGallery from '../components/ProductGallery';
import RelatedProducts from '../components/RelatedProducts';
import '../styles/catalog.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let cancelled = false;
    api
      .getProduct(id)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
        setQuantity(1);
        setStatus('ok');
      })
      .catch((e) => !cancelled && setStatus(e.status === 404 ? 'notfound' : 'error'));
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (product) document.title = `${product.name} | ${STORE_NAME}`;
    return () => {
      document.title = STORE_NAME;
    };
  }, [product]);

  if (status === 'loading') return <p className="status">Cargando…</p>;
  if (status === 'notfound') return <p className="status">Producto no encontrado. <Link to="/">Volver al catálogo</Link></p>;
  if (status === 'error') return <p className="status status-error">No se pudo cargar el producto.</p>;

  const max = Math.max(product.stock, 1);
  const images = product.images?.length ? product.images : product.image_url ? [product.image_url] : [];

  return (
    <section className="product-detail">
      <nav className="breadcrumb" aria-label="Ruta de navegación">
        <Link to="/">Catálogo</Link>
        {product.category && (
          <>
            <span aria-hidden="true">/</span>
            <Link to={`/?categoria=${product.category_slug}`}>{product.category}</Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <div className="product-detail-grid">
        <ProductGallery key={product.id} images={images} name={product.name} />
        <div className="product-detail-info">
          {product.category && <span className="product-card-category">{product.category}</span>}
          <h1>{product.name}</h1>
          <p className="product-card-price">{formatPrice(product.price, CURRENCY)}</p>
          <p>{product.description}</p>
          <p className="muted">{product.stock > 0 ? `Disponibles: ${product.stock}` : 'Agotado'}</p>

          <div className="quantity">
            <label htmlFor="qty">Cantidad</label>
            <input
              id="qty"
              type="number"
              min="1"
              max={max}
              value={quantity}
              disabled={product.stock < 1}
              onChange={(e) => setQuantity(Math.min(Math.max(parseInt(e.target.value, 10) || 1, 1), max))}
            />
          </div>
          <WhatsAppButton product={product} quantity={quantity} />
        </div>
      </div>
      <RelatedProducts key={product.id} productId={product.id} />
    </section>
  );
}
