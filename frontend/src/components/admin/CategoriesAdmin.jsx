import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../Toast';
import ConfirmDialog from './ConfirmDialog';
import useAdminError from './useAdminError';

export default function CategoriesAdmin() {
  const handleError = useAdminError();
  const { notify } = useToast();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    () => api.getCategories().then(setCategories).catch((e) => notify(e.message, 'error')).finally(() => setLoading(false)),
    [notify]
  );

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn, okMsg) => {
    try {
      await fn();
      notify(okMsg);
      load();
    } catch (e) {
      handleError(e, (m) => notify(m, 'error'));
    }
  };

  const add = (e) => {
    e.preventDefault();
    run(async () => {
      await api.admin.createCategory(name.trim());
      setName('');
    }, 'Categoría creada');
  };

  const startEdit = (c) => {
    setEditId(c.id);
    setEditName(c.name);
  };

  const saveEdit = (e, c) => {
    e.preventDefault();
    const next = editName.trim();
    setEditId(null);
    if (next && next !== c.name) run(() => api.admin.updateCategory(c.id, next), 'Categoría actualizada');
  };

  const confirmRemove = () => {
    const c = toDelete;
    setToDelete(null);
    run(() => api.admin.deleteCategory(c.id), 'Categoría eliminada');
  };

  return (
    <div className="card">
      <h2>Categorías <span className="count">{categories.length}</span></h2>
      <form className="inline-form" onSubmit={add}>
        <input aria-label="Nueva categoría" placeholder="Nueva categoría" required maxLength="100" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn">Agregar</button>
      </form>
      {loading && <p className="status">Cargando…</p>}
      {!loading && categories.length === 0 && <p className="status">Aún no hay categorías</p>}
      <ul className="list">
        {categories.map((c) => (
          <li key={c.id}>
            {editId === c.id ? (
              <form className="inline-form inline-edit" onSubmit={(e) => saveEdit(e, c)}>
                <input aria-label="Nombre de la categoría" required maxLength="100" autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} />
                <button className="btn">Guardar</button>
                <button type="button" className="btn btn-outline" onClick={() => setEditId(null)}>Cancelar</button>
              </form>
            ) : (
              <>
                <span>{c.name}</span>
                <span className="actions">
                  <button className="btn btn-outline" onClick={() => startEdit(c)}>Renombrar</button>
                  <button className="btn btn-danger" onClick={() => setToDelete(c)}>Eliminar</button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      {toDelete && (
        <ConfirmDialog
          title="Eliminar categoría"
          message={`¿Eliminar "${toDelete.name}"? Sus productos quedarán sin categoría.`}
          onConfirm={confirmRemove}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
