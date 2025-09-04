import React from 'react';
import { GameSelection } from '@/lib/progress';
import { AlgorithmVisualizer } from './AlgorithmVisualizer';
import { DataStructureBuilder } from './DataStructureBuilder';
import { CircuitBuilder } from './CircuitBuilder';
import { CodeDebugging } from './CodeDebugging';
import { NetworkSimulator } from './NetworkSimulator';
import { DatabaseDesigner } from './DatabaseDesigner';

interface GameRouterProps {
  selection: GameSelection;
  onComplete: (correct: number, total: number) => void;
}

export const GameRouter: React.FC<GameRouterProps> = ({ selection, onComplete }) => {
  const getGameForSelection = () => {
    const { subject, topic, level } = selection;

    // Computer Science games
    if (subject === "Computer Science") {
      switch (topic) {
        case "Algorithms":
          return <AlgorithmVisualizer level={level} onComplete={onComplete} />;
        case "Data Structures":
          return <DataStructureBuilder level={level} onComplete={onComplete} />;
        case "Programming":
          return <CodeDebugging level={level} onComplete={onComplete} />;
        default:
          return <AlgorithmVisualizer level={level} onComplete={onComplete} />;
      }
    }

    // Engineering games
    if (subject === "Engineering") {
      switch (topic) {
        case "Digital Logic":
          return <CircuitBuilder level={level} onComplete={onComplete} />;
        case "Computer Networks":
          return <NetworkSimulator level={level} onComplete={onComplete} />;
        case "Database Systems":
          return <DatabaseDesigner level={level} onComplete={onComplete} />;
        default:
          return <CircuitBuilder level={level} onComplete={onComplete} />;
      }
    }

    // Default fallback
    return <AlgorithmVisualizer level={level} onComplete={onComplete} />;
  };

  return (
    <div className="w-full h-full">
      {getGameForSelection()}
    </div>
  );
};