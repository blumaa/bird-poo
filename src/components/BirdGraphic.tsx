import { forwardRef } from 'react';

interface BirdGraphicProps {
  wingFill?: string;
  bodyFill?: string;
  isHurt?: boolean;
  wingsRef?: React.RefObject<SVGGElement | null>;
}

export const BirdGraphic = forwardRef<SVGGElement, BirdGraphicProps>(
  function BirdGraphic(
    { wingFill = '#A0784A', bodyFill = '#A0784A', isHurt = false, wingsRef },
    ref
  ) {
    const hurtBody = '#8B1A1A';
    const hurtWing = '#A82020';
    const body = isHurt ? hurtBody : bodyFill;
    const wing = isHurt ? hurtWing : wingFill;

    return (
      <g ref={ref}>
        {/* Tail wedges — behind body */}
        <polygon points="-16,0 -30,-7 -26,6" fill={isHurt ? '#6B0A0A' : '#6B4820'} stroke="#111" strokeWidth="1.5" />
        <polygon points="-16,4 -32,6 -24,13" fill={isHurt ? '#8B1A1A' : '#8B6030'} stroke="#111" strokeWidth="1.5" />

        {/* Wings (GSAP-animated — ref preserved) */}
        <g ref={wingsRef}>
          {/* Left wing: swept back polygon */}
          <polygon points="-5,0 -20,-10 -38,-3 -28,5" fill={wing} stroke="#111" strokeWidth="2" />
          {/* Right wing: asymmetric tip angle — Cubist simultaneity */}
          <polygon points="5,0 20,-10 38,-3 28,5" fill={wing} stroke="#111" strokeWidth="2" />
          {/* Wing facet highlight — lighter plane on right wing */}
          <polygon points="5,0 20,-10 24,-2 14,4" fill={isHurt ? '#C04040' : '#C49060'} stroke="#111" strokeWidth="1" />
        </g>

        {/* Body — irregular angular hexagon */}
        <polygon points="-14,8 -16,-2 -6,-10 12,-8 18,2 12,10 -4,12" fill={body} stroke="#111" strokeWidth="2" />
        {/* Body shadow facet */}
        <polygon points="-14,8 -16,-2 -4,-8 -2,10" fill={isHurt ? '#6B0A0A' : '#7A5830'} stroke="#111" strokeWidth="1" />

        {/* Neck join facet */}
        <polygon points="10,-8 18,-12 22,-4" fill={isHurt ? '#AA2020' : '#C49060'} stroke="#111" strokeWidth="1.5" />

        {/* Head — polygon showing profile + frontal plane simultaneously */}
        <polygon points="16,-14 24,-12 30,-6 28,0 20,4 14,2 12,-6" fill={body} stroke="#111" strokeWidth="2" />
        {/* Head shadow plane (left/rear facet) */}
        <polygon points="12,-6 16,-14 18,-12 14,2" fill={isHurt ? '#6B0A0A' : '#7A5830'} stroke="#111" strokeWidth="1" />

        {/* Beak — angular forward-thrusting triangle */}
        <polygon points="28,-4 40,-1 28,3" fill="#D4A820" stroke="#111" strokeWidth="2" />
        {/* Beak highlight */}
        <line x1="28" y1="-4" x2="40" y2="-1" stroke="#F0C030" strokeWidth="1" />

        {/* Eye — frontal eye placed on profile head (classic Picasso move) */}
        {isHurt ? (
          <>
            {/* X eyes when hurt */}
            <line x1="18" y1="-10" x2="26" y2="-4" stroke="#111" strokeWidth="3" strokeLinecap="round" />
            <line x1="18" y1="-4" x2="26" y2="-10" stroke="#111" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Almond eye polygon (frontal, on profile head) */}
            <polygon points="17,-8 22,-10 26,-7 22,-4" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
            <circle cx="22" cy="-7" r="2" fill="#111" />
            <circle cx="22.8" cy="-7.5" r="0.6" fill="#F5ECD7" />
          </>
        )}

        {/* Eyebrow — bold angular dash */}
        <line x1="17" y1="-11" x2="24" y2="-12" stroke="#111" strokeWidth="2" strokeLinecap="round" />

        {/* Feet — angular orange strokes */}
        <path d="M -3 10 L -6 17 M -3 10 L -3 17 M -3 10 L 0 17"
          stroke="#D4A820" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 6 10 L 3 17 M 6 10 L 6 17 M 6 10 L 9 17"
          stroke="#D4A820" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Pain markers when hurt — bold polygon asterisks */}
        {isHurt && (
          <>
            <g transform="translate(-22, -22)">
              <line x1="-5" y1="0" x2="5" y2="0" stroke="#D4A820" strokeWidth="2.5" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#D4A820" strokeWidth="2.5" />
              <line x1="-4" y1="-4" x2="4" y2="4" stroke="#D4A820" strokeWidth="2.5" />
              <line x1="4" y1="-4" x2="-4" y2="4" stroke="#D4A820" strokeWidth="2.5" />
            </g>
            <g transform="translate(26, -16)">
              <line x1="-4" y1="0" x2="4" y2="0" stroke="#D4A820" strokeWidth="2" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="#D4A820" strokeWidth="2" />
            </g>
            <g transform="translate(-8, -26)">
              <line x1="-3" y1="0" x2="3" y2="0" stroke="#D4A820" strokeWidth="2" />
              <line x1="0" y1="-3" x2="0" y2="3" stroke="#D4A820" strokeWidth="2" />
            </g>
          </>
        )}
      </g>
    );
  }
);
