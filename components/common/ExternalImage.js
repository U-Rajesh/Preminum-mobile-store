'use client';

import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

/**
 * ExternalImage
 *
 * A high-performance, robust image component designed for arbitrary external product URLs.
 * Bypasses Next.js domain restrictions while maintaining a drop-in API compatible with next/image.
 *
 * Features:
 * - Direct standard HTML <img> rendering without next.config.mjs hostname whitelist requirements
 * - Automatic error boundary and empty source fallback
 * - Drop-in support for `fill`, `width`, `height`, `style`, and `priority`
 * - Resets error state immediately when `src` updates (ideal for real-time admin form typing/pasting)
 * - Prevents broken image icons when external assets fail to load
 *
 * @param {Object} props
 * @param {string} [props.src] - Image source URL (HTTPS, HTTP, relative, or data URL)
 * @param {string} [props.alt=''] - Alt description for accessibility
 * @param {boolean} [props.fill=false] - When true, stretches absolutely to 100% of parent container
 * @param {number|string} [props.width] - Optional explicit width if not using fill
 * @param {number|string} [props.height] - Optional explicit height if not using fill
 * @param {string} [props.className] - CSS class names
 * @param {Object} [props.style] - Inline CSS styles
 * @param {boolean} [props.priority=false] - Eagerly loads with high fetch priority
 * @param {React.ReactNode} [props.fallback] - Custom React node to render on error or empty src
 * @param {React.ReactNode} [props.fallbackIcon] - Custom icon to display in default placeholder
 * @param {Function} [props.onLoad] - Image load event callback
 * @param {Function} [props.onError] - Image error event callback
 */
export default function ExternalImage({
  src,
  alt = '',
  fill = false,
  width,
  height,
  className,
  style = {},
  priority = false,
  fallback = null,
  fallbackIcon = null,
  sizes,
  unoptimized,
  onLoad,
  onError,
  ...restProps
}) {
  const isSrcValid = Boolean(src && typeof src === 'string' && src.trim().length > 0);
  const [hasError, setHasError] = useState(!isSrcValid);
  const [isLoaded, setIsLoaded] = useState(false);

  // Synchronize error and load state whenever src changes
  useEffect(() => {
    const valid = Boolean(src && typeof src === 'string' && src.trim().length > 0);
    setHasError(!valid);
    setIsLoaded(false);
  }, [src]);

  const handleImageError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  const handleImageLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  // Render fallback if source is empty or failed to load
  if (hasError || !isSrcValid) {
    if (fallback) {
      return fallback;
    }

    const placeholderStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(14, 12, 10, 0.45)',
      color: 'var(--color-muted, #94a3b8)',
      ...(fill
        ? {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }
        : {
            width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
            height: height ? (typeof height === 'number' ? `${height}px` : height) : '100%',
          }),
      ...style,
    };

    return (
      <div
        className={className}
        style={placeholderStyle}
        role="img"
        aria-label={alt || 'Image not available'}
      >
        {fallbackIcon || <Smartphone size={24} style={{ opacity: 0.4 }} aria-hidden="true" />}
      </div>
    );
  }

  // Calculate image style
  const imageStyle = {
    ...(fill
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }
      : {}),
    ...style,
  };

  return (
    <img
      src={src.trim()}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={className}
      style={imageStyle}
      onLoad={handleImageLoad}
      onError={handleImageError}
      {...restProps}
    />
  );
}
