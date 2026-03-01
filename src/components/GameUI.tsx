import { memo } from 'react';
import { MAX_AMMO } from '../utils/constants';

// Module-level constants — never recreated on render
const AMMO_INDICES = Array.from({ length: MAX_AMMO }, (_, i) => i);
const LIVES_INDICES = [0, 1, 2] as const;

// HeartIcon path — size is always 9, compute once
const HEART_SIZE = 9;
const HEART_PATH = [
  `M 0 ${HEART_SIZE * 0.3}`,
  `C ${-HEART_SIZE * 0.1} ${HEART_SIZE * 0.05} ${-HEART_SIZE * 0.6} ${-HEART_SIZE * 0.35} ${-HEART_SIZE * 0.5} ${-HEART_SIZE * 0.55}`,
  `C ${-HEART_SIZE * 0.4} ${-HEART_SIZE * 0.75} ${-HEART_SIZE * 0.1} ${-HEART_SIZE * 0.7} 0 ${-HEART_SIZE * 0.5}`,
  `C ${HEART_SIZE * 0.1} ${-HEART_SIZE * 0.7} ${HEART_SIZE * 0.4} ${-HEART_SIZE * 0.75} ${HEART_SIZE * 0.5} ${-HEART_SIZE * 0.55}`,
  `C ${HEART_SIZE * 0.6} ${-HEART_SIZE * 0.35} ${HEART_SIZE * 0.1} ${HEART_SIZE * 0.05} 0 ${HEART_SIZE * 0.3}`,
  'Z',
].join(' ');

interface GameUIProps {
  score: number;
  level: number;
  ammo: number;
  birdLives: number;
}

// Unique filter IDs scoped to this component to avoid SVG defs collisions
const FILTER_IDS = {
  neonGreen: 'ui-neon-green',
  neonRed: 'ui-neon-red',
  neonAmber: 'ui-neon-amber',
  neonBrown: 'ui-neon-brown',
  scanlines: 'ui-scanlines',
} as const;

const RETRO_FONT = "'Courier New', 'Lucida Console', monospace";

// Palette
const COLOR = {
  panelBg: 'rgba(0, 0, 10, 0.78)',
  panelBorder: '#1a3a1a',
  scoreValue: '#e8ff00',
  scoreLabel: '#44ff44',
  lvlLabel: '#44ff44',
  lvlValue: '#ffffff',
  heartActive: '#ff2244',
  heartDim: '#2a0a0a',
  heartDimStroke: '#4a1a1a',
  ammoLabel: '#44ff44',
  ammoFull: '#7b3f00',
  ammoFullHighlight: '#c06000',
  ammoEmpty: '#2a2a2a',
  ammoEmptyStroke: '#444444',
  scanlineBase: 'rgba(0,0,0,0.18)',
} as const;

// --------------------------------------------------------------------
// Sub-components
// --------------------------------------------------------------------

/** SVG <defs> block — filters for neon glow and scanline pattern. Memoized: never changes. */
const ArcadeDefs = memo(function ArcadeDefs() {
  return (
    <defs>
      {/* Green neon glow — score / level / ammo labels */}
      <filter id={FILTER_IDS.neonGreen} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Red neon glow — active hearts */}
      <filter id={FILTER_IDS.neonRed} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Amber neon glow — score value */}
      <filter id={FILTER_IDS.neonAmber} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Brown neon glow — active ammo poop */}
      <filter id={FILTER_IDS.neonBrown} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* CRT scanline pattern */}
      <pattern id={FILTER_IDS.scanlines} x="0" y="0" width="400" height="3" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="400" height="1.2" fill={COLOR.scanlineBase} />
      </pattern>
    </defs>
  );
});

