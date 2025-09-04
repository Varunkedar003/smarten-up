export type GameSelection = {
  subject: string;
  topic: string;
  subtopic: string;
  level: "easy" | "intermediate" | "hard";
};

export type ProgressData = {
  topicsCompleted: number;
  gamesPlayed: number;
  rewards: number;
  punishments: number;
  badges: string[];
  xp: number;
  lastPlayedAt?: string;
  completedSubtopics: string[];
};

const KEY = "lr_progress";

const defaultProgress: ProgressData = {
  topicsCompleted: 0,
  gamesPlayed: 0,
  rewards: 0,
  punishments: 0,
  badges: [],
  xp: 0,
  completedSubtopics: [],
};

export function getProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultProgress };
    return { ...defaultProgress, ...JSON.parse(raw) } as ProgressData;
  } catch {
    return { ...defaultProgress };
  }
}

function setProgress(p: ProgressData) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function recordGameStart(sel: GameSelection) {
  const p = getProgress();
  p.gamesPlayed += 1;
  p.xp += 5; // small XP for starting
  p.lastPlayedAt = new Date().toISOString();
  // Starter badge
  if (!p.badges.includes("Getting Started")) p.badges.push("Getting Started");
  setProgress(p);
}

export function recordGameComplete(sel: GameSelection, correct: number, total: number) {
  const p = getProgress();
  const subKey = `${sel.subject}:${sel.topic}:${sel.subtopic}`;
  const newCompletion = !p.completedSubtopics.includes(subKey) && correct / total >= 0.6;
  if (newCompletion) {
    p.completedSubtopics.push(subKey);
    p.topicsCompleted += 1;
    p.xp += 20;
  } else {
    p.xp += 10; // partial XP
  }

  // rewards / punishments (gamified)
  if (correct / total >= 0.8) {
    p.rewards += 1;
    if (!p.badges.includes("Quick Learner")) p.badges.push("Quick Learner");
  } else if (correct / total < 0.4) {
    p.punishments += 1; // playful nudge
  }

  // Milestone badges
  if (p.gamesPlayed >= 5 && !p.badges.includes("Game Explorer")) p.badges.push("Game Explorer");
  if (p.topicsCompleted >= 3 && !p.badges.includes("Topic Tamer")) p.badges.push("Topic Tamer");

  setProgress(p);
}

export function resetProgress() {
  localStorage.removeItem(KEY);
}

// simple reactive hook
import { useEffect, useState } from "react";
export function useProgress() {
  const [state, setState] = useState<ProgressData>(getProgress());
  useEffect(() => {
    const i = setInterval(() => setState(getProgress()), 800);
    return () => clearInterval(i);
  }, []);
  return state;
}
