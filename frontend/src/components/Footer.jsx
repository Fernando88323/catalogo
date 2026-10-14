import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SOCIALS, STORE_NAME, WHATSAPP_NUMBER } from '../config/store';
import { api } from '../services/api';

const YEAR = new Date().getFullYear();

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.getCategories().then((c) => setCategories(c.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>{STORE_NAME}</h3>
          <p>Encuentra tus productos favoritos y haz tu pedido directo por WhatsApp, rápido y sin complicaciones.</p>
          <a className="btn btn-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer noopener">
            Escríbenos por WhatsApp
          </a>
        </div>
        <nav aria-label="Enlaces del pie">
          <h4>Tienda</h4>
          <ul>
            <li><Link to="/">Todo el catálogo</Link></li>
            {categories.map((c) => (
              <li key={c.id}><Link to={`/?categoria=${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <h4>Síguenos</h4>
          <p className="footer-note">Novedades y promociones en nuestras redes.</p>
          <div className="footer-socials">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer noopener" aria-label={s.name} title={s.name}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d={s.path} /></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <span>© {YEAR} {STORE_NAME}. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
