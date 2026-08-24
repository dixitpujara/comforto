import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';
import { forgetCachedImage } from '../lib/registerSW';
import '../assets/css/SafeImage.css';

/**
 * <SafeImage /> — drop-in replacement for <img> that renders a branded
 * placeholder when the source is missing, errors, or fails to decode.
 *
 * Usage: <SafeImage src={...} alt="..." className="..." />
 */
const SafeImage = ({
  src,
  alt = '',
  className = '',
  loading = 'lazy',
  style,
  label = 'Image unavailable',
  ...rest
}) => {
  const [errored, setErrored] = useState(false);

  // Reset error state if the src changes (e.g. variant switching).
  useEffect(() => { setErrored(false); }, [src]);

  if (!src || errored) {
    return (
      <div
        className={`img-fallback ${className}`}
        style={style}
        role="img"
        aria-label={alt || label}
      >
        <span className="img-fallback-inner">
          <ImageOff size={22} aria-hidden="true" />
          <span className="img-fallback-text">{label}</span>
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      style={style}
      onError={() => {
        setErrored(true);
        // The offline cache can't tell a dead URL from a real photo (opaque
        // responses report no status), so evict anything that won't decode.
        forgetCachedImage(src);
      }}
      {...rest}
    />
  );
};

export default SafeImage;
