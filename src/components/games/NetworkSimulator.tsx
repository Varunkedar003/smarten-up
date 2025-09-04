import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface NetworkSimulatorProps {
  level: 'easy' | 'intermediate' | 'hard';
  onComplete: (correct: number, total: number) => void;
}

export const NetworkSimulator: React.FC<NetworkSimulatorProps> = ({ level, onComplete }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [score, setScore] = useState(0);
  const [totalPackets, setTotalPackets] = useState(0);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      backgroundColor: '#111827',
      scene: {
        create: function() {
          const scene = this;
          
          const packetsToRoute = level === 'easy' ? 8 : level === 'intermediate' ? 12 : 16;
          let packetsRouted = 0;
          let correctRoutes = 0;
          
          // Title
          scene.add.text(400, 30, 'Network Packet Router', {
            fontSize: '24px',
            color: '#ffffff'
          }).setOrigin(0.5);

          // Network nodes
          const nodes = [
            { id: 'A', x: 150, y: 150, ip: '192.168.1.1' },
            { id: 'B', x: 350, y: 150, ip: '192.168.1.2' },
            { id: 'C', x: 550, y: 150, ip: '192.168.1.3' },
            { id: 'D', x: 150, y: 350, ip: '10.0.0.1' },
            { id: 'E', x: 350, y: 350, ip: '10.0.0.2' },
            { id: 'F', x: 550, y: 350, ip: '10.0.0.3' }
          ];

          // Draw nodes
          nodes.forEach(node => {
            const circle = scene.add.circle(node.x, node.y, 30, 0x3b82f6);
            circle.setStrokeStyle(2, 0x1e40af);
            
            scene.add.text(node.x, node.y - 5, node.id, {
              fontSize: '16px',
              color: '#ffffff'
            }).setOrigin(0.5);
            
            scene.add.text(node.x, node.y + 50, node.ip, {
              fontSize: '10px',
              color: '#94a3b8'
            }).setOrigin(0.5);
          });

          // Draw connections
          const connections = [
            [0, 1], [1, 2], // Top row
            [3, 4], [4, 5], // Bottom row
            [0, 3], [1, 4], [2, 5] // Vertical connections
          ];

          connections.forEach(([from, to]) => {
            const line = scene.add.line(0, 0, 
              nodes[from].x, nodes[from].y,
              nodes[to].x, nodes[to].y,
              0x6b7280, 1
            ).setOrigin(0);
          });

          // Packet display
          let currentPacket: any = null;
          let packetGraphic: Phaser.GameObjects.Graphics | null = null;

          // Instructions
          const instructionText = scene.add.text(400, 80, '', {
            fontSize: '14px',
            color: '#fbbf24'
          }).setOrigin(0.5);

          // Score
          const scoreText = scene.add.text(50, 60, 'Packets Routed: 0/0', {
            fontSize: '16px',
            color: '#ffffff'
          });

          // Create clickable areas for nodes
          nodes.forEach((node, index) => {
            const clickArea = scene.add.circle(node.x, node.y, 35, 0x000000, 0)
              .setInteractive()
              .on('pointerdown', () => routePacket(index));
          });

          function generatePacket() {
            packetsRouted++;
            setTotalPackets(packetsRouted);
            
            if (packetsRouted > packetsToRoute) {
              setScore(correctRoutes);
              setGameState('completed');
              return;
            }

            // Generate random source and destination
            const sourceIndex = Math.floor(Math.random() * nodes.length);
            let destIndex = Math.floor(Math.random() * nodes.length);
            while (destIndex === sourceIndex) {
              destIndex = Math.floor(Math.random() * nodes.length);
            }

            currentPacket = {
              source: nodes[sourceIndex],
              destination: nodes[destIndex],
              sourceIndex,
              destIndex
            };

            // Draw packet
            if (packetGraphic) packetGraphic.destroy();
            packetGraphic = scene.add.graphics();
            packetGraphic.fillStyle(0xf59e0b);
            packetGraphic.fillRect(currentPacket.source.x - 10, currentPacket.source.y - 40, 20, 15);

            instructionText.setText(`Route packet from ${currentPacket.source.id} (${currentPacket.source.ip}) to ${currentPacket.destination.id} (${currentPacket.destination.ip})`);
          }

          function routePacket(nodeIndex: number) {
            if (!currentPacket) return;

            if (nodeIndex === currentPacket.destIndex) {
              correctRoutes++;
              toast.success(`Packet delivered to ${nodes[nodeIndex].id}!`);
              
              // Animate packet movement
              if (packetGraphic) {
                scene.tweens.add({
                  targets: packetGraphic,
                  x: nodes[nodeIndex].x - 10,
                  y: nodes[nodeIndex].y - 40,
                  duration: 500,
                  onComplete: () => {
                    if (packetGraphic) packetGraphic.destroy();
                    generatePacket();
                  }
                });
              }
            } else {
              toast.error(`Wrong destination! Packet lost.`);
              if (packetGraphic) packetGraphic.destroy();
              generatePacket();
            }
            
            scoreText.setText(`Packets Routed: ${correctRoutes}/${packetsRouted}`);
          }

          // Network topology explanation
          scene.add.text(400, 450, 'Click on the correct destination node to route the packet', {
            fontSize: '12px',
            color: '#94a3b8'
          }).setOrigin(0.5);

          scene.add.text(400, 470, 'Same subnet: 192.168.1.x and 10.0.0.x', {
            fontSize: '10px',
            color: '#6b7280'
          }).setOrigin(0.5);

          // Start first packet
          generatePacket();
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
    onComplete(score, totalPackets);
  };

  if (gameState === 'completed') {
    return (
      <Card className="p-8 max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Network Engineer!</h2>
        <p className="mb-4">You successfully routed {score} out of {totalPackets} packets!</p>
        <p className="text-sm text-muted-foreground mb-6">
          Routing Efficiency: {Math.round((score / totalPackets) * 100)}%
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
          Topic: Network Routing
        </p>
      </div>
    </div>
  );
};