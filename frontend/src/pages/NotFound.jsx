import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="not-found">
      <p className="not-found-code">404</p>
      <h1>Página no encontrada</h1>
      <p className="muted">La página que buscas no existe o fue movida.</p>
      <Link to="/" className="btn">Volver al catálogo</Link>
    </section>
  );
}
