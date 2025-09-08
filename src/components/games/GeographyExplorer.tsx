import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Globe, MapPin } from 'lucide-react';
import { speechService } from '@/services/speechService';
import { toast } from 'sonner';

interface GeographyExplorerProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

export const GeographyExplorer: React.FC<GeographyExplorerProps> = ({ level, subtopic, onComplete }) => {
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');

  useEffect(() => {
    speechService.speakExplanation('Geography', subtopic, level);
    generateChallenge();
  }, [level, subtopic]);

  const generateChallenge = () => {
    let challenge;

    if (subtopic.includes('Physical Geography')) {
      const physicalQuestions = {
        easy: [
          {
            type: 'multiple-choice',
            question: 'What is the longest river in the world?',
            options: ['Amazon River', 'Nile River', 'Mississippi River', 'Yangtze River'],
            answer: 'Nile River',
            explanation: 'The Nile River in Africa is approximately 6,650 km long, making it the longest river.'
          },
          {
            type: 'multiple-choice',
            question: 'Which continent has the most countries?',
            options: ['Asia', 'Europe', 'Africa', 'South America'],
            answer: 'Africa',
            explanation: 'Africa has 54 recognized sovereign countries, more than any other continent.'
          }
        ],
        intermediate: [
          {
            type: 'fill-blank',
            question: 'The highest mountain peak in the world is Mount ______.',
            answer: 'Everest',
            explanation: 'Mount Everest, at 8,848.86 meters, is the highest mountain above sea level.'
          },
          {
            type: 'multiple-choice',
            question: 'What type of climate is characterized by hot, dry summers and mild, wet winters?',
            options: ['Tropical', 'Mediterranean', 'Continental', 'Arctic'],
            answer: 'Mediterranean',
            explanation: 'Mediterranean climate features dry summers and wet winters, found around the Mediterranean Sea.'
          }
        ],
        hard: [
          {
            type: 'fill-blank',
            question: 'The Ring of Fire is a region around the ______ Ocean known for volcanic activity.',
            answer: 'Pacific',
            explanation: 'The Ring of Fire is a horseshoe-shaped region around the Pacific Ocean with high seismic activity.'
          }
        ]
      };
      
      const levelQuestions = physicalQuestions[level] || physicalQuestions.easy;
      challenge = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
    }
    else if (subtopic.includes('Map Skills')) {
      const mapQuestions = {
        easy: [
          {
            type: 'multiple-choice',
            question: 'What are the four cardinal directions?',
            options: ['North, South, East, West', 'Up, Down, Left, Right', 'Forward, Back, Left, Right', 'Top, Bottom, Side, Corner'],
            answer: 'North, South, East, West',
            explanation: 'The four cardinal directions are North, South, East, and West.'
          },
          {
            type: 'multiple-choice',
            question: 'What does a map scale of 1:100,000 mean?',
            options: ['1 cm = 1 km', '1 cm = 10 km', '1 cm = 100 km', '1 cm = 1000 km'],
            answer: '1 cm = 1 km',
            explanation: 'A scale of 1:100,000 means 1 cm on the map represents 1 km (100,000 cm) in reality.'
          }
        ],
        intermediate: [
          {
            type: 'fill-blank',
            question: 'Lines of ______ run east-west and measure distance north or south of the equator.',
            answer: 'latitude',
            explanation: 'Lines of latitude (parallels) run horizontally and measure degrees north or south of the equator.'
          }
        ],
        hard: [
          {
            type: 'fill-blank',
            question: 'The ______ meridian at 0° longitude passes through Greenwich, England.',
            answer: 'Prime',
            explanation: 'The Prime Meridian at 0° longitude is the reference line for measuring longitude east and west.'
          }
        ]
      };
      
      const levelQuestions = mapQuestions[level] || mapQuestions.easy;
      challenge = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
    }
    else if (subtopic.includes('Human Geography')) {
      const humanQuestions = {
        easy: [
          {
            type: 'multiple-choice',
            question: 'What is the most populous country in the world?',
            options: ['India', 'China', 'United States', 'Indonesia'],
            answer: 'China',
            explanation: 'China has the largest population with over 1.4 billion people.'
          }
        ],
        intermediate: [
          {
            type: 'multiple-choice',
            question: 'What is urbanization?',
            options: ['Building farms', 'Moving to cities', 'Protecting forests', 'Mining resources'],
            answer: 'Moving to cities',
            explanation: 'Urbanization is the process of population moving from rural areas to urban centers.'
          }
        ],
        hard: [
          {
            type: 'fill-blank',
            question: 'The process of people moving from one country to another is called ______.',
            answer: 'migration',
            explanation: 'Migration refers to the movement of people from one place to another, especially across borders.'
          }
        ]
      };
      
      const levelQuestions = humanQuestions[level] || humanQuestions.easy;
      challenge = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
    }

    setCurrentChallenge(challenge || {
      type: 'multiple-choice',
      question: 'Which is the largest ocean?',
      options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'],
      answer: 'Pacific',
      explanation: 'The Pacific Ocean is the largest ocean, covering about one-third of Earth\'s surface.'
    });
  };

  const checkAnswer = () => {
    const answer = currentChallenge.type === 'multiple-choice' ? selectedOption : userAnswer.trim();
    const isCorrect = answer.toLowerCase() === currentChallenge.answer.toLowerCase();
    
    if (isCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      toast.success('Correct! ' + currentChallenge.explanation);
      speechService.speak(`Great job! ${currentChallenge.explanation}`, { rate: 0.9 });
    } else {
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
      toast.error(`Incorrect. The answer is: ${currentChallenge.answer}`);
      speechService.speak(`The correct answer is ${currentChallenge.answer}. ${currentChallenge.explanation}`, { rate: 0.9 });
    }

    if (score.total + 1 >= 7) {
      setGameState('completed');
      onComplete(score.correct + (isCorrect ? 1 : 0), score.total + 1);
    } else {
      setTimeout(() => {
        generateChallenge();
        setUserAnswer('');
        setSelectedOption('');
      }, 3000);
    }
  };

  if (gameState === 'completed') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Geography Exploration Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold text-primary">
            {score.correct}/{score.total}
          </div>
          <p className="text-muted-foreground">
            {score.correct / score.total >= 0.8 ? 'Excellent geographical knowledge!' : 
             score.correct / score.total >= 0.6 ? 'Good understanding of geography!' : 'Keep exploring our world!'}
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
              <Globe className="w-5 h-5" />
              Geography Explorer
            </div>
            <span className="text-lg font-normal">Score: {score.correct}/{score.total}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentChallenge && (
            <>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium text-center">{currentChallenge.question}</p>
              </div>

              {currentChallenge.type === 'multiple-choice' ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentChallenge.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(option)}
                      className={`p-3 text-left border rounded-lg transition-all ${
                        selectedOption === option 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4" />
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-center"
                    placeholder="Type your answer..."
                    autoFocus
                  />
                </div>
              )}

              <Button 
                onClick={checkAnswer} 
                disabled={currentChallenge.type === 'multiple-choice' ? !selectedOption : !userAnswer.trim()}
                className="w-full"
              >
                Submit Answer
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Level: {level} | Subject: Geography - {subtopic}</p>
      </div>
    </div>
  );
};