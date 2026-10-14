import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { STORE_NAME } from '../config/store';
import { clearToken, getToken } from '../services/api';
import Footer from './Footer';
import '../styles/layout.css';

export default function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const logged = Boolean(getToken());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const logout = () => {
    clearToken();
    navigate('/');
  };

  return (
    <div className="site-shell">
      <header className={scrolled ? 'site-header scrolled' : 'site-header'}>
        <div className="container header-bar">
          <Link to="/" className="brand">{STORE_NAME}</Link>
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden="true">{open ? '✕' : '☰'}</span>
          </button>
          <nav id="main-nav" aria-label="Principal" className={open ? 'open' : ''} onClick={() => setOpen(false)}>
            <NavLink to="/" end>Catálogo</NavLink>
            {logged ? (
              <>
                <NavLink to="/admin">Panel</NavLink>
                <button type="button" onClick={logout}>Salir</button>
              </>
            ) : (
              <NavLink to="/admin/login">Admin</NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="site-main">
        <div className="container">
          <Outlet />
        </div>
      </main>
      {!pathname.startsWith('/admin') && <Footer />}
    </div>
  );
}
