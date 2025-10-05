import React, { useEffect } from 'react';
import { GameSelection } from '@/lib/progress';
import { AlgorithmVisualizer } from './AlgorithmVisualizer';
import { AlgorithmVisualizer3D } from './AlgorithmVisualizer3D';
import { DataStructureBuilder } from './DataStructureBuilder';
import { DataStructure3D } from './DataStructure3D';
import { CircuitBuilder } from './CircuitBuilder';
import { CircuitBuilder3D } from './CircuitBuilder3D';
import { CodeDebugging } from './CodeDebugging';
import { NetworkSimulator } from './NetworkSimulator';
import { DatabaseDesigner } from './DatabaseDesigner';
import { DatabaseDesigner3D } from './DatabaseDesigner3D';
import { MathEquationSolver } from './MathEquationSolver';
import { MathVisualizer3D } from './MathVisualizer3D';
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
import { NetworkSimulator3D } from './NetworkSimulator3D';
import { MoleculeBuilder3D } from './MoleculeBuilder3D';
import { PhysicsWorld3D } from './PhysicsWorld3D';
import { DNASequencer3D } from './DNASequencer3D';
import { CloudArchitect3D } from './CloudArchitect3D';
import { DataTowerDefense } from './DataTowerDefense';
import { ProcessCity3D } from './ProcessCity3D';
import { NeuralNexus3D } from './NeuralNexus3D';
import { CPUInside3D } from './CPUInside3D';
import { BridgeBuilder3D } from './BridgeBuilder3D';
import { ForceField3D } from './ForceField3D';
import { GravitySimulator3D } from './GravitySimulator3D';
import { MatrixMaze3D } from './MatrixMaze3D';
import { CellExplorer3D } from './CellExplorer3D';
import { WaveWorks3D } from './WaveWorks3D';
import { VectorQuest3D } from './VectorQuest3D';
import { ReactionChamber3D } from './ReactionChamber3D';
import { BrainNetwork3D } from './BrainNetwork3D';
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
          if (subtopic?.includes('Bubble') || subtopic?.includes('Quick') || subtopic?.includes('Merge')) {
            return <AlgorithmVisualizer3D level={level} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Binary Search')) {
            return <AlgorithmVisualizer3D level={level} onComplete={onComplete} />;
          }
          if (subtopic?.includes('DFS') || subtopic?.includes('BFS') || subtopic?.includes("Dijkstra")) {
            return <GraphPathfinderGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          return <AlgorithmVisualizer3D level={level} onComplete={onComplete} />;
        case "Data Structures": {
          if (subtopic?.includes('Arrays')) {
            return <ArrayArrangeGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Stacks')) {
            return <StackSimulatorGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Queues')) {
            return <QueueSimulator level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Trees') || subtopic?.includes('AVL')) {
            return <TreeTraversalGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Graphs')) {
            return <GraphPathfinderGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Hash')) {
            return <DataTowerDefense level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          return <DataStructure3D level={level} onComplete={onComplete} />;
        }
        case "Programming":
          if (subtopic?.includes('Syntax') || subtopic?.includes('Debugging')) {
            return <CodePuzzle level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('OOP') || subtopic?.includes('Design Patterns')) {
            return <CodeDebugging level={level} onComplete={onComplete} />;
          }
          return <CodePuzzle level={level} subtopic={subtopic} onComplete={onComplete} />;
        case "Database Management":
          if (subtopic?.includes('SQL') || subtopic?.includes('Joins')) {
            return <DatabaseDesigner3D level={level} onComplete={onComplete} />;
          }
          if (subtopic?.includes('NoSQL')) {
            return <CloudArchitect3D level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          return <DatabaseDesigner3D level={level} onComplete={onComplete} />;
        case "Machine Learning":
          return <NeuralNexus3D level={level} subtopic={subtopic} onComplete={onComplete} />;
        default:
          return <AlgorithmVisualizer3D level={level} onComplete={onComplete} />;
      }
    }

    // Engineering games
    if (subject === "Engineering") {
      switch (topic) {
        case "Digital Logic":
          if (subtopic?.includes('Gates') || subtopic?.includes('Boolean')) {
            return <CircuitBuilder3D level={level} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Flip-Flops') || subtopic?.includes('Sequential')) {
            return <CPUInside3D level={level} onComplete={onComplete} />;
          }
          return <CircuitBuilder3D level={level} onComplete={onComplete} />;
        case "Computer Networks":
          if (subtopic?.includes('OSI') || subtopic?.includes('DNS')) {
            return <PacketSimulationGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Network Security') || subtopic?.includes('Firewalls') || subtopic?.includes('VPN')) {
            return <PacketSimulationGame level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('Routing') || subtopic?.includes('TCP/IP') || subtopic?.includes('Wireless')) {
            return <NetworkSimulator3D level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          return <NetworkSimulator3D level={level} subtopic={subtopic} onComplete={onComplete} />;
        case "Software Engineering":
          if (subtopic?.includes('Agile')) {
            return <AgileSprintRunner level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          if (subtopic?.includes('SDLC') || subtopic?.includes('Testing')) {
            return <ProcessCity3D level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          return <AgileSprintRunner level={level} subtopic={subtopic} onComplete={onComplete} />;
        case "Systems Design":
          if (subtopic?.includes('Architecture') || subtopic?.includes('Scaling')) {
            return <CloudArchitect3D level={level} subtopic={subtopic} onComplete={onComplete} />;
          }
          return <ProcessCity3D level={level} subtopic={subtopic} onComplete={onComplete} />;
        default:
          return <CircuitBuilder3D level={level} onComplete={onComplete} />;
      }
    }

    // Mathematics games
    if (subject === "Mathematics") {
      if (subtopic?.includes('Linear') || subtopic?.includes('Quadratic') || subtopic?.includes('Algebra')) {
        return <MathVisualizer3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      if (subtopic?.includes('Calculus') || subtopic?.includes('Derivatives') || subtopic?.includes('Integration')) {
        return <MathVisualizer3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      if (subtopic?.includes('Geometry') || subtopic?.includes('Coordinate')) {
        return <VectorQuest3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      if (subtopic?.includes('Triangles') || subtopic?.includes('Circles')) {
        return <MatrixMaze3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      return <MathVisualizer3D level={level} subtopic={subtopic} onComplete={onComplete} />;
    }

    // Physics games
    if (subject === "Physics") {
      if (subtopic?.includes('Kinematics') || subtopic?.includes('Forces') || subtopic?.includes('Momentum')) {
        return <ForceField3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      if (subtopic?.includes('Energy') || subtopic?.includes('Circular Motion')) {
        return <PhysicsWorld3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      if (subtopic?.includes('Gravity') || subtopic?.includes('Quantum') || subtopic?.includes('Special Relativity')) {
        return <GravitySimulator3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      if (subtopic?.includes('Reflection') || subtopic?.includes('Refraction') || subtopic?.includes('Wave')) {
        return <WaveWorks3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      return <PhysicsWorld3D level={level} subtopic={subtopic} onComplete={onComplete} />;
    }

    // Chemistry games
    if (subject === "Chemistry") {
      if (subtopic?.includes('Bonding') || subtopic?.includes('Molecular') || subtopic?.includes('Atomic')) {
        return <MoleculeBuilder3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      if (subtopic?.includes('Reaction') || subtopic?.includes('Equilibrium') || subtopic?.includes('Kinetics')) {
        return <ReactionChamber3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      return <ChemistryLab level={level} subtopic={subtopic} onComplete={onComplete} />;
    }

    // Biology games
    if (subject === "Biology") {
      if (subtopic?.includes('DNA') || subtopic?.includes('Genetics') || subtopic?.includes('Gene')) {
        return <DNASequencer3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      if (subtopic?.includes('Cell') || subtopic?.includes('Organelles') || subtopic?.includes('Membrane')) {
        return <CellExplorer3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      if (subtopic?.includes('Brain') || subtopic?.includes('Nervous') || subtopic?.includes('Neuron')) {
        return <BrainNetwork3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
      if (subtopic?.includes('Photosynthesis') || subtopic?.includes('Respiration')) {
        return <CellExplorer3D level={level} subtopic={subtopic} onComplete={onComplete} />;
      }
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