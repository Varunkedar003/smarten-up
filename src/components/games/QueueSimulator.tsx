import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { speechService } from '@/services/speechService';

interface QueueSimulatorProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

type Operation = { type: 'enqueue' | 'dequeue'; value?: number };

export const QueueSimulator: React.FC<QueueSimulatorProps> = ({ level, subtopic, onComplete }) => {
  const [queue, setQueue] = useState<number[]>([]);
  const [ops, setOps] = useState<Operation[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    speechService.speakExplanation('Computer Science', subtopic || 'Queues', level);
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, subtopic]);

  const opsPerRound = level === 'easy' ? 3 : level === 'intermediate' ? 4 : 5;

  const reset = () => {
    const start = Array.from({ length: level === 'hard' ? 4 : 3 }, () => Math.floor(Math.random() * 9));
    const sequence: Operation[] = [];
    for (let i = 0; i < opsPerRound; i++) {
      if (Math.random() < 0.6) sequence.push({ type: 'enqueue', value: Math.floor(Math.random() * 9) });
      else sequence.push({ type: 'dequeue' });
    }
    setQueue(start);
    setOps(sequence);
    setIndex(0);
  };

  const computeAnswer = () => {
    const arr = [...queue];
    for (let i = 0; i < opsPerRound; i++) {
      const op = ops[i];
      if (op.type === 'enqueue') arr.push(op.value!);
      else arr.shift();
    }
    return arr;
  };

  const optionsFromAnswer = (ans: number[]) => {
    const variants = [ans];
    for (let i = 0; i < 2; i++) {
      const v = [...ans];
      if (v.length > 0) {
        const a = Math.floor(Math.random() * v.length);
        const b = Math.floor(Math.random() * v.length);
        [v[a], v[b]] = [v[b], v[a]];
      } else {
        v.push(Math.floor(Math.random() * 9));
      }
      variants.push(v);
    }
    return shuffle(variants).map(x => x);
  };

  const shuffle = <T,>(arr: T[]): T[] => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  const [choices, setChoices] = useState<number[][]>([]);
  const [answer, setAnswer] = useState<number[]>([]);

  useEffect(() => {
    if (ops.length === 0) return; // Guard: don't run if ops is empty
    const ans = computeAnswer();
    setAnswer(ans);
    setChoices(optionsFromAnswer(ans));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.join(','), ops.map(o => o.type + (o.value ?? '')).join(',')]);

  const pick = (arr: number[]) => {
    const correct = JSON.stringify(arr) === JSON.stringify(answer);
    setScore(p => ({ correct: p.correct + (correct ? 1 : 0), total: p.total + 1 }));
    if (correct) toast.success('Correct queue state.'); else toast.error('That is not the resulting queue.');

    const nowTotal = score.total + 1;
    if (nowTotal >= 6) {
      setPlaying(false);
      onComplete(score.correct + (correct ? 1 : 0), nowTotal);
    } else {
      reset();
    }
  };

  if (!playing) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Queues Challenge Complete</CardTitle>
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
          <span>After these operations, what is the final queue?</span>
          <span className="text-sm font-normal">Score: {score.correct}/{score.total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <div className="mb-2">Start: <code>[{queue.join(', ')}]</code></div>
          <div>Ops: {ops.map((o, i) => o.type === 'enqueue' ? `enqueue(${o.value})` : 'dequeue').join(' → ')}</div>
        </div>
        <div className="grid gap-3">
          {choices.map((c, i) => (
            <Button key={i} variant="outline" className="justify-start h-auto py-3" onClick={() => pick(c)}>
              <code className="text-sm">[{c.join(', ')}]</code>
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Level: {level} • Topic: Stacks & Queues — Queue Simulator</div>
      </CardContent>
    </Card>
  );
};