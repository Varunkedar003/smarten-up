import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface DataStructureBuilderProps {
  level: 'easy' | 'intermediate' | 'hard';
  onComplete: (correct: number, total: number) => void;
}

export const DataStructureBuilder: React.FC<DataStructureBuilderProps> = ({ level, onComplete }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState(0);
  const [totalOperations, setTotalOperations] = useState(0);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#0f172a',
      scene: {
        create: function() {
          const scene = this;
          
          // Stack implementation
          const stack: number[] = [];
          const maxSize = level === 'easy' ? 5 : level === 'intermediate' ? 8 : 12;
          const operations = level === 'easy' ? 8 : level === 'intermediate' ? 12 : 16;
          
          let correctOps = 0;
          let totalOps = 0;
          let currentTarget: string | null = null;
          
          // Visual stack representation
          const stackVisual: Phaser.GameObjects.Rectangle[] = [];
          const stackTexts: Phaser.GameObjects.Text[] = [];
          
          // Title
          scene.add.text(400, 30, 'Stack Data Structure Game', {
            fontSize: '28px',
            color: '#ffffff'
          }).setOrigin(0.5);

          // Instructions
          const instructionText = scene.add.text(400, 80, '', {
            fontSize: '16px',
            color: '#94a3b8'
          }).setOrigin(0.5);

          // Stack base
          scene.add.rectangle(400, 500, 120, 20, 0x475569);
          scene.add.text(400, 530, 'STACK', {
            fontSize: '14px',
            color: '#94a3b8'
          }).setOrigin(0.5);

          // Buttons
          const pushBtn = scene.add.rectangle(200, 150, 120, 40, 0x3b82f6)
            .setInteractive()
            .on('pointerdown', () => pushOperation());
          
          scene.add.text(200, 150, 'PUSH', {
            fontSize: '16px',
            color: '#ffffff'
          }).setOrigin(0.5);

          const popBtn = scene.add.rectangle(350, 150, 120, 40, 0xef4444)
            .setInteractive()
            .on('pointerdown', () => popOperation());
          
          scene.add.text(350, 150, 'POP', {
            fontSize: '16px',
            color: '#ffffff'
          }).setOrigin(0.5);

          const peekBtn = scene.add.rectangle(500, 150, 120, 40, 0x10b981)
            .setInteractive()
            .on('pointerdown', () => peekOperation());
          
          scene.add.text(500, 150, 'PEEK', {
            fontSize: '16px',
            color: '#ffffff'
          }).setOrigin(0.5);

          // Score display
          const scoreText = scene.add.text(50, 50, 'Score: 0/0', {
            fontSize: '18px',
            color: '#ffffff'
          });

          function generateNextChallenge() {
            totalOps++;
            setTotalOperations(totalOps);
            
            if (totalOps > operations) {
              // Game completed
              setScore(correctOps);
              setGameState('completed');
              return;
            }

            const challenges = [
              'push',
              stack.length > 0 ? 'pop' : 'push',
              stack.length > 0 ? 'peek' : 'push'
            ];

            currentTarget = challenges[Math.floor(Math.random() * challenges.length)];
            
            if (currentTarget === 'push') {
              const value = Math.floor(Math.random() * 100) + 1;
              instructionText.setText(`Push ${value} onto the stack`);
              (scene as any).pushValue = value;
            } else if (currentTarget === 'pop') {
              instructionText.setText('Pop the top element from the stack');
            } else if (currentTarget === 'peek') {
              instructionText.setText('Peek at the top element (don\'t remove it)');
            }
          }

          function updateStackVisual() {
            // Clear existing visual
            stackVisual.forEach(rect => rect.destroy());
            stackTexts.forEach(text => text.destroy());
            stackVisual.length = 0;
            stackTexts.length = 0;

            // Draw stack elements
            stack.forEach((value, index) => {
              const y = 480 - (index * 40);
              const rect = scene.add.rectangle(400, y, 100, 35, 0x1e40af);
              const text = scene.add.text(400, y, value.toString(), {
                fontSize: '16px',
                color: '#ffffff'
              }).setOrigin(0.5);

              stackVisual.push(rect);
              stackTexts.push(text);
            });
          }

          function pushOperation() {
            if (currentTarget === 'push') {
              if (stack.length < maxSize) {
                stack.push((scene as any).pushValue || Math.floor(Math.random() * 100) + 1);
                updateStackVisual();
                correctOps++;
                toast.success('Correct push operation!');
              } else {
                toast.error('Stack overflow!');
              }
              scoreText.setText(`Score: ${correctOps}/${totalOps}`);
              generateNextChallenge();
            } else {
              toast.error(`Wrong operation! Expected: ${currentTarget}`);
            }
          }

          function popOperation() {
            if (currentTarget === 'pop') {
              if (stack.length > 0) {
                const popped = stack.pop();
                updateStackVisual();
                correctOps++;
                toast.success(`Popped: ${popped}`);
              } else {
                toast.error('Stack underflow!');
              }
              scoreText.setText(`Score: ${correctOps}/${totalOps}`);
              generateNextChallenge();
            } else {
              toast.error(`Wrong operation! Expected: ${currentTarget}`);
            }
          }

          function peekOperation() {
            if (currentTarget === 'peek') {
              if (stack.length > 0) {
                const top = stack[stack.length - 1];
                correctOps++;
                toast.success(`Top element: ${top}`);
              } else {
                toast.error('Stack is empty!');
              }
              scoreText.setText(`Score: ${correctOps}/${totalOps}`);
              generateNextChallenge();
            } else {
              toast.error(`Wrong operation! Expected: ${currentTarget}`);
            }
          }

          // Start first challenge
          generateNextChallenge();
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
    onComplete(score, totalOperations);
  };

  if (gameState === 'completed') {
    return (
      <Card className="p-8 max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Stack Mastery Complete!</h2>
        <p className="mb-4">You completed {score} out of {totalOperations} operations correctly!</p>
        <p className="text-sm text-muted-foreground mb-6">
          Score: {Math.round((score / totalOperations) * 100)}%
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
          Data Structure: Stack Operations
        </p>
      </div>
    </div>
  );
};