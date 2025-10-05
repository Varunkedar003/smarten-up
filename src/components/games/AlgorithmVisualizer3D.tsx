import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface AlgorithmVisualizer3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const AlgorithmVisualizer3D: React.FC<AlgorithmVisualizer3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentArray, setCurrentArray] = useState<number[]>([]);
  const [options, setOptions] = useState<number[][]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const maxRounds = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 10;
  const sceneRef = useRef<{ scene: THREE.Scene; camera: THREE.Camera; renderer: THREE.WebGLRenderer; cubes: THREE.Mesh[] } | null>(null);

  const generateRound = () => {
    const len = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 9;
    const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 50) + 1);
    const sorted = [...arr].sort((a, b) => a - b);
    
    // Generate wrong options
    const wrong1 = [...sorted];
    if (wrong1.length > 1) {
      const i = Math.floor(Math.random() * (wrong1.length - 1));
      [wrong1[i], wrong1[i + 1]] = [wrong1[i + 1], wrong1[i]];
    }
    
    const wrong2 = [...sorted].reverse();
    
    const allOptions = [sorted, wrong1, wrong2].sort(() => Math.random() - 0.5);
    const correctIdx = allOptions.findIndex(opt => JSON.stringify(opt) === JSON.stringify(sorted));
    
    setCurrentArray(arr);
    setOptions(allOptions);
    setCorrectIndex(correctIdx);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    generateRound();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const cubes: THREE.Mesh[] = [];
    currentArray.forEach((val, i) => {
      const geometry = new THREE.BoxGeometry(1, val * 0.1, 1);
      const material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = (i - currentArray.length / 2) * 1.5;
      cube.position.y = val * 0.05;
      scene.add(cube);
      cubes.push(cube);
    });

    camera.position.z = level === 'easy' ? 10 : level === 'intermediate' ? 15 : 20;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    sceneRef.current = { scene, camera, renderer, cubes };

    const animate = () => {
      requestAnimationFrame(animate);
      cubes.forEach(cube => {
        cube.rotation.y += 0.005;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [currentArray, level]);

  const handleAnswer = (selectedIndex: number) => {
    const correct = selectedIndex === correctIndex;
    if (correct) {
      setScore(prev => prev + 1);
    }
    setTotal(prev => prev + 1);
    
    const newRounds = roundsPlayed + 1;
    setRoundsPlayed(newRounds);
    
    if (newRounds >= maxRounds) {
      onComplete(score + (correct ? 1 : 0), total + 1);
    } else {
      generateRound();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>3D Sorting Algorithm Challenge</span>
          <span className="text-sm">Score: {score}/{total} • Round {roundsPlayed + 1}/{maxRounds}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[300px] rounded-lg overflow-hidden border-2 border-primary/20" />
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Unsorted array: <code>[{currentArray.join(', ')}]</code></p>
          <p className="text-sm text-muted-foreground">Which option shows the correctly sorted array (ascending)?</p>
          
          <div className="grid gap-2 pt-2">
            {options.map((option, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                className="justify-start h-auto py-3 text-left"
                onClick={() => handleAnswer(idx)}
              >
                <code className="text-sm">[{option.join(', ')}]</code>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
