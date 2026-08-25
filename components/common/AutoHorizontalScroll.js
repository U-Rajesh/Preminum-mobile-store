'use client';

import { useAutoHorizontalScroll } from '@/hooks/useAutoHorizontalScroll';
import styles from './AutoHorizontalScroll.module.css';

/**
 * Reusable container that auto-scrolls horizontally on mouse hover towards left/right edges.
 * Includes subtle luxury edge fade indicators when additional content is scrollable.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Table or wide content
 * @param {string} [props.className] - Additional CSS class for the scroll container
 * @param {string} [props.wrapperClassName] - Additional CSS class for the outer wrapper
 * @param {number} [props.edgeZoneRatio=0.22]
 * @param {number} [props.maxSpeed=16]
 * @param {boolean} [props.showIndicators=true]
 */
export default function AutoHorizontalScroll({
  children,
  className = '',
  wrapperClassName = '',
  edgeZoneRatio = 0.22,
  maxSpeed = 16,
  showIndicators = true,
  ...rest
}) {
  const { containerRef, wrapperRef } = useAutoHorizontalScroll({
    edgeZoneRatio,
    maxSpeed,
  });

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${wrapperClassName}`}
      data-can-scroll-left="false"
      data-can-scroll-right="false"
      data-is-scrollable="false"
    >
      {showIndicators && (
        <>
          <div className={`${styles.edgeIndicator} ${styles.edgeLeft}`} aria-hidden="true" />
          <div className={`${styles.edgeIndicator} ${styles.edgeRight}`} aria-hidden="true" />
        </>
      )}
      <div
        ref={containerRef}
        className={`${styles.container} ${className}`}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
}
