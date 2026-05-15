import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import '../assets/css/Catalog.css';

const Wishlist = () => {
  const { wishlist } = useWishlist();
  const { products } = useProducts();

  const items = useMemo(() => {
    return wishlist
      .map(saved => products.find(p => p.id === saved.id) || saved)
      .filter(p => p && p.name);
  }, [wishlist, products]);

  return (
    <div className="catalog container animate-fade-in">
      <div className="catalog-head">
        <span className="eyebrow">Saved Pieces</span>
        <h1 className="section-title">Your Wishlist</h1>
        <p>{items.length} {items.length === 1 ? 'piece' : 'pieces'} saved for later</p>
      </div>

      {items.length > 0 ? (
        <div className="catalog-products">
          {items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state empty-state-rich">
          <div className="empty-state-icon">
            <Heart size={28} />
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Explore the catalog to find pieces you love and save them here.</p>
          <Link to="/" className="btn btn-primary mt-4">Browse home</Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
