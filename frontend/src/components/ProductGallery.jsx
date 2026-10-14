import { useState } from 'react';
import { assetUrl } from '../services/api';

// Muestra la imagen seleccionada completa (sin recortar) y miniaturas para cambiar
export default function ProductGallery({ images, name }) {
  const [current, setCurrent] = useState(0);
  const urls = images.map(assetUrl);

  if (!urls.length) return <div className="gallery-empty">Sin imagen</div>;

  return (
    <div className="gallery">
      <a className="gallery-main" href={urls[current]} target="_blank" rel="noreferrer" title="Abrir imagen original">
        <img src={urls[current]} alt={`${name} – imagen ${current + 1}`} />
      </a>
      {urls.length > 1 && (
        <ul className="gallery-thumbs" aria-label="Imágenes del producto">
          {urls.map((u, i) => (
            <li key={u}>
              <button
                type="button"
                className={i === current ? 'active' : ''}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={i === current}
                onClick={() => setCurrent(i)}
              >
                <img src={u} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
