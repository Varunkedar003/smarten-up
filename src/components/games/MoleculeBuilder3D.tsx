import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import * as THREE from 'three';

interface MoleculeBuilder3DProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

interface Molecule {
  name: string;
  formula: string;
  atoms: { element: string; count: number }[];
}

export const MoleculeBuilder3D: React.FC<MoleculeBuilder3DProps> = ({
  level,
  subtopic,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentMolecule, setCurrentMolecule] = useState<Molecule | null>(null);
  const [builtAtoms, setBuiltAtoms] = useState<{ element: string; count: number }[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  const molecules: Record<string, Molecule[]> = {
    easy: [
      { name: 'Water', formula: 'H₂O', atoms: [{ element: 'H', count: 2 }, { element: 'O', count: 1 }] },
      { name: 'Carbon Dioxide', formula: 'CO₂', atoms: [{ element: 'C', count: 1 }, { element: 'O', count: 2 }] },
      { name: 'Ammonia', formula: 'NH₃', atoms: [{ element: 'N', count: 1 }, { element: 'H', count: 3 }] },
    ],
    intermediate: [
      { name: 'Methane', formula: 'CH₄', atoms: [{ element: 'C', count: 1 }, { element: 'H', count: 4 }] },
      { name: 'Ethanol', formula: 'C₂H₆O', atoms: [{ element: 'C', count: 2 }, { element: 'H', count: 6 }, { element: 'O', count: 1 }] },
      { name: 'Glucose', formula: 'C₆H₁₂O₆', atoms: [{ element: 'C', count: 6 }, { element: 'H', count: 12 }, { element: 'O', count: 6 }] },
    ],
    hard: [
      { name: 'Benzene', formula: 'C₆H₆', atoms: [{ element: 'C', count: 6 }, { element: 'H', count: 6 }] },
      { name: 'Caffeine', formula: 'C₈H₁₀N₄O₂', atoms: [{ element: 'C', count: 8 }, { element: 'H', count: 10 }, { element: 'N', count: 4 }, { element: 'O', count: 2 }] },
      { name: 'Aspirin', formula: 'C₉H₈O₄', atoms: [{ element: 'C', count: 9 }, { element: 'H', count: 8 }, { element: 'O', count: 4 }] },
    ],
  };

  const atomColors: Record<string, number> = {
    H: 0xffffff, // White
    C: 0x808080, // Gray
    N: 0x0000ff, // Blue
    O: 0xff0000, // Red
    S: 0xffff00, // Yellow
  };

  useEffect(() => {
    generateMolecule();
  }, [level]);

  const generateMolecule = () => {
    const moleculeList = molecules[level];
    const molecule = moleculeList[Math.floor(Math.random() * moleculeList.length)];
    setCurrentMolecule(molecule);
    setBuiltAtoms([]);
  };

  useEffect(() => {
    if (!containerRef.current || !currentMolecule) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Create atoms in 3D
    const atomMeshes: THREE.Mesh[] = [];
    let currentIndex = 0;

    builtAtoms.forEach(({ element, count }) => {
      for (let i = 0; i < count; i++) {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshPhongMaterial({
          color: atomColors[element] || 0xcccccc,
          emissive: atomColors[element] || 0xcccccc,
          emissiveIntensity: 0.3,
        });

        const atom = new THREE.Mesh(geometry, material);
        
        // Arrange atoms in a circle
        const angle = (currentIndex / builtAtoms.reduce((sum, a) => sum + a.count, 0)) * Math.PI * 2;
        const radius = 5;
        atom.position.x = Math.cos(angle) * radius;
        atom.position.y = Math.sin(angle) * radius;
        atom.position.z = 0;

        scene.add(atom);
        atomMeshes.push(atom);
        currentIndex++;
      }
    });

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      atomMeshes.forEach((atom, i) => {
        atom.rotation.y += 0.01;
        atom.position.z = Math.sin(Date.now() * 0.001 + i) * 0.5;
      });

      camera.position.x = Math.sin(Date.now() * 0.0005) * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [builtAtoms, currentMolecule]);

  const addAtom = (element: string) => {
    if (!currentMolecule) return;

    const existing = builtAtoms.find(a => a.element === element);
    const required = currentMolecule.atoms.find(a => a.element === element);
    
    if (!required) {
      toast.error(`${element} is not part of ${currentMolecule.name}!`);
      return;
    }

    const currentCount = existing ? existing.count : 0;
    if (currentCount >= required.count) {
      toast.error(`You already have enough ${element} atoms!`);
      return;
    }

    const newBuiltAtoms = existing
      ? builtAtoms.map(a => a.element === element ? { ...a, count: a.count + 1 } : a)
      : [...builtAtoms, { element, count: 1 }];

    setBuiltAtoms(newBuiltAtoms);
    toast.success(`Added ${element} atom!`);
  };

  const checkMolecule = () => {
    if (!currentMolecule) return;

    const isCorrect = currentMolecule.atoms.every(required => {
      const built = builtAtoms.find(a => a.element === required.element);
      return built && built.count === required.count;
    }) && currentMolecule.atoms.length === builtAtoms.length;

    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
    };
    setScore(newScore);

    if (isCorrect) {
      toast.success(`Correct! You built ${currentMolecule.name}!`);
    } else {
      toast.error('Incorrect molecule. Try again!');
    }

    const targetScore = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 7;
    if (newScore.total >= targetScore) {
      setGameState('completed');
      onComplete(newScore.correct, newScore.total);
    } else {
      setTimeout(generateMolecule, 1500);
    }
  };

  if (gameState === 'completed') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">⚗️</div>
          <h2 className="text-2xl font-bold mb-4">Molecule Building Complete!</h2>
          <p className="text-lg mb-4">
            Score: {score.correct} / {score.total}
          </p>
          <p className="text-muted-foreground mb-6">
            Accuracy: {Math.round((score.correct / score.total) * 100)}%
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>3D Molecule Builder</CardTitle>
          <Badge variant="secondary">
            Score: {score.correct}/{score.total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentMolecule && (
          <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
            <h3 className="font-semibold text-lg">{currentMolecule.name}</h3>
            <p className="text-sm text-muted-foreground">Formula: {currentMolecule.formula}</p>
            <p className="text-xs">Build this molecule by adding the correct atoms!</p>
          </div>
        )}

        <div 
          ref={containerRef} 
          className="w-full h-[300px] rounded-lg overflow-hidden border border-border"
        />

        <div className="flex flex-wrap gap-2">
          {['H', 'C', 'N', 'O', 'S'].map(element => (
            <Button
              key={element}
              onClick={() => addAtom(element)}
              variant="outline"
              size="sm"
              style={{ borderColor: `#${atomColors[element].toString(16)}` }}
            >
              Add {element}
            </Button>
          ))}
        </div>

        <Button onClick={checkMolecule} className="w-full" disabled={builtAtoms.length === 0}>
          Check Molecule
        </Button>
      </CardContent>
    </Card>
  );
};
