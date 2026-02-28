import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { HumanState, HumanReaction } from '../types/game';

interface HumanProps {
  x: number;
  y: number;
  direction: 'left' | 'right';
  isPlaying: boolean;
  humanState?: HumanState;
  humanReaction?: HumanReaction;
  isRespawning?: boolean;
  opacity?: number;
}

type ViewState = 'side' | 'front' | 'shooting' | 'vomiting' | 'crying' | 'running';

export function Human({
  x,
  y,
  direction,
  isPlaying,
  humanState = 'walking',
  humanReaction = 'none',
  isRespawning: _isRespawning = false,
  opacity = 1,
}: HumanProps) {
  const [viewState, setViewState] = useState<ViewState>('side');
  const [currentDirection, setCurrentDirection] = useState(direction);
  const prevDirectionRef = useRef(direction);
  const scaleX = currentDirection === 'left' ? -1 : 1;

  const leftLegRef = useRef<SVGGElement>(null);
  const rightLegRef = useRef<SVGGElement>(null);
  const leftArmRef = useRef<SVGGElement>(null);
  const rightArmRef = useRef<SVGGElement>(null);
  const walkingTlRef = useRef<gsap.core.Timeline | null>(null);

  // Handle reaction state (overrides other states)
  useEffect(() => {
    if (humanReaction !== 'none') {
      setViewState(humanReaction);
      if (walkingTlRef.current) {
        walkingTlRef.current.pause();
      }
    } else if (viewState === 'vomiting' || viewState === 'crying' || viewState === 'running') {
      // Reaction ended, return to side view
      setViewState('side');
      if (walkingTlRef.current && isPlaying) {
        walkingTlRef.current.play();
      }
    }
  }, [humanReaction, isPlaying, viewState]);

  // Handle shooting state
  useEffect(() => {
    if (humanReaction !== 'none') return; // Reactions take priority
    if (humanState === 'shooting' && viewState !== 'front') {
      setViewState('shooting');
      if (walkingTlRef.current) {
        walkingTlRef.current.pause();
      }
    } else if (humanState === 'walking' && viewState === 'shooting') {
      setViewState('side');
      if (walkingTlRef.current && isPlaying) {
        walkingTlRef.current.play();
      }
    }
  }, [humanState, isPlaying, viewState, humanReaction]);

  // Handle direction change with turn animation
  useEffect(() => {
    if (prevDirectionRef.current !== direction && isPlaying && humanState !== 'shooting') {
      // Direction changed - play turn animation
      setViewState('front');

      // Kill walking animation during turn
      if (walkingTlRef.current) {
        walkingTlRef.current.pause();
      }

      // After pause, switch to new direction and resume
      const turnTimeout = setTimeout(() => {
        setCurrentDirection(direction);
        setViewState('side');
        if (walkingTlRef.current && isPlaying) {
          walkingTlRef.current.play();
        }
      }, 500); // 0.5 second pause while facing camera

      prevDirectionRef.current = direction;

      return () => clearTimeout(turnTimeout);
    }
  }, [direction, isPlaying, humanState]);

  // Walking animation - restarts when direction changes to fix visual sync
  useEffect(() => {
    if (!isPlaying || viewState !== 'side') return;
    if (!leftLegRef.current || !rightLegRef.current || !leftArmRef.current || !rightArmRef.current) return;

    // Reset all transforms before starting new animation
    gsap.set(leftLegRef.current, { rotation: 0, transformOrigin: '-3px 5px' }); // Front leg hip at (-3, 5)
    gsap.set(rightLegRef.current, { rotation: 0, transformOrigin: '3px 5px' });  // Back leg hip at (3, 5)
    gsap.set(leftArmRef.current, { rotation: 0, transformOrigin: '-4px -12px' }); // Back arm shoulder at (-4, -12)
    gsap.set(rightArmRef.current, { rotation: 0, transformOrigin: '6px -12px' }); // Front arm shoulder at (6, -12)

    const tl = gsap.timeline({ repeat: -1 });
    walkingTlRef.current = tl;

    // Walking animation - opposite arm and leg swing together (natural walking motion)
    // When front leg swings forward, back arm swings forward (and vice versa)
    const swingAngle = 18;
    const duration = 0.18;

    // Phase 1: Front leg forward, back leg back, front arm back, back arm forward
    tl.to(leftLegRef.current, { rotation: swingAngle, duration, ease: 'sine.inOut' }, 0)
      .to(rightLegRef.current, { rotation: -swingAngle, duration, ease: 'sine.inOut' }, 0)
      .to(leftArmRef.current, { rotation: swingAngle, duration, ease: 'sine.inOut' }, 0)
      .to(rightArmRef.current, { rotation: -swingAngle, duration, ease: 'sine.inOut' }, 0)
    // Phase 2: Reverse
      .to(leftLegRef.current, { rotation: -swingAngle, duration, ease: 'sine.inOut' })
      .to(rightLegRef.current, { rotation: swingAngle, duration, ease: 'sine.inOut' }, '<')
      .to(leftArmRef.current, { rotation: -swingAngle, duration, ease: 'sine.inOut' }, '<')
      .to(rightArmRef.current, { rotation: swingAngle, duration, ease: 'sine.inOut' }, '<');

    return () => {
      tl.kill();
      walkingTlRef.current = null;
    };
  }, [isPlaying, viewState, currentDirection]);

  // Shooting view - aiming gun upward
  if (viewState === 'shooting') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`} style={{ opacity, transition: 'opacity 0.5s ease' }}>
        {/* Shadow */}
        <ellipse cx="0" cy="28" rx="15" ry="4" fill="rgba(0,0,0,0.2)" />

        {/* Legs - standing still */}
        <path d="M 3 5 L 3 22 L 6 26" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none" />
        <ellipse cx="8" cy="26" rx="6" ry="3" fill="#2d2d2d" />
        <path d="M -3 5 L -3 22 L -6 26" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none" />
        <ellipse cx="-8" cy="26" rx="6" ry="3" fill="#2d2d2d" />

        {/* Body - Side profile suit */}
        <path
          d="M -6 -15 L -6 8 L 8 8 L 8 -15 Q 1 -18 -6 -15"
          fill="#1a1a2e"
          stroke="#0d0d1a"
          strokeWidth="1"
        />

        {/* White shirt collar */}
        <path d="M -2 -15 L 0 -12 L 4 -15" stroke="#fff" strokeWidth="2" fill="none" />

        {/* Tie */}
        <path d="M 1 -12 L 1 2" stroke="#8B0000" strokeWidth="3" />

        {/* Back arm - supporting gun */}
        <path
          d="M -4 -12 L 2 -25"
          stroke="#1a1a2e"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Front arm - holding gun up */}
        <path
          d="M 6 -12 L 6 -30"
          stroke="#1a1a2e"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Gun */}
        <g transform="translate(4, -32)">
          {/* Gun body */}
          <rect x="-3" y="-8" width="6" height="12" fill="#2d2d2d" rx="1" />
          {/* Gun barrel - pointing up */}
          <rect x="-2" y="-18" width="4" height="10" fill="#1a1a1a" />
          {/* Gun grip */}
          <rect x="-2" y="4" width="4" height="6" fill="#4a3728" rx="1" />
        </g>

        {/* Hand on gun */}
        <circle cx="4" cy="-30" r="3" fill="#E8BEAC" />
        <circle cx="2" cy="-26" r="2.5" fill="#E8BEAC" />

        {/* Head - Side profile, looking up */}
        <g transform="translate(0, -25) rotate(-15)">
          <path
            d="M -4 0
               C -6 -8, 2 -14, 8 -10
               L 10 -6
               L 14 -4
               L 14 2
               L 10 6
               L 4 8
               L -2 6
               L -4 0"
            fill="#E8BEAC"
            stroke="#D4A08C"
            strokeWidth="1"
          />

          {/* Hair - receding */}
          <path
            d="M 0 -12
               C 4 -14, 8 -12, 9 -10
               L 8 -8
               C 6 -10, 2 -10, 0 -8
               L -2 -6
               C -2 -10, -1 -12, 0 -12"
            fill="#3d2314"
          />

          {/* Side hair */}
          <path d="M -3 -4 C -5 -6, -4 -2, -3 0" fill="#3d2314" />

          {/* Ear */}
          <ellipse cx="-3" cy="-2" rx="2" ry="3" fill="#E8BEAC" stroke="#D4A08C" strokeWidth="0.5" />

          {/* Eye - looking up */}
          <ellipse cx="6" cy="-4" rx="2" ry="1.5" fill="#fff" />
          <circle cx="6" cy="-5" r="1" fill="#4a3728" />

          {/* Eyebrow - furrowed */}
          <path d="M 4 -7 Q 6 -9 9 -8" stroke="#3d2314" strokeWidth="1" fill="none" />

          {/* Nose */}
          <path d="M 10 -6 L 14 -2 L 12 0" stroke="#D4A08C" strokeWidth="1" fill="none" />

          {/* Mouth - determined */}
          <path d="M 10 3 L 12 2" stroke="#c77" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>
    );
  }

  // Vomiting reaction - bent over with green splatter
  if (viewState === 'vomiting') {
    return (
      <g transform={`translate(${x}, ${y})`} style={{ opacity, transition: 'opacity 0.5s ease' }}>
        {/* Shadow */}
        <ellipse cx="0" cy="28" rx="15" ry="4" fill="rgba(0,0,0,0.2)" />

        {/* Legs - slightly bent */}
        <path d="M -5 5 L -8 22 L -10 26" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 5 5 L 2 22 L 0 26" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none" />
        <ellipse cx="-12" cy="26" rx="6" ry="3" fill="#2d2d2d" />
        <ellipse cx="-2" cy="26" rx="6" ry="3" fill="#2d2d2d" />

        {/* Body - bent forward */}
        <g transform="rotate(30)">
          <path
            d="M -10 -15 L -10 8 L 10 8 L 10 -15 Q 0 -20 -10 -15"
            fill="#1a1a2e"
            stroke="#0d0d1a"
            strokeWidth="1"
          />
          <path d="M -4 -15 L 0 -10 L 4 -15" stroke="#fff" strokeWidth="2" fill="none" />
          <path d="M 0 -10 L 0 5" stroke="#8B0000" strokeWidth="4" />
        </g>

        {/* Arms hanging */}
        <path d="M -5 -5 L 5 10" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M 10 -5 L 20 10" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* Head - looking down */}
        <g transform="translate(15, -15) rotate(45)">
          <ellipse cx="0" cy="0" rx="10" ry="12" fill="#E8BEAC" />
          <path d="M -8 -8 Q -8 -14 0 -14 Q 8 -14 8 -8 L 6 -6 Q 0 -10 -6 -6 Z" fill="#3d2314" />
          {/* Sick face */}
          <ellipse cx="-4" cy="-2" rx="2" ry="1.5" fill="#fff" />
          <ellipse cx="4" cy="-2" rx="2" ry="1.5" fill="#fff" />
          <circle cx="-4" cy="-2" r="1" fill="#4a3728" />
          <circle cx="4" cy="-2" r="1" fill="#4a3728" />
          {/* Green tint on face */}
          <ellipse cx="0" cy="2" rx="6" ry="4" fill="#90EE90" opacity="0.3" />
          {/* Open mouth */}
          <ellipse cx="0" cy="6" rx="4" ry="3" fill="#8B4513" />
        </g>

        {/* Vomit splatter */}
        <g transform="translate(25, 0)">
          <ellipse cx="0" cy="5" rx="8" ry="5" fill="#90EE90" opacity="0.8" />
          <ellipse cx="5" cy="8" rx="5" ry="3" fill="#7CFC00" opacity="0.7" />
          <ellipse cx="-3" cy="10" rx="4" ry="2" fill="#ADFF2F" opacity="0.6" />
          {/* Drips */}
          <path d="M 0 -5 Q 2 0 0 5" stroke="#90EE90" strokeWidth="3" fill="none" />
          <path d="M -5 -3 Q -3 2 -5 7" stroke="#7CFC00" strokeWidth="2" fill="none" />
        </g>
      </g>
    );
  }

  // Crying reaction - face in hands
  if (viewState === 'crying') {
    return (
      <g transform={`translate(${x}, ${y})`} style={{ opacity, transition: 'opacity 0.5s ease' }}>
        {/* Shadow */}
        <ellipse cx="0" cy="28" rx="15" ry="4" fill="rgba(0,0,0,0.2)" />

        {/* Legs - standing */}
        <path d="M -5 5 L -5 22 L -8 26" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 5 5 L 5 22 L 8 26" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none" />
        <ellipse cx="-10" cy="26" rx="6" ry="3" fill="#2d2d2d" />
        <ellipse cx="10" cy="26" rx="6" ry="3" fill="#2d2d2d" />

        {/* Body - hunched slightly */}
        <path
          d="M -10 -15 L -10 8 L 10 8 L 10 -15 Q 0 -20 -10 -15"
          fill="#1a1a2e"
          stroke="#0d0d1a"
          strokeWidth="1"
        />
        <path d="M -4 -15 L 0 -10 L 4 -15" stroke="#fff" strokeWidth="2" fill="none" />
        <path d="M 0 -10 L 0 5" stroke="#8B0000" strokeWidth="4" />

        {/* Arms up to face */}
        <path d="M -10 -12 L -8 -25" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M 10 -12 L 8 -25" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="-8" cy="-27" r="3" fill="#E8BEAC" />
        <circle cx="8" cy="-27" r="3" fill="#E8BEAC" />

        {/* Head - crying */}
        <g transform="translate(0, -40)">
          <ellipse cx="0" cy="0" rx="10" ry="12" fill="#E8BEAC" />
          <path d="M -8 -8 Q -8 -14 0 -14 Q 8 -14 8 -8 L 6 -6 Q 0 -10 -6 -6 Z" fill="#3d2314" />
          {/* Closed eyes with tears */}
          <path d="M -6 -2 L -2 -2" stroke="#4a3728" strokeWidth="1.5" />
          <path d="M 2 -2 L 6 -2" stroke="#4a3728" strokeWidth="1.5" />
          {/* Tear streaks */}
          <path d="M -4 0 Q -5 5 -4 12" stroke="#87CEEB" strokeWidth="2" fill="none" opacity="0.8" />
          <path d="M 4 0 Q 5 5 4 12" stroke="#87CEEB" strokeWidth="2" fill="none" opacity="0.8" />
          {/* Tear drops */}
          <circle cx="-4" cy="14" r="2" fill="#87CEEB" />
          <circle cx="4" cy="14" r="2" fill="#87CEEB" />
          {/* Sad eyebrows */}
          <path d="M -6 -5 Q -4 -3 -2 -4" stroke="#3d2314" strokeWidth="1" fill="none" />
          <path d="M 2 -4 Q 4 -3 6 -5" stroke="#3d2314" strokeWidth="1" fill="none" />
          {/* Frowning mouth */}
          <path d="M -3 6 Q 0 4 3 6" stroke="#c77" strokeWidth="1.5" fill="none" />
          {/* Red nose from crying */}
          <circle cx="0" cy="2" r="2" fill="#ff9999" />
        </g>
      </g>
    );
  }

  // Running reaction - sprinting pose
  if (viewState === 'running') {
    return (
      <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`} style={{ opacity, transition: 'opacity 0.5s ease' }}>
        {/* Shadow - stretched from running */}
        <ellipse cx="5" cy="28" rx="20" ry="4" fill="rgba(0,0,0,0.2)" />

        {/* Back leg - extended back */}
        <path d="M 5 5 L 20 15 L 30 20" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none" />
        <ellipse cx="32" cy="20" rx="6" ry="3" fill="#2d2d2d" transform="rotate(-20, 32, 20)" />

        {/* Body - leaning forward */}
        <g transform="rotate(-20)">
          <path
            d="M -6 -15 L -6 8 L 8 8 L 8 -15 Q 1 -18 -6 -15"
            fill="#1a1a2e"
            stroke="#0d0d1a"
            strokeWidth="1"
          />
          <path d="M -2 -15 L 0 -12 L 4 -15" stroke="#fff" strokeWidth="2" fill="none" />
          <path d="M 1 -12 L 1 2" stroke="#8B0000" strokeWidth="3" />
        </g>

        {/* Front leg - lifted high */}
        <path d="M -5 0 L -15 -5 L -20 5" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none" />
        <ellipse cx="-22" cy="7" rx="6" ry="3" fill="#2d2d2d" transform="rotate(15, -22, 7)" />

        {/* Back arm - extended back */}
        <path d="M -2 -20 L 15 -10" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="17" cy="-9" r="3" fill="#E8BEAC" />

        {/* Front arm - pumping forward */}
        <path d="M 5 -20 L -10 -30" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="-12" cy="-31" r="3" fill="#E8BEAC" />

        {/* Head - looking forward in panic */}
        <g transform="translate(5, -35) rotate(-15)">
          <path
            d="M -4 0
               C -6 -8, 2 -14, 8 -10
               L 10 -6
               L 14 -4
               L 14 2
               L 10 6
               L 4 8
               L -2 6
               L -4 0"
            fill="#E8BEAC"
            stroke="#D4A08C"
            strokeWidth="1"
          />
          <path
            d="M 0 -12
               C 4 -14, 8 -12, 9 -10
               L 8 -8
               C 6 -10, 2 -10, 0 -8
               L -2 -6
               C -2 -10, -1 -12, 0 -12"
            fill="#3d2314"
          />
          <path d="M -3 -4 C -5 -6, -4 -2, -3 0" fill="#3d2314" />
          {/* Wide panicked eye */}
          <ellipse cx="6" cy="-4" rx="3" ry="2.5" fill="#fff" />
          <circle cx="7" cy="-4" r="1.5" fill="#4a3728" />
          {/* Raised eyebrow */}
          <path d="M 3 -8 Q 6 -10 10 -8" stroke="#3d2314" strokeWidth="1" fill="none" />
          {/* Open mouth screaming */}
          <ellipse cx="12" cy="2" rx="3" ry="4" fill="#8B4513" />
          {/* Sweat drops */}
          <path d="M -2 -8 Q -4 -12 -2 -14" stroke="#87CEEB" strokeWidth="1" fill="none" />
          <circle cx="-2" cy="-14" r="1.5" fill="#87CEEB" />
        </g>

        {/* Speed lines */}
        <path d="M 35 -10 L 50 -10" stroke="#888" strokeWidth="1" opacity="0.5" />
        <path d="M 35 0 L 55 0" stroke="#888" strokeWidth="1" opacity="0.5" />
        <path d="M 35 10 L 50 10" stroke="#888" strokeWidth="1" opacity="0.5" />
      </g>
    );
  }

  // Front view (when turning)
  if (viewState === 'front') {
    return (
      <g transform={`translate(${x}, ${y})`} style={{ opacity, transition: 'opacity 0.5s ease' }}>
        {/* Shadow */}
        <ellipse cx="0" cy="28" rx="15" ry="4" fill="rgba(0,0,0,0.2)" />

        {/* Legs - standing */}
        <path d="M -5 5 L -5 22 L -8 26" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 5 5 L 5 22 L 8 26" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Shoes */}
        <ellipse cx="-10" cy="26" rx="6" ry="3" fill="#2d2d2d" />
        <ellipse cx="10" cy="26" rx="6" ry="3" fill="#2d2d2d" />

        {/* Body - front view suit */}
        <path
          d="M -10 -15 L -10 8 L 10 8 L 10 -15 Q 0 -20 -10 -15"
          fill="#1a1a2e"
          stroke="#0d0d1a"
          strokeWidth="1"
        />

        {/* White shirt collar */}
        <path d="M -4 -15 L 0 -10 L 4 -15" stroke="#fff" strokeWidth="2" fill="none" />

        {/* Tie */}
        <path d="M 0 -10 L 0 5" stroke="#8B0000" strokeWidth="4" />

        {/* Arms - at sides */}
        <path d="M -10 -12 L -14 2" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M 10 -12 L 14 2" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* Hands */}
        <circle cx="-14" cy="4" r="3" fill="#E8BEAC" />
        <circle cx="14" cy="4" r="3" fill="#E8BEAC" />

        {/* Head - front view */}
        <g transform="translate(0, -28)">
          {/* Face shape */}
          <ellipse cx="0" cy="0" rx="10" ry="12" fill="#E8BEAC" />

          {/* Hair - receding */}
          <path
            d="M -8 -8 Q -8 -14 0 -14 Q 8 -14 8 -8 L 6 -6 Q 0 -10 -6 -6 Z"
            fill="#3d2314"
          />

          {/* Eyes */}
          <ellipse cx="-4" cy="-2" rx="2" ry="1.5" fill="#fff" />
          <ellipse cx="4" cy="-2" rx="2" ry="1.5" fill="#fff" />
          <circle cx="-4" cy="-2" r="1" fill="#4a3728" />
          <circle cx="4" cy="-2" r="1" fill="#4a3728" />

          {/* Eyebrows */}
          <path d="M -6 -5 L -2 -5" stroke="#3d2314" strokeWidth="1" />
          <path d="M 2 -5 L 6 -5" stroke="#3d2314" strokeWidth="1" />

          {/* Nose */}
          <path d="M 0 -1 L 0 3" stroke="#D4A08C" strokeWidth="1" />

          {/* Mouth - slight smirk */}
          <path d="M -3 6 Q 0 8 3 6" stroke="#c77" strokeWidth="1.5" fill="none" />

          {/* Ears */}
          <ellipse cx="-9" cy="0" rx="2" ry="3" fill="#E8BEAC" />
          <ellipse cx="9" cy="0" rx="2" ry="3" fill="#E8BEAC" />
        </g>
      </g>
    );
  }

  // Side view (normal walking)
  return (
    <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`} style={{ opacity, transition: 'opacity 0.5s ease' }}>
      {/* Shadow */}
      <ellipse cx="0" cy="28" rx="15" ry="4" fill="rgba(0,0,0,0.2)" />

      {/* Back leg (behind body) */}
      <g ref={rightLegRef}>
        <path
          d="M 3 5 L 3 20 L 6 26"
          stroke="#1a1a2e"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="8" cy="26" rx="6" ry="3" fill="#2d2d2d" />
      </g>

      {/* Body - Side profile suit */}
      <path
        d="M -6 -15 L -6 8 L 8 8 L 8 -15 Q 1 -18 -6 -15"
        fill="#1a1a2e"
        stroke="#0d0d1a"
        strokeWidth="1"
      />

      {/* White shirt collar */}
      <path d="M -2 -15 L 0 -12 L 4 -15" stroke="#fff" strokeWidth="2" fill="none" />

      {/* Tie */}
      <path d="M 1 -12 L 1 2" stroke="#8B0000" strokeWidth="3" />

      {/* Back arm */}
      <g ref={leftArmRef}>
        <path
          d="M -4 -12 L -8 0"
          stroke="#1a1a2e"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="-8" cy="2" r="3" fill="#E8BEAC" />
      </g>

      {/* Front leg */}
      <g ref={leftLegRef}>
        <path
          d="M -3 5 L -3 20 L -6 26"
          stroke="#1a1a2e"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <ellipse cx="-8" cy="26" rx="6" ry="3" fill="#2d2d2d" />
      </g>

      {/* Front arm */}
      <g ref={rightArmRef}>
        <path
          d="M 6 -12 L 10 0"
          stroke="#1a1a2e"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="10" cy="2" r="3" fill="#E8BEAC" />
      </g>

      {/* Head - Side profile */}
      <g transform="translate(0, -25)">
        <path
          d="M -4 0
             C -6 -8, 2 -14, 8 -10
             L 10 -6
             L 14 -4
             L 14 2
             L 10 6
             L 4 8
             L -2 6
             L -4 0"
          fill="#E8BEAC"
          stroke="#D4A08C"
          strokeWidth="1"
        />

        {/* Hair - receding */}
        <path
          d="M 0 -12
             C 4 -14, 8 -12, 9 -10
             L 8 -8
             C 6 -10, 2 -10, 0 -8
             L -2 -6
             C -2 -10, -1 -12, 0 -12"
          fill="#3d2314"
        />

        {/* Side hair */}
        <path d="M -3 -4 C -5 -6, -4 -2, -3 0" fill="#3d2314" />

        {/* Ear */}
        <ellipse cx="-3" cy="-2" rx="2" ry="3" fill="#E8BEAC" stroke="#D4A08C" strokeWidth="0.5" />

        {/* Eye */}
        <ellipse cx="6" cy="-4" rx="2" ry="1.5" fill="#fff" />
        <circle cx="7" cy="-4" r="1" fill="#4a3728" />

        {/* Eyebrow */}
        <path d="M 4 -7 Q 6 -8 9 -7" stroke="#3d2314" strokeWidth="1" fill="none" />

        {/* Nose */}
        <path d="M 10 -6 L 14 -2 L 12 0" stroke="#D4A08C" strokeWidth="1" fill="none" />

        {/* Mouth */}
        <path d="M 10 3 L 13 3" stroke="#c77" strokeWidth="1.5" strokeLinecap="round" />

        {/* Chin */}
        <path d="M 10 6 Q 8 8 4 8" stroke="#D4A08C" strokeWidth="0.5" fill="none" />
      </g>
    </g>
  );
}
