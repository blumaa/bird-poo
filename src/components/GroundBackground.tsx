import { memo } from 'react';
import { VIEWBOX } from '../utils/constants';

// Paul Klee palette
const K = {
  ochre:      '#C8902A',
  sand:       '#D4B878',
  cream:      '#E8DEC0',
  warmCream:  '#DDD0A8',
  dustyRose:  '#C4876A',
  terracotta: '#A05030',
  sage:       '#7A9A5A',
  paleGreen:  '#8AAA6A',
  moss:       '#4A6A3A',
  deepGreen:  '#3A5A30',
  mutedBlue:  '#5A7A9A',
  deepBlue:   '#2A4A6A',
  mauve:      '#8A6A8A',
  warmGrey:   '#9A8A7A',
  sienna:     '#8A4820',
};

// Grass tufts — thin delicate wire lines, Klee style
const GRASS_TUFTS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 10) + (i % 5),
  height: 6 + (i % 6),
  id: i,
}));

// Klee-palette flowers — warm, muted, botanical
const FLOWERS = [
  { x: 30,  color: K.dustyRose,  size: 5 },
  { x: 80,  color: K.ochre,      size: 4 },
  { x: 150, color: K.mauve,      size: 5 },
  { x: 220, color: K.mutedBlue,  size: 4 },
  { x: 290, color: K.terracotta, size: 5 },
  { x: 350, color: K.ochre,      size: 4 },
  { x: 380, color: K.dustyRose,  size: 5 },
];