/** Rounded panel backdrop with a subtle border */
function Panel({
  x,
  y,
  width,
  height,
  rx = 4,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
}) {
  return (
    <>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        ry={rx}
        fill={COLOR.panelBg}
        stroke={COLOR.panelBorder}
        strokeWidth="1"
      />
      {/* Scanline overlay on the panel */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={rx}
        ry={rx}
        fill={`url(#${FILTER_IDS.scanlines})`}
        opacity="0.6"
      />
    </>
  );
}

/** SVG-drawn poop shape — a simple stacked-blob silhouette */
function PoopIcon({
  cx,
  cy,
  active,
}: {
  cx: number;
  cy: number;
  active: boolean;
}) {
  const mainFill = active ? COLOR.ammoFull : COLOR.ammoEmpty;
  const strokeColor = active ? COLOR.ammoFull : COLOR.ammoEmptyStroke;
  const glowFilter = active ? `url(#${FILTER_IDS.neonBrown})` : undefined;

  // Three stacked blobs: base, middle, top — drawn relative to cx/cy
  return (
    <g transform={`translate(${cx}, ${cy})`} filter={glowFilter}>
      {/* Base blob */}
      <ellipse cx="0" cy="4" rx="3.5" ry="1.5" fill={mainFill} stroke={strokeColor} strokeWidth="0.6" />
      {/* Middle blob */}
      <ellipse cx="0" cy="0" rx="2" ry="1.5" fill={mainFill} stroke={strokeColor} strokeWidth="0.6" />
      {/* Top blob / head */}
      <ellipse cx="0" cy="-3" rx="1" ry="1" fill={mainFill} stroke={strokeColor} strokeWidth="0.6" />
    </g>
  );
}

/** SVG-drawn heart shape — uses module-level HEART_PATH (size always 9) */
function HeartIcon({
  cx,
  cy,
  active,
}: {
  cx: number;
  cy: number;
  active: boolean;
}) {
  const fill = active ? COLOR.heartActive : COLOR.heartDim;
  const stroke = active ? COLOR.heartActive : COLOR.heartDimStroke;
  const glowFilter = active ? `url(#${FILTER_IDS.neonRed})` : undefined;

  return (
    <g transform={`translate(${cx}, ${cy})`} filter={glowFilter}>
      <path d={HEART_PATH} fill={fill} stroke={stroke} strokeWidth="0.8" />
    </g>
  );
}

// --------------------------------------------------------------------
// Left panel: Score + Level + Ammo
// --------------------------------------------------------------------
const LEFT_PANEL = { x: 5, y: 5, width: 155, height: 65 };

function ScoreLevelBlock({ score, level }: { score: number; level: number }) {
  return (
    <g>
      {/* SCORE label */}
      <text
        x={LEFT_PANEL.x + 7}
        y={LEFT_PANEL.y + 14}
        fill={COLOR.scoreLabel}
        fontSize="8"
        fontFamily={RETRO_FONT}
        fontWeight="bold"
        letterSpacing="2"
        filter={`url(#${FILTER_IDS.neonGreen})`}
      >
        SCORE
      </text>

      {/* Score value */}
      <text
        x={LEFT_PANEL.x + 7}
        y={LEFT_PANEL.y + 30}
        fill={COLOR.scoreValue}
        fontSize="16"
        fontFamily={RETRO_FONT}
        fontWeight="bold"
        letterSpacing="1"
        filter={`url(#${FILTER_IDS.neonAmber})`}
      >
        {String(score).padStart(6, '0')}
      </text>

      {/* LVL label */}
      <text
        x={LEFT_PANEL.x + 105}
        y={LEFT_PANEL.y + 14}
        fill={COLOR.lvlLabel}
        fontSize="8"
        fontFamily={RETRO_FONT}
        fontWeight="bold"
        letterSpacing="2"
        filter={`url(#${FILTER_IDS.neonGreen})`}
      >
        LVL
      </text>

      {/* Level value */}
      <text
        x={LEFT_PANEL.x + 105}
        y={LEFT_PANEL.y + 30}
        fill={COLOR.lvlValue}
        fontSize="16"
        fontFamily={RETRO_FONT}
        fontWeight="bold"
        filter={`url(#${FILTER_IDS.neonGreen})`}
      >
        {level}
      </text>
    </g>
  );
}

function AmmoBlock({ ammo }: { ammo: number }) {
  const ammoY = LEFT_PANEL.y + 56;
  const ammoStartX = LEFT_PANEL.x + 44;
  const spacing = 24;

  return (
    <g>
      {/* AMMO label */}
      <text
        x={LEFT_PANEL.x + 7}
        y={ammoY}
        fill={COLOR.ammoLabel}
        fontSize="8"
        fontFamily={RETRO_FONT}
        fontWeight="bold"
        letterSpacing="2"
        filter={`url(#${FILTER_IDS.neonGreen})`}
      >
        AMMO
      </text>

      {/* Poop icons */}
      {AMMO_INDICES.map((i) => (
        <PoopIcon
          key={i}
          cx={ammoStartX + i * spacing}
          cy={ammoY - 5}
          active={i < ammo}
        />
      ))}
    </g>
  );
}

// --------------------------------------------------------------------
// Right panel: Bird Lives
// --------------------------------------------------------------------
const RIGHT_PANEL = { x: 265, y: 5, width: 130, height: 40 };

function LivesBlock({ birdLives }: { birdLives: number }) {
  const livesY = RIGHT_PANEL.y + 28;
  const livesStartX = RIGHT_PANEL.x + 10;
  const spacing = 20;

  return (
    <g>
      {/* LIVES label */}
      <text
        x={RIGHT_PANEL.x + 15}
        y={RIGHT_PANEL.y + 12}
        fill={COLOR.lvlLabel}
        fontSize="8"
        fontFamily={RETRO_FONT}
        fontWeight="bold"
        letterSpacing="2"
        filter={`url(#${FILTER_IDS.neonGreen})`}
      >
        LIVES
      </text>

      {/* Heart icons */}
      {LIVES_INDICES.map((i) => (
        <HeartIcon
          key={i}
          cx={livesStartX + 10 + i * spacing}
          cy={livesY}
          active={i < birdLives}
        />
      ))}
    </g>
  );
}

// --------------------------------------------------------------------
// Root component
// --------------------------------------------------------------------
export function GameUI({ score, level, ammo, birdLives }: GameUIProps) {
  return (
    <g>
      <ArcadeDefs />

      {/* Left panel */}
      <Panel
        x={LEFT_PANEL.x}
        y={LEFT_PANEL.y}
        width={LEFT_PANEL.width}
        height={LEFT_PANEL.height}
      />
      <ScoreLevelBlock score={score} level={level} />
      <AmmoBlock ammo={ammo} />

      {/* Right panel */}
      <Panel
        x={RIGHT_PANEL.x}
        y={RIGHT_PANEL.y}
        width={RIGHT_PANEL.width}
        height={RIGHT_PANEL.height}
      />
      <LivesBlock birdLives={birdLives} />
    </g>
  );
}
