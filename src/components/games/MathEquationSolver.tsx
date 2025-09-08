import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { speechService } from '@/services/speechService';
import { toast } from 'sonner';

interface MathEquationSolverProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

export const MathEquationSolver: React.FC<MathEquationSolverProps> = ({ level, subtopic, onComplete }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentEquation, setCurrentEquation] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  
  const generateEquation = () => {
    let equation;
    
    if (subtopic.includes('Linear Equations') || subtopic.includes('Quadratic')) {
      switch (level) {
        case 'easy':
          // Simple linear equations like 2x + 3 = 7
          const a = Math.floor(Math.random() * 5) + 1;
          const b = Math.floor(Math.random() * 10) + 1;
          const x = Math.floor(Math.random() * 10) + 1;
          const result = a * x + b;
          equation = {
            question: `${a}x + ${b} = ${result}`,
            answer: x,
            explanation: `Subtract ${b} from both sides: ${a}x = ${result - b}, then divide by ${a}: x = ${x}`
          };
          break;
        case 'intermediate':
          // More complex equations
          const c = Math.floor(Math.random() * 3) + 2;
          const d = Math.floor(Math.random() * 8) + 1;
          const y = Math.floor(Math.random() * 6) + 1;
          const res = c * y - d;
          equation = {
            question: `${c}x - ${d} = ${res}`,
            answer: y,
            explanation: `Add ${d} to both sides: ${c}x = ${res + d}, then divide by ${c}: x = ${y}`
          };
          break;
        case 'hard':
          // Quadratic or systems of equations
          const p = Math.floor(Math.random() * 3) + 1;
          const q = Math.floor(Math.random() * 5) + 2;
          const r = Math.floor(Math.random() * 4) + 1;
          equation = {
            question: `x² + ${q}x + ${r} = 0`,
            answer: 'complex', // For demonstration
            explanation: `Use quadratic formula: x = (-${q} ± √(${q}² - 4(1)(${r}))) / 2`
          };
          break;
      }
    } else if (subtopic.includes('Polynomials')) {
      // Polynomial operations
      const coeff1 = Math.floor(Math.random() * 5) + 1;
      const coeff2 = Math.floor(Math.random() * 4) + 1;
      equation = {
        question: `Expand: (${coeff1}x + ${coeff2})²`,
        answer: `${coeff1 * coeff1}x² + ${2 * coeff1 * coeff2}x + ${coeff2 * coeff2}`,
        explanation: `Use (a + b)² = a² + 2ab + b²`
      };
    }
    
    return equation || {
      question: '2x + 4 = 10',
      answer: 3,
      explanation: 'Subtract 4 from both sides: 2x = 6, then divide by 2: x = 3'
    };
  };

  useEffect(() => {
    // Start background audio explanation
    speechService.speakExplanation('Mathematics', subtopic, level);
    
    // Generate first equation
    setCurrentEquation(generateEquation());
  }, [level, subtopic]);

  const checkAnswer = () => {
    const isCorrect = userAnswer.toString().trim() === currentEquation.answer.toString();
    
    if (isCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      toast.success('Correct! ' + currentEquation.explanation);
      speechService.speak('Excellent work! ' + currentEquation.explanation, { rate: 0.9 });
    } else {
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
      toast.error(`Incorrect. The answer is ${currentEquation.answer}. ${currentEquation.explanation}`);
      speechService.speak(`Not quite right. The correct answer is ${currentEquation.answer}. ${currentEquation.explanation}`, { rate: 0.9 });
    }

    // Check if game should end
    if (score.total + 1 >= 8) {
      setGameState('completed');
      onComplete(score.correct + (isCorrect ? 1 : 0), score.total + 1);
    } else {
      // Generate next equation after a delay
      setTimeout(() => {
        setCurrentEquation(generateEquation());
        setUserAnswer('');
      }, 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer.trim()) {
      checkAnswer();
    }
  };

  if (gameState === 'completed') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Game Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold text-primary">
            {score.correct}/{score.total}
          </div>
          <p className="text-muted-foreground">
            {score.correct / score.total >= 0.8 ? 'Excellent work!' : 
             score.correct / score.total >= 0.6 ? 'Good job!' : 'Keep practicing!'}
          </p>
          <Button onClick={() => window.history.back()} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" ref={gameRef}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Equation Solver
            <span className="text-lg font-normal">Score: {score.correct}/{score.total}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentEquation && (
            <>
              <div className="text-center">
                <div className="text-2xl font-mono p-6 bg-secondary rounded-lg mb-4">
                  {currentEquation.question}
                </div>
                <p className="text-muted-foreground">Solve for x</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-lg">x =</span>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-center text-lg w-32"
                    placeholder="?"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!userAnswer.trim()}>
                  Submit Answer
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Level: {level} | Subject: Mathematics - {subtopic}</p>
      </div>
    </div>
  );
};