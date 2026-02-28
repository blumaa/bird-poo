import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { BirdGraphic } from './BirdGraphic';

export function LoadingScreen() {
  const birdRef = useRef<SVGGElement>(null);
  const wingsRef = useRef<SVGGElement>(null);
  const dotsRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!birdRef.current) return;

    // Bird bouncing animation
    const tl = gsap.to(birdRef.current, {
      y: -15,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (!wingsRef.current) return;

    // Wing flapping animation
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(wingsRef.current, {
      y: -8,
      duration: 0.12,
      ease: 'power2.out',
    }).to(wingsRef.current, {
      y: 6,
      duration: 0.12,
      ease: 'power2.in',
    });

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (!dotsRef.current) return;

    const dots = dotsRef.current.children;
    const tl = gsap.to(dots, {
      opacity: 1,
      stagger: 0.3,
      repeat: -1,
      repeatDelay: 0.5,
      yoyo: true,
      duration: 0.3,
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(to bottom, #4BA3D9, #87CEEB)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <svg width="200" height="200" viewBox="0 0 200 200">
        <g transform="translate(100, 80)">
          <BirdGraphic ref={birdRef} wingsRef={wingsRef} />
        </g>

        {/* Poop drops */}
        <g>
          <ellipse cx="90" cy="130" rx="6" ry="5" fill="#8B4513" opacity="0.6" />
          <ellipse cx="110" cy="140" rx="5" ry="4" fill="#8B4513" opacity="0.4" />
          <ellipse cx="100" cy="155" rx="4" ry="3" fill="#8B4513" opacity="0.2" />
        </g>
      </svg>

      <h1
        style={{
          color: '#8B4513',
          fontFamily: 'sans-serif',
          fontSize: '32px',
          margin: '20px 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        Bird Poo
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span
          style={{
            color: '#555',
            fontFamily: 'sans-serif',
            fontSize: '18px',
          }}
        >
          Loading
        </span>
        <svg ref={dotsRef} width="30" height="20" viewBox="0 0 30 20">
          <circle cx="5" cy="15" r="3" fill="#555" opacity="0.3" />
          <circle cx="15" cy="15" r="3" fill="#555" opacity="0.3" />
          <circle cx="25" cy="15" r="3" fill="#555" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
}
