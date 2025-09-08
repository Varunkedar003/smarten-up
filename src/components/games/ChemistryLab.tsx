import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, TestTube } from 'lucide-react';
import { speechService } from '@/services/speechService';
import { toast } from 'sonner';

interface ChemistryLabProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

export const ChemistryLab: React.FC<ChemistryLabProps> = ({ level, subtopic, onComplete }) => {
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentReaction, setCurrentReaction] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  const periodicElements = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'];

  useEffect(() => {
    speechService.speakExplanation('Chemistry', subtopic, level);
    generateReaction();
  }, [level, subtopic]);

  const generateReaction = () => {
    let reaction;
    
    if (subtopic.includes('Chemical Reactions') || subtopic.includes('Balancing')) {
      switch (level) {
        case 'easy':
          const simpleReactions = [
            {
              question: 'Balance: H₂ + O₂ → H₂O',
              unbalanced: 'H₂ + O₂ → H₂O',
              answer: '2H₂ + O₂ → 2H₂O',
              explanation: 'We need 2 H₂ molecules to provide 4 H atoms, and they produce 2 H₂O molecules'
            },
            {
              question: 'Balance: Na + Cl₂ → NaCl',
              unbalanced: 'Na + Cl₂ → NaCl',
              answer: '2Na + Cl₂ → 2NaCl',
              explanation: 'One Cl₂ molecule provides 2 Cl atoms, so we need 2 Na atoms to form 2 NaCl'
            },
            {
              question: 'Balance: Mg + O₂ → MgO',
              unbalanced: 'Mg + O₂ → MgO',
              answer: '2Mg + O₂ → 2MgO',
              explanation: 'One O₂ molecule has 2 oxygen atoms, so we need 2 Mg atoms'
            }
          ];
          reaction = simpleReactions[Math.floor(Math.random() * simpleReactions.length)];
          break;
        case 'intermediate':
          const mediumReactions = [
            {
              question: 'Balance: C₂H₆ + O₂ → CO₂ + H₂O',
              unbalanced: 'C₂H₆ + O₂ → CO₂ + H₂O',
              answer: '2C₂H₆ + 7O₂ → 4CO₂ + 6H₂O',
              explanation: 'This is a combustion reaction. Balance C first, then H, then O'
            },
            {
              question: 'Balance: Fe + HCl → FeCl₂ + H₂',
              unbalanced: 'Fe + HCl → FeCl₂ + H₂',
              answer: 'Fe + 2HCl → FeCl₂ + H₂',
              explanation: 'Iron displaces hydrogen from hydrochloric acid'
            }
          ];
          reaction = mediumReactions[Math.floor(Math.random() * mediumReactions.length)];
          break;
        case 'hard':
          const hardReactions = [
            {
              question: 'Balance: C₄H₁₀ + O₂ → CO₂ + H₂O',
              unbalanced: 'C₄H₁₀ + O₂ → CO₂ + H₂O',
              answer: '2C₄H₁₀ + 13O₂ → 8CO₂ + 10H₂O',
              explanation: 'Complex hydrocarbon combustion requires careful counting of atoms'
            }
          ];
          reaction = hardReactions[Math.floor(Math.random() * hardReactions.length)];
          break;
      }
    } else if (subtopic.includes('Atomic Structure')) {
      reaction = {
        type: 'atomic',
        question: 'How many electrons does Carbon (C) have?',
        answer: '6',
        explanation: 'Carbon has atomic number 6, so it has 6 protons and 6 electrons in neutral state'
      };
    } else if (subtopic.includes('Periodic Trends')) {
      reaction = {
        type: 'periodic',
        question: 'Which element has higher electronegativity: F or Cl?',
        answer: 'F',
        explanation: 'Fluorine has higher electronegativity because electronegativity decreases down a group'
      };
    }

    setCurrentReaction(reaction || {
      question: 'Balance: H₂ + O₂ → H₂O',
      answer: '2H₂ + O₂ → 2H₂O',
      explanation: 'We need equal numbers of each type of atom on both sides'
    });
  };

  const checkAnswer = () => {
    const normalizedUserAnswer = userAnswer.replace(/\s+/g, '').toLowerCase();
    const normalizedCorrectAnswer = currentReaction.answer.replace(/\s+/g, '').toLowerCase();
    
    const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    
    if (isCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      toast.success('Correct! ' + currentReaction.explanation);
      speechService.speak(`Excellent! ${currentReaction.explanation}`, { rate: 0.9 });
    } else {
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
      toast.error(`Incorrect. The answer is: ${currentReaction.answer}`);
      speechService.speak(`Not quite right. The correct answer is ${currentReaction.answer}. ${currentReaction.explanation}`, { rate: 0.9 });
    }

    if (score.total + 1 >= 7) {
      setGameState('completed');
      onComplete(score.correct + (isCorrect ? 1 : 0), score.total + 1);
    } else {
      setTimeout(() => {
        generateReaction();
        setUserAnswer('');
        setSelectedElements([]);
      }, 3000);
    }
  };

  const handleElementClick = (element: string) => {
    if (selectedElements.length < 10) { // Limit selection
      setSelectedElements(prev => [...prev, element]);
      setUserAnswer(prev => prev + element);
    }
  };

  const clearAnswer = () => {
    setUserAnswer('');
    setSelectedElements([]);
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Lab Session Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold text-primary">
            {score.correct}/{score.total}
          </div>
          <p className="text-muted-foreground">
            {score.correct / score.total >= 0.8 ? 'Outstanding chemistry skills!' : 
             score.correct / score.total >= 0.6 ? 'Good chemical knowledge!' : 'Keep practicing chemistry!'}
          </p>
          <Button onClick={() => window.history.back()} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Chemistry Lab
            </div>
            <span className="text-lg font-normal">Score: {score.correct}/{score.total}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentReaction && (
            <>
              <div className="text-center">
                <div className="p-4 bg-secondary rounded-lg mb-4">
                  <p className="font-medium">{currentReaction.question}</p>
                  {currentReaction.unbalanced && (
                    <div className="mt-2 font-mono text-lg">
                      {currentReaction.unbalanced}
                    </div>
                  )}
                </div>
              </div>

              {subtopic.includes('Balancing') || subtopic.includes('Reactions') ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Balanced Equation:</label>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-center font-mono"
                      placeholder="Enter balanced equation..."
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button type="button" onClick={clearAnswer} variant="outline" size="sm">
                      Clear
                    </Button>
                    <Button type="submit" disabled={!userAnswer.trim()}>
                      Check Answer
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  {subtopic.includes('Atomic') && (
                    <div className="grid grid-cols-6 gap-2 p-4 bg-secondary rounded-lg">
                      <div className="col-span-6 text-sm text-center mb-2">Periodic Table (first 18 elements)</div>
                      {periodicElements.map((element, index) => (
                        <button
                          key={element}
                          onClick={() => handleElementClick(element)}
                          className="p-2 bg-white border rounded text-sm font-mono hover:bg-blue-50 transition-colors"
                        >
                          {element}
                          <div className="text-xs text-gray-500">{index + 1}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-center"
                        placeholder="Enter your answer..."
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-center">
                      <Button type="button" onClick={clearAnswer} variant="outline" size="sm">
                        Clear
                      </Button>
                      <Button type="submit" disabled={!userAnswer.trim()}>
                        Submit Answer
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Level: {level} | Subject: Chemistry - {subtopic}</p>
      </div>
    </div>
  );
};