import { VIEWBOX } from '../utils/constants';

export function SkyBackground() {
  return (
    <g>
      <defs>
        {/* Ben-Day dots for sky: small white circles on 10×10 grid */}
        <pattern id="licht-sky-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2.5" fill="white" />
        </pattern>
        {/* Ben-Day dots for clouds: light blue circles on 8×8 grid */}
        <pattern id="licht-cloud-dots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2" fill="#99CCFF" />
        </pattern>
      </defs>

      {/* Sky — flat primary blue */}
      <rect x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} fill="#0055CC" />
      {/* Ben-Day halftone overlay */}
      <rect x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} fill="url(#licht-sky-dots)" opacity="0.25" />

      {/* Sun — flat yellow, thick black outline, bold rays */}
      <g transform="translate(350, 50)">
        {/* Bold rays: draw black (wider) underneath, then yellow on top */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <g key={angle}>
            <line
              x1="0" y1="0"
              x2={Math.cos((angle * Math.PI) / 180) * 34}
              y2={Math.sin((angle * Math.PI) / 180) * 34}
              stroke="black"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="0" y1="0"
              x2={Math.cos((angle * Math.PI) / 180) * 34}
              y2={Math.sin((angle * Math.PI) / 180) * 34}
              stroke="#FFE600"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        ))}
        {/* Sun disc */}
        <circle cx="0" cy="0" r="20" fill="#FFE600" stroke="black" strokeWidth="3" />
      </g>

      {/* Background birds — bold comic silhouettes */}
      <g fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round">
        <path d="M 50 120 Q 55 115 60 120 M 60 120 Q 65 115 70 120" />
        <path d="M 120 80 Q 123 77 126 80 M 126 80 Q 129 77 132 80" />
        <path d="M 280 100 Q 284 96 288 100 M 288 100 Q 292 96 296 100" />
      </g>

      {/* Cloud 1 */}
      <g>
        <ellipse cx="60" cy="130" rx="30" ry="15" fill="white" stroke="black" strokeWidth="2.5" />
        <ellipse cx="85" cy="125" rx="25" ry="18" fill="white" stroke="black" strokeWidth="2.5" />
        <ellipse cx="45" cy="125" rx="20" ry="12" fill="white" stroke="black" strokeWidth="2.5" />
        {/* Ben-Day dots shading overlay */}
        <ellipse cx="60" cy="130" rx="30" ry="15" fill="url(#licht-cloud-dots)" opacity="0.15" />
        <ellipse cx="85" cy="125" rx="25" ry="18" fill="url(#licht-cloud-dots)" opacity="0.15" />
        <ellipse cx="45" cy="125" rx="20" ry="12" fill="url(#licht-cloud-dots)" opacity="0.15" />
      </g>

      {/* Cloud 2 */}
      <g>
        <ellipse cx="260" cy="60" rx="25" ry="12" fill="white" stroke="black" strokeWidth="2.5" />
        <ellipse cx="280" cy="55" rx="20" ry="14" fill="white" stroke="black" strokeWidth="2.5" />
        <ellipse cx="245" cy="58" rx="18" ry="10" fill="white" stroke="black" strokeWidth="2.5" />
        <ellipse cx="260" cy="60" rx="25" ry="12" fill="url(#licht-cloud-dots)" opacity="0.15" />
        <ellipse cx="280" cy="55" rx="20" ry="14" fill="url(#licht-cloud-dots)" opacity="0.15" />
        <ellipse cx="245" cy="58" rx="18" ry="10" fill="url(#licht-cloud-dots)" opacity="0.15" />
      </g>

      {/* Cloud 3 */}
      <g>
        <ellipse cx="150" cy="170" rx="35" ry="16" fill="white" stroke="black" strokeWidth="2.5" />
        <ellipse cx="180" cy="165" rx="28" ry="18" fill="white" stroke="black" strokeWidth="2.5" />
        <ellipse cx="130" cy="168" rx="22" ry="12" fill="white" stroke="black" strokeWidth="2.5" />
        <ellipse cx="150" cy="170" rx="35" ry="16" fill="url(#licht-cloud-dots)" opacity="0.15" />
        <ellipse cx="180" cy="165" rx="28" ry="18" fill="url(#licht-cloud-dots)" opacity="0.15" />
        <ellipse cx="130" cy="168" rx="22" ry="12" fill="url(#licht-cloud-dots)" opacity="0.15" />
      </g>
    </g>
  );
}
