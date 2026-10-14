import { useState } from 'react';
import { api, assetUrl } from '../../services/api';
import useAdminError from './useAdminError';

const MAX_IMAGES = 5;

export default function ProductForm({ product, categories, onCancel, onSaved }) {
  const handleError = useAdminError();
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    stock: product?.stock ?? 0,
    category_id: product?.category_id ?? '',
    images: product?.images ?? [],
    active: product ? Boolean(product.active) : true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const onFiles = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    if (!files.length) return;
    if (form.images.length + files.length > MAX_IMAGES) {
      setError(`Máximo ${MAX_IMAGES} imágenes por producto`);
      return;
    }
    setError('');
    setUploading(true);
    try {
      const { urls } = await api.admin.upload(files);
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      handleError(err, setError);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  const makeCover = (i) =>
    setForm((f) => ({ ...f, images: [f.images[i], ...f.images.filter((_, idx) => idx !== i)] }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const body = {
      name: form.name,
      description: form.description,
      active: form.active,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id ? Number(form.category_id) : null,
      images: form.images,
    };
    try {
      if (product) await api.admin.updateProduct(product.id, body);
      else await api.admin.createProduct(body);
      onSaved();
    } catch (err) {
      handleError(err, setError);
      setSaving(false);
    }
  };

  return (
    <form className="card form-grid" onSubmit={submit}>
      <div className="form-head">
        <h2>{product ? 'Editar producto' : 'Nuevo producto'}</h2>
        <p>{product ? 'Actualiza los datos y las imágenes del producto.' : 'Completa los datos para publicar un nuevo producto.'}</p>
      </div>

      <div className="form-cols">
      <div className="form-main">
      <fieldset>
        <legend>Información</legend>
        <div>
          <label htmlFor="name">Nombre</label>
          <input id="name" required maxLength="150" value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label htmlFor="description">Descripción</label>
          <textarea id="description" rows="4" value={form.description} onChange={set('description')} />
        </div>
      </fieldset>

      <fieldset>
        <legend>Precio e inventario</legend>
        <div className="row">
          <div>
            <label htmlFor="price">Precio</label>
            <input id="price" type="number" step="0.01" min="0" required value={form.price} onChange={set('price')} />
          </div>
          <div>
            <label htmlFor="stock">Stock</label>
            <input id="stock" type="number" min="0" required value={form.stock} onChange={set('stock')} />
          </div>
          <div>
            <label htmlFor="category">Categoría</label>
            <select id="category" value={form.category_id} onChange={set('category_id')}>
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </fieldset>
      </div>

      <div className="form-side">
      <fieldset>
        <legend>Imágenes ({form.images.length}/{MAX_IMAGES})</legend>
        <label htmlFor="image" className="upload-drop">
          {uploading ? 'Subiendo…' : 'Seleccionar imágenes (JPG, PNG o WebP, máx. 2 MB c/u)'}
        </label>
        <input
          id="image"
          className="visually-hidden"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading || form.images.length >= MAX_IMAGES}
          onChange={onFiles}
        />
        <ul className="image-list">
          {form.images.map((url, i) => (
            <li key={url}>
              <img className="preview" src={assetUrl(url)} alt={`Imagen ${i + 1}`} />
              {i === 0 ? <span className="badge badge-ok">Portada</span> : <button type="button" onClick={() => makeCover(i)}>Hacer portada</button>}
              <button type="button" onClick={() => removeImage(i)}>Quitar</button>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend>Publicación</legend>
        <label className="check">
          <input type="checkbox" checked={form.active} onChange={set('active')} /> Visible en el catálogo
        </label>
      </fieldset>
      </div>
      </div>
      {error && <p className="status-error" role="alert">{error}</p>}
      <div className="actions form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button>
        <button className="btn" disabled={saving || uploading}>{saving ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  );
}
