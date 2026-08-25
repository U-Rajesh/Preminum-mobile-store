'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to enable smooth auto-scrolling horizontally when hovering near left/right edges of a container.
 *
 * @param {Object} options
 * @param {number} [options.edgeZoneRatio=0.22] - Fraction of container width for edge zone (0.22 = 22%)
 * @param {number} [options.maxSpeed=16] - Max scroll speed in pixels per frame
 * @param {boolean} [options.enabled=true] - Whether auto-scrolling is enabled
 * @returns {{
 *   containerRef: React.RefObject<HTMLElement>,
 *   wrapperRef: React.RefObject<HTMLElement>,
 *   checkScrollability: () => void
 * }}
 */
export function useAutoHorizontalScroll(options = {}) {
  const {
    edgeZoneRatio = 0.22,
    maxSpeed = 16,
    enabled = true,
  } = options;

  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const rafIdRef = useRef(null);
  const velocityRef = useRef(0);
  const isHoveredRef = useRef(false);
  const isTouchDeviceRef = useRef(false);

  // Update visual indicators (left / right fade indicators)
  const updateEdgeIndicators = useCallback(() => {
    const el = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!el || !wrapper) return;

    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const isScrollable = maxScroll > 2;

    const canScrollLeft = isScrollable && scrollLeft > 3;
    const canScrollRight = isScrollable && scrollLeft < maxScroll - 3;

    if (wrapper.dataset.canScrollLeft !== String(canScrollLeft)) {
      wrapper.dataset.canScrollLeft = String(canScrollLeft);
    }
    if (wrapper.dataset.canScrollRight !== String(canScrollRight)) {
      wrapper.dataset.canScrollRight = String(canScrollRight);
    }
    if (wrapper.dataset.isScrollable !== String(isScrollable)) {
      wrapper.dataset.isScrollable = String(isScrollable);
    }
  }, []);

  // Animation frame loop
  const scrollLoop = useCallback(() => {
    const el = containerRef.current;
    if (!el || velocityRef.current === 0 || !isHoveredRef.current) {
      rafIdRef.current = null;
      return;
    }

    const prevScrollLeft = el.scrollLeft;
    el.scrollLeft += velocityRef.current;

    // If reaching boundary, stop accelerating in that direction
    if (
      (velocityRef.current < 0 && el.scrollLeft <= 0) ||
      (velocityRef.current > 0 && el.scrollLeft >= el.scrollWidth - el.clientWidth)
    ) {
      updateEdgeIndicators();
      // Keep loop running in case cursor is still in edge zone
    }

    if (el.scrollLeft !== prevScrollLeft) {
      updateEdgeIndicators();
    }

    rafIdRef.current = requestAnimationFrame(scrollLoop);
  }, [updateEdgeIndicators]);

  const startLoop = useCallback(() => {
    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(scrollLoop);
    }
  }, [scrollLoop]);

  const stopLoop = useCallback(() => {
    velocityRef.current = 0;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect touch / coarse pointer devices
    const isTouch =
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    isTouchDeviceRef.current = isTouch;

    const el = containerRef.current;
    if (!el) return;

    // Initial indicator check
    updateEdgeIndicators();

    const onScroll = () => {
      updateEdgeIndicators();
    };

    el.addEventListener('scroll', onScroll, { passive: true });

    // ResizeObserver to detect layout/content changes
    const resizeObserver = new ResizeObserver(() => {
      updateEdgeIndicators();
    });
    resizeObserver.observe(el);

    if (isTouch || !enabled) {
      return () => {
        el.removeEventListener('scroll', onScroll);
        resizeObserver.disconnect();
      };
    }

    const onMouseEnter = () => {
      isHoveredRef.current = true;
      updateEdgeIndicators();
    };

    const onMouseLeave = () => {
      isHoveredRef.current = false;
      stopLoop();
      updateEdgeIndicators();
    };

    const onMouseMove = (e) => {
      if (!isHoveredRef.current) isHoveredRef.current = true;

      const rect = el.getBoundingClientRect();
      const width = rect.width;
      if (width <= 0) return;

      const scrollWidth = el.scrollWidth;
      const clientWidth = el.clientWidth;

      // Only auto-scroll if content actually overflows horizontally
      if (scrollWidth <= clientWidth + 2) {
        velocityRef.current = 0;
        return;
      }

      const mouseX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, mouseX / width));

      const leftThreshold = edgeZoneRatio;
      const rightThreshold = 1 - edgeZoneRatio;

      if (ratio < leftThreshold) {
        // Left edge: scroll left (closer to 0 => higher speed)
        const intensity = (leftThreshold - ratio) / leftThreshold;
        // Non-linear easing for natural feeling
        velocityRef.current = -Math.round(Math.pow(intensity, 1.3) * maxSpeed);
        startLoop();
      } else if (ratio > rightThreshold) {
        // Right edge: scroll right (closer to 1 => higher speed)
        const intensity = (ratio - rightThreshold) / edgeZoneRatio;
        velocityRef.current = Math.round(Math.pow(intensity, 1.3) * maxSpeed);
        startLoop();
      } else {
        // Center zone: stop scrolling
        velocityRef.current = 0;
      }
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      stopLoop();
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mousemove', onMouseMove);
      resizeObserver.disconnect();
    };
  }, [edgeZoneRatio, maxSpeed, enabled, startLoop, stopLoop, updateEdgeIndicators]);

  return {
    containerRef,
    wrapperRef,
    checkScrollability: updateEdgeIndicators,
  };
}
