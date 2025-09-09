import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { speechService } from '@/services/speechService';

interface TreeTraversalGameProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

type Node = { v: number; left?: Node; right?: Node };

function generateTree(level: 'easy' | 'intermediate' | 'hard'): Node {
  const size = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 9;
  const values = Array.from({ length: size }, (_, i) => i + 1);
  // simple BST insert for deterministic structure
  const insert = (root: Node | undefined, val: number): Node => {
    if (!root) return { v: val };
    if (val < root.v) root.left = insert(root.left, val);
    else root.right = insert(root.right, val);
    return root;
  };
  let root: Node | undefined;
  values.sort(() => Math.random() - 0.5).forEach(v => { root = insert(root, v); });
  return root!;
}

function traverse(root: Node | undefined, type: 'pre' | 'in' | 'post'): number[] {
  const res: number[] = [];
  const dfs = (n?: Node) => {
    if (!n) return;
    if (type === 'pre') res.push(n.v);
    dfs(n.left);
    if (type === 'in') res.push(n.v);
    dfs(n.right);
    if (type === 'post') res.push(n.v);
  };
  dfs(root);
  return res;
}

export const TreeTraversalGame: React.FC<TreeTraversalGameProps> = ({ level, subtopic, onComplete }) => {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [playing, setPlaying] = useState(true);
  const [tree, setTree] = useState<Node>(() => generateTree(level));
  const [type, setType] = useState<'pre' | 'in' | 'post'>(() => (level === 'easy' ? 'in' : Math.random() < 0.5 ? 'pre' : 'post'));

  useEffect(() => {
    speechService.speakExplanation('Computer Science', subtopic || 'Trees', level);
    setTree(generateTree(level));
    setType(level === 'easy' ? 'in' : Math.random() < 0.5 ? 'pre' : 'post');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, subtopic]);

  const answer = useMemo(() => traverse(tree, type), [tree, type]);

  const makeOption = () => {
    const correct = answer;
    const wrong1 = [...correct];
    wrong1.sort(() => Math.random() - 0.5);
    const wrong2 = [...correct].reverse();
    const all = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);
    return all;
  };

  const [options, setOptions] = useState<number[][]>(() => makeOption());
  useEffect(() => setOptions(makeOption()), [answer.join(',')]);

  const pick = (arr: number[]) => {
    const correct = JSON.stringify(arr) === JSON.stringify(answer);
    setScore(p => ({ correct: p.correct + (correct ? 1 : 0), total: p.total + 1 }));
    if (correct) toast.success('Correct traversal.'); else toast.error('Incorrect order.');

    const nowTotal = score.total + 1;
    if (nowTotal >= 6) {
      setPlaying(false);
      onComplete(score.correct + (correct ? 1 : 0), nowTotal);
    } else {
      setTree(generateTree(level));
      setType(level === 'easy' ? 'in' : Math.random() < 0.5 ? 'pre' : 'post');
    }
  };

  if (!playing) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Trees Challenge Complete</CardTitle>
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
          <span>Select the correct {type === 'in' ? 'in‑order' : type === 'pre' ? 'pre‑order' : 'post‑order'} traversal</span>
          <span className="text-sm font-normal">Score: {score.correct}/{score.total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">Tree shown as values only (BST structure hidden for challenge)</div>
        <div className="grid gap-2">
          {options.map((opt, i) => (
            <Button key={i} variant="outline" className="justify-start h-auto py-3" onClick={() => pick(opt)}>
              <code className="text-sm">[{opt.join(', ')}]</code>
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">Level: {level} • Topic: Trees — Traversal Game</div>
      </CardContent>
    </Card>
  );
};