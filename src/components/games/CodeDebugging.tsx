import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface CodeDebuggingProps {
  level: 'easy' | 'intermediate' | 'hard';
  onComplete: (correct: number, total: number) => void;
}

export const CodeDebugging: React.FC<CodeDebuggingProps> = ({ level, onComplete }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState(0);
  const [totalBugs, setTotalBugs] = useState(0);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#1e1b4b',
      scene: {
        create: function() {
          const scene = this;
          
          const bugChallenges = level === 'easy' ? 4 : level === 'intermediate' ? 6 : 8;
          let currentBug = 0;
          let bugsFixed = 0;
          
          // Title
          scene.add.text(400, 30, 'Debug the Code!', {
            fontSize: '28px',
            color: '#ffffff'
          }).setOrigin(0.5);

          // Code display area
          const codeBackground = scene.add.rectangle(400, 300, 700, 400, 0x0f172a);
          codeBackground.setStrokeStyle(2, 0x334155);

          let codeLines: Phaser.GameObjects.Text[] = [];
          let bugOptions: Phaser.GameObjects.Rectangle[] = [];

          // Score display
          const scoreText = scene.add.text(50, 60, 'Bugs Fixed: 0/0', {
            fontSize: '18px',
            color: '#ffffff'
          });

          const bugDatabase = [
            // Easy bugs
            {
              code: [
                'function sum(a, b) {',
                '  return a + b',  // Missing semicolon
                '}',
                '',
                'console.log(sum(5, 3));'
              ],
              bugLine: 1,
              description: 'Missing semicolon',
              fixed: 'return a + b;'
            },
            {
              code: [
                'for (let i = 0; i < 5; i++); {', // Extra semicolon
                '  console.log(i);',
                '}'
              ],
              bugLine: 0,
              description: 'Extra semicolon in for loop',
              fixed: 'for (let i = 0; i < 5; i++) {'
            },
            // Intermediate bugs
            {
              code: [
                'function factorial(n) {',
                '  if (n = 0) return 1;', // Assignment instead of comparison
                '  return n * factorial(n - 1);',
                '}'
              ],
              bugLine: 1,
              description: 'Assignment instead of comparison',
              fixed: 'if (n == 0) return 1;'
            },
            {
              code: [
                'let arr = [1, 2, 3];',
                'for (let i = 0; i <= arr.length; i++) {', // Off-by-one error
                '  console.log(arr[i]);',
                '}'
              ],
              bugLine: 1,
              description: 'Array bounds error',
              fixed: 'for (let i = 0; i < arr.length; i++) {'
            },
            // Hard bugs
            {
              code: [
                'class Calculator {',
                '  constructor(value) {',
                '    this.value = value;',
                '  }',
                '  add(n) {',
                '    return value + n;', // Missing 'this.'
                '  }',
                '}'
              ],
              bugLine: 5,
              description: 'Missing this reference',
              fixed: 'return this.value + n;'
            },
            {
              code: [
                'async function fetchData() {',
                '  const response = fetch("/api/data");', // Missing await
                '  const data = await response.json();',
                '  return data;',
                '}'
              ],
              bugLine: 1,
              description: 'Missing await keyword',
              fixed: 'const response = await fetch("/api/data");'
            }
          ];

          function displayBug() {
            currentBug++;
            setTotalBugs(currentBug);
            
            if (currentBug > bugChallenges) {
              setScore(bugsFixed);
              setGameState('completed');
              return;
            }

            // Clear previous display
            codeLines.forEach(line => line.destroy());
            bugOptions.forEach(option => option.destroy());
            codeLines = [];
            bugOptions = [];

            // Select appropriate bugs based on level
            let availableBugs = bugDatabase;
            if (level === 'easy') {
              availableBugs = bugDatabase.slice(0, 2);
            } else if (level === 'intermediate') {
              availableBugs = bugDatabase.slice(0, 4);
            }

            const bug = availableBugs[Math.floor(Math.random() * availableBugs.length)];
            
            // Display challenge info
            const challengeText = scene.add.text(400, 80, `Bug ${currentBug}/${bugChallenges}: Find and click the buggy line!`, {
              fontSize: '16px',
              color: '#fbbf24'
            }).setOrigin(0.5);

            // Display code
            bug.code.forEach((line, index) => {
              const y = 200 + (index * 25);
              const lineNumber = scene.add.text(120, y, `${index + 1}:`, {
                fontSize: '14px',
                color: '#94a3b8'
              });

              const codeLine = scene.add.text(150, y, line, {
                fontSize: '14px',
                color: index === bug.bugLine ? '#ef4444' : '#e2e8f0',
                fontFamily: 'monospace'
              });

              // Make line clickable
              const clickArea = scene.add.rectangle(400, y, 600, 20, 0x000000, 0)
                .setInteractive()
                .on('pointerdown', () => checkBugLine(index, bug.bugLine, bug.description));

              codeLines.push(lineNumber, codeLine);
              bugOptions.push(clickArea);
            });
          }

          function checkBugLine(clicked: number, correct: number, description: string) {
            if (clicked === correct) {
              bugsFixed++;
              toast.success(`Correct! ${description} fixed!`);
              
              // Highlight the fixed line in green
              codeLines.forEach((textObj, index) => {
                if (textObj.text && !textObj.text.includes(':')) {
                  if (Math.floor(index / 2) === correct) {
                    textObj.setColor('#10b981');
                  }
                }
              });

              setTimeout(() => {
                displayBug();
              }, 1500);
            } else {
              toast.error('Not the buggy line. Keep looking!');
            }
            
            scoreText.setText(`Bugs Fixed: ${bugsFixed}/${currentBug}`);
          }

          // Start first bug challenge
          displayBug();
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
    onComplete(score, totalBugs);
  };

  if (gameState === 'completed') {
    return (
      <Card className="p-8 max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Debug Master!</h2>
        <p className="mb-4">You fixed {score} out of {totalBugs} bugs!</p>
        <p className="text-sm text-muted-foreground mb-6">
          Debugging Skills: {Math.round((score / totalBugs) * 100)}%
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
          Skill: Code Debugging
        </p>
      </div>
    </div>
  );
};