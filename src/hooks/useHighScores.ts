import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface HighScore {
  id: string;
  player_name: string;
  score: number;
  level: number;
}

export function useHighScores() {
  const [scores, setScores] = useState<HighScore[]>([]);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from('high_scores')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);
    setScores(data ?? []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitScore = async (name: string, score: number, level: number) => {
    await supabase.from('high_scores').insert({ player_name: name, score, level });
    await refresh();
  };

  const isEligible = (score: number) =>
    scores.length < 10 || score > (scores[scores.length - 1]?.score ?? 0);

  return { scores, submitScore, isEligible };
}
