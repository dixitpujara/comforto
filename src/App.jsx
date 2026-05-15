import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SiteFooter from './components/SiteFooter';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import Compare from './pages/Compare';
import Collection from './pages/Collection';
import Admin from './pages/Admin';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/p/:id" element={<ProductDetail publicView />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/compare" element={<Compare />} />

          {/* Staff-only */}
          <Route path="/collection" element={<RequireAuth role="admin"><Collection /></RequireAuth>} />
          <Route path="/catalog" element={<RequireAuth><Catalog /></RequireAuth>} />
          <Route path="/product/:id" element={<RequireAuth><ProductDetail /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  );
}

export default App;
