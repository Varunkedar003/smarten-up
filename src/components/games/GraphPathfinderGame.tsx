import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { speechService } from '@/services/speechService';

interface GraphPathfinderGameProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

type Graph = Record<string, string[]>;

function genGraph(level: 'easy' | 'intermediate' | 'hard'): Graph {
  const sizes = { easy: 5, intermediate: 7, hard: 9 } as const;
  const n = sizes[level];
  const labels = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
  const g: Graph = {};
  for (const v of labels) g[v] = [];
  // Create a connected random graph
  for (let i = 1; i < n; i++) {
    const a = labels[i];
    const b = labels[Math.floor(Math.random() * i)];
    if (!g[a].includes(b)) g[a].push(b);
    if (!g[b].includes(a)) g[b].push(a);
  }
  // Add some extra edges
  const extra = level === 'easy' ? 2 : level === 'intermediate' ? 3 : 4;
  for (let i = 0; i < extra; i++) {
    const a = labels[Math.floor(Math.random() * n)];
    const b = labels[Math.floor(Math.random() * n)];
    if (a !== b && !g[a].includes(b)) { g[a].push(b); g[b].push(a); }
  }
  // Sort adjacency for deterministic display
  for (const v of labels) g[v].sort();
  return g;
}

function bfsShortestPath(g: Graph, start: string, goal: string): string[] {
  const q: string[][] = [[start]];
  const seen = new Set([start]);
  while (q.length) {
    const path = q.shift()!;
    const last = path[path.length - 1];
    if (last === goal) return path;
    for (const nei of g[last] || []) {
      if (!seen.has(nei)) {
        seen.add(nei);
        q.push([...path, nei]);
      }
    }
  }
  return [];
}

export const GraphPathfinderGame: React.FC<GraphPathfinderGameProps> = ({ level, subtopic, onComplete }) => {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [playing, setPlaying] = useState(true);
  const [graph, setGraph] = useState<Graph>(() => genGraph(level));
  const labels = useMemo(() => Object.keys(graph), [graph]);
  const [start, setStart] = useState(() => labels[0] || 'A');
  const [goal, setGoal] = useState(() => labels[labels.length - 1] || 'B');

  useEffect(() => {
    speechService.speakExplanation('Computer Science', subtopic || 'Graphs', level);
    const g = genGraph(level);
    setGraph(g);
    const lbs = Object.keys(g);
    setStart(lbs[0]);
    setGoal(lbs[lbs.length - 1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, subtopic]);

  const answer = useMemo(() => bfsShortestPath(graph, start, goal), [graph, start, goal]);

  const options = useMemo(() => {
    const correct = answer;
    // wrong1: add a detour if possible
    const wrong1 = correct.length > 2 ? [...correct.slice(0, -1), ...correct.slice(-1)] : [...correct, correct[0]];
    // wrong2: reverse path (not always valid but serves as decoy)
    const wrong2 = [...correct].reverse();
    return [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);
  }, [answer]);

  const pick = (arr: string[]) => {
    const correct = JSON.stringify(arr) === JSON.stringify(answer);
    setScore(p => ({ correct: p.correct + (correct ? 1 : 0), total: p.total + 1 }));
    if (correct) toast.success('Correct shortest path.'); else toast.error('Try again — think breadth-first.');

    const nowTotal = score.total + 1;
    if (nowTotal >= 6) {
      setPlaying(false);
      onComplete(score.correct + (correct ? 1 : 0), nowTotal);
    } else {
      const g = genGraph(level);
      setGraph(g);
      const lbs = Object.keys(g);
      setStart(lbs[0]);
      setGoal(lbs[lbs.length - 1]);
    }
  };

  if (!playing) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Graphs Challenge Complete</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <div className="text-2xl font-bold text-primary">{score.correct}/{score.total}</div>
          <Button onClick={() => window.history.back()} className="w-full">Continue</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Which is the shortest path from {start} to {goal}?</span>
          <span className="text-sm font-normal">Score: {score.correct}/{score.total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">Adjacency:</div>
        <div className="text-xs font-mono bg-muted/50 rounded p-2">
          {Object.entries(graph).map(([v, ns]) => (
            <div key={v}>{v}: [ {ns.join(', ')} ]</div>
          ))}
        </div>
        <div className="grid gap-2">
          {options.map((opt, i) => (
            <Button key={i} variant="outline" className="justify-start h-auto py-3" onClick={() => pick(opt)}>
              <code className="text-sm">[{opt.join(' → ')}]</code>
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Level: {level} • Topic: Graphs — Pathfinder</div>
      </CardContent>
    </Card>
  );
}
