'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { ProgressState, DashboardStats, Milestone } from '@/types';
import { PHASES } from '@/data/phases';
import {
  getLocalItem,
  setLocalItem,
  LOCAL_KEYS,
} from '@/utils/storage';

interface ProgressContextType {
  state: ProgressState;
  stats: DashboardStats;
  milestones: Milestone[];
  toggleTopic: (id: string) => void;
  toggleAllPhase: (id: number) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const INITIAL_STATE: ProgressState = { topics: {}, phases: {} };

const ZERO_STATS: DashboardStats = {
  totalTopics: PHASES.reduce((sum, p) => sum + p.topics.length, 0),
  completedTopics: 0,
  completedPhases: 0,
  percentage: 0,
  streak: 0,
};

const MILESTONES: Milestone[] = [
  { pct: 25, label: 'First Quarter', color: 'var(--orange)' },
  { pct: 50, label: 'Halfway', color: 'var(--accent2)' },
  { pct: 75, label: 'Almost There', color: 'var(--pink)' },
  { pct: 100, label: 'Complete!', color: 'var(--green2)' },
];

function loadState(): ProgressState {
  return getLocalItem<ProgressState>(LOCAL_KEYS.PREP_STATE) ?? INITIAL_STATE;
}

function saveState(state: ProgressState) {
  setLocalItem(LOCAL_KEYS.PREP_STATE, state);
}

function computeStreak(): number {
  if (typeof window === 'undefined') return 0;
  const today = new Date().toDateString();
  const lastVisit = getLocalItem<string>(LOCAL_KEYS.LAST_VISIT);
  let streak = getLocalItem<number>(LOCAL_KEYS.STREAK) ?? 0;

  if (lastVisit !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastVisit === yesterday) streak++;
    else if (lastVisit) streak = 1;
    else streak = 1;
    setLocalItem(LOCAL_KEYS.LAST_VISIT, today);
    setLocalItem(LOCAL_KEYS.STREAK, streak);
  }

  return streak;
}

function computeStats(state: ProgressState, streak: number): DashboardStats {
  const totalTopics = PHASES.reduce((sum, p) => sum + p.topics.length, 0);
  const completedTopics = Object.values(state.topics).filter(Boolean).length;
  const completedPhases = Object.values(state.phases).filter(Boolean).length;
  const percentage = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return {
    totalTopics,
    completedTopics,
    completedPhases,
    percentage,
    streak,
  };
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(INITIAL_STATE);
  const [streak, setStreak] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(loadState());
    setStreak(computeStreak());
  }, []);

  useEffect(() => {
    if (mounted) saveState(state);
  }, [state, mounted]);

  const toggleTopic = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, topics: { ...prev.topics, [id]: !prev.topics[id] } };
      PHASES.forEach((phase) => {
        const allDone = phase.topics.every((t) => next.topics[t.id]);
        if (allDone) next.phases = { ...next.phases, [phase.id]: true };
        else {
          const { [phase.id]: _, ...rest } = next.phases;
          next.phases = rest;
        }
      });
      return next;
    });
  }, []);

  const toggleAllPhase = useCallback((id: number) => {
    setState((prev) => {
      const phase = PHASES.find((p) => p.id === id);
      if (!phase) return prev;
      const allDone = phase.topics.every((t) => prev.topics[t.id]);
      const nextTopics = { ...prev.topics };
      phase.topics.forEach((t) => { nextTopics[t.id] = !allDone; });
      const nextPhases = { ...prev.phases };
      if (!allDone) nextPhases[id] = true;
      else delete nextPhases[id];
      return { topics: nextTopics, phases: nextPhases };
    });
  }, []);

  const resetProgress = useCallback(() => {
    if (!confirm('Reset all progress? This cannot be undone.')) return;
    setState(INITIAL_STATE);
  }, []);

  const stats = useMemo(() => computeStats(state, streak), [state, streak]);

  const value = useMemo(
    () => ({ state, stats, milestones: MILESTONES, toggleTopic, toggleAllPhase, resetProgress }),
    [state, stats, toggleTopic, toggleAllPhase, resetProgress],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
