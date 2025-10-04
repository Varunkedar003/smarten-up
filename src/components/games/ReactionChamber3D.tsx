import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface ReactionChamber3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const ReactionChamber3D: React.FC<ReactionChamber3DProps> = ({ level, subtopic, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [temperature, setTemperature] = useState(25);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f1e);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xff6600, 2, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Reaction chamber (cylinder)
    const chamberGeometry = new THREE.CylinderGeometry(4, 4, 8, 32, 1, true);
    const chamberMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2244aa,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
    scene.add(chamber);

    // Molecules (particles)
    const moleculeCount = level === 'easy' ? 30 : level === 'intermediate' ? 50 : 80;
    const molecules: THREE.Mesh[] = [];

    for (let i = 0; i < moleculeCount; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 8, 8);
      const material = new THREE.MeshPhongMaterial({ 
        color: i % 2 === 0 ? 0xff0000 : 0x0000ff,
        emissive: i % 2 === 0 ? 0x660000 : 0x000066
      });
      const molecule = new THREE.Mesh(geometry, material);
      
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3.5;
      molecule.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 7,
        Math.sin(angle) * radius
      );
      
      molecule.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );
      
      scene.add(molecule);
      molecules.push(molecule);
    }

    camera.position.set(8, 5, 10);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      
      const speed = 1 + (temperature / 100);
      
      molecules.forEach(molecule => {
        molecule.position.add(molecule.userData.velocity.multiplyScalar(speed));
        
        // Bounce off walls
        const radius = 3.5;
        const height = 3.5;
        
        if (Math.sqrt(molecule.position.x ** 2 + molecule.position.z ** 2) > radius) {
          const angle = Math.atan2(molecule.position.z, molecule.position.x);
          molecule.position.x = Math.cos(angle) * radius;
          molecule.position.z = Math.sin(angle) * radius;
          molecule.userData.velocity.x *= -0.8;
          molecule.userData.velocity.z *= -0.8;
        }
        
        if (Math.abs(molecule.position.y) > height) {
          molecule.position.y = Math.sign(molecule.position.y) * height;
          molecule.userData.velocity.y *= -0.8;
        }
      });
      
      chamber.rotation.y += 0.005;
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level, temperature]);

  const heatReaction = () => {
    setTemperature(prev => Math.min(200, prev + 25));
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>⚗️ Reaction Chamber 3D</span>
          <span className="text-sm">Temp: {temperature}°C | Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={heatReaction} className="flex-1">Heat Reaction</Button>
          <Button onClick={() => onComplete(score, total || 1)} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
