import { useCallback, useRef, useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useHighScores } from './hooks/useHighScores';
import { useBirdControls } from './hooks/useBirdControls';
import { useHumanAI } from './hooks/useHumanAI';
import { useAmmoRegen } from './hooks/useAmmoRegen';
import { useHumanShooting } from './hooks/useHumanShooting';
import { Bird } from './components/Bird';
import { Poop } from './components/Poop';
import { Bullet } from './components/Bullet';
import { Human } from './components/Human';
import { GameUI } from './components/GameUI';
import { StartScreen } from './components/StartScreen';
import { GameOverOverlay } from './components/GameOverOverlay';
import { SkyBackground } from './components/SkyBackground';
import { GroundBackground } from './components/GroundBackground';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { TouchZoneHints } from './components/TouchZoneHints';
import { HudButtons } from './components/HudButtons';
import { HighScoresModal } from './components/HighScoresModal';
import { VIEWBOX, PLAYER_Y } from './utils/constants';
import { useViewBoxHeight } from './hooks/useViewBox';
import { haptics } from './hooks/useHaptics';
import type { PoopData, BulletData } from './types/game';

export function Game() {
  const {
    state,
    startGame,
    moveBird,
    moveHuman,
    spawnPoop,
    removePoop,
    hitHuman,
    missHuman,
    regenAmmo,
    resetGame,
    birdHit,
    finalizeGameOver,
    startShooting,
    stopShooting,
    spawnBullet,
    removeBullet,
    startRespawn,
    finishRespawn,
    pauseGame,
    resumeGame,
  } = useGameState();

  const { scores, submitScore, isEligible } = useHighScores();

  const [birdDirection, setBirdDirection] = useState<'left' | 'right'>('right');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [humanOpacity, setHumanOpacity] = useState(1);
  const [birdHurt, setBirdHurt] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const prevLevelRef = useRef(state.level);
  const prevBirdLivesRef = useRef(state.birdLives);

  // Track level changes
  useEffect(() => {
    if (state.level > prevLevelRef.current && state.status === 'playing') {
      setDisplayLevel(state.level);
      setShowLevelUp(true);
    }
    prevLevelRef.current = state.level;
  }, [state.level, state.status]);

  // Track bird getting hit
  useEffect(() => {
    if (state.birdLives < prevBirdLivesRef.current && (state.status === 'playing' || state.status === 'dying')) {
      setBirdHurt(true);
      const timeout = setTimeout(() => setBirdHurt(false), 800);
      return () => clearTimeout(timeout);
    }
    prevBirdLivesRef.current = state.birdLives;
  }, [state.birdLives, state.status]);

  // Delay game over overlay to let hurt animation finish
  useEffect(() => {
    if (state.status === 'dying') {
      haptics.gameOver();
      const timeout = setTimeout(finalizeGameOver, 1200);
      return () => clearTimeout(timeout);
    }
  }, [state.status, finalizeGameOver]);

  const handleLevelUpComplete = useCallback(() => {
    setShowLevelUp(false);
  }, []);

  // Handle human reaction timing - start fade immediately when hit
  useEffect(() => {
    if (state.humanReaction !== 'none' && !state.isHumanRespawning) {
      // Start fade out immediately
      setHumanOpacity(0);

      // After fade completes, start respawn
      const fadeTimeout = setTimeout(() => {
        startRespawn();
      }, 500); // 0.5 second fade duration

      return () => clearTimeout(fadeTimeout);
    }
  }, [state.humanReaction, state.isHumanRespawning, startRespawn]);

  // Handle respawn completion - fade back in
  useEffect(() => {
    if (state.isHumanRespawning) {
      // Immediately fade back in with new human
      const respawnTimeout = setTimeout(() => {
        finishRespawn();
        setHumanOpacity(1);
      }, 100); // Small delay to ensure state update

      return () => clearTimeout(respawnTimeout);
    }
  }, [state.isHumanRespawning, finishRespawn]);

  const humanXRef = useRef(state.humanX);
  humanXRef.current = state.humanX;

  const birdXRef = useRef(state.birdX);
  birdXRef.current = state.birdX;

  const isPlaying = state.status === 'playing';

  const handleBirdMove = useCallback((x: number) => {
    const currentX = birdXRef.current;
    if (x < currentX) {
      setBirdDirection('left');
    } else if (x > currentX) {
      setBirdDirection('right');
    }
    moveBird(x);
  }, [moveBird]);

  const handleSpawnPoop = useCallback((poop: PoopData) => {
    haptics.poopDrop();
    spawnPoop(poop);
  }, [spawnPoop]);

  const { handleTouchStart, handleTouchEnd } = useBirdControls({
    birdX: state.birdX,
    ammo: state.ammo,
    isPlaying,
    onMove: handleBirdMove,
    onPoop: handleSpawnPoop,
  });

  useHumanAI({
    humanX: state.humanX,
    humanDirection: state.humanDirection,
    level: state.level,
    isPlaying,
    humanReaction: state.humanReaction,
    isRespawning: state.isHumanRespawning,
    onMove: moveHuman,
  });

  useAmmoRegen({
    ammo: state.ammo,
    maxAmmo: state.maxAmmo,
    isPlaying,
    onRegen: regenAmmo,
  });

  useHumanShooting({
    humanX: state.humanX,
    level: state.level,
    isPlaying,
    humanReaction: state.humanReaction,
    isRespawning: state.isHumanRespawning,
    onStartShooting: startShooting,
    onStopShooting: stopShooting,
    onSpawnBullet: spawnBullet,
  });

  const getBirdX = useCallback(() => birdXRef.current, []);

  const handleBulletHit = useCallback((id: string) => {
    haptics.birdHit();
    birdHit();
    removeBullet(id);
  }, [birdHit, removeBullet]);

  const handleBulletMiss = useCallback((id: string) => {
    removeBullet(id);
  }, [removeBullet]);

  const handleStart = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleHit = useCallback((id: string) => {
    haptics.hitHuman();
    hitHuman(id);
  }, [hitHuman]);

  const handleMiss = useCallback((id: string) => {
    missHuman(id);
  }, [missHuman]);

  const handleRemove = useCallback((id: string) => {
    removePoop(id);
  }, [removePoop]);

  const getHumanX = useCallback(() => humanXRef.current, []);

  const handleRestart = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const viewBoxHeight = useViewBoxHeight();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <svg
      viewBox={`0 ${-(viewBoxHeight - VIEWBOX.height) / 2} ${VIEWBOX.width} ${viewBoxHeight}`}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
        userSelect: 'none',
        display: 'block',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Sky with sun and clouds */}
      <SkyBackground viewBoxHeight={viewBoxHeight} />

      {/* Ground with grass, flowers, and path */}
      <GroundBackground viewBoxHeight={viewBoxHeight} />

      {state.status === 'idle' && <StartScreen onStart={handleStart} viewBoxHeight={viewBoxHeight} />}

      {(state.status === 'playing' || state.status === 'paused' || state.status === 'dying') && (
        <>
          <GameUI
            score={state.score}
            level={state.level}
            ammo={state.ammo}
            birdLives={state.birdLives}
            viewBoxHeight={viewBoxHeight}
          />

          <Bird x={state.birdX} direction={birdDirection} isPlaying={isPlaying} isHurt={birdHurt} />

          {state.poops.map((poop: PoopData) => (
            <Poop
              key={poop.id}
              poop={poop}
              level={state.level}
              getHumanX={getHumanX}
              onHit={handleHit}
              onMiss={handleMiss}
              onRemove={handleRemove}
            />
          ))}

          {state.bullets.map((bullet: BulletData) => (
            <Bullet
              key={bullet.id}
              startX={bullet.x}
              startY={bullet.y}
              getBirdX={getBirdX}
              onHit={() => handleBulletHit(bullet.id)}
              onMiss={() => handleBulletMiss(bullet.id)}
            />
          ))}

          <Human
            x={state.humanX}
            y={PLAYER_Y}
            direction={state.humanDirection}
            isPlaying={isPlaying}
            humanState={state.humanState}
            humanReaction={state.humanReaction}
            isRespawning={state.isHumanRespawning}
            opacity={humanOpacity}
          />

          {/* Touch zone hints — mobile only, auto-fades */}
          <TouchZoneHints />

          {/* Level up animation */}
          {showLevelUp && (
            <LevelUpOverlay level={displayLevel} onComplete={handleLevelUpComplete} />
          )}

          {/* HUD buttons — inside SVG so they scale with the viewBox */}
          <HudButtons
            onShowScores={() => { pauseGame(); setShowScores(true); }}
            viewBoxHeight={viewBoxHeight}
          />
        </>
      )}

      {state.status === 'gameOver' && (
        <Human
          x={state.humanX}
          y={PLAYER_Y}
          direction={state.humanDirection}
          isPlaying={false}
          humanState="walking"
        />
      )}
    </svg>
    {state.status === 'gameOver' && (
      <GameOverOverlay
        score={state.score}
        level={state.level}
        highScores={scores}
        isEligible={isEligible(state.score)}
        onSubmitScore={submitScore}
        onRestart={handleRestart}
      />
    )}

    {showScores && (
      <HighScoresModal scores={scores} onClose={() => {
        setShowScores(false);
        if (state.status === 'paused') resumeGame();
      }} />
    )}
    </div>
  );
}
