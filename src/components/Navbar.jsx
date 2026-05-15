import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Heart, Scale, LogOut, User, FileText, Settings } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCollection } from '../context/CollectionContext';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import '../assets/css/Navbar.css';

const Navbar = () => {
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { count: collectionCount } = useCollection();
  const { rawCategories } = useProducts();
  const { user, logout, isAuthed } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/catalog${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  const onLogout = () => { logout(); navigate('/'); };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-monogram" aria-hidden="true">C</span>
          <span className="navbar-wordmark">Comforto</span>
          <span className="navbar-eyebrow">Furniture</span>
        </Link>

        <nav className="navbar-links">
          {rawCategories.map(c => (
            <NavLink
              key={c}
              to={`/catalog?category=${encodeURIComponent(c)}`}
              className="navbar-link"
            >
              {c}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <form className="navbar-search" onSubmit={onSearch}>
            <Search size={16} />
            <input
              type="search"
              placeholder="Search curated pieces..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </form>

          <Link to="/compare" className="navbar-icon" title="Compare">
            <Scale size={18} />
            {compareList.length > 0 && <span className="badge">{compareList.length}</span>}
          </Link>

          {isAuthed && user?.role === 'admin' && (
            <Link to="/collection" className="navbar-icon" title="Create Collection">
              <FileText size={18} />
              {collectionCount > 0 && <span className="badge">{collectionCount}</span>}
            </Link>
          )}

          {isAuthed && (user?.role === 'admin' || user?.role === 'designer') && (
            <Link to="/admin" className="navbar-icon" title="Admin">
              <Settings size={18} />
            </Link>
          )}

          <Link to="/wishlist" className="navbar-icon" title="Wishlist">
            <Heart size={18} />
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </Link>

          {isAuthed ? (
            <div className="navbar-user">
              <span className="navbar-username"><User size={14} /> {user.name}</span>
              <button className="navbar-staff" onClick={onLogout} title="Sign out">
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-staff">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
