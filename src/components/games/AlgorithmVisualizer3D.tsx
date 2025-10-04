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
  const [sorting, setSorting] = useState(false);
  const sceneRef = useRef<{ scene: THREE.Scene; camera: THREE.Camera; renderer: THREE.WebGLRenderer; cubes: THREE.Mesh[] } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

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
    const values = Array.from({ length: level === 'easy' ? 5 : level === 'intermediate' ? 8 : 12 }, () => Math.floor(Math.random() * 10) + 1);
    
    values.forEach((val, i) => {
      const geometry = new THREE.BoxGeometry(1, val * 0.5, 1);
      const material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.x = (i - values.length / 2) * 1.5;
      cube.position.y = val * 0.25;
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
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const handleSort = async () => {
    if (!sceneRef.current || sorting) return;
    setSorting(true);
    const { cubes } = sceneRef.current;
    
    // Bubble sort visualization
    for (let i = 0; i < cubes.length; i++) {
      for (let j = 0; j < cubes.length - i - 1; j++) {
        const h1 = (cubes[j].geometry as THREE.BoxGeometry).parameters.height;
        const h2 = (cubes[j + 1].geometry as THREE.BoxGeometry).parameters.height;
        
        if (h1 > h2) {
          // Swap positions with animation
          const x1 = cubes[j].position.x;
          cubes[j].position.x = cubes[j + 1].position.x;
          cubes[j + 1].position.x = x1;
          [cubes[j], cubes[j + 1]] = [cubes[j + 1], cubes[j]];
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
    
    setSorting(false);
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  const handleComplete = () => {
    onComplete(score, total || 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>3D Sorting Algorithm Visualizer</span>
          <span className="text-sm">Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={handleSort} disabled={sorting} className="flex-1">
            {sorting ? 'Sorting...' : 'Sort Array'}
          </Button>
          <Button onClick={handleComplete} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
