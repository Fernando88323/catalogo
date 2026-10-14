import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import ProductCard from './ProductCard';

export default function RelatedProducts({ productId }) {
  const [items, setItems] = useState(null);
  const track = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api.getRelated(productId).then((r) => !cancelled && setItems(r)).catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const scroll = (dir) => {
    const el = track.current;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (items && !items.length) return null;

  return (
    <section className="related" aria-labelledby="related-title">
      <div className="related-head">
        <h2 id="related-title">También te puede interesar</h2>
        <div className="related-arrows">
          <button type="button" aria-label="Anterior" onClick={() => scroll(-1)}>‹</button>
          <button type="button" aria-label="Siguiente" onClick={() => scroll(1)}>›</button>
        </div>
      </div>
      <div className="related-track" ref={track}>
        {items
          ? items.map((p) => <div className="related-item" key={p.id}><ProductCard product={p} /></div>)
          : Array.from({ length: 4 }, (_, i) => <div className="related-item related-skeleton" key={i} />)}
      </div>
    </section>
  );
}
