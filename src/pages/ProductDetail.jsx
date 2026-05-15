import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Scale, ArrowLeft, MessageCircle, FilePlus, Check } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCollection } from '../context/CollectionContext';
import { useAuth } from '../context/AuthContext';
import SafeImage from '../components/SafeImage';
import '../assets/css/ProductDetail.css';

const ProductDetail = ({ publicView = false }) => {
  const { id } = useParams();
  const { products } = useProducts();
  const product = useMemo(() => products.find(p => p.id === id), [id, products]);
  const { isAuthed, user } = useAuth();
  const canUseCollection = user?.role === 'admin';
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();
  const { addItem, isInCollection } = useCollection();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [zoomStyle, setZoomStyle] = useState({});

  const allImages = useMemo(() => {
    if (!product) return [];
    return [product.image, ...(product.gallery || [])].filter((v, i, a) => a.indexOf(v) === i);
  }, [product]);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants?.[0] || null);
      setActiveImage(product.image);
    }
  }, [product]);

  useEffect(() => {
    if (!selectedVariant || !product) return;
    if (selectedVariant.image) {
      setActiveImage(selectedVariant.image);
      return;
    }
    const idx = product.variants?.findIndex(v => v.id === selectedVariant.id) ?? -1;
    setActiveImage(allImages[idx] || product.image);
  }, [selectedVariant, product, allImages]);

  if (!product) {
    return (
      <div className="container detail-empty">
        <h2>Product not found</h2>
        <Link to="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isCompared   = isInCompare(product.id);
  const inCollection = isInCollection(product.id);
  const backLink     = publicView ? '/' : '/catalog';
  const backLabel    = publicView ? 'Back to Home' : 'Back to Catalog';

  const handleWhatsAppShare = () => {
    const variantInfo = selectedVariant ? ` (${selectedVariant.colorName})` : '';
    const shareUrl = `${window.location.origin}/p/${product.id}`;
    const text = `Have a look at the ${product.name}${variantInfo} from Comforto Furniture (Bopal): ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.7)' });
  };
  const handleMouseLeave = () => setZoomStyle({ transform: 'scale(1)' });

  const tagClass = product.tag === 'New' ? 'tag-new'
                 : product.tag === 'Bestseller' ? 'tag-bestseller'
                 : 'tag-popular';

  return (
    <div className="detail container animate-fade-in">
      <Link to={backLink} className="detail-back">
        <ArrowLeft size={18} /> {backLabel}
      </Link>

      <div className="detail-grid">
        {/* MEDIA */}
        <div className="detail-media">
          <div className="detail-image" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            {product.tag && (
              <span className={`tag-chip ${tagClass} detail-tag`}>{product.tag.toUpperCase()}</span>
            )}
            <SafeImage src={activeImage} alt={product.name} style={zoomStyle} />
          </div>

          <div className="detail-thumbs">
            {allImages.map((img, i) => (
              <button
                key={i}
                className={`detail-thumb ${activeImage === img ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
              >
                <SafeImage src={img} alt="" className="compact" />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div className="detail-info">
          <span className="eyebrow">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          <span className="detail-rule" aria-hidden="true" />
          <p className="detail-subtitle">{product.subtitle}</p>

          <div className="detail-spec">
            <span><strong>Material</strong> {product.material}</span>
            <span><strong>Room</strong> {product.roomType}</span>
            <span><strong>Availability</strong> {product.availability}</span>
          </div>

          {product.variants?.length > 0 && (
            <div className="detail-variants">
              <div className="detail-variants-head">
                <h3>Color</h3>
                <span className="variant-name">{selectedVariant?.colorName}</span>
              </div>
              <div className="swatch-row">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    className={`swatch ${selectedVariant?.id === v.id ? 'active' : ''}`}
                    style={{ background: v.colorHex }}
                    title={v.colorName}
                    onClick={() => setSelectedVariant(v)}
                  />
                ))}
              </div>
            </div>
          )}

          <p className="detail-description">{product.description}</p>

          <div className="detail-features">
            <h3>Key Features</h3>
            <ul>
              {product.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>

          <div className="detail-actions">
            {canUseCollection && (
              <button
                className={`btn btn-primary btn-large ${inCollection ? 'active' : ''}`}
                onClick={() => addItem(product)}
                disabled={inCollection}
              >
                {inCollection ? <><Check size={18} /> Added to Collection</> : <><FilePlus size={18} /> Add to Collection</>}
              </button>
            )}
            <button className="btn btn-whatsapp btn-large" onClick={handleWhatsAppShare}>
              <MessageCircle size={18} /> Inquire on WhatsApp
            </button>
            <button
              className={`btn btn-ghost btn-large ${isWishlisted ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
              {isWishlisted ? 'Wishlisted' : 'Wishlist'}
            </button>
            <button
              className={`btn btn-ghost btn-large ${isCompared ? 'active' : ''}`}
              onClick={() => toggleCompare(product)}
            >
              <Scale size={16} />
              {isCompared ? 'Comparing' : 'Compare'}
            </button>

            {publicView && (
              <p className="detail-share-note">
                Curated by Comforto Furniture · Bopal, Ahmedabad
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
