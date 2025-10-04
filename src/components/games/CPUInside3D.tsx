import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface CPUInside3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const CPUInside3D: React.FC<CPUInside3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [instructions, setInstructions] = useState(10);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1e);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffaa00, 2, 50);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // CPU Core
    const coreGeometry = new THREE.BoxGeometry(4, 0.5, 4);
    const coreMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      emissive: 0x111111
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // ALU, CU, Registers
    const components = [
      { name: 'ALU', color: 0xff6600, pos: [-2, 1, 0] as [number, number, number] },
      { name: 'CU', color: 0x00aaff, pos: [2, 1, 0] as [number, number, number] },
      { name: 'REG', color: 0x00ff66, pos: [0, 1, 2] as [number, number, number] }
    ];

    components.forEach(comp => {
      const geometry = new THREE.BoxGeometry(1.5, 1, 1.5);
      const material = new THREE.MeshPhongMaterial({ 
        color: comp.color,
        emissive: comp.color,
        emissiveIntensity: 0.3
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...comp.pos);
      scene.add(mesh);
    });

    // Data bus lines
    for (let i = 0; i < 8; i++) {
      const geometry = new THREE.BoxGeometry(0.1, 0.05, 5);
      const material = new THREE.MeshPhongMaterial({ color: 0xffaa00 });
      const bus = new THREE.Mesh(geometry, material);
      bus.position.x = (i - 3.5) * 0.5;
      bus.position.y = 0.3;
      scene.add(bus);
    }

    camera.position.set(5, 5, 8);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      core.rotation.y = time * 0.2;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const executeInstruction = () => {
    setInstructions(prev => Math.max(0, prev - 1));
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>⚙️ CPU Inside 3D</span>
          <span className="text-sm">Instructions: {instructions} | Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={executeInstruction} className="flex-1">Execute Instruction</Button>
          <Button onClick={() => onComplete(score, total || 1)} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
