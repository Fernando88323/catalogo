import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import '../styles/catalog.css';

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const search = params.get('q') || '';
  const category = params.get('categoria') || '';
  const page = Number(params.get('pagina')) || 1;

  const [text, setText] = useState(search);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ items: [], total: 0, pageSize: 12 });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .getProducts({ search, category, page: page > 1 ? page : '' })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus('ok');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [search, category, page]);

  const update = (changes) => {
    setStatus('loading');
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  const submit = (e) => {
    e.preventDefault();
    update({ q: text.trim(), pagina: '' });
  };

  const clear = () => {
    setText('');
    setStatus('loading');
    setParams({});
  };

  const totalPages = Math.max(Math.ceil(data.total / data.pageSize), 1);

  return (
    <section>
      <div className="catalog-hero">
        <h1>Nuestro catálogo</h1>
        <p>Elige tus productos y pídelos directo por WhatsApp.</p>
      </div>

      <form className="catalog-search" onSubmit={submit} role="search">
        <input
          type="search"
          placeholder="Buscar productos…"
          aria-label="Buscar productos"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn">Buscar</button>
      </form>

      <div className="chips" role="group" aria-label="Categorías">
        <button type="button" className={!category ? 'chip active' : 'chip'} onClick={() => update({ categoria: '', pagina: '' })}>
          Todas
        </button>
        {categories.map((c) => (
          <button
            type="button"
            key={c.id}
            className={category === c.slug ? 'chip active' : 'chip'}
            onClick={() => update({ categoria: c.slug, pagina: '' })}
          >
            {c.name}
          </button>
        ))}
      </div>

      {status === 'error' && <p className="status status-error">No se pudo cargar el catálogo.</p>}

      {status === 'loading' && (
        <div className="product-grid" aria-busy="true">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      )}

      {status === 'ok' && data.items.length === 0 && (
        <div className="empty-state">
          <p>No encontramos productos con esos filtros.</p>
          <button type="button" className="btn btn-outline" onClick={clear}>Limpiar filtros</button>
        </div>
      )}

      {status === 'ok' && data.items.length > 0 && (
        <div className="product-grid">
          {data.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Paginación">
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => update({ pagina: page - 1 > 1 ? page - 1 : '' })}>
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button className="btn btn-outline" disabled={page >= totalPages} onClick={() => update({ pagina: page + 1 })}>
            Siguiente
          </button>
        </nav>
      )}
    </section>
  );
}
