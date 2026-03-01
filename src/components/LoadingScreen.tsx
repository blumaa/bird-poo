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
        background: '#1B2A4A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: "Impact, 'Arial Black', sans-serif",
      }}
    >
      {/* Ben-Day dot pattern band — top accent stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '60px',
          overflow: 'hidden',
        }}
      >
        <svg width="100%" height="60" style={{ display: 'block' }}>
          <defs>
            <pattern id="benday-top" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#1B2A4A" />
              <circle cx="6" cy="6" r="3.5" fill="#F5C518" />
            </pattern>
          </defs>
          <rect width="100%" height="60" fill="url(#benday-top)" />
          {/* Bold black border under the band */}
          <line x1="0" y1="59" x2="10000" y2="59" stroke="#1A1A1A" strokeWidth="3" />
        </svg>
      </div>

      {/* Ben-Day dot pattern band — bottom accent stripe */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '60px',
          overflow: 'hidden',
        }}
      >
        <svg width="100%" height="60" style={{ display: 'block' }}>
          <defs>
            <pattern id="benday-bottom" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#1B2A4A" />
              <circle cx="6" cy="6" r="3.5" fill="#F5C518" />
            </pattern>
          </defs>
          <line x1="0" y1="1" x2="10000" y2="1" stroke="#1A1A1A" strokeWidth="3" />
          <rect y="3" width="100%" height="57" fill="url(#benday-bottom)" />
        </svg>
      </div>

      {/* Bird SVG */}
      <svg width="200" height="200" viewBox="0 0 200 200">
        <g transform="translate(100, 80)">
          <BirdGraphic ref={birdRef} wingsRef={wingsRef} />
        </g>
      </svg>

      {/* "BIRD POO" title */}
      <h1
        style={{
          color: '#F5C518',
          fontFamily: "Impact, 'Arial Black', sans-serif",
          fontSize: '56px',
          margin: '8px 0 6px 0',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          lineHeight: 1,
          WebkitTextStroke: '2.5px #1A1A1A',
          textShadow: '4px 4px 0 #1A1A1A',
        }}
      >
        BIRD POO
      </h1>

      {/* Thick rule under title */}
      <div
        style={{
          width: '220px',
          height: '3px',
          background: '#F5C518',
          margin: '4px 0 16px 0',
        }}
      />

      {/* Loading row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '2.5px solid #F5C518',
          padding: '6px 18px',
          background: '#243447',
          boxShadow: '3px 3px 0 #1A1A1A',
        }}
      >
        <span
          style={{
            color: '#F5E6C8',
            fontFamily: "Impact, 'Arial Black', sans-serif",
            fontSize: '18px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          LOADING
        </span>
        <svg ref={dotsRef} width="36" height="20" viewBox="0 0 36 20">
          <circle cx="6"  cy="13" r="4" fill="#F4603A" opacity="0.25" stroke="#1A1A1A" strokeWidth="1.5" />
          <circle cx="18" cy="13" r="4" fill="#F4603A" opacity="0.25" stroke="#1A1A1A" strokeWidth="1.5" />
          <circle cx="30" cy="13" r="4" fill="#F4603A" opacity="0.25" stroke="#1A1A1A" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
