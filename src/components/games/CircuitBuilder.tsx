import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface CircuitBuilderProps {
  level: 'easy' | 'intermediate' | 'hard';
  onComplete: (correct: number, total: number) => void;
}

export const CircuitBuilder: React.FC<CircuitBuilderProps> = ({ level, onComplete }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState(0);
  const [totalChallenges, setTotalChallenges] = useState(0);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#0c0a09',
      scene: {
        create: function() {
          const scene = this;
          
          const challenges = level === 'easy' ? 5 : level === 'intermediate' ? 8 : 12;
          let currentChallenge = 0;
          let correctAnswers = 0;
          let inputA = false;
          let inputB = false;
          let currentGate = 'AND';
          
          // Title
          scene.add.text(400, 30, 'Digital Logic Circuit Builder', {
            fontSize: '24px',
            color: '#ffffff'
          }).setOrigin(0.5);

          // Input switches
          const switchA = scene.add.rectangle(100, 200, 60, 30, inputA ? 0x10b981 : 0x7f1d1d)
            .setInteractive()
            .on('pointerdown', () => {
              inputA = !inputA;
              switchA.setFillStyle(inputA ? 0x10b981 : 0x7f1d1d);
              updateOutput();
            });

          const switchB = scene.add.rectangle(100, 280, 60, 30, inputB ? 0x10b981 : 0x7f1d1d)
            .setInteractive()
            .on('pointerdown', () => {
              inputB = !inputB;
              switchB.setFillStyle(inputB ? 0x10b981 : 0x7f1d1d);
              updateOutput();
            });

          scene.add.text(50, 200, 'A', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
          scene.add.text(50, 280, 'B', { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);

          // Logic gate
          const gateShape = scene.add.graphics();
          let gateText: Phaser.GameObjects.Text;
          
          function drawGate(gate: string) {
            gateShape.clear();
            gateShape.fillStyle(0x374151);
            gateShape.fillRect(300, 220, 120, 80);
            gateShape.lineStyle(2, 0x9ca3af);
            gateShape.strokeRect(300, 220, 120, 80);
            
            if (gateText) gateText.destroy();
            gateText = scene.add.text(360, 260, gate, {
              fontSize: '20px',
              color: '#ffffff'
            }).setOrigin(0.5);
          }

          // Output LED
          const outputLed = scene.add.circle(600, 240, 25, 0x7f1d1d);
          scene.add.text(650, 240, 'Output', { fontSize: '16px', color: '#ffffff' }).setOrigin(0, 0.5);

          // Wires
          const wireA = scene.add.line(0, 0, 130, 215, 330, 240, 0x94a3b8, 1).setOrigin(0);
          const wireB = scene.add.line(0, 0, 130, 265, 330, 280, 0x94a3b8, 1).setOrigin(0);
          const wireOut = scene.add.line(0, 0, 420, 260, 575, 240, 0x94a3b8, 1).setOrigin(0);

          // Challenge display
          const challengeText = scene.add.text(400, 100, '', {
            fontSize: '16px',
            color: '#fbbf24'
          }).setOrigin(0.5);

          const targetText = scene.add.text(400, 130, '', {
            fontSize: '14px',
            color: '#94a3b8'
          }).setOrigin(0.5);

          // Score
          const scoreText = scene.add.text(50, 50, 'Score: 0/0', {
            fontSize: '18px',
            color: '#ffffff'
          });

          // Check button
          const checkBtn = scene.add.rectangle(400, 400, 120, 40, 0x3b82f6)
            .setInteractive()
            .on('pointerdown', checkAnswer);
          
          scene.add.text(400, 400, 'CHECK', {
            fontSize: '16px',
            color: '#ffffff'
          }).setOrigin(0.5);

          let targetOutput: boolean;

          function generateChallenge() {
            currentChallenge++;
            setTotalChallenges(currentChallenge);
            
            if (currentChallenge > challenges) {
              setScore(correctAnswers);
              setGameState('completed');
              return;
            }

            const gates = level === 'easy' ? ['AND', 'OR'] : 
                         level === 'intermediate' ? ['AND', 'OR', 'NOT', 'NAND'] :
                         ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR'];
            
            currentGate = gates[Math.floor(Math.random() * gates.length)];
            drawGate(currentGate);

            // Generate random target scenario
            const scenarios = [
              [false, false],
              [false, true],
              [true, false],
              [true, true]
            ];
            
            const [targetA, targetB] = scenarios[Math.floor(Math.random() * scenarios.length)];
            targetOutput = calculateOutput(targetA, targetB, currentGate);
            
            challengeText.setText(`Challenge ${currentChallenge}: Set inputs to make output ${targetOutput ? 'ON' : 'OFF'}`);
            targetText.setText(`Gate: ${currentGate} | Target A: ${targetA ? 'ON' : 'OFF'}, B: ${targetB ? 'ON' : 'OFF'}`);

            // Reset inputs
            inputA = false;
            inputB = false;
            switchA.setFillStyle(0x7f1d1d);
            switchB.setFillStyle(0x7f1d1d);
            updateOutput();
          }

          function calculateOutput(a: boolean, b: boolean, gate: string): boolean {
            switch (gate) {
              case 'AND': return a && b;
              case 'OR': return a || b;
              case 'NOT': return !a; // Only uses input A
              case 'NAND': return !(a && b);
              case 'NOR': return !(a || b);
              case 'XOR': return a !== b;
              default: return false;
            }
          }

          function updateOutput() {
            const output = calculateOutput(inputA, inputB, currentGate);
            outputLed.setFillStyle(output ? 0x10b981 : 0x7f1d1d);
          }

          function checkAnswer() {
            const currentOutput = calculateOutput(inputA, inputB, currentGate);
            
            if (currentOutput === targetOutput) {
              correctAnswers++;
              toast.success('Correct! Well done!');
            } else {
              toast.error('Incorrect. Try adjusting the inputs.');
            }
            
            scoreText.setText(`Score: ${correctAnswers}/${currentChallenge}`);
            generateChallenge();
          }

          // Start first challenge
          generateChallenge();
        }
      }
    };

    phaserGameRef.current = new Phaser.Game(config);

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [level]);

  const handleComplete = () => {
    onComplete(score, totalChallenges);
  };

  if (gameState === 'completed') {
    return (
      <Card className="p-8 max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Circuit Master!</h2>
        <p className="mb-4">You solved {score} out of {totalChallenges} logic challenges!</p>
        <p className="text-sm text-muted-foreground mb-6">
          Score: {Math.round((score / totalChallenges) * 100)}%
        </p>
        <Button onClick={handleComplete} className="w-full">
          Continue
        </Button>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div ref={gameRef} className="mx-auto" />
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Level: {level.charAt(0).toUpperCase() + level.slice(1)} | 
          Topic: Digital Logic Gates
        </p>
      </div>
    </div>
  );
};