import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface DatabaseDesignerProps {
  level: 'easy' | 'intermediate' | 'hard';
  onComplete: (correct: number, total: number) => void;
}

export const DatabaseDesigner: React.FC<DatabaseDesignerProps> = ({ level, onComplete }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState(0);
  const [totalQueries, setTotalQueries] = useState(0);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#1f2937',
      scene: {
        create: function() {
          const scene = this;
          
          const queriesToComplete = level === 'easy' ? 6 : level === 'intermediate' ? 9 : 12;
          let queriesCompleted = 0;
          let correctQueries = 0;
          
          // Title
          scene.add.text(400, 30, 'SQL Database Designer', {
            fontSize: '24px',
            color: '#ffffff'
          }).setOrigin(0.5);

          // Database tables
          const tables = {
            users: {
              x: 150, y: 180,
              columns: ['id', 'name', 'email', 'age'],
              data: [
                { id: 1, name: 'Alice', email: 'alice@email.com', age: 25 },
                { id: 2, name: 'Bob', email: 'bob@email.com', age: 30 },
                { id: 3, name: 'Carol', email: 'carol@email.com', age: 28 }
              ]
            },
            orders: {
              x: 500, y: 180,
              columns: ['id', 'user_id', 'product', 'amount'],
              data: [
                { id: 1, user_id: 1, product: 'Laptop', amount: 999 },
                { id: 2, user_id: 2, product: 'Mouse', amount: 25 },
                { id: 3, user_id: 1, product: 'Keyboard', amount: 50 }
              ]
            }
          };

          // Draw tables
          Object.entries(tables).forEach(([tableName, table]) => {
            // Table header
            const headerRect = scene.add.rectangle(table.x, table.y - 20, 200, 30, 0x374151);
            headerRect.setStrokeStyle(1, 0x9ca3af);
            scene.add.text(table.x, table.y - 20, tableName.toUpperCase(), {
              fontSize: '14px',
              color: '#ffffff'
            }).setOrigin(0.5);

            // Column headers
            table.columns.forEach((col, index) => {
              const colRect = scene.add.rectangle(table.x - 75 + (index * 50), table.y + 10, 48, 25, 0x4b5563);
              colRect.setStrokeStyle(1, 0x6b7280);
              scene.add.text(table.x - 75 + (index * 50), table.y + 10, col, {
                fontSize: '10px',
                color: '#e5e7eb'
              }).setOrigin(0.5);
            });

            // Data rows
            table.data.forEach((row, rowIndex) => {
              table.columns.forEach((col, colIndex) => {
                const cellRect = scene.add.rectangle(
                  table.x - 75 + (colIndex * 50), 
                  table.y + 35 + (rowIndex * 20), 
                  48, 18, 0x1f2937
                );
                cellRect.setStrokeStyle(1, 0x4b5563);
                scene.add.text(
                  table.x - 75 + (colIndex * 50), 
                  table.y + 35 + (rowIndex * 20), 
                  String(row[col as keyof typeof row]), {
                  fontSize: '9px',
                  color: '#d1d5db'
                }).setOrigin(0.5);
              });
            });
          });

          // Query challenges
          const challenges = [
            // Easy
            { 
              question: 'SELECT all users', 
              correct: 'SELECT * FROM users',
              options: ['SELECT * FROM users', 'SELECT users FROM *', 'GET * FROM users']
            },
            {
              question: 'SELECT users older than 27',
              correct: 'SELECT * FROM users WHERE age > 27',
              options: ['SELECT * FROM users WHERE age > 27', 'SELECT users WHERE age > 27', 'SELECT * WHERE age > 27']
            },
            // Intermediate
            {
              question: 'COUNT total number of orders',
              correct: 'SELECT COUNT(*) FROM orders',
              options: ['SELECT COUNT(*) FROM orders', 'SELECT COUNT orders', 'COUNT(*) FROM orders']
            },
            {
              question: 'JOIN users with their orders',
              correct: 'SELECT * FROM users JOIN orders ON users.id = orders.user_id',
              options: [
                'SELECT * FROM users JOIN orders ON users.id = orders.user_id',
                'SELECT * FROM users, orders WHERE id = user_id',
                'JOIN users orders ON id = user_id'
              ]
            },
            // Hard
            {
              question: 'Find users with orders > $50',
              correct: 'SELECT DISTINCT u.name FROM users u JOIN orders o ON u.id = o.user_id WHERE o.amount > 50',
              options: [
                'SELECT DISTINCT u.name FROM users u JOIN orders o ON u.id = o.user_id WHERE o.amount > 50',
                'SELECT users.name FROM users WHERE orders.amount > 50',
                'SELECT name FROM users JOIN orders WHERE amount > 50'
              ]
            }
          ];

          // Current challenge display
          const challengeText = scene.add.text(400, 380, '', {
            fontSize: '16px',
            color: '#fbbf24'
          }).setOrigin(0.5);

          // Option buttons
          let optionButtons: Phaser.GameObjects.Rectangle[] = [];
          let optionTexts: Phaser.GameObjects.Text[] = [];

          // Score
          const scoreText = scene.add.text(50, 60, 'Queries: 0/0', {
            fontSize: '16px',
            color: '#ffffff'
          });

          let currentChallenge: any;

          function generateQuery() {
            queriesCompleted++;
            setTotalQueries(queriesCompleted);
            
            if (queriesCompleted > queriesToComplete) {
              setScore(correctQueries);
              setGameState('completed');
              return;
            }

            // Clear previous options
            optionButtons.forEach(btn => btn.destroy());
            optionTexts.forEach(txt => txt.destroy());
            optionButtons = [];
            optionTexts = [];

            // Select challenge based on level
            let availableChallenges = challenges;
            if (level === 'easy') {
              availableChallenges = challenges.slice(0, 2);
            } else if (level === 'intermediate') {
              availableChallenges = challenges.slice(0, 4);
            }

            currentChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)];
            challengeText.setText(`Query ${queriesCompleted}/${queriesToComplete}: ${currentChallenge.question}`);

            // Shuffle options
            const shuffledOptions = [...currentChallenge.options].sort(() => Math.random() - 0.5);

            // Create option buttons
            shuffledOptions.forEach((option, index) => {
              const y = 450 + (index * 40);
              const button = scene.add.rectangle(400, y, 600, 35, 0x374151)
                .setInteractive()
                .on('pointerdown', () => selectOption(option));
              
              button.setStrokeStyle(1, 0x6b7280);
              
              const text = scene.add.text(400, y, option, {
                fontSize: '12px',
                color: '#e5e7eb',
                fontFamily: 'monospace'
              }).setOrigin(0.5);

              optionButtons.push(button);
              optionTexts.push(text);
            });
          }

          function selectOption(selectedOption: string) {
            if (selectedOption === currentChallenge.correct) {
              correctQueries++;
              toast.success('Correct SQL query!');
            } else {
              toast.error('Incorrect. Try studying SQL syntax!');
            }
            
            scoreText.setText(`Queries: ${correctQueries}/${queriesCompleted}`);
            
            setTimeout(() => {
              generateQuery();
            }, 1500);
          }

          // Instructions
          scene.add.text(400, 100, 'Study the database schema above and select the correct SQL query', {
            fontSize: '14px',
            color: '#94a3b8'
          }).setOrigin(0.5);

          // Start first query
          generateQuery();
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
    onComplete(score, totalQueries);
  };

  if (gameState === 'completed') {
    return (
      <Card className="p-8 max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Database Master!</h2>
        <p className="mb-4">You wrote {score} out of {totalQueries} SQL queries correctly!</p>
        <p className="text-sm text-muted-foreground mb-6">
          SQL Skills: {Math.round((score / totalQueries) * 100)}%
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
          Topic: SQL Database Design
        </p>
      </div>
    </div>
  );
};