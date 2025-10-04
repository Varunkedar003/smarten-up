import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface BridgeBuilder3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const BridgeBuilder3D: React.FC<BridgeBuilder3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [stress, setStress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Ground/Water
    const waterGeometry = new THREE.PlaneGeometry(50, 50);
    const waterMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x0066aa,
      transparent: true,
      opacity: 0.7
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2;
    scene.add(water);

    // Bridge supports
    const pillarCount = level === 'easy' ? 2 : level === 'intermediate' ? 3 : 4;
    for (let i = 0; i <= pillarCount; i++) {
      const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
      const pillarMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.x = (i / pillarCount) * 12 - 6;
      pillar.position.y = 0;
      scene.add(pillar);
    }

    // Bridge deck
    const deckGeometry = new THREE.BoxGeometry(13, 0.3, 2);
    const deckMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 2;
    scene.add(deck);

    // Cables
    for (let i = 0; i < pillarCount + 1; i++) {
      const cableGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 8);
      const cableMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
      const cable = new THREE.Mesh(cableGeometry, cableMaterial);
      cable.position.x = (i / pillarCount) * 12 - 6;
      cable.position.y = 3.5;
      cable.rotation.z = Math.PI / 6;
      scene.add(cable);
    }

    camera.position.set(8, 5, 12);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const addSupport = () => {
    setStress(prev => Math.max(0, prev - 10));
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  const testLoad = () => {
    setStress(prev => Math.min(100, prev + 20));
    setTotal(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🌉 Bridge Builder 3D</span>
          <span className="text-sm">Stress: {stress}% | Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={addSupport} className="flex-1">Add Support</Button>
          <Button onClick={testLoad} variant="secondary" className="flex-1">Test Load</Button>
          <Button onClick={() => onComplete(score, total || 1)} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
