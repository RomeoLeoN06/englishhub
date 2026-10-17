import { NavLink } from 'react-router-dom';
import { useCategoryModal } from '../context/CategoryModalContext';

export default function Navbar() {
  const { openCategoryModal, categories } = useCategoryModal();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <span className="navbar-logo-icon">E</span>
          EnglishHub
        </NavLink>
        <div className="navbar-nav">
          <button
            type="button"
            className="nav-link nav-cat-compact-btn"
            onClick={() => openCategoryModal()}
            title="Kategoriler (Kısayol: K)"
            id="navbar-categories-btn"
          >
            <span>📂</span>
            <span className="nav-cat-label">Kategoriler</span>
          </button>

          <NavLink
            to="/learn"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            📚 Öğren
          </NavLink>
          <NavLink
            to="/quiz"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            🧠 Quiz
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
