import { VIEWBOX } from '../utils/constants';

// Pre-computed grass tuft data (deterministic to avoid re-render jitter)
const GRASS_TUFTS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 10) + (i % 5),  // Deterministic offset based on index
  height: 8 + (i % 6),     // Deterministic height based on index
  id: i,
}));

// Pre-computed flower positions
const FLOWERS = [
  { x: 30, color: '#FF6B6B' },
  { x: 80, color: '#FFE66D' },
  { x: 150, color: '#FF6B6B' },
  { x: 220, color: '#C9B1FF' },
  { x: 290, color: '#FFE66D' },
  { x: 350, color: '#FF6B6B' },
  { x: 380, color: '#C9B1FF' },
];

// Pre-computed ground texture dots
const GROUND_DOTS = Array.from({ length: 20 }, (_, i) => ({
  x: 20 + i * 20,
  y: 545 + (i % 4) * 10,  // Deterministic y based on index
  r: 1 + (i % 2),         // Deterministic radius
  id: i,
}));

export function GroundBackground() {

  return (
    <g>
      {/* Main ground */}
      <rect x="0" y="500" width={VIEWBOX.width} height="100" fill="#228B22" />

      {/* Darker grass border at top */}
      <rect x="0" y="500" width={VIEWBOX.width} height="4" fill="#1B5E20" />

      {/* Path/sidewalk where human walks */}
      <rect x="0" y="510" width={VIEWBOX.width} height="25" fill="#8B7355" />
      <rect x="0" y="510" width={VIEWBOX.width} height="2" fill="#A08060" />
      <rect x="0" y="533" width={VIEWBOX.width} height="2" fill="#6B5344" />

      {/* Path texture lines */}
      {[0, 60, 120, 180, 240, 300, 360].map((x) => (
        <line
          key={x}
          x1={x}
          y1="512"
          x2={x}
          y2="533"
          stroke="#7A6450"
          strokeWidth="1"
          opacity="0.3"
        />
      ))}

      {/* Grass tufts along top edge */}
      {GRASS_TUFTS.map(({ x, height, id }) => (
        <g key={id}>
          <path
            d={`M ${x} 500 Q ${x - 2} ${500 - height} ${x} ${500 - height * 0.6}
                M ${x} 500 Q ${x + 2} ${500 - height} ${x + 1} ${500 - height * 0.7}
                M ${x} 500 Q ${x} ${500 - height * 1.1} ${x - 1} ${500 - height * 0.8}`}
            stroke="#2E7D32"
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      ))}

      {/* Flowers */}
      {FLOWERS.map(({ x, color }, i) => (
        <g key={i} transform={`translate(${x}, 498)`}>
          {/* Stem */}
          <line x1="0" y1="0" x2="0" y2="-12" stroke="#2E7D32" strokeWidth="1.5" />
          {/* Flower petals */}
          <circle cx="0" cy="-14" r="4" fill={color} />
          <circle cx="-3" cy="-12" r="3" fill={color} />
          <circle cx="3" cy="-12" r="3" fill={color} />
          <circle cx="-2" cy="-16" r="3" fill={color} />
          <circle cx="2" cy="-16" r="3" fill={color} />
          {/* Center */}
          <circle cx="0" cy="-14" r="2" fill="#FFD700" />
        </g>
      ))}

      {/* Ground texture - subtle dots */}
      {GROUND_DOTS.map(({ x, y, r, id }) => (
        <circle
          key={id}
          cx={x}
          cy={y}
          r={r}
          fill="#1B5E20"
          opacity="0.3"
        />
      ))}

      {/* Building silhouettes in background */}
      <g opacity="0.15">
        <rect x="10" y="470" width="40" height="30" fill="#333" />
        <rect x="15" y="460" width="30" height="40" fill="#333" />
        <rect x="70" y="475" width="25" height="25" fill="#333" />
        <rect x="320" y="465" width="35" height="35" fill="#333" />
        <rect x="360" y="470" width="30" height="30" fill="#333" />
        <rect x="355" y="455" width="20" height="45" fill="#333" />
      </g>
    </g>
  );
}
