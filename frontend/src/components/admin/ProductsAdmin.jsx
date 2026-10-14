import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, assetUrl } from '../../services/api';
import { CURRENCY } from '../../config/store';
import { formatPrice } from '../../utils/whatsapp';
import { useToast } from '../Toast';
import ConfirmDialog from './ConfirmDialog';
import ProductForm from './ProductForm';
import useAdminError from './useAdminError';

export default function ProductsAdmin() {
  const handleError = useAdminError();
  const { notify } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api.admin.products(), api.getCategories()]);
      setProducts(p);
      setCategories(c);
    } catch (e) {
      handleError(e, setError);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [products, query]);

  const confirmRemove = async () => {
    const p = toDelete;
    setToDelete(null);
    try {
      await api.admin.deleteProduct(p.id);
      notify('Producto eliminado');
      load();
    } catch (e) {
      handleError(e, (m) => notify(m, 'error'));
    }
  };

  if (editing) {
    return (
      <ProductForm
        product={editing === 'new' ? null : editing}
        categories={categories}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          notify(editing === 'new' ? 'Producto creado' : 'Cambios guardados');
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <div className="card">
      <div className="toolbar">
        <h2>Productos <span className="count">{products.length}</span></h2>
        <button className="btn" onClick={() => setEditing('new')}>+ Nuevo producto</button>
      </div>
      <input
        type="search"
        className="admin-search"
        aria-label="Buscar producto"
        placeholder="Buscar por nombre…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {error && <p className="status-error" role="alert">{error}</p>}
      {loading && <p className="status">Cargando…</p>}
      {!loading && filtered.length === 0 && <p className="status">{products.length ? 'Sin resultados' : 'Aún no hay productos'}</p>}

      {filtered.length > 0 && (
        <ul className="admin-items">
          {filtered.map((p) => (
            <li key={p.id} className="admin-item">
              <div className="admin-item-media">
                {p.image_url ? <img src={assetUrl(p.image_url)} alt="" /> : <span>Sin foto</span>}
              </div>
              <div className="admin-item-main">
                <strong>{p.name}</strong>
                <span className="muted">{p.category || 'Sin categoría'}</span>
              </div>
              <div className="admin-item-meta">
                <span className="price">{formatPrice(p.price, CURRENCY)}</span>
                <span className={p.stock > 0 ? 'badge' : 'badge badge-soldout'}>Stock: {p.stock}</span>
                <span className={p.active ? 'badge badge-ok' : 'badge badge-off'}>{p.active ? 'Activo' : 'Oculto'}</span>
              </div>
              <div className="actions">
                <button className="btn btn-outline" onClick={() => setEditing(p)}>Editar</button>
                <button className="btn btn-danger" onClick={() => setToDelete(p)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar producto"
          message={`¿Eliminar "${toDelete.name}"? Esta acción no se puede deshacer.`}
          onConfirm={confirmRemove}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
