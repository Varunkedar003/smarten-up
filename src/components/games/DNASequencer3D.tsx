import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import * as THREE from 'three';

interface DNASequencer3DProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

export const DNASequencer3D: React.FC<DNASequencer3DProps> = ({
  level,
  subtopic,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  const bases = ['A', 'T', 'G', 'C'];
  const baseColors: Record<string, number> = {
    A: 0x00ff00, // Green
    T: 0xff0000, // Red
    G: 0x0000ff, // Blue
    C: 0xffff00, // Yellow
  };

  const generateSequence = () => {
    const length = level === 'easy' ? 4 : level === 'intermediate' ? 6 : 8;
    const sequence = Array.from({ length }, () => bases[Math.floor(Math.random() * bases.length)]);
    setTargetSequence(sequence);
    setCurrentSequence([]);
  };

  useEffect(() => {
    generateSequence();
  }, [level]);

  useEffect(() => {
    if (!containerRef.current || targetSequence.length === 0) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1e);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 20;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Create DNA double helix structure
    const helixRadius = 3;
    const helixHeight = 15;
    const turns = 2;
    const stepsPerTurn = 20;

    // Backbone strands
    const strand1Points: THREE.Vector3[] = [];
    const strand2Points: THREE.Vector3[] = [];

    for (let i = 0; i <= turns * stepsPerTurn; i++) {
      const t = i / stepsPerTurn;
      const angle1 = t * Math.PI * 2;
      const angle2 = angle1 + Math.PI;
      const y = (t / turns) * helixHeight - helixHeight / 2;

      strand1Points.push(new THREE.Vector3(
        Math.cos(angle1) * helixRadius,
        y,
        Math.sin(angle1) * helixRadius
      ));

      strand2Points.push(new THREE.Vector3(
        Math.cos(angle2) * helixRadius,
        y,
        Math.sin(angle2) * helixRadius
      ));
    }

    const strand1Geometry = new THREE.BufferGeometry().setFromPoints(strand1Points);
    const strand2Geometry = new THREE.BufferGeometry().setFromPoints(strand2Points);
    const strandMaterial = new THREE.LineBasicMaterial({ color: 0x888888, linewidth: 2 });

    const strand1 = new THREE.Line(strand1Geometry, strandMaterial);
    const strand2 = new THREE.Line(strand2Geometry, strandMaterial);
    scene.add(strand1);
    scene.add(strand2);

    // Create base pairs
    const basePairs: THREE.Mesh[] = [];
    const pairStep = Math.floor(stepsPerTurn / 4);

    for (let i = 0; i < targetSequence.length; i++) {
      const idx = i * pairStep;
      if (idx >= strand1Points.length) break;

      const base = targetSequence[i];
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshPhongMaterial({
        color: baseColors[base],
        emissive: baseColors[base],
        emissiveIntensity: 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(strand1Points[idx]);
      scene.add(mesh);
      basePairs.push(mesh);

      // Connection line
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        strand1Points[idx],
        strand2Points[idx],
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: baseColors[base],
        transparent: true,
        opacity: 0.5,
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    }

    // User's sequence visualization
    const userBases: THREE.Mesh[] = [];
    currentSequence.forEach((base, i) => {
      const geometry = new THREE.SphereGeometry(0.6, 16, 16);
      const material = new THREE.MeshPhongMaterial({
        color: baseColors[base],
        emissive: baseColors[base],
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(i * 2 - currentSequence.length, -10, 0);
      scene.add(mesh);
      userBases.push(mesh);
    });

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate DNA helix
      strand1.rotation.y += 0.005;
      strand2.rotation.y += 0.005;
      basePairs.forEach((bp, i) => {
        bp.rotation.y += 0.005;
        bp.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
      });

      // Animate user bases
      userBases.forEach((base, i) => {
        base.rotation.y += 0.05;
        base.position.y = -10 + Math.sin(Date.now() * 0.002 + i) * 0.3;
      });

      camera.position.x = Math.sin(Date.now() * 0.0003) * 5;
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
  }, [currentSequence, targetSequence]);

  const addBase = (base: string) => {
    if (currentSequence.length >= targetSequence.length) {
      toast.error('Sequence complete! Check your answer.');
      return;
    }

    setCurrentSequence([...currentSequence, base]);
    toast.success(`Added ${base}`);
  };

  const checkSequence = () => {
    if (currentSequence.length !== targetSequence.length) {
      toast.error('Sequence incomplete!');
      return;
    }

    const isCorrect = currentSequence.every((base, idx) => base === targetSequence[idx]);

    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
    };
    setScore(newScore);

    if (isCorrect) {
      toast.success('Correct DNA sequence! 🧬');
    } else {
      toast.error('Incorrect sequence. Try again!');
    }

    const targetScore = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 7;
    if (newScore.total >= targetScore) {
      setGameState('completed');
      onComplete(newScore.correct, newScore.total);
    } else {
      setTimeout(generateSequence, 1500);
    }
  };

  const resetSequence = () => {
    setCurrentSequence([]);
  };

  if (gameState === 'completed') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🧬</div>
          <h2 className="text-2xl font-bold mb-4">DNA Sequencing Complete!</h2>
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
          <CardTitle>3D DNA Sequencer</CardTitle>
          <Badge variant="secondary">
            Score: {score.correct}/{score.total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
          <p className="text-sm font-semibold">Target Sequence:</p>
          <div className="flex gap-2 flex-wrap">
            {targetSequence.map((base, idx) => (
              <Badge 
                key={idx} 
                style={{ backgroundColor: `#${baseColors[base].toString(16)}`, color: '#000' }}
              >
                {base}
              </Badge>
            ))}
          </div>
          <p className="text-sm font-semibold mt-3">Your Sequence:</p>
          <div className="flex gap-2 flex-wrap min-h-[32px]">
            {currentSequence.map((base, idx) => (
              <Badge 
                key={idx} 
                variant="outline"
                style={{ borderColor: `#${baseColors[base].toString(16)}` }}
              >
                {base}
              </Badge>
            ))}
          </div>
        </div>

        <div 
          ref={containerRef} 
          className="w-full h-[350px] rounded-lg overflow-hidden border border-border"
        />

        <div className="flex flex-wrap gap-2">
          {bases.map(base => (
            <Button
              key={base}
              onClick={() => addBase(base)}
              variant="outline"
              size="sm"
              style={{ borderColor: `#${baseColors[base].toString(16)}` }}
            >
              Add {base}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={checkSequence} className="flex-1" disabled={currentSequence.length === 0}>
            Check Sequence
          </Button>
          <Button onClick={resetSequence} variant="outline">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
