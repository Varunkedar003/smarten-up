import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface DataTowerDefenseProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const DataTowerDefense: React.FC<DataTowerDefenseProps> = ({ level, subtopic, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [bugs, setBugs] = useState(5);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0033);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xff00ff, 2, 50);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Create towers (data structures)
    const towers: THREE.Mesh[] = [];
    const towerTypes = ['Stack', 'Queue', 'Tree', 'Graph'];
    
    towerTypes.forEach((type, i) => {
      const geometry = new THREE.CylinderGeometry(0.8, 1, 4, 8);
      const material = new THREE.MeshPhongMaterial({ 
        color: [0xff0088, 0x00ff88, 0x0088ff, 0xff8800][i],
        emissive: 0x220044
      });
      const tower = new THREE.Mesh(geometry, material);
      tower.position.x = (i - 1.5) * 4;
      tower.position.y = 2;
      scene.add(tower);
      towers.push(tower);
    });

    // Create bugs (enemies)
    const bugCount = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 8;
    const bugMeshes: THREE.Mesh[] = [];
    
    for (let i = 0; i < bugCount; i++) {
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        emissive: 0x660000
      });
      const bug = new THREE.Mesh(geometry, material);
      bug.position.set(
        (Math.random() - 0.5) * 15,
        Math.random() * 5,
        -10 + Math.random() * 5
      );
      scene.add(bug);
      bugMeshes.push(bug);
    }

    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      towers.forEach((tower, i) => {
        tower.rotation.y += 0.02;
        tower.position.y = 2 + Math.sin(time + i) * 0.2;
      });
      
      bugMeshes.forEach((bug, i) => {
        bug.position.z += 0.02;
        bug.rotation.x += 0.05;
        bug.rotation.y += 0.05;
        if (bug.position.z > 5) {
          bug.position.z = -10;
        }
      });
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const defendAttack = () => {
    setBugs(prev => Math.max(0, prev - 1));
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🛡️ Data Tower Defense</span>
          <span className="text-sm">Bugs: {bugs} | Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={defendAttack} className="flex-1">Defend!</Button>
          <Button onClick={() => onComplete(score, total || 1)} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
