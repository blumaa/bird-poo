import { useState, useEffect } from 'react';
import { VIEWBOX } from '../utils/constants';

/** Returns a viewBox height that fills the screen while keeping width at 400. */
export function useViewBoxHeight(): number {
  const [height, setHeight] = useState(() => calcHeight());

  useEffect(() => {
    const onResize = () => setHeight(calcHeight());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return height;
}

function calcHeight(): number {
  const aspect = window.innerHeight / window.innerWidth;
  const h = Math.round(VIEWBOX.width * aspect);
  // Never go below the base game height
  return Math.max(h, VIEWBOX.height);
}
