'use client';

import { useState } from 'react';
import ExternalImage from '@/components/common/ExternalImage';
import { Smartphone } from 'lucide-react';
import styles from './ProductGallery.module.css';

export default function ProductGallery({ images = [], brand = '', name = '' }) {
  // Sort images by display_order ascending
  const sortedImages = [...images].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeImage = sortedImages[selectedIndex] || sortedImages[0] || null;

  const getAltText = (img, index) => {
    if (img?.alt_text && img.alt_text.trim().length > 0) {
      return img.alt_text;
    }
    return `${brand} ${name} view ${index + 1}`;
  };

  return (
    <div className={styles.galleryContainer}>
      {/* Main Large Product Image */}
      <div className={styles.mainImageWrapper}>
        <ExternalImage
          src={activeImage?.image_url}
          alt={getAltText(activeImage, selectedIndex)}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
          className={styles.mainImage}
          fallback={
            <div className={styles.placeholderBox} aria-hidden="true">
              <Smartphone size={56} className={styles.placeholderIcon} />
              <span style={{ fontSize: '0.875rem' }}>No image available</span>
            </div>
          }
        />
      </div>

      {/* Thumbnails Row (if multiple images available) */}
      {sortedImages.length > 1 && (
        <div
          className={styles.thumbnailsRow}
          role="region"
          aria-label="Product thumbnail selection"
        >
          {sortedImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id || `thumb-${idx}`}
                type="button"
                className={`${styles.thumbnailBtn} ${
                  isSelected ? styles.thumbnailBtnActive : ''
                }`}
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Show ${getAltText(img, idx)}`}
                aria-pressed={isSelected}
              >
                <ExternalImage
                  src={img.image_url}
                  alt=""
                  fill
                  sizes="72px"
                  className={styles.thumbnailImage}
                  fallbackIcon={<Smartphone size={16} color="#94a3b8" aria-hidden="true" />}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
