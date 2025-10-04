import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface DataStructure3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const DataStructure3D: React.FC<DataStructure3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const sceneRef = useRef<{ scene: THREE.Scene; camera: THREE.Camera; renderer: THREE.WebGLRenderer; nodes: THREE.Mesh[] } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ff88, 1, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Create tree structure
    const nodes: THREE.Mesh[] = [];
    const nodeCount = level === 'easy' ? 7 : level === 'intermediate' ? 15 : 31;
    
    for (let i = 0; i < nodeCount; i++) {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ffaa,
        emissive: 0x002200,
        shininess: 100
      });
      const node = new THREE.Mesh(geometry, material);
      
      const level = Math.floor(Math.log2(i + 1));
      const posInLevel = i - (Math.pow(2, level) - 1);
      const spacing = 8 / Math.pow(2, level);
      
      node.position.x = (posInLevel - Math.pow(2, level) / 2) * spacing;
      node.position.y = 10 - level * 3;
      node.position.z = 0;
      
      scene.add(node);
      nodes.push(node);
      
      // Add connecting lines
      if (i > 0) {
        const parentIdx = Math.floor((i - 1) / 2);
        const material = new THREE.LineBasicMaterial({ color: 0x0088ff });
        const points = [nodes[parentIdx].position, node.position];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
      }
    }

    camera.position.z = 20;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    sceneRef.current = { scene, camera, renderer, nodes };

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      nodes.forEach((node, i) => {
        node.position.y += Math.sin(time + i * 0.5) * 0.01;
        node.rotation.y += 0.02;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const handleTraverse = () => {
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>3D Binary Tree Visualization</span>
          <span className="text-sm">Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={handleTraverse} className="flex-1">Traverse Tree</Button>
          <Button onClick={() => onComplete(score, total || 1)} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
