import { forwardRef } from 'react';

interface BirdGraphicProps {
  wingFill?: string;
  bodyFill?: string;
  isHurt?: boolean;
  wingsRef?: React.RefObject<SVGGElement | null>;
}

export const BirdGraphic = forwardRef<SVGGElement, BirdGraphicProps>(
  function BirdGraphic(
    { wingFill = '#6B6B6B', bodyFill = '#4A4A4A', isHurt = false, wingsRef },
    ref
  ) {
    return (
      <g ref={ref}>
        {/* Wings (animated - behind body) */}
        <g ref={wingsRef}>
          <path
            d="M -5 0 C -15 -8, -30 -12, -38 -5 C -30 -2, -15 2, -5 0"
            fill={wingFill}
            stroke={isHurt ? '#CC3333' : '#4A4A4A'}
            strokeWidth="1"
          />
          <path
            d="M 5 0 C 15 -8, 30 -12, 38 -5 C 30 -2, 15 2, 5 0"
            fill={wingFill}
            stroke={isHurt ? '#CC3333' : '#4A4A4A'}
            strokeWidth="1"
          />
        </g>

        {/* Body */}
        <ellipse cx="0" cy="0" rx="18" ry="11" fill={bodyFill} />

        {/* Head */}
        <circle cx="16" cy="-4" r="9" fill={bodyFill} />

        {/* Beak */}
        <polygon points="25,-4 36,-2 25,1" fill="#FFA500" />
        <line x1="25" y1="-4" x2="36" y2="-2" stroke="#E69500" strokeWidth="0.5" />

        {/* Eye */}
        {isHurt ? (
          <>
            <line x1="16" y1="-8" x2="22" y2="-4" stroke="#000" strokeWidth="2" />
            <line x1="16" y1="-4" x2="22" y2="-8" stroke="#000" strokeWidth="2" />
          </>
        ) : (
          <>
            <circle cx="18" cy="-6" r="3" fill="#fff" />
            <circle cx="19" cy="-6" r="1.5" fill="#000" />
            <circle cx="19.5" cy="-6.5" r="0.5" fill="#fff" />
          </>
        )}

        {/* Eyebrow */}
        <path
          d={isHurt ? 'M 15 -10 L 21 -8' : 'M 15 -10 Q 18 -11 21 -10'}
          stroke="#333"
          strokeWidth="1"
          fill="none"
        />

        {/* Feet */}
        <path
          d="M -3 10 L -6 16 M -3 10 L -3 16 M -3 10 L 0 16"
          stroke="#FFA500"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 6 10 L 3 16 M 6 10 L 6 16 M 6 10 L 9 16"
          stroke="#FFA500"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Tail feathers */}
        <path
          d="M -16 2 Q -28 0 -24 -6"
          fill={isHurt ? '#FF5555' : '#5A5A5A'}
          stroke={bodyFill}
          strokeWidth="1"
        />
        <path
          d="M -16 0 Q -26 2 -22 8"
          fill={isHurt ? '#FF5555' : '#5A5A5A'}
          stroke={bodyFill}
          strokeWidth="1"
        />

        {/* Pain stars when hurt */}
        {isHurt && (
          <>
            <text x="-25" y="-20" fontSize="14" fill="#FFD700">
              ★
            </text>
            <text x="25" y="-15" fontSize="10" fill="#FFD700">
              ★
            </text>
            <text x="-10" y="-25" fontSize="12" fill="#FFD700">
              ★
            </text>
          </>
        )}
      </g>
    );
  }
);
