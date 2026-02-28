import { VIEWBOX } from '../utils/constants';

export function SkyBackground() {
  return (
    <g>
      {/* Sky gradient */}
      <defs>
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4BA3D9" />
          <stop offset="50%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#B8E4F8" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="70%" stopColor="#FFEB3B" />
          <stop offset="100%" stopColor="#FFC107" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#skyGradient)" />

      {/* Sun */}
      <g transform="translate(350, 50)">
        {/* Sun glow */}
        <circle cx="0" cy="0" r="35" fill="#FFEB3B" opacity="0.3" />
        <circle cx="0" cy="0" r="25" fill="#FFEB3B" opacity="0.5" />
        {/* Sun */}
        <circle cx="0" cy="0" r="18" fill="url(#sunGlow)" />
        {/* Sun rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="0"
            y1="0"
            x2={Math.cos((angle * Math.PI) / 180) * 30}
            y2={Math.sin((angle * Math.PI) / 180) * 30}
            stroke="#FFD54F"
            strokeWidth="2"
            opacity="0.6"
          />
        ))}
      </g>

      {/* Distant birds (simple V shapes) */}
      <g fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round">
        <path d="M 50 120 Q 55 115 60 120 M 60 120 Q 65 115 70 120" />
        <path d="M 120 80 Q 123 77 126 80 M 126 80 Q 129 77 132 80" />
        <path d="M 280 100 Q 284 96 288 100 M 288 100 Q 292 96 296 100" />
      </g>

      {/* Clouds - static */}
      <g>
        <ellipse cx="60" cy="130" rx="30" ry="15" fill="#fff" opacity="0.9" />
        <ellipse cx="85" cy="125" rx="25" ry="18" fill="#fff" opacity="0.9" />
        <ellipse cx="45" cy="125" rx="20" ry="12" fill="#fff" opacity="0.9" />
      </g>

      <g>
        <ellipse cx="260" cy="60" rx="25" ry="12" fill="#fff" opacity="0.85" />
        <ellipse cx="280" cy="55" rx="20" ry="14" fill="#fff" opacity="0.85" />
        <ellipse cx="245" cy="58" rx="18" ry="10" fill="#fff" opacity="0.85" />
      </g>

      <g>
        <ellipse cx="150" cy="170" rx="35" ry="16" fill="#fff" opacity="0.8" />
        <ellipse cx="180" cy="165" rx="28" ry="18" fill="#fff" opacity="0.8" />
        <ellipse cx="130" cy="168" rx="22" ry="12" fill="#fff" opacity="0.8" />
      </g>
    </g>
  );
}
