import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Clock } from 'lucide-react';
import SafeImage from './SafeImage';
import logoLight from '../assets/logo-light.svg';
import '../assets/css/SiteFooter.css';

const SiteFooter = () => (
  <footer className="site-footer">
    {/* ─── Experience the showroom ─── */}
    <section id="visit" className="site-footer-visit">
      <div className="container">
        <div className="visit-inner">
          <div className="visit-text">
            <span className="eyebrow">Pay us a visit</span>
            <h2 className="section-title">Experience the showroom</h2>
            <p>
              Touch the textiles, feel the joinery, and explore the full
              collection at our flagship in Bopal — by appointment or simply
              walk in.
            </p>
            <div className="visit-meta">
              <div className="visit-meta-item">
                <span className="visit-meta-icon"><MapPin size={14} /></span>
                <div>
                  <strong>Comforto Furniture, Bopal</strong>
                  <span>Ahmedabad, Gujarat 380058</span>
                </div>
              </div>
              <div className="visit-meta-item">
                <span className="visit-meta-icon"><Clock size={14} /></span>
                <div>
                  <strong>Open Mon – Sun</strong>
                  <span>10:30 AM – 8:30 PM</span>
                </div>
              </div>
              <div className="visit-meta-item">
                <span className="visit-meta-icon"><Phone size={14} /></span>
                <div>
                  <strong>+91 94299 18571</strong>
                  <span>WhatsApp &amp; call</span>
                </div>
              </div>
            </div>
            <div className="visit-actions">
              <a
                href="https://wa.me/919429918571?text=Hi%20Comforto%2C%20I'd%20like%20to%20visit%20the%20showroom."
                target="_blank" rel="noreferrer"
                className="btn btn-accent"
              >
                Book a Visit
              </a>
              <a
                href="https://maps.google.com/?q=Comforto+Furniture+Bopal+Ahmedabad"
                target="_blank" rel="noreferrer"
                className="btn btn-ghost"
              >
                Get Directions <ArrowRight size={14} />
              </a>
            </div>
          </div>
          <div className="visit-image">
            <SafeImage
              src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=1200"
              alt="Comforto Furniture showroom"
            />
          </div>
        </div>
      </div>
    </section>

    {/* ─── Minimal bottom band: logo left, copyright right ─── */}
    <div className="site-footer-band">
      <span className="site-footer-stripe" aria-hidden="true" />
      <div className="container site-footer-band-inner">
        <Link to="/" className="site-footer-brand-row" aria-label="Comforto Furniture">
          <img src={logoLight} alt="Comforto Furniture" className="site-footer-logo" />
        </Link>
        <span className="site-footer-copy">
          © {new Date().getFullYear()} Comforto Furniture · Crafted for enduring quality.
        </span>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
