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

const BADGES = {
  "Getting Started": { threshold: 1, type: "games" },
  "Game Explorer": { threshold: 5, type: "games" },
  "Gaming Enthusiast": { threshold: 15, type: "games" },
  "Topic Tamer": { threshold: 3, type: "topics" },
  "Subject Master": { threshold: 10, type: "topics" },
  "Quick Learner": { threshold: 1, type: "highscore" },
  "Perfect Score": { threshold: 1, type: "perfect" },
  "XP Hunter": { threshold: 100, type: "xp" },
  "XP Legend": { threshold: 500, type: "xp" },
  "Comeback King": { threshold: 3, type: "recovery" }
};

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
  }
  
  if (correct === total) {
    if (!p.badges.includes("Perfect Score")) p.badges.push("Perfect Score");
  }
  
  if (correct / total < 0.4) {
    p.punishments += 1;
  } else if (p.punishments >= 3 && correct / total >= 0.7) {
    if (!p.badges.includes("Comeback King")) p.badges.push("Comeback King");
  }

  // Milestone badges
  if (p.gamesPlayed >= 5 && !p.badges.includes("Game Explorer")) p.badges.push("Game Explorer");
  if (p.gamesPlayed >= 15 && !p.badges.includes("Gaming Enthusiast")) p.badges.push("Gaming Enthusiast");
  if (p.topicsCompleted >= 3 && !p.badges.includes("Topic Tamer")) p.badges.push("Topic Tamer");
  if (p.topicsCompleted >= 10 && !p.badges.includes("Subject Master")) p.badges.push("Subject Master");
  if (p.xp >= 100 && !p.badges.includes("XP Hunter")) p.badges.push("XP Hunter");
  if (p.xp >= 500 && !p.badges.includes("XP Legend")) p.badges.push("XP Legend");

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
