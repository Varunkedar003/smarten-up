import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface CircuitBuilder3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const CircuitBuilder3D: React.FC<CircuitBuilder3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [powered, setPowered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Circuit board
    const boardGeometry = new THREE.BoxGeometry(10, 0.2, 6);
    const boardMaterial = new THREE.MeshPhongMaterial({ color: 0x006400 });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.y = -1;
    scene.add(board);

    // Logic gates (as cubes)
    const gateCount = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 8;
    const gates: THREE.Mesh[] = [];
    
    for (let i = 0; i < gateCount; i++) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0xff6600,
        emissive: 0x330000
      });
      const gate = new THREE.Mesh(geometry, material);
      gate.position.x = (i - gateCount / 2) * 2;
      gate.position.y = 1;
      scene.add(gate);
      gates.push(gate);
      
      // Connecting wires
      const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
      const wireMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
      const wire = new THREE.Mesh(wireGeometry, wireMaterial);
      wire.position.x = gate.position.x;
      wire.position.y = 0;
      wire.rotation.z = Math.PI / 2;
      scene.add(wire);
    }

    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      gates.forEach((gate, i) => {
        gate.rotation.y += 0.01;
        if (powered) {
          (gate.material as THREE.MeshPhongMaterial).emissive.setHex(0x00ff00);
        } else {
          (gate.material as THREE.MeshPhongMaterial).emissive.setHex(0x330000);
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level, powered]);

  const handlePowerToggle = () => {
    setPowered(!powered);
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>3D Digital Circuit Builder</span>
          <span className="text-sm">Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={handlePowerToggle} className="flex-1">
            {powered ? 'Power OFF' : 'Power ON'}
          </Button>
          <Button onClick={() => onComplete(score, total || 1)} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
