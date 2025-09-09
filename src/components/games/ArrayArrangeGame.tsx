import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { speechService } from '@/services/speechService';

interface ArrayArrangeGameProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

export const ArrayArrangeGame: React.FC<ArrayArrangeGameProps> = ({ level, subtopic, onComplete }) => {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [options, setOptions] = useState<number[][]>([]);
  const [answerIndex, setAnswerIndex] = useState<number>(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    speechService.speakExplanation('Computer Science', subtopic || 'Arrays & Lists', level);
    nextRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, subtopic]);

  const len = useMemo(() => (level === 'easy' ? 5 : level === 'intermediate' ? 8 : 12), [level]);

  const nextRound = () => {
    // Create a random base array
    const base = Array.from({ length: len }, () => Math.floor(Math.random() * 50));
    const sorted = [...base].sort((a, b) => a - b);

    // Generate 3 variants, 1 is correct sorted array
    const correctIdx = Math.floor(Math.random() * 3);
    const variants: number[][] = [];
    for (let i = 0; i < 3; i++) {
      if (i === correctIdx) variants.push(sorted);
      else {
        const arr = [...sorted];
        // introduce small mistakes based on difficulty
        const swaps = level === 'easy' ? 1 : level === 'intermediate' ? 2 : 3;
        for (let s = 0; s < swaps; s++) {
          const a = Math.floor(Math.random() * arr.length);
          const b = Math.floor(Math.random() * arr.length);
          [arr[a], arr[b]] = [arr[b], arr[a]];
        }
        variants.push(arr);
      }
    }
    setOptions(variants);
    setAnswerIndex(correctIdx);
  };

  const choose = (idx: number) => {
    const correct = idx === answerIndex;
    setScore(p => ({ correct: p.correct + (correct ? 1 : 0), total: p.total + 1 }));
    if (correct) {
      toast.success('Correct – that array is perfectly sorted.');
    } else {
      toast.error('Not quite – look for numbers out of order.');
    }

    const nowTotal = score.total + 1;
    if (nowTotal >= 8) {
      setPlaying(false);
      onComplete(score.correct + (correct ? 1 : 0), nowTotal);
    } else {
      nextRound();
    }
  };

  if (!playing) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Arrays Challenge Complete</CardTitle>
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
          <span>Pick the correctly sorted array (ascending)</span>
          <span className="text-sm font-normal">Score: {score.correct}/{score.total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {options.map((arr, i) => (
            <Button key={i} variant={i === answerIndex ? 'secondary' : 'outline'} className="justify-start h-auto py-3" onClick={() => choose(i)}>
              <code className="text-sm">[{arr.join(', ')}]</code>
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Level: {level} • Topic: Arrays & Lists</div>
      </CardContent>
    </Card>
  );
};