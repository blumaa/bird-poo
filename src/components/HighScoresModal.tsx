import type { HighScore } from '../hooks/useHighScores';

interface HighScoresModalProps {
  scores: HighScore[];
  onClose: () => void;
}

export function HighScoresModal({ scores, onClose }: HighScoresModalProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(10, 15, 25, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1E2D40',
          border: '3px solid #1A1A1A',
          padding: '20px',
          width: 286,
          maxHeight: '85%',
          overflowY: 'auto',
          textAlign: 'center',
          boxShadow: '5px 5px 0px #1A1A1A',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ben-Day dot band */}
        <div style={{ width: '100%', height: 18, marginBottom: 14, overflow: 'hidden', border: '2px solid #1A1A1A', boxSizing: 'border-box' }}>
          <svg width="100%" height="18" style={{ display: 'block' }}>
            <defs>
              <pattern id="benday-hs" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill="#1E2D40" />
                <circle cx="6" cy="6" r="3.5" fill="#F5C518" />
              </pattern>
            </defs>
            <rect width="100%" height="18" fill="url(#benday-hs)" />
          </svg>
        </div>

        <h2 style={{ margin: '0 0 4px', color: '#F5C518', fontSize: 28, fontFamily: "Impact, 'Arial Black', sans-serif", fontWeight: 'bold', letterSpacing: 2, lineHeight: 1, WebkitTextStroke: '1px #1A1A1A' }}>
          HIGH SCORES
        </h2>

        <div style={{ height: 3, background: '#F5C518', margin: '8px 0 14px' }} />

        {scores.length === 0 ? (
          <p style={{ color: '#A0B4C8', fontSize: 13, margin: '12px 0' }}>No scores yet. Be the first!</p>
        ) : (
          <div style={{ border: '2.5px solid #1A1A1A', overflow: 'hidden', boxShadow: '2px 2px 0px #1A1A1A' }}>
            <div style={{ background: '#0D5C55', padding: '5px 8px', fontWeight: 'bold', fontSize: 11, letterSpacing: 2, color: '#F5E6C8', fontFamily: "Impact, 'Arial Black', sans-serif", textAlign: 'left', textTransform: 'uppercase' }}>
              LEADERBOARD
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'Arial, Helvetica, sans-serif' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #1A1A1A', background: '#243447' }}>
                  <th style={{ padding: '4px 6px', textAlign: 'left',  color: '#A0B4C8', fontWeight: 'bold', fontSize: 11 }}>#</th>
                  <th style={{ padding: '4px 6px', textAlign: 'left',  color: '#A0B4C8', fontWeight: 'bold', fontSize: 11 }}>NAME</th>
                  <th style={{ padding: '4px 6px', textAlign: 'right', color: '#A0B4C8', fontWeight: 'bold', fontSize: 11 }}>SCORE</th>
                  <th style={{ padding: '4px 6px', textAlign: 'right', color: '#A0B4C8', fontWeight: 'bold', fontSize: 11 }}>LVL</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr
                    key={s.id}
                    style={{
                      background: i % 2 === 0 ? '#1E2D40' : '#243447',
                      borderBottom: i < scores.length - 1 ? '1px solid #0A0A0A' : 'none',
                    }}
                  >
                    <td style={{ padding: '4px 6px', color: '#F5E6C8' }}>{i + 1}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'left',  color: '#F5E6C8' }}>{s.player_name}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', color: '#F4603A', fontWeight: 'bold' }}>{s.score}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'right', color: '#F5E6C8' }}>{s.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: 14,
            padding: '10px 0',
            background: '#F4603A',
            color: '#F5E6C8',
            border: '2.5px solid #1A1A1A',
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: "Impact, 'Arial Black', sans-serif",
            cursor: 'pointer',
            width: '100%',
            letterSpacing: 3,
            textTransform: 'uppercase',
            boxShadow: '3px 3px 0px #1A1A1A',
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
