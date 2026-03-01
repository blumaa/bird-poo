import { useState } from 'react';
import type { HighScore } from '../hooks/useHighScores';

interface GameOverOverlayProps {
  score: number;
  level: number;
  highScores: HighScore[];
  isEligible: boolean;
  onSubmitScore: (name: string, score: number, level: number) => Promise<void>;
  onRestart: () => void;
}

// Ben-Day dot band rendered as an inline SVG strip at the top of the card
function BenDayBand() {
  return (
    <div
      style={{
        width: '100%',
        height: '18px',
        marginBottom: '14px',
        flexShrink: 0,
        overflow: 'hidden',
        border: '2px solid #1A1A1A',
        boxSizing: 'border-box',
      }}
    >
      <svg width="100%" height="18" style={{ display: 'block' }}>
        <defs>
          <pattern id="benday-card" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill="#1E2D40" />
            <circle cx="6" cy="6" r="3.5" fill="#F4603A" />
          </pattern>
        </defs>
        <rect width="100%" height="18" fill="url(#benday-card)" />
      </svg>
    </div>
  );
}

export function GameOverOverlay({
  score,
  level,
  highScores,
  isEligible,
  onSubmitScore,
  onRestart,
}: GameOverOverlayProps) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    await onSubmitScore(name.trim(), score, level);
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(10, 15, 25, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          background: '#1E2D40',
          border: '3px solid #1A1A1A',
          padding: '20px 20px 20px',
          width: '286px',
          maxHeight: '92%',
          overflowY: 'auto',
          textAlign: 'center',
          boxShadow: '5px 5px 0px #1A1A1A',
          boxSizing: 'border-box',
        }}
      >
        {/* Ben-Day dot band at top of card */}
        <BenDayBand />

        {/* "GAME OVER" heading */}
        <h2
          style={{
            margin: '0 0 4px',
            color: '#F5C518',
            fontSize: '34px',
            fontFamily: "Impact, 'Arial Black', sans-serif",
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            lineHeight: 1,
            WebkitTextStroke: '1px #1A1A1A',
          }}
        >
          GAME OVER
        </h2>

        {/* Thick golden rule */}
        <div
          style={{
            height: '3px',
            background: '#F5C518',
            margin: '8px 0 12px',
          }}
        />

        {/* Score and level */}
        <p
          style={{
            margin: '0 0 3px',
            fontSize: '15px',
            color: '#F5E6C8',
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          SCORE:{' '}
          <strong
            style={{
              color: '#F4603A',
              fontSize: '22px',
              fontFamily: "Impact, 'Arial Black', sans-serif",
              letterSpacing: '1px',
            }}
          >
            {score}
          </strong>
        </p>
        <p
          style={{
            margin: '0 0 14px',
            fontSize: '12px',
            color: '#A0B4C8',
            fontFamily: "Arial, Helvetica, sans-serif",
            letterSpacing: '1px',
          }}
        >
          LEVEL: <strong>{level}</strong>
        </p>

        {/* Eligible + not yet submitted */}
        {isEligible && !submitted && (
          <>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: '12px',
                color: '#5ECFB1',
                fontWeight: 'bold',
                fontFamily: "Impact, 'Arial Black', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              You made the top 10!
            </p>
            <LeaderboardTable scores={highScores} highlightScore={score} />
            <div
              style={{
                display: 'flex',
                gap: '7px',
                marginTop: '11px',
              }}
            >
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                maxLength={20}
                style={{
                  flex: 1,
                  padding: '7px 8px',
                  border: '2.5px solid #F5C518',
                  fontSize: '13px',
                  background: '#243447',
                  color: '#F5E6C8',
                  fontFamily: "Arial, Helvetica, sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !name.trim()}
                style={{
                  padding: '7px 11px',
                  background: '#0D5C55',
                  color: '#F5E6C8',
                  border: '2.5px solid #1A1A1A',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  fontFamily: "Impact, 'Arial Black', sans-serif",
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: submitting || !name.trim() ? 'not-allowed' : 'pointer',
                  opacity: submitting || !name.trim() ? 0.5 : 1,
                  boxShadow: submitting || !name.trim() ? 'none' : '2px 2px 0px #1A1A1A',
                }}
              >
                {submitting ? '...' : 'SUBMIT'}
              </button>
            </div>
          </>
        )}

        {/* Eligible + already submitted */}
        {isEligible && submitted && (
          <>
            <p
              style={{
                margin: '0 0 8px',
                fontSize: '12px',
                color: '#5ECFB1',
                fontWeight: 'bold',
                fontFamily: "Impact, 'Arial Black', sans-serif",
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Score saved!
            </p>
            <LeaderboardTable scores={highScores} highlightScore={score} />
          </>
        )}

        {/* Not eligible — just show leaderboard */}
        {!isEligible && highScores.length > 0 && (
          <LeaderboardTable scores={highScores} />
        )}

        {/* Play Again button */}
        <button
          onClick={onRestart}
          style={{
            marginTop: '14px',
            padding: '10px 0',
            background: '#F4603A',
            color: '#F5E6C8',
            border: '2.5px solid #1A1A1A',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: "Impact, 'Arial Black', sans-serif",
            cursor: 'pointer',
            width: '100%',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            boxShadow: '3px 3px 0px #1A1A1A',
          }}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

function LeaderboardTable({
  scores,
  highlightScore,
}: {
  scores: HighScore[];
  highlightScore?: number;
}) {
  return (
    <div
      style={{
        border: '2.5px solid #1A1A1A',
        overflow: 'hidden',
        marginTop: '4px',
        boxShadow: '2px 2px 0px #1A1A1A',
      }}
    >
      {/* Header bar — teal */}
      <div
        style={{
          background: '#0D5C55',
          padding: '5px 8px',
          fontWeight: 'bold',
          fontSize: '11px',
          letterSpacing: '2px',
          color: '#F5E6C8',
          fontFamily: "Impact, 'Arial Black', sans-serif",
          textAlign: 'left',
          textTransform: 'uppercase',
        }}
      >
        HIGH SCORES
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: '2px solid #1A1A1A',
              background: '#243447',
            }}
          >
            <th style={{ padding: '4px 6px', textAlign: 'left', color: '#A0B4C8', fontWeight: 'bold', fontSize: '11px' }}>#</th>
            <th style={{ padding: '4px 6px', textAlign: 'left', color: '#A0B4C8', fontWeight: 'bold', fontSize: '11px' }}>NAME</th>
            <th style={{ padding: '4px 6px', textAlign: 'right', color: '#A0B4C8', fontWeight: 'bold', fontSize: '11px' }}>SCORE</th>
            <th style={{ padding: '4px 6px', textAlign: 'right', color: '#A0B4C8', fontWeight: 'bold', fontSize: '11px' }}>LVL</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr
              key={s.id}
              style={{
                background:
                  s.score === highlightScore
                    ? '#F5C518'
                    : i % 2 === 0
                    ? '#1E2D40'
                    : '#243447',
                fontWeight: s.score === highlightScore ? 'bold' : 'normal',
                borderBottom: i < scores.length - 1 ? '1px solid #0A0A0A' : 'none',
              }}
            >
              <td style={{ padding: '4px 6px', color: s.score === highlightScore ? '#1A1A1A' : '#F5E6C8' }}>{i + 1}</td>
              <td style={{ padding: '4px 6px', textAlign: 'left', color: s.score === highlightScore ? '#1A1A1A' : '#F5E6C8' }}>{s.player_name}</td>
              <td style={{ padding: '4px 6px', textAlign: 'right', color: s.score === highlightScore ? '#1A1A1A' : '#F5E6C8' }}>{s.score}</td>
              <td style={{ padding: '4px 6px', textAlign: 'right', color: s.score === highlightScore ? '#1A1A1A' : '#F5E6C8' }}>{s.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
