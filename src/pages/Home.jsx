import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sofa, Table, Lamp, Bed, Armchair, Package,
  ArrowRight,
  Sparkles, Truck, Award, Leaf, PencilRuler, Hammer,
  ChevronDown, ChevronLeft, ChevronRight,
  Heart, Scale, FilePlus, Check, MessageCircle
} from 'lucide-react';
import { categoryIcon } from '../data/products';
import SafeImage from '../components/SafeImage';
import { useProducts } from '../context/ProductsContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useCollection } from '../context/CollectionContext';
import { useAuth } from '../context/AuthContext';
import '../assets/css/Home.css';

const ICONS = { Sofa, Table, Lamp, Bed, Armchair, Package };

const TAB_FILTERS = ['All', 'New', 'Bestseller', 'Popular'];

/* ─────────── Hero (full-page parallax slider) ─────────── */
const SLIDES = [
  {
    eyebrow: 'New Collection 2026',
    title: ['The Art of Living', 'Through Precision.'],
    copy: 'Experience architectural furniture designed for the modern sanctuary. Hand-finished details meet structural integrity.',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=1800',
    primary:   { label: 'Explore Selection', to: '/catalog' },
    secondary: { label: 'View Lookbook',     to: '/catalog?category=Lounge' }
  },
  {
    eyebrow: 'Bespoke Lounge',
    title: ['Tailored to Your', 'Every Comfort.'],
    copy: 'From silhouette to finish — every Comforto piece is made-to-order, in textiles and timber chosen by you.',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1800',
    primary:   { label: 'Discover Lounge', to: '/catalog?category=Lounge' },
    secondary: { label: 'Read the Story',  to: '/catalog' }
  },
  {
    eyebrow: 'Heirloom Pieces',
    title: ['Crafted to Outlive', 'Generations.'],
    copy: 'Sustainable hardwoods, hand-finished joinery, and craftsmanship established since 2018 in every Comforto creation.',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1800',
    primary:   { label: 'See Craftsmanship', to: '/catalog' },
    secondary: { label: 'Visit Showroom',    to: '#visit' }
  }
];
const SLIDE_DURATION = 7000;

