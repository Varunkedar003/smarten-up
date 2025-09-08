import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Microscope } from 'lucide-react';
import { speechService } from '@/services/speechService';
import { toast } from 'sonner';

interface BiologyExplorerProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

export const BiologyExplorer: React.FC<BiologyExplorerProps> = ({ level, subtopic, onComplete }) => {
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  useEffect(() => {
    speechService.speakExplanation('Biology', subtopic, level);
    generateQuestion();
  }, [level, subtopic]);

  const generateQuestion = () => {
    let question;

    if (subtopic.includes('Cell Biology')) {
      const cellQuestions = {
        easy: [
          {
            question: 'Which organelle is known as the powerhouse of the cell?',
            options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Lysosome'],
            answer: 'Mitochondria',
            explanation: 'Mitochondria produce ATP, the energy currency of the cell through cellular respiration.'
          },
          {
            question: 'What controls what enters and exits the cell?',
            options: ['Cell wall', 'Nucleus', 'Cell membrane', 'Cytoplasm'],
            answer: 'Cell membrane',
            explanation: 'The cell membrane is selectively permeable and regulates molecular transport.'
          }
        ],
        intermediate: [
          {
            question: 'In which phase of mitosis do chromosomes align at the cell center?',
            options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
            answer: 'Metaphase',
            explanation: 'During metaphase, chromosomes align at the metaphase plate (cell center).'
          }
        ],
        hard: [
          {
            question: 'Which enzyme complex synthesizes ATP in cellular respiration?',
            options: ['Complex I', 'Complex II', 'Complex III', 'ATP Synthase'],
            answer: 'ATP Synthase',
            explanation: 'ATP Synthase uses the proton gradient to synthesize ATP from ADP and phosphate.'
          }
        ]
      };
      
      const levelQuestions = cellQuestions[level] || cellQuestions.easy;
      question = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
    } 
    else if (subtopic.includes('Genetics')) {
      const geneticsQuestions = {
        easy: [
          {
            question: 'What does DNA stand for?',
            options: ['Deoxyribonucleic Acid', 'Dehydrated Nucleic Acid', 'Double Nuclear Acid', 'Dynamic Nuclear Acid'],
            answer: 'Deoxyribonucleic Acid',
            explanation: 'DNA is Deoxyribonucleic Acid, the molecule that carries genetic information.'
          },
          {
            question: 'How many chromosomes do humans typically have?',
            options: ['44', '46', '48', '50'],
            answer: '46',
            explanation: 'Humans have 46 chromosomes (23 pairs) in their somatic cells.'
          }
        ],
        intermediate: [
          {
            question: 'If brown eyes (B) are dominant over blue eyes (b), what is the phenotype of Bb?',
            options: ['Brown eyes', 'Blue eyes', 'Green eyes', 'Cannot determine'],
            answer: 'Brown eyes',
            explanation: 'Bb is heterozygous with brown eyes because B is dominant over b.'
          }
        ],
        hard: [
          {
            question: 'What is the probability of two heterozygous parents (Aa × Aa) having a homozygous recessive child?',
            options: ['0%', '25%', '50%', '75%'],
            answer: '25%',
            explanation: 'In a Punnett square for Aa × Aa, there is a 25% chance of getting aa (homozygous recessive).'
          }
        ]
      };
      
      const levelQuestions = geneticsQuestions[level] || geneticsQuestions.easy;
      question = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
    }
    else if (subtopic.includes('Human Biology')) {
      const humanBioQuestions = {
        easy: [
          {
            question: 'Which organ pumps blood throughout the body?',
            options: ['Liver', 'Heart', 'Lungs', 'Kidneys'],
            answer: 'Heart',
            explanation: 'The heart is a muscular organ that pumps blood through the circulatory system.'
          },
          {
            question: 'Where does gas exchange occur in the respiratory system?',
            options: ['Trachea', 'Bronchi', 'Alveoli', 'Larynx'],
            answer: 'Alveoli',
            explanation: 'Alveoli are tiny air sacs where oxygen and carbon dioxide exchange occurs.'
          }
        ],
        intermediate: [
          {
            question: 'Which type of blood cell carries oxygen?',
            options: ['White blood cells', 'Red blood cells', 'Platelets', 'Plasma cells'],
            answer: 'Red blood cells',
            explanation: 'Red blood cells contain hemoglobin which binds and transports oxygen.'
          }
        ],
        hard: [
          {
            question: 'What is the functional unit of the kidney?',
            options: ['Glomerulus', 'Nephron', 'Ureter', 'Renal pelvis'],
            answer: 'Nephron',
            explanation: 'The nephron is the basic functional unit of the kidney, filtering blood and producing urine.'
          }
        ]
      };
      
      const levelQuestions = humanBioQuestions[level] || humanBioQuestions.easy;
      question = levelQuestions[Math.floor(Math.random() * levelQuestions.length)];
    }

    setCurrentQuestion(question || {
      question: 'What is the basic unit of life?',
      options: ['Atom', 'Molecule', 'Cell', 'Organism'],
      answer: 'Cell',
      explanation: 'The cell is the smallest structural and functional unit of all living organisms.'
    });
  };

  const checkAnswer = () => {
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    if (isCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      toast.success('Correct! ' + currentQuestion.explanation);
      speechService.speak(`Excellent! ${currentQuestion.explanation}`, { rate: 0.9 });
    } else {
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
      toast.error(`Incorrect. The answer is: ${currentQuestion.answer}`);
      speechService.speak(`The correct answer is ${currentQuestion.answer}. ${currentQuestion.explanation}`, { rate: 0.9 });
    }

    if (score.total + 1 >= 8) {
      setGameState('completed');
      onComplete(score.correct + (isCorrect ? 1 : 0), score.total + 1);
    } else {
      setTimeout(() => {
        generateQuestion();
        setSelectedAnswer('');
      }, 3000);
    }
  };

  if (gameState === 'completed') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Biology Exploration Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold text-primary">
            {score.correct}/{score.total}
          </div>
          <p className="text-muted-foreground">
            {score.correct / score.total >= 0.8 ? 'Excellent biological knowledge!' : 
             score.correct / score.total >= 0.6 ? 'Good understanding of biology!' : 'Keep exploring biology!'}
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
              <Microscope className="w-5 h-5" />
              Biology Explorer
            </div>
            <span className="text-lg font-normal">Score: {score.correct}/{score.total}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentQuestion && (
            <>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium text-center">{currentQuestion.question}</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    className={`p-3 text-left border rounded-lg transition-all ${
                      selectedAnswer === option 
                        ? 'border-primary bg-primary/10' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedAnswer === option ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}>
                        {selectedAnswer === option && (
                          <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              <Button 
                onClick={checkAnswer} 
                disabled={!selectedAnswer}
                className="w-full"
              >
                Submit Answer
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Level: {level} | Subject: Biology - {subtopic}</p>
      </div>
    </div>
  );
};