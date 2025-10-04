import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface GravitySimulator3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const GravitySimulator3D: React.FC<GravitySimulator3DProps> = ({ level, subtopic, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x222222, 1);
    scene.add(ambientLight);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Planets
    const planetCount = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 8;
    const planets: { mesh: THREE.Mesh; radius: number; speed: number }[] = [];

    for (let i = 0; i < planetCount; i++) {
      const size = 0.3 + Math.random() * 0.3;
      const geometry = new THREE.SphereGeometry(size, 16, 16);
      const material = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5)
      });
      const planet = new THREE.Mesh(geometry, material);
      
      const radius = 3 + i * 2;
      const speed = 0.5 / (radius * 0.5);
      
      planets.push({ mesh: planet, radius, speed });
      scene.add(planet);

      // Orbit line
      const orbitGeometry = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x444444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      // Point light for sun glow
      const pointLight = new THREE.PointLight(0xffff00, 0.5, 50);
      sun.add(pointLight);
    }

    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      planets.forEach(({ mesh, radius, speed }) => {
        const angle = time * speed;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.z = Math.sin(angle) * radius;
        mesh.rotation.y += 0.05;
      });
      
      sun.rotation.y += 0.005;
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const addPlanet = () => {
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🌌 Gravity Simulator 3D</span>
          <span className="text-sm">Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={addPlanet} className="flex-1">Add Planet</Button>
          <Button onClick={() => onComplete(score, total || 1)} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