const Hero = () => {
  const [active, setActive]   = useState(0);
  const [paused, setPaused]   = useState(false);
  const total = SLIDES.length;

  // Auto-advance — interval resets whenever `active` changes (manual nav also resets timer)
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % total);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [active, paused, total]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setActive(p => (p + 1) % total);
      if (e.key === 'ArrowLeft')  setActive(p => (p - 1 + total) % total);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total]);

  const goTo = (i) => setActive(i);
  const prev = () => setActive(p => (p - 1 + total) % total);
  const next = () => setActive(p => (p + 1) % total);

  return (
    <section
      className="hero-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* Slide stage */}
      <div className="slider-stage">
        {SLIDES.map((slide, i) => {
          const state = i === active ? 'active'
                      : i === (active + 1) % total ? 'next'
                      : 'prev';
          return (
            <article
              key={i}
              className={`slide slide-${state}`}
              aria-hidden={i !== active}
            >
              <div className="slide-image-wrap">
                <SafeImage
                  src={slide.image}
                  alt=""
                  className="slide-image"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                <div className="slide-tint" />
              </div>

              <div className="container slide-overlay-wrap">
                <div className="slide-overlay">
                  <span className="hero-eyebrow">
                    <span className="diamond" /> {slide.eyebrow}
                  </span>
                  <h1 className="hero-title">
                    {slide.title.map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}{idx < slide.title.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h1>
                  <span className="hero-rule" />
                  <p className="hero-copy">{slide.copy}</p>
                  <div className="hero-actions">
                    <Link to={slide.primary.to} className="btn btn-accent">{slide.primary.label}</Link>
                    {slide.secondary.to.startsWith('#') ? (
                      <a href={slide.secondary.to} className="btn btn-outline-light">{slide.secondary.label}</a>
                    ) : (
                      <Link to={slide.secondary.to} className="btn btn-outline-light">{slide.secondary.label}</Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Gold corner ornaments — fixed to slider, persist across slides */}
      <span className="hero-corner tl" aria-hidden="true" />
      <span className="hero-corner tr" aria-hidden="true" />
      <span className="hero-corner bl" aria-hidden="true" />
      <span className="hero-corner br" aria-hidden="true" />

      {/* Vertical "established" mark on the right edge */}
      <div className="hero-vmark" aria-hidden="true">
        <span className="diamond" />
        Est. Bopal · Ahmedabad
        <span className="diamond" />
      </div>

      {/* Side arrows */}
      <button className="slider-arrow slider-arrow-prev" onClick={prev} aria-label="Previous slide">
        <ChevronLeft size={20} />
      </button>
      <button className="slider-arrow slider-arrow-next" onClick={next} aria-label="Next slide">
        <ChevronRight size={20} />
      </button>

      {/* Bottom indicator strip: counter · dots · scroll */}
      <div className="container slider-foot-wrap">
        <div className="slider-foot">
          <div className="slider-counter">
            <span className="slider-counter-active">{String(active + 1).padStart(2, '0')}</span>
            <span className="slider-counter-sep" />
            <span className="slider-counter-total">{String(total).padStart(2, '0')}</span>
          </div>

          <div className="slider-dots" role="tablist">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`slider-dot ${i === active ? 'active' : ''}`}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <a href="#browse" className="hero-scroll">
            <span>Scroll</span>
            <ChevronDown size={14} />
          </a>
        </div>
      </div>

      {/* Progress bar — fills over SLIDE_DURATION; key change re-runs animation */}
      <div className="slider-progress" aria-hidden="true">
        <div
          key={`${active}-${paused}`}
          className={`slider-progress-fill ${paused ? 'paused' : ''}`}
        />
      </div>
    </section>
  );
};

/* ─────────── Values strip (trust signals) ─────────── */
const VALUES = [
  { icon: Sparkles,    label: 'Bespoke Design' },
  { icon: Truck,       label: 'White-Glove Delivery' },
  { icon: Award, label: 'Established Since 2018' },
  { icon: Leaf,        label: 'Sustainably Sourced' }
];

const ValuesStrip = () => (
  <section className="values container">
    <div className="values-inner">
      {VALUES.map((v, i) => {
        const I = v.icon;
        return (
          <React.Fragment key={v.label}>
            <div className="value-item">
              <span className="value-icon"><I size={16} /></span>
              <span className="value-label">{v.label}</span>
            </div>
            {i < VALUES.length - 1 && <span className="diamond value-sep" aria-hidden="true" />}
          </React.Fragment>
        );
      })}
    </div>
  </section>
);

/* ─────────── Browse categories ─────────── */
const BrowseCategories = () => {
  const { rawCategories } = useProducts();
  return (
    <section id="browse" className="browse container">
      <header className="section-head">
        <span className="eyebrow">By Category</span>
        <h2 className="section-title">Browse Categories</h2>
        <p>Curated essentials for every room in your home.</p>
      </header>
      <div className="browse-grid">
        {rawCategories.map((c) => {
          const Icon = ICONS[categoryIcon[c]] || Sofa;
          return (
            <Link key={c} to={`/catalog?category=${encodeURIComponent(c)}`} className="browse-card">
              <div className="browse-icon"><Icon size={20} /></div>
              <span className="browse-label">{c}</span>
              <span className="browse-arrow"><ArrowRight size={14} /></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

/* ─────────── Featured selection ─────────── */
const FeaturedSelection = () => {
  const [filter, setFilter] = useState('All');
  const { products } = useProducts();

  const featured = useMemo(() => {
    const list = filter === 'All' ? products : products.filter(p => p.tag === filter);
    return list.slice(0, 8);
  }, [filter, products]);

  return (
    <section className="featured container">
      <header className="section-head featured-head">
        <div>
          <span className="eyebrow">Curated Picks</span>
          <h2 className="section-title">Featured Selection</h2>
          <p>The pieces our community is currently coveting.</p>
        </div>
        <div className="filter-tabs">
          {TAB_FILTERS.map(t => (
            <button
              key={t}
              className={`filter-tab ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}
            >{t}</button>
          ))}
        </div>
      </header>

      <div className="featured-grid">
        {featured.map(p => <FeaturedCard key={p.id} product={p} />)}
      </div>

      <div className="featured-cta">
        <Link to="/catalog" className="btn btn-ghost">
          View Entire Collection <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

const FeaturedCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();
  const { addItem, isInCollection } = useCollection();
  const { user } = useAuth();
  const canUseCollection = user?.role === 'admin';
  const [currentImage, setCurrentImage] = useState(product.image);
  const [activeVariantId, setActiveVariantId] = useState(null);

  const isWishlisted = isInWishlist(product.id);
  const isCompared   = isInCompare(product.id);
  const inCollection = isInCollection(product.id);

  const handleWhatsAppShare = (e) => {
    e.preventDefault();
    const productUrl = `${window.location.origin}/p/${product.id}`;
    const text = `Have a look at the ${product.name} from Comforto Furniture (Bopal): ${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSwatchClick = (e, v) => {
    e.preventDefault();
    setCurrentImage(v.image || product.image);
    setActiveVariantId(v.id);
  };

  return (
    <Link to={`/p/${product.id}`} className="feat-card">
      <div className="feat-image-wrap">
        <SafeImage src={currentImage} alt={product.name} />
        <div className="feat-actions">
          <button
            className={`feat-icon ${isWishlisted ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            title="Wishlist"
          >
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            className={`feat-icon ${isCompared ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); toggleCompare(product); }}
            title="Compare"
          >
            <Scale size={16} />
          </button>
          {canUseCollection && (
            <button
              className={`feat-icon ${inCollection ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); addItem(product); }}
              title={inCollection ? 'In collection' : 'Add to collection'}
            >
              {inCollection ? <Check size={16} /> : <FilePlus size={16} />}
            </button>
          )}
          <button className="feat-icon" onClick={handleWhatsAppShare} title="Share">
            <MessageCircle size={16} />
          </button>
        </div>
        <span className="feat-view">
          View piece <ArrowRight size={14} />
        </span>
      </div>
      <div className="feat-meta">
        <h3 className="feat-name">{product.name}</h3>
        <p className="feat-subtitle">{product.subtitle}</p>
        <div className="feat-swatches">
          {product.variants.slice(0, 4).map(v => (
            <button
              type="button"
              key={v.id}
              className={`feat-swatch ${activeVariantId === v.id ? 'active' : ''}`}
              style={{ background: v.colorHex }}
              title={v.colorName}
              onClick={(e) => handleSwatchClick(e, v)}
            />
          ))}
        </div>
      </div>
    </Link>
  );
};

/* ─────────── Bespoke Journey (made-to-order process) ─────────── */
const JOURNEY_STEPS = [
  { icon: MessageCircle, title: 'Consult', copy: 'Share your space and style — in-store or on WhatsApp.' },
  { icon: PencilRuler,   title: 'Design',  copy: 'We tailor the size, fabric and wood to you.' },
  { icon: Hammer,        title: 'Craft',   copy: 'Skilled artisans hand-build it in solid wood.' },
  { icon: Truck,         title: 'Deliver', copy: 'We deliver and place it right in your home.' },
];

const BespokeJourney = () => (
  <section className="journey container">
    <header className="section-head">
      <span className="eyebrow">How It Works</span>
      <h2 className="section-title">Made Just for You</h2>
      <p>Four simple steps, from first hello to a piece that's truly yours.</p>
      <span className="journey-rule" aria-hidden="true" />
    </header>

    <div className="journey-steps">
      {JOURNEY_STEPS.map((step, i) => {
        const Icon = step.icon;
        return (
          <React.Fragment key={step.title}>
            <div className="journey-step">
              <span className="journey-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="journey-step-icon"><Icon size={24} /></span>
              <h3 className="journey-step-title">{step.title}</h3>
              <p className="journey-step-copy">{step.copy}</p>
            </div>
            {i < JOURNEY_STEPS.length - 1 && (
              <span className="journey-arrow" aria-hidden="true"><ChevronRight size={20} /></span>
            )}
          </React.Fragment>
        );
      })}
    </div>

    <div className="journey-cta">
      <Link to="/catalog" className="btn btn-accent">
        Explore the Collection <ArrowRight size={16} />
      </Link>
    </div>
  </section>
);

const Home = () => {
  return (
    <div className="home animate-fade-in">
      <Hero />
      <ValuesStrip />
      <BrowseCategories />
      <FeaturedSelection />
      <BespokeJourney />
    </div>
  );
};

export default Home;
