import React, { useEffect } from 'react';
import { GameSelection } from '@/lib/progress';
import { AlgorithmVisualizer } from './AlgorithmVisualizer';
import { DataStructureBuilder } from './DataStructureBuilder';
import { CircuitBuilder } from './CircuitBuilder';
import { CodeDebugging } from './CodeDebugging';
import { NetworkSimulator } from './NetworkSimulator';
import { DatabaseDesigner } from './DatabaseDesigner';
import { MathEquationSolver } from './MathEquationSolver';
import { PhysicsSimulator } from './PhysicsSimulator';
import { ChemistryLab } from './ChemistryLab';
import { BiologyExplorer } from './BiologyExplorer';
import { ArrayArrangeGame } from './ArrayArrangeGame';
import { QueueSimulator } from './QueueSimulator';
import { TreeTraversalGame } from './TreeTraversalGame';
import { StackSimulatorGame } from './StackSimulatorGame';
import { GraphPathfinderGame } from './GraphPathfinderGame';
import { PacketSimulationGame } from './PacketSimulationGame';
import { AgileSprintRunner } from './AgileSprintRunner';
import { CodePuzzle } from './CodePuzzle';
import { speechService } from '@/services/speechService';

interface GameRouterProps {
  selection: GameSelection;
  onComplete: (correct: number, total: number) => void;
}

export const GameRouter: React.FC<GameRouterProps> = ({ selection, onComplete }) => {
  const { subject, topic, subtopic, level } = selection;

  useEffect(() => {
    try {
      speechService.speakExplanation(topic, subtopic || topic, level);
    } catch (e) {
      // ignore speech errors silently
    }
  }, [subject, topic, subtopic, level]);

  const getGameForSelection = () => {

    // Computer Science games
    if (subject === "Computer Science") {
      switch (topic) {
        case "Algorithms":
          return <AlgorithmVisualizer level={level} onComplete={onComplete} />;
        case "Data Structures": {
          // Route different subtopics to distinct games
          if (subtopic?.includes('Arrays')) {
            return <ArrayArrangeGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Stacks')) {
            return <StackSimulatorGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Queues')) {
            return <QueueSimulator level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Trees')) {
            return <TreeTraversalGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Graphs')) {
            return <GraphPathfinderGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          return <DataStructureBuilder level={level} onComplete={onComplete} />;
        }
        case "Programming":
          if (subtopic?.includes('Syntax') || subtopic?.includes('Debugging')) {
            return <CodePuzzle level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          return <CodeDebugging level={level} onComplete={onComplete} />;
        case "Database Management":
          return <DatabaseDesigner level={level} onComplete={onComplete} />;
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
          if (subtopic?.includes('Network Security')) {
            return <PacketSimulationGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          return <NetworkSimulator level={level} onComplete={onComplete} />;
        case "Software Engineering":
          if (subtopic?.includes('Agile')) {
            return <AgileSprintRunner level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          return <CodeDebugging level={level} onComplete={onComplete} />;
        case "Systems Design":
          return <CodeDebugging level={level} onComplete={onComplete} />;
        default:
          return <CircuitBuilder level={level} onComplete={onComplete} />;
      }
    }

    // Mathematics games
    if (subject === "Mathematics") {
      return <MathEquationSolver level={level} subtopic={subtopic} onComplete={onComplete} />;
    }

    // Physics games
    if (subject === "Physics") {
      return <PhysicsSimulator level={level} subtopic={subtopic} onComplete={onComplete} />;
    }

    // Chemistry games
    if (subject === "Chemistry") {
      return <ChemistryLab level={level} subtopic={subtopic} onComplete={onComplete} />;
    }

    // Biology games
    if (subject === "Biology") {
      return <BiologyExplorer level={level} subtopic={subtopic} onComplete={onComplete} />;
    }

    // Other subjects - use appropriate fallbacks
    return <AlgorithmVisualizer level={level} onComplete={onComplete} />;
  };

  return (
    <div className="w-full h-full">
      {getGameForSelection()}
    </div>
  );
};