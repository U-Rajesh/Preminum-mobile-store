'use client';

import { useEffect, useRef } from 'react';
import styles from './AtmosphericBackground.module.css';

// Pre-defined static deterministic showroom dust particles
const PARTICLES = [
  { id: 1, top: '12%', left: '15%', size: 2.5, opacity: 0.30, dur: 16, delay: 0, dx: '30px', dy: '-70px' },
  { id: 2, top: '25%', left: '75%', size: 3.0, opacity: 0.22, dur: 20, delay: 2, dx: '-25px', dy: '-90px' },
  { id: 3, top: '40%', left: '30%', size: 2.0, opacity: 0.35, dur: 18, delay: 4, dx: '40px', dy: '-60px' },
  { id: 4, top: '60%', left: '85%', size: 2.5, opacity: 0.25, dur: 22, delay: 1, dx: '-35px', dy: '-80px' },
  { id: 5, top: '75%', left: '10%', size: 3.5, opacity: 0.18, dur: 24, delay: 3, dx: '20px', dy: '-100px' },
  { id: 6, top: '85%', left: '60%', size: 2.0, opacity: 0.30, dur: 17, delay: 5, dx: '-20px', dy: '-70px' },
  { id: 7, top: '18%', left: '45%', size: 2.5, opacity: 0.22, dur: 21, delay: 2.5, dx: '35px', dy: '-85px' },
  { id: 8, top: '35%', left: '90%', size: 3.0, opacity: 0.25, dur: 19, delay: 4.5, dx: '-40px', dy: '-75px' },
  { id: 9, top: '50%', left: '5%', size: 2.0, opacity: 0.35, dur: 23, delay: 1.5, dx: '25px', dy: '-95px' },
  { id: 10, top: '68%', left: '40%', size: 2.5, opacity: 0.22, dur: 18, delay: 3.5, dx: '-30px', dy: '-65px' },
  { id: 11, top: '80%', left: '80%', size: 3.0, opacity: 0.30, dur: 25, delay: 0.5, dx: '30px', dy: '-90px' },
  { id: 12, top: '92%', left: '25%', size: 2.0, opacity: 0.18, dur: 17, delay: 5.5, dx: '-25px', dy: '-80px' },
  { id: 13, top: '8%', left: '65%', size: 2.5, opacity: 0.25, dur: 20, delay: 2.2, dx: '20px', dy: '-70px' },
  { id: 14, top: '48%', left: '70%', size: 2.0, opacity: 0.30, dur: 22, delay: 4.2, dx: '-35px', dy: '-85px' },
  { id: 15, top: '30%', left: '20%', size: 3.0, opacity: 0.22, dur: 19, delay: 1.8, dx: '45px', dy: '-75px' },
  { id: 16, top: '70%', left: '95%', size: 2.0, opacity: 0.25, dur: 24, delay: 3.8, dx: '-20px', dy: '-90px' },
];

export default function AtmosphericBackground() {
  const cursorRef = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000 });
  const currentPos = useRef({ x: -1000, y: -1000 });
  const rafId = useRef(null);

  useEffect(() => {
    // Only enable cursor following on non-touch desktop devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth trailing animation loop using requestAnimationFrame
    const updateCursor = () => {
      if (cursorRef.current) {
        const ease = 0.08;
        currentPos.current.x += (mousePos.current.x - currentPos.current.x) * ease;
        currentPos.current.y += (mousePos.current.y - currentPos.current.y) * ease;

        cursorRef.current.style.left = `${currentPos.current.x}px`;
        cursorRef.current.style.top = `${currentPos.current.y}px`;
      }
      rafId.current = requestAnimationFrame(updateCursor);
    };

    rafId.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className={styles.atmosphericCanvas} aria-hidden="true">
      {/* 1. Large Blurred Ambient Light Orbs */}
      <div className={styles.orbLayer}>
        <div className={`${styles.orb} ${styles.orb1}`} />
        <div className={`${styles.orb} ${styles.orb2}`} />
        <div className={`${styles.orb} ${styles.orb3}`} />
        <div className={`${styles.orb} ${styles.orb4}`} />
      </div>

      {/* 2. Technical Animated Subtle Grid */}
      <div className={styles.gridLayer} />

      {/* 3. Luxury Showroom Dust Particles */}
      <div className={styles.particlesContainer}>
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className={styles.particle}
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              '--particle-opacity': p.opacity,
              '--drift-x': p.dx,
              '--drift-y': p.dy,
            }}
          />
        ))}
      </div>

      {/* 4. Mouse-Following Ambient Lighting (Desktop Only) */}
      <div ref={cursorRef} className={styles.cursorGlow} />

      {/* 5. Vignette Frame */}
      <div className={styles.vignette} />
    </div>
  );
}
