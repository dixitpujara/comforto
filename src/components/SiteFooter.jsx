import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Clock } from 'lucide-react';
import logoLight from '../assets/logo-light.svg';
import '../assets/css/SiteFooter.css';

const WHATSAPP = "https://wa.me/919409203078?text=Hi%20Comforto%2C%20I'd%20like%20to%20visit%20the%20showroom.";
const MAPS = 'https://maps.google.com/?q=Comforto+Furniture+Bopal+Ahmedabad';

const SiteFooter = () => (
  <footer className="site-footer">
    {/* ─── Experience the showroom — minimal, centred ─── */}
    <section id="visit" className="site-footer-visit">
      <div className="container visit-inner">
        <span className="eyebrow center">Pay us a visit</span>
        <h2 className="section-title">Experience the showroom</h2>
        <p>
          Touch the textiles, feel the joinery, and explore the full collection
          at our flagship in Bopal — by appointment or simply walk in.
        </p>
        <div className="visit-actions">
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-accent">Book a Visit</a>
          <a href={MAPS} target="_blank" rel="noreferrer" className="btn btn-ghost">
            Get Directions <ArrowRight size={14} />
          </a>
        </div>
        <div className="visit-facts">
          <a href={MAPS} target="_blank" rel="noreferrer" className="visit-fact">
            <MapPin size={14} /> Bopal, Ahmedabad 380058
          </a>
          <span className="visit-fact">
            <Clock size={14} /> Mon – Sun · 10:30 AM – 8:30 PM
          </span>
          <a href="tel:+919409203078" className="visit-fact">
            <Phone size={14} /> +91 94092 03078
          </a>
        </div>
      </div>
    </section>

    {/* ─── Minimal bottom band: logo left, copyright right ─── */}
    <div className="site-footer-band">
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
