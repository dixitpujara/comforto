import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Scale, FilePlus, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCollection } from '../context/CollectionContext';
import SafeImage from './SafeImage';
import '../assets/css/ProductCard.css';

const ProductCard = ({ product, to }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();
  const { addItem, isInCollection } = useCollection();
  const [currentImage, setCurrentImage] = useState(product.image);

  const isWishlisted = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);
  const inCollection = isInCollection(product.id);
  const detailUrl = to || `/product/${product.id}`;

  const tagClass = product.tag === 'New' ? 'tag-new'
                 : product.tag === 'Bestseller' ? 'tag-bestseller'
                 : product.tag === 'Popular' ? 'tag-popular'
                 : '';

  const handleWhatsAppShare = (e) => {
    e.preventDefault();
    const productUrl = `${window.location.origin}/p/${product.id}`;
    const text = `Have a look at the ${product.name} from Comforto Furniture (Bopal): ${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="pcard animate-fade-in">
      <Link to={detailUrl} className="pcard-image-wrap">
        {product.tag && (
          <span className={`tag-chip ${tagClass} pcard-tag`}>{product.tag.toUpperCase()}</span>
        )}
        <SafeImage src={currentImage} alt={product.name} />
        <div className="pcard-hover-actions">
          <button
            className={`pcard-icon ${isWishlisted ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            title="Wishlist"
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            className={`pcard-icon ${isCompared ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); toggleCompare(product); }}
            title="Compare"
          >
            <Scale size={16} />
          </button>
          <button
            className={`pcard-icon ${inCollection ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            title={inCollection ? 'In collection' : 'Add to collection'}
          >
            {inCollection ? <Check size={16} /> : <FilePlus size={16} />}
          </button>
          <button className="pcard-icon" onClick={handleWhatsAppShare} title="Share">
            <MessageCircle size={16} />
          </button>
        </div>
      </Link>

      <div className="pcard-meta">
        <Link to={detailUrl}><h3 className="pcard-name">{product.name}</h3></Link>
        <p className="pcard-subtitle">{product.subtitle}</p>
        <div className="pcard-swatches">
          {(product.variants || []).slice(0, 4).map(v => (
            <span
              key={v.id}
              className="pcard-swatch"
              style={{ background: v.colorHex }}
              title={v.colorName}
              onMouseEnter={() => setCurrentImage(v.image || product.image)}
              onMouseLeave={() => setCurrentImage(product.image)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
