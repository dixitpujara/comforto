import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, Scale, LogOut, User, FileText, Settings, Menu, X } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCollection } from '../context/CollectionContext';
import { useProducts } from '../context/ProductsContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';
import '../assets/css/Navbar.css';

const Navbar = () => {
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();
  const { count: collectionCount } = useCollection();
  const { rawCategories, subcategories } = useProducts();
  const { user, logout, isAuthed } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Close the mobile menu whenever the route changes.
  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location.pathname, location.search]);

  // Focus the input as soon as the search bar expands.
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const runSearch = () => {
    navigate(`/catalog${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setSearchOpen(false);
  };

  const onSearch = (e) => {
    e.preventDefault();
    runSearch();
  };

  const onLogout = () => { logout(); navigate('/'); };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Comforto Furniture">
          <img src={logo} alt="Comforto Furniture" className="navbar-logo" />
        </Link>

        <nav className="navbar-links">
          {rawCategories.map(c => {
            const subs = subcategories[c] || [];
            return (
              <div key={c} className="navbar-link-wrap">
                <NavLink
                  to={`/catalog?category=${encodeURIComponent(c)}`}
                  className="navbar-link"
                >
                  {c}
                </NavLink>
                {subs.length > 0 && (
                  <div className="navbar-dropdown">
                    {subs.map(s => (
                      <Link
                        key={s}
                        to={`/catalog?category=${encodeURIComponent(c)}&subcategory=${encodeURIComponent(s)}`}
                        className="navbar-dropdown-link"
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="navbar-actions">
          <button
            type="button"
            className={`navbar-icon ${searchOpen ? 'active' : ''}`}
            aria-label="Search"
            aria-expanded={searchOpen}
            title="Search"
            onClick={() => setSearchOpen(o => !o)}
          >
            <Search size={18} />
          </button>

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

          {isAuthed && user?.role === 'admin' && (
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

        <button
          type="button"
          className="navbar-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className={`navbar-searchbar ${searchOpen ? 'open' : ''}`}>
        <form className="container navbar-searchbar-form" onSubmit={onSearch}>
          <Search size={18} />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search curated pieces..."
            value={q}
            onChange={e => setQ(e.target.value)}
            tabIndex={searchOpen ? 0 : -1}
          />
          <button type="submit" className="navbar-searchbar-submit">Search</button>
          <button
            type="button"
            className="navbar-searchbar-close"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            <X size={18} />
          </button>
        </form>
      </div>

      <div className={`navbar-mobile ${menuOpen ? 'open' : ''}`}>
        <form className="navbar-mobile-search" onSubmit={onSearch}>
          <Search size={16} />
          <input
            type="search"
            placeholder="Search curated pieces..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </form>

        <nav className="navbar-mobile-links">
          {rawCategories.map(c => {
            const subs = subcategories[c] || [];
            return (
              <div key={c} className="navbar-mobile-group">
                <NavLink
                  to={`/catalog?category=${encodeURIComponent(c)}`}
                  className="navbar-mobile-link"
                >
                  {c}
                </NavLink>
                {subs.length > 0 && (
                  <div className="navbar-mobile-sublinks">
                    {subs.map(s => (
                      <NavLink
                        key={s}
                        to={`/catalog?category=${encodeURIComponent(c)}&subcategory=${encodeURIComponent(s)}`}
                        className="navbar-mobile-sublink"
                      >
                        {s}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="navbar-mobile-actions">
          <Link to="/compare" className="navbar-mobile-action">
            <Scale size={18} /> Compare
            {compareList.length > 0 && <span className="badge">{compareList.length}</span>}
          </Link>

          <Link to="/wishlist" className="navbar-mobile-action">
            <Heart size={18} /> Wishlist
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </Link>

          {isAuthed && user?.role === 'admin' && (
            <Link to="/collection" className="navbar-mobile-action">
              <FileText size={18} /> Create Collection
              {collectionCount > 0 && <span className="badge">{collectionCount}</span>}
            </Link>
          )}

          {isAuthed && user?.role === 'admin' && (
            <Link to="/admin" className="navbar-mobile-action">
              <Settings size={18} /> Admin
            </Link>
          )}
        </div>

        <div className="navbar-mobile-auth">
          {isAuthed ? (
            <>
              <span className="navbar-mobile-user"><User size={16} /> {user.name}</span>
              <button className="navbar-staff" onClick={onLogout}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-staff">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
