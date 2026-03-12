import { useCallback, useRef, useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useHighScores } from './hooks/useHighScores';
import { useBirdControls } from './hooks/useBirdControls';
import { useHumanMovement } from './hooks/useHumanMovement';
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
import { sfx, isMuted, setMuted } from './hooks/useSoundEffects';
import type { PoopData, BulletData, HumanData } from './types/game';

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
    syncHumanCount,
    pauseGame,
    resumeGame,
  } = useGameState();

  const { scores, submitScore, isEligible } = useHighScores();

  const [birdDirection, setBirdDirection] = useState<'left' | 'right'>('right');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [displayLevel, setDisplayLevel] = useState(1);
  const [humanOpacities, setHumanOpacities] = useState<Record<string, number>>({});
  const [birdHurt, setBirdHurt] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [soundMuted, setSoundMuted] = useState(isMuted());
  const prevLevelRef = useRef(state.level);
  const prevBirdLivesRef = useRef(state.birdLives);
  const fadeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const respawnTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const prevHumansRef = useRef(state.humans);

  // Track level changes — sync human count + level up overlay
  useEffect(() => {
    if (state.level > prevLevelRef.current && state.status === 'playing') {
      setDisplayLevel(state.level);
      setShowLevelUp(true);
      sfx.levelUp();
      syncHumanCount();
    }
    prevLevelRef.current = state.level;
  }, [state.level, state.status, syncHumanCount]);

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
      sfx.gameOver();
      const timeout = setTimeout(finalizeGameOver, 1200);
      return () => clearTimeout(timeout);
    }
  }, [state.status, finalizeGameOver]);

  const handleLevelUpComplete = useCallback(() => {
    setShowLevelUp(false);
  }, []);

  // Per-human reaction/respawn fade management
  useEffect(() => {
    const prevHumans = prevHumansRef.current;
    const currentHumans = state.humans;

    for (const human of currentHumans) {
      const prevHuman = prevHumans.find(h => h.id === human.id);

      // Detect new reaction — start fade out
      if (human.reaction !== 'none' && !human.isRespawning) {
        const wasReacting = prevHuman && prevHuman.reaction !== 'none';
        if (!wasReacting && !fadeTimersRef.current.has(human.id)) {
          setHumanOpacities(prev => ({ ...prev, [human.id]: 0 }));
          const timer = setTimeout(() => {
            startRespawn(human.id);
            fadeTimersRef.current.delete(human.id);
          }, 500);
          fadeTimersRef.current.set(human.id, timer);
        }
      }

      // Detect respawning — fade back in
      if (human.isRespawning && !respawnTimersRef.current.has(human.id)) {
        const timer = setTimeout(() => {
          finishRespawn(human.id);
          setHumanOpacities(prev => ({ ...prev, [human.id]: 1 }));
          respawnTimersRef.current.delete(human.id);
        }, 100);
        respawnTimersRef.current.set(human.id, timer);
      }
    }

    prevHumansRef.current = currentHumans;
  }, [state.humans, startRespawn, finishRespawn]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of fadeTimersRef.current.values()) clearTimeout(timer);
      for (const timer of respawnTimersRef.current.values()) clearTimeout(timer);
    };
  }, []);

  const humansRef = useRef(state.humans);
  humansRef.current = state.humans;

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
    sfx.poopDrop();
    spawnPoop(poop);
  }, [spawnPoop]);

  const { handleTouchStart, handleTouchEnd } = useBirdControls({
    birdX: state.birdX,
    ammo: state.ammo,
    isPlaying,
    onMove: handleBirdMove,
    onPoop: handleSpawnPoop,
  });

  useHumanMovement({
    humans: state.humans,
    level: state.level,
    isPlaying,
    onMove: moveHuman,
  });

  useAmmoRegen({
    ammo: state.ammo,
    maxAmmo: state.maxAmmo,
    isPlaying,
    onRegen: regenAmmo,
  });

  const handleSpawnBullet = useCallback((bullet: BulletData) => {
    sfx.humanShoot();
    spawnBullet(bullet);
  }, [spawnBullet]);

  useHumanShooting({
    humans: state.humans,
    level: state.level,
    isPlaying,
    onStartShooting: startShooting,
    onStopShooting: stopShooting,
    onSpawnBullet: handleSpawnBullet,
  });

  const getBirdX = useCallback(() => birdXRef.current, []);
  const getHumans = useCallback(() => humansRef.current, []);

  const handleBulletHit = useCallback((id: string) => {
    haptics.birdHit();
    sfx.birdHit();
    birdHit();
    removeBullet(id);
  }, [birdHit, removeBullet]);

  const handleBulletMiss = removeBullet;

  const handleStart = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleHit = useCallback((poopId: string, humanId: string) => {
    haptics.hitHuman();
    sfx.hitHuman();
    hitHuman(poopId, humanId);
  }, [hitHuman]);

  const handleMiss = useCallback((id: string) => {
    missHuman(id);
  }, [missHuman]);

  const handleRemove = useCallback((id: string) => {
    removePoop(id);
  }, [removePoop]);

  const handleRestart = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted();
    setMuted(newMuted);
    setSoundMuted(newMuted);
  }, []);

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
              getHumans={getHumans}
              onHit={handleHit}
              onMiss={handleMiss}
              onRemove={handleRemove}
            />
          ))}

          {state.bullets.map((bullet: BulletData) => (
            <Bullet
              key={bullet.id}
              id={bullet.id}
              startX={bullet.x}
              startY={bullet.y}
              characterType={bullet.characterType}
              getBirdX={getBirdX}
              onHit={handleBulletHit}
              onMiss={handleBulletMiss}
            />
          ))}

          {state.humans.map((human: HumanData) => (
            <Human
              key={human.id}
              x={human.x}
              y={PLAYER_Y}
              direction={human.direction}
              isPlaying={isPlaying}
              characterType={human.character}
              humanState={human.state}
              humanReaction={human.reaction}
              isRespawning={human.isRespawning}
              opacity={humanOpacities[human.id] ?? 1}
            />
          ))}

          {/* Touch zone hints — mobile only, auto-fades */}
          <TouchZoneHints />

          {/* Level up animation */}
          {showLevelUp && (
            <LevelUpOverlay level={displayLevel} onComplete={handleLevelUpComplete} />
          )}

          {/* HUD buttons — inside SVG so they scale with the viewBox */}
          <HudButtons
            onShowScores={() => { pauseGame(); setShowScores(true); }}
            onToggleMute={handleToggleMute}
            isMuted={soundMuted}
            viewBoxHeight={viewBoxHeight}
          />
        </>
      )}

      {state.status === 'gameOver' && (
        state.humans.map((human: HumanData) => (
          <Human
            key={human.id}
            x={human.x}
            y={PLAYER_Y}
            direction={human.direction}
            isPlaying={false}
            characterType={human.character}
            humanState="walking"
          />
        ))
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
