import { useState } from 'react';
import ProductsAdmin from '../components/admin/ProductsAdmin';
import CategoriesAdmin from '../components/admin/CategoriesAdmin';
import '../styles/admin.css';

const TABS = [
  { id: 'products', label: 'Productos', Component: ProductsAdmin },
  { id: 'categories', label: 'Categorías', Component: CategoriesAdmin },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('products');
  const { Component } = TABS.find((t) => t.id === tab);

  return (
    <section className="admin">
      <header className="admin-head">
        <h1>Panel de administración</h1>
        <p className="muted">Gestiona los productos y categorías de tu catálogo.</p>
      </header>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'tab active' : 'tab'} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <Component />
    </section>
  );
}
