import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface MatrixMaze3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const MatrixMaze3D: React.FC<MatrixMaze3DProps> = ({ level, subtopic, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x00ff00, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ff00, 2, 50);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Create matrix grid
    const gridSize = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 10;
    const cubes: THREE.Mesh[] = [];

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x00ff00,
          emissive: 0x003300,
          transparent: true,
          opacity: 0.6
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = (x - gridSize / 2) * 1.2;
        cube.position.z = (z - gridSize / 2) * 1.2;
        cube.position.y = 0;
        scene.add(cube);
        cubes.push(cube);
      }
    }

    // Player
    const playerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const playerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      emissive: 0x666600
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = 1;
    scene.add(player);

    camera.position.set(gridSize * 0.8, gridSize * 1.2, gridSize * 0.8);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      cubes.forEach((cube, i) => {
        cube.position.y = Math.sin(time + i * 0.1) * 0.3;
        (cube.material as THREE.MeshPhongMaterial).opacity = 0.4 + Math.sin(time + i * 0.2) * 0.2;
      });
      
      player.rotation.y += 0.02;
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const transform = () => {
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔢 Matrix Maze 3D</span>
          <span className="text-sm">Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={transform} className="flex-1">Transform Matrix</Button>
          <Button onClick={() => onComplete(score, total || 1)} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