export const GroundBackground = memo(function GroundBackground() {
  return (
    <g>
      {/* ── GROUND — Klee patchwork mosaic of greens ── */}
      <rect x="0" y="500" width={VIEWBOX.width} height="100" fill={K.sage} />
      {/* Overlapping coloured patches — like Klee's field paintings */}
      <rect x="0"   y="500" width="82"  height="58" fill={K.paleGreen} opacity="0.55" />
      <rect x="78"  y="500" width="58"  height="48" fill={K.moss}      opacity="0.45" />
      <rect x="132" y="514" width="88"  height="42" fill={K.paleGreen} opacity="0.40" />
      <rect x="198" y="500" width="72"  height="52" fill={K.deepGreen} opacity="0.35" />
      <rect x="264" y="506" width="78"  height="50" fill={K.sage}      opacity="0.45" />
      <rect x="338" y="500" width="62"  height="58" fill={K.moss}      opacity="0.50" />
      {/* Thin mosaic seam lines across ground — very subtle */}
      <line x1="80"  y1="500" x2="80"  y2="558" stroke={K.deepGreen} strokeWidth="0.5" opacity="0.4" />
      <line x1="200" y1="500" x2="200" y2="558" stroke={K.deepGreen} strokeWidth="0.5" opacity="0.4" />
      <line x1="340" y1="500" x2="340" y2="558" stroke={K.deepGreen} strokeWidth="0.5" opacity="0.4" />

      {/* ── PATH — Klee warm mosaic tiles ── */}
      <rect x="0" y="510" width={VIEWBOX.width} height="25" fill={K.sand} />
      {/* Individual tile tints — each slightly different warm ochre/cream */}
      <rect x="0"   y="510" width="50" height="25" fill={K.cream}     opacity="0.55" />
      <rect x="50"  y="510" width="50" height="25" fill={K.ochre}     opacity="0.25" />
      <rect x="100" y="510" width="50" height="25" fill={K.warmCream} opacity="0.45" />
      <rect x="150" y="510" width="50" height="25" fill={K.sand}      opacity="0.35" />
      <rect x="200" y="510" width="50" height="25" fill={K.cream}     opacity="0.50" />
      <rect x="250" y="510" width="50" height="25" fill={K.ochre}     opacity="0.25" />
      <rect x="300" y="510" width="50" height="25" fill={K.warmCream} opacity="0.40" />
      <rect x="350" y="510" width="50" height="25" fill={K.sand}      opacity="0.45" />
      {/* Thin grout lines between tiles */}
      {[50, 100, 150, 200, 250, 300, 350].map(x => (
        <line key={x} x1={x} y1="510" x2={x} y2="535" stroke={K.warmGrey} strokeWidth="0.75" opacity="0.6" />
      ))}
      <line x1="0" y1="510" x2={VIEWBOX.width} y2="510" stroke={K.warmGrey} strokeWidth="1" opacity="0.7" />
      <line x1="0" y1="535" x2={VIEWBOX.width} y2="535" stroke={K.warmGrey} strokeWidth="1" opacity="0.7" />

      {/* ── GRASS TUFTS — delicate Klee wire lines ── */}
      {GRASS_TUFTS.map(({ x, height, id }) => (
        <g key={id}>
          <line x1={x} y1="500" x2={x - 2} y2={500 - height}      stroke={K.moss}      strokeWidth="1"   strokeLinecap="round" />
          <line x1={x} y1="500" x2={x + 2} y2={500 - height + 2}  stroke={K.deepGreen} strokeWidth="1"   strokeLinecap="round" />
          <line x1={x} y1="500" x2={x}     y2={500 - height - 2}  stroke={K.sage}      strokeWidth="0.8" strokeLinecap="round" />
        </g>
      ))}

      {/* ── FLOWERS — Klee geometric botanical ── */}
      {FLOWERS.map(({ x, color, size }, i) => (
        <g key={i} transform={`translate(${x}, 498)`}>
          {/* Wire stem */}
          <line x1="0" y1="0" x2="0" y2={-(size * 2.8 + 2)} stroke={K.moss} strokeWidth="1" strokeLinecap="round" />
          {/* Small leaf */}
          <line
            x1="0" y1={-(size * 1.4)}
            x2={size * 0.9} y2={-(size * 2.0)}
            stroke={K.sage} strokeWidth="1" strokeLinecap="round"
          />
          {/* Petal spokes — radiating thin lines */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
            const rad = (angle * Math.PI) / 180;
            const cy = -(size * 2.8 + 2);
            return (
              <line
                key={angle}
                x1={Math.cos(rad) * (size * 0.45)}
                y1={cy + Math.sin(rad) * (size * 0.45)}
                x2={Math.cos(rad) * size}
                y2={cy + Math.sin(rad) * size}
                stroke={color}
                strokeWidth="1"
                strokeLinecap="round"
              />
            );
          })}
          {/* Flower centre */}
          <circle cx="0" cy={-(size * 2.8 + 2)} r={size * 0.45} fill={color} />
        </g>
      ))}

      {/* ── BUILDINGS — Klee colourful city, stacked warm rectangles ── */}

      {/* Left cluster */}
      <g opacity="0.78">
        {/* Wide base building — ochre */}
        <rect x="8"  y="462" width="42" height="38" fill={K.ochre} stroke={K.sienna} strokeWidth="0.5" />
        <rect x="14" y="468" width="5"  height="5"  fill={K.cream} opacity="0.65" />
        <rect x="24" y="468" width="5"  height="5"  fill={K.cream} opacity="0.65" />
        <rect x="34" y="468" width="5"  height="5"  fill={K.cream} opacity="0.65" />
        <rect x="14" y="479" width="5"  height="5"  fill={K.cream} opacity="0.65" />
        <rect x="34" y="479" width="5"  height="5"  fill={K.cream} opacity="0.65" />

        {/* Narrow tall tower — terracotta */}
        <rect x="12" y="445" width="14" height="55" fill={K.terracotta} stroke={K.sienna} strokeWidth="0.5" />
        <rect x="15" y="451" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="15" y="461" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="15" y="471" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="15" y="481" width="4"  height="4"  fill={K.cream} opacity="0.6" />

        {/* Short wide block — muted blue */}
        <rect x="50" y="474" width="24" height="26" fill={K.mutedBlue} stroke={K.deepBlue} strokeWidth="0.5" />
        <rect x="54" y="479" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="62" y="479" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="54" y="489" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="62" y="489" width="4"  height="4"  fill={K.cream} opacity="0.6" />

        {/* Thin accent tower — mauve */}
        <rect x="76" y="456" width="10" height="44" fill={K.mauve} stroke="#6A5070" strokeWidth="0.5" />
        <rect x="78" y="462" width="6"  height="4"  fill={K.cream} opacity="0.55" />
        <rect x="78" y="472" width="6"  height="4"  fill={K.cream} opacity="0.55" />
        <rect x="78" y="482" width="6"  height="4"  fill={K.cream} opacity="0.55" />
        <rect x="78" y="492" width="6"  height="4"  fill={K.cream} opacity="0.55" />
      </g>

      {/* Right cluster */}
      <g opacity="0.78">
        {/* Main wide building — dusty rose */}
        <rect x="308" y="464" width="36" height="36" fill={K.dustyRose} stroke={K.terracotta} strokeWidth="0.5" />
        <rect x="314" y="470" width="5"  height="5"  fill={K.cream} opacity="0.65" />
        <rect x="324" y="470" width="5"  height="5"  fill={K.cream} opacity="0.65" />
        <rect x="334" y="470" width="5"  height="5"  fill={K.cream} opacity="0.65" />
        <rect x="314" y="481" width="5"  height="5"  fill={K.cream} opacity="0.65" />
        <rect x="334" y="481" width="5"  height="5"  fill={K.cream} opacity="0.65" />

        {/* Tall tower — warm grey */}
        <rect x="346" y="450" width="16" height="50" fill={K.warmGrey} stroke="#7A6A5A" strokeWidth="0.5" />
        <rect x="349" y="456" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="355" y="456" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="349" y="466" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="355" y="466" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="349" y="476" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="355" y="476" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="349" y="486" width="4"  height="4"  fill={K.cream} opacity="0.6" />
        <rect x="355" y="486" width="4"  height="4"  fill={K.cream} opacity="0.6" />

        {/* Right accent building — ochre */}
        <rect x="364" y="458" width="30" height="42" fill={K.ochre} stroke={K.sienna} strokeWidth="0.5" />
        <rect x="368" y="464" width="5"  height="5"  fill={K.warmCream} opacity="0.6" />
        <rect x="378" y="464" width="5"  height="5"  fill={K.warmCream} opacity="0.6" />
        <rect x="368" y="475" width="5"  height="5"  fill={K.warmCream} opacity="0.6" />
        <rect x="378" y="475" width="5"  height="5"  fill={K.warmCream} opacity="0.6" />
        <rect x="368" y="486" width="5"  height="5"  fill={K.warmCream} opacity="0.6" />
        <rect x="378" y="486" width="5"  height="5"  fill={K.warmCream} opacity="0.6" />
      </g>
    </g>
  );
});
