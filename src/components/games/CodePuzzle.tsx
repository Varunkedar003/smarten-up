import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Code, CheckCircle, XCircle } from 'lucide-react';

interface CodePuzzleProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

interface Puzzle {
  question: string;
  code: string;
  options: string[];
  answer: string;
}

export const CodePuzzle: React.FC<CodePuzzleProps> = ({
  level,
  subtopic,
  onComplete,
}) => {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  useEffect(() => {
    generatePuzzle();
  }, [level]);

  const generatePuzzle = () => {
    const puzzles: Puzzle[] = level === 'easy' 
      ? [
          {
            question: 'What does this code output?',
            code: 'let x = 5;\nlet y = x + 3;\nconsole.log(y);',
            options: ['5', '8', '53', 'undefined'],
            answer: '8',
          },
          {
            question: 'What is the value of result?',
            code: 'let a = 10;\nlet b = 20;\nlet result = a * 2;',
            options: ['10', '20', '30', '40'],
            answer: '20',
          },
          {
            question: 'What does this loop print?',
            code: 'for(let i = 0; i < 3; i++) {\n  console.log(i);\n}',
            options: ['0 1 2', '1 2 3', '0 1 2 3', '0 0 0'],
            answer: '0 1 2',
          },
        ]
      : level === 'intermediate'
      ? [
          {
            question: 'What is the output?',
            code: 'let arr = [1, 2, 3];\narr.push(4);\nconsole.log(arr.length);',
            options: ['3', '4', '5', 'undefined'],
            answer: '4',
          },
          {
            question: 'What does this function return?',
            code: 'function mystery(n) {\n  return n * n + n;\n}\nmystery(5);',
            options: ['25', '30', '10', '5'],
            answer: '30',
          },
          {
            question: 'What is logged?',
            code: 'let obj = { x: 1, y: 2 };\nlet { x } = obj;\nconsole.log(x);',
            options: ['undefined', '1', '2', 'obj'],
            answer: '1',
          },
        ]
      : [
          {
            question: 'What is the result?',
            code: 'const nums = [1,2,3,4];\nconst result = nums.reduce((a,b) => a+b, 0);',
            options: ['0', '10', '24', 'undefined'],
            answer: '10',
          },
          {
            question: 'What does this return?',
            code: 'const fn = (x) => (y) => x + y;\nfn(5)(3);',
            options: ['5', '3', '8', 'function'],
            answer: '8',
          },
          {
            question: 'What is printed?',
            code: '[..."hello"].length',
            options: ['1', '5', 'undefined', 'error'],
            answer: '5',
          },
        ];

    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    setCurrentPuzzle(puzzle);
    setSelectedAnswer(null);
  };

  const checkAnswer = () => {
    if (!currentPuzzle || !selectedAnswer) return;

    const isCorrect = selectedAnswer === currentPuzzle.answer;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
    };
    setScore(newScore);

    if (isCorrect) {
      toast.success('Correct! Well done!');
    } else {
      toast.error(`Wrong! The answer was: ${currentPuzzle.answer}`);
    }

    if (newScore.total >= (level === 'easy' ? 5 : level === 'intermediate' ? 7 : 10)) {
      setGameState('completed');
      onComplete(newScore.correct, newScore.total);
    } else {
      setTimeout(() => {
        generatePuzzle();
      }, 1500);
    }
  };

  if (gameState === 'completed') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🧩</div>
          <h2 className="text-2xl font-bold mb-4">Code Puzzles Complete!</h2>
          <p className="text-lg mb-4">
            Score: {score.correct} / {score.total}
          </p>
          <p className="text-muted-foreground mb-6">
            Accuracy: {Math.round((score.correct / score.total) * 100)}%
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Puzzle Challenge
          </CardTitle>
          <Badge variant="secondary">
            Score: {score.correct}/{score.total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentPuzzle && (
          <>
            <div>
              <h3 className="text-sm font-semibold mb-2">{currentPuzzle.question}</h3>
              <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
                {currentPuzzle.code}
              </div>
            </div>

            <div className="space-y-2">
              {currentPuzzle.options.map((option) => (
                <Button
                  key={option}
                  onClick={() => setSelectedAnswer(option)}
                  variant={selectedAnswer === option ? 'default' : 'outline'}
                  className="w-full justify-start font-mono"
                >
                  {option}
                </Button>
              ))}
            </div>

            <Button 
              onClick={checkAnswer} 
              className="w-full"
              disabled={!selectedAnswer}
            >
              Submit Answer
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
