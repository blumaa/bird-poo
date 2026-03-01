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

export function GameOverOverlay({ score, level, highScores, isEligible, onSubmitScore, onRestart }: GameOverOverlayProps) {
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
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        width: '280px',
        maxHeight: '90%',
        overflowY: 'auto',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}>
        <h2 style={{ margin: '0 0 8px', color: '#E74C3C', fontSize: '28px' }}>Game Over</h2>
        <p style={{ margin: '0 0 4px', fontSize: '16px', color: '#333' }}>Score: <strong>{score}</strong></p>
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#666' }}>Level: {level}</p>

        {isEligible && !submitted && (
          <>
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#27AE60', fontWeight: 'bold' }}>
              You made the top 10!
            </p>
            <LeaderboardTable scores={highScores} highlightScore={score} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                maxLength={20}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !name.trim()}
                style={{
                  padding: '8px 12px',
                  background: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  opacity: submitting || !name.trim() ? 0.6 : 1,
                }}
              >
                {submitting ? '...' : 'Submit'}
              </button>
            </div>
          </>
        )}

        {isEligible && submitted && (
          <>
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#27AE60', fontWeight: 'bold' }}>
              Score saved!
            </p>
            <LeaderboardTable scores={highScores} highlightScore={score} />
          </>
        )}

        {!isEligible && highScores.length > 0 && (
          <>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#999' }}>Top 10</p>
            <LeaderboardTable scores={highScores} />
          </>
        )}

        <button
          onClick={onRestart}
          style={{
            marginTop: '16px',
            padding: '10px 32px',
            background: '#4CAF50',
            color: '#fff',
            border: '2px solid #2E7D32',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

function LeaderboardTable({ scores, highlightScore }: { scores: HighScore[]; highlightScore?: number }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #eee' }}>
          <th style={{ padding: '4px', textAlign: 'left', color: '#999' }}>#</th>
          <th style={{ padding: '4px', textAlign: 'left', color: '#999' }}>Name</th>
          <th style={{ padding: '4px', textAlign: 'right', color: '#999' }}>Score</th>
          <th style={{ padding: '4px', textAlign: 'right', color: '#999' }}>Lvl</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((s, i) => (
          <tr
            key={s.id}
            style={{
              background: s.score === highlightScore ? '#FFF9C4' : 'transparent',
              fontWeight: s.score === highlightScore ? 'bold' : 'normal',
            }}
          >
            <td style={{ padding: '3px 4px', color: '#999' }}>{i + 1}</td>
            <td style={{ padding: '3px 4px', textAlign: 'left' }}>{s.player_name}</td>
            <td style={{ padding: '3px 4px', textAlign: 'right' }}>{s.score}</td>
            <td style={{ padding: '3px 4px', textAlign: 'right', color: '#666' }}>{s.level}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
