import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface AlgorithmVisualizerProps {
  level: 'easy' | 'intermediate' | 'hard';
  onComplete: (correct: number, total: number) => void;
}

export const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({ level, onComplete }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#1e293b',
      scene: {
        preload: function() {
          // Create simple colored rectangles
          this.add.graphics()
            .fillStyle(0x3b82f6)
            .fillRect(0, 0, 60, 40)
            .generateTexture('block', 60, 40);
        },
        create: function() {
          const scene = this;
          
          // Algorithm visualization setup
          const arraySize = level === 'easy' ? 5 : level === 'intermediate' ? 8 : 12;
          const values = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
          const blocks: Phaser.GameObjects.Rectangle[] = [];
          
          // Create visual blocks
          values.forEach((value, index) => {
            const block = scene.add.rectangle(
              100 + index * 70, 
              300, 
              60, 
              value * 2, 
              0x3b82f6
            );
            block.setInteractive();
            
            const text = scene.add.text(
              100 + index * 70, 
              300, 
              value.toString(), 
              { fontSize: '14px', color: '#ffffff' }
            ).setOrigin(0.5);
            
            blocks.push(block);
            
            block.on('pointerdown', () => {
              handleBlockClick(index, block, text);
            });
          });

          // Instructions
          scene.add.text(400, 50, 'Sort the blocks from smallest to largest', {
            fontSize: '24px',
            color: '#ffffff'
          }).setOrigin(0.5);

          scene.add.text(400, 100, 'Click blocks in ascending order by their values', {
            fontSize: '16px',
            color: '#94a3b8'
          }).setOrigin(0.5);

          let currentStep = 0;
          const sortedValues = [...values].sort((a, b) => a - b);
          let correctSteps = 0;

          function handleBlockClick(index: number, block: Phaser.GameObjects.Rectangle, text: Phaser.GameObjects.Text) {
            if (values[index] === sortedValues[currentStep]) {
              // Correct choice
              block.setFillStyle(0x10b981);
              correctSteps++;
              currentStep++;
              
              if (currentStep === values.length) {
                // Game completed
                setScore(correctSteps);
                setTotalSteps(values.length);
                setGameState('completed');
                toast.success('Algorithm completed! Great sorting!');
              }
            } else {
              // Wrong choice
              block.setFillStyle(0xef4444);
              toast.error('Wrong order! Try again.');
              
              // Reset after 1 second
              setTimeout(() => {
                block.setFillStyle(0x3b82f6);
              }, 1000);
            }
          }
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
    onComplete(score, totalSteps);
  };

  if (gameState === 'completed') {
    return (
      <Card className="p-8 max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Algorithm Complete!</h2>
        <p className="mb-4">You sorted {score} out of {totalSteps} blocks correctly!</p>
        <p className="text-sm text-muted-foreground mb-6">
          Score: {Math.round((score / totalSteps) * 100)}%
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
          Algorithm: Bubble Sort Visualization
        </p>
      </div>
    </div>
  );
};