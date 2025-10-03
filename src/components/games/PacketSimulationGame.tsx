import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Wifi, Server, Shield, Activity } from 'lucide-react';

interface PacketSimulationGameProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

interface Packet {
  id: number;
  source: string;
  destination: string;
  data: string;
  protocol: string;
}

export const PacketSimulationGame: React.FC<PacketSimulationGameProps> = ({
  level,
  subtopic,
  onComplete,
}) => {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentPacket, setCurrentPacket] = useState<Packet | null>(null);
  const [routers, setRouters] = useState<string[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  useEffect(() => {
    generateNetwork();
    generatePacket();
  }, [level]);

  const generateNetwork = () => {
    const routerCount = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 7;
    const routerNames = Array.from({ length: routerCount }, (_, i) => `Router ${i + 1}`);
    setRouters(routerNames);
  };

  const generatePacket = () => {
    const protocols = level === 'easy' ? ['HTTP'] : level === 'intermediate' ? ['HTTP', 'TCP', 'UDP'] : ['HTTP', 'TCP', 'UDP', 'ICMP', 'DNS'];
    const packet: Packet = {
      id: Date.now(),
      source: routers[0] || 'Source',
      destination: routers[routers.length - 1] || 'Destination',
      data: `Data-${Math.floor(Math.random() * 1000)}`,
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
    };
    setCurrentPacket(packet);
    setPath([packet.source]);
  };

  const routePacket = (router: string) => {
    if (!currentPacket) return;

    const newPath = [...path, router];
    setPath(newPath);

    if (router === currentPacket.destination) {
      const isCorrect = newPath.length <= routers.length;
      const newScore = {
        correct: score.correct + (isCorrect ? 1 : 0),
        total: score.total + 1,
      };
      setScore(newScore);

      if (isCorrect) {
        toast.success(`Packet routed successfully! Hops: ${newPath.length - 1}`);
      } else {
        toast.error('Inefficient routing!');
      }

      if (newScore.total >= (level === 'easy' ? 5 : level === 'intermediate' ? 8 : 10)) {
        setGameState('completed');
        onComplete(newScore.correct, newScore.total);
      } else {
        setTimeout(() => {
          generatePacket();
        }, 1500);
      }
    }
  };

  if (gameState === 'completed') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-4">Network Simulation Complete!</h2>
          <p className="text-lg mb-4">
            Score: {score.correct} / {score.total}
          </p>
          <p className="text-muted-foreground mb-6">
            Efficiency: {Math.round((score.correct / score.total) * 100)}%
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Packet Routing Simulation
          </CardTitle>
          <Badge variant="secondary">
            Score: {score.correct}/{score.total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentPacket && (
          <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4" />
              <span className="font-semibold">From:</span> {currentPacket.source}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              <span className="font-semibold">To:</span> {currentPacket.destination}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              <span className="font-semibold">Protocol:</span> {currentPacket.protocol}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold mb-3">Current Path:</h3>
          <div className="flex flex-wrap gap-2">
            {path.map((hop, idx) => (
              <Badge key={idx} variant="outline">
                {hop} {idx < path.length - 1 && '→'}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Route through:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {routers.map((router) => (
              <Button
                key={router}
                onClick={() => routePacket(router)}
                disabled={path.includes(router)}
                variant={path.includes(router) ? 'secondary' : 'outline'}
                className="w-full"
              >
                {router}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
