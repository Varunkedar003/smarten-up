import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Play, Pause } from 'lucide-react';
import { speechService } from '@/services/speechService';
import { toast } from 'sonner';

interface PhysicsSimulatorProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

export const PhysicsSimulator: React.FC<PhysicsSimulatorProps> = ({ level, subtopic, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [userInput, setUserInput] = useState({ force: 10, mass: 5 });
  const animationRef = useRef<number>();

  useEffect(() => {
    speechService.speakExplanation('Physics', subtopic, level);
    generateChallenge();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [level, subtopic]);

  const generateChallenge = () => {
    let challenge;
    
    if (subtopic.includes('Forces')) {
      switch (level) {
        case 'easy':
          challenge = {
            type: 'force',
            question: 'A 5kg box needs to accelerate at 2 m/s². What force is needed?',
            targetForce: 10, // F = ma = 5 * 2
            targetAcceleration: 2,
            mass: 5,
            tolerance: 1
          };
          break;
        case 'intermediate':
          const mass = Math.floor(Math.random() * 10) + 3;
          const acceleration = Math.floor(Math.random() * 5) + 1;
          challenge = {
            type: 'force',
            question: `A ${mass}kg object needs to accelerate at ${acceleration} m/s². Calculate the required force.`,
            targetForce: mass * acceleration,
            targetAcceleration: acceleration,
            mass: mass,
            tolerance: 2
          };
          break;
        case 'hard':
          // Include friction
          const m = Math.floor(Math.random() * 8) + 4;
          const a = Math.floor(Math.random() * 4) + 2;
          const friction = Math.floor(Math.random() * 15) + 5;
          challenge = {
            type: 'force',
            question: `A ${m}kg object with ${friction}N of friction needs to accelerate at ${a} m/s². What applied force is needed?`,
            targetForce: m * a + friction,
            targetAcceleration: a,
            mass: m,
            friction: friction,
            tolerance: 3
          };
          break;
      }
    } else if (subtopic.includes('Energy')) {
      challenge = {
        type: 'energy',
        question: 'Calculate the kinetic energy of a 10kg object moving at 5 m/s',
        targetEnergy: 0.5 * 10 * 5 * 5, // KE = 1/2 * m * v²
        mass: 10,
        velocity: 5,
        tolerance: 5
      };
    }

    setCurrentChallenge(challenge || {
      type: 'force',
      question: 'Calculate the force needed to accelerate a 5kg object at 2 m/s²',
      targetForce: 10,
      mass: 5,
      tolerance: 1
    });
  };

  const runSimulation = () => {
    if (!canvasRef.current || !currentChallenge) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsSimulating(true);
    
    let time = 0;
    const boxSize = 40;
    let position = 50;
    const appliedForce = userInput.force;
    const mass = currentChallenge.mass;
    const friction = currentChallenge.friction || 0;
    
    // Calculate acceleration based on user's input
    const netForce = appliedForce - friction;
    const acceleration = netForce / mass;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw ground
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
      
      // Update position
      position += acceleration * time * 2; // Scaled for visibility
      time += 0.1;
      
      // Draw box
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(position, canvas.height - 20 - boxSize, boxSize, boxSize);
      
      // Draw force arrow
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(position + boxSize + 5, canvas.height - 20 - boxSize/2);
      ctx.lineTo(position + boxSize + 5 + appliedForce * 2, canvas.height - 20 - boxSize/2);
      ctx.stroke();
      
      // Draw force label
      ctx.fillStyle = '#EF4444';
      ctx.font = '14px Arial';
      ctx.fillText(`${appliedForce}N`, position + boxSize + 10, canvas.height - 20 - boxSize/2 - 10);
      
      // Draw velocity
      ctx.fillStyle = '#10B981';
      ctx.fillText(`v = ${(acceleration * time).toFixed(1)} m/s`, 10, 30);
      ctx.fillText(`a = ${acceleration.toFixed(1)} m/s²`, 10, 50);
      
      if (position < canvas.width - boxSize - 10 && time < 5) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSimulating(false);
        checkResult();
      }
    };
    
    animate();
  };

  const checkResult = () => {
    const appliedForce = userInput.force;
    const targetForce = currentChallenge.targetForce;
    const tolerance = currentChallenge.tolerance;
    
    const isCorrect = Math.abs(appliedForce - targetForce) <= tolerance;
    
    if (isCorrect) {
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      toast.success(`Correct! The ideal force was ${targetForce}N`);
      speechService.speak(`Great job! You applied the right amount of force. The physics principle here is Newton's second law.`, { rate: 0.9 });
    } else {
      setScore(prev => ({ correct: prev.correct, total: prev.total + 1 }));
      toast.error(`Close! The ideal force was ${targetForce}N (you used ${appliedForce}N)`);
      speechService.speak(`Not quite right. The correct force was ${targetForce} Newtons. Remember, Force equals mass times acceleration.`, { rate: 0.9 });
    }

    if (score.total + 1 >= 6) {
      setGameState('completed');
      onComplete(score.correct + (isCorrect ? 1 : 0), score.total + 1);
    } else {
      setTimeout(() => {
        generateChallenge();
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }, 2000);
    }
  };

  if (gameState === 'completed') {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Simulation Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-3xl font-bold text-primary">
            {score.correct}/{score.total}
          </div>
          <p className="text-muted-foreground">
            {score.correct / score.total >= 0.8 ? 'You understand physics well!' : 
             score.correct / score.total >= 0.6 ? 'Good grasp of the concepts!' : 'Keep studying physics!'}
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
            Physics Simulator
            <span className="text-lg font-normal">Score: {score.correct}/{score.total}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentChallenge && (
            <>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="font-medium">{currentChallenge.question}</p>
              </div>

              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="border rounded-lg mx-auto block"
                style={{ background: '#F0F8FF' }}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Applied Force (N)</label>
                  <input
                    type="number"
                    value={userInput.force}
                    onChange={(e) => setUserInput(prev => ({ ...prev, force: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mass: {currentChallenge.mass} kg</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-center">
                    {currentChallenge.mass} kg
                  </div>
                </div>
              </div>

              <Button 
                onClick={runSimulation} 
                disabled={isSimulating}
                className="w-full"
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Physics Simulation
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Level: {level} | Subject: Physics - {subtopic}</p>
      </div>
    </div>
  );
};