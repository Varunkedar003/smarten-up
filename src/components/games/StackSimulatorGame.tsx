import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { speechService } from '@/services/speechService';

interface StackSimulatorGameProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

type Op = { type: 'push' | 'pop'; value?: number };

function genOps(level: 'easy' | 'intermediate' | 'hard'): Op[] {
  const len = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 9;
  const ops: Op[] = [];
  let size = 0;
  for (let i = 0; i < len; i++) {
    const doPush = size === 0 ? true : Math.random() < 0.6; // bias to push
    if (doPush) {
      const v = Math.floor(Math.random() * 9) + 1;
      ops.push({ type: 'push', value: v });
      size++;
    } else {
      ops.push({ type: 'pop' });
      size = Math.max(0, size - 1);
    }
  }
  return ops;
}

function runOps(ops: Op[]): number[] {
  const stack: number[] = [];
  for (const op of ops) {
    if (op.type === 'push' && typeof op.value === 'number') stack.push(op.value);
    if (op.type === 'pop' && stack.length) stack.pop();
  }
  return stack; // bottom -> top
}

export const StackSimulatorGame: React.FC<StackSimulatorGameProps> = ({ level, subtopic, onComplete }) => {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [playing, setPlaying] = useState(true);
  const [ops, setOps] = useState<Op[]>(() => genOps(level));

  useEffect(() => {
    speechService.speakExplanation('Computer Science', subtopic || 'Stacks', level);
    setOps(genOps(level));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, subtopic]);

  const answer = useMemo(() => runOps(ops), [ops]);

  const options = useMemo(() => {
    const correct = answer;
    const wrong1 = [...correct];
    if (wrong1.length > 1) {
      // swap top two
      const a = wrong1.length - 1;
      const b = wrong1.length - 2;
      [wrong1[a], wrong1[b]] = [wrong1[b], wrong1[a]];
    } else {
      wrong1.push(Math.floor(Math.random() * 9) + 1);
    }
    const wrong2 = correct.length ? correct.slice(0, -1) : [Math.floor(Math.random() * 9) + 1];
    return [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);
  }, [answer]);

  const pick = (arr: number[]) => {
    const correct = JSON.stringify(arr) === JSON.stringify(answer);
    setScore(p => ({ correct: p.correct + (correct ? 1 : 0), total: p.total + 1 }));
    if (correct) toast.success('Correct final stack.'); else toast.error('Not quite — remember LIFO.');

    const nowTotal = score.total + 1;
    if (nowTotal >= 6) {
      setPlaying(false);
      onComplete(score.correct + (correct ? 1 : 0), nowTotal);
    } else {
      setOps(genOps(level));
    }
  };

  const prettyOps = ops.map(op => op.type === 'push' ? `push ${op.value}` : 'pop').join(', ');

  if (!playing) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Stacks Challenge Complete</CardTitle>
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
          <span>Given operations, what is the final stack (bottom → top)?</span>
          <span className="text-sm font-normal">Score: {score.correct}/{score.total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">Operations: <code>{prettyOps}</code></div>
        <div className="grid gap-2">
          {options.map((opt, i) => (
            <Button key={i} variant="outline" className="justify-start h-auto py-3" onClick={() => pick(opt)}>
              <code className="text-sm">[{opt.join(', ')}]</code>
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Level: {level} • Topic: Stacks — Simulator</div>
      </CardContent>
    </Card>
  );
}
