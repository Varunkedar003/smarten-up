import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface BrainNetwork3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const BrainNetwork3D: React.FC<BrainNetwork3DProps> = ({ level, subtopic, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0520);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xff00aa, 2, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Create neural network
    const neuronCount = level === 'easy' ? 20 : level === 'intermediate' ? 40 : 60;
    const neurons: THREE.Mesh[] = [];
    const connections: THREE.Line[] = [];

    // Create neurons
    for (let i = 0; i < neuronCount; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 16, 16);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0xff00aa,
        emissive: 0x880044
      });
      const neuron = new THREE.Mesh(geometry, material);
      
      // Distribute in brain-like shape
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 5 + Math.random() * 2;
      
      neuron.position.x = radius * Math.sin(phi) * Math.cos(theta);
      neuron.position.y = radius * Math.cos(phi);
      neuron.position.z = radius * Math.sin(phi) * Math.sin(theta);
      
      scene.add(neuron);
      neurons.push(neuron);
    }

    // Create connections
    for (let i = 0; i < neurons.length; i++) {
      const connectionsPerNeuron = 3;
      for (let j = 0; j < connectionsPerNeuron; j++) {
        const targetIdx = Math.floor(Math.random() * neurons.length);
        if (targetIdx !== i) {
          const points = [neurons[i].position, neurons[targetIdx].position];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ 
            color: 0x00aaff,
            transparent: true,
            opacity: 0.2
          });
          const line = new THREE.Line(geometry, material);
          scene.add(line);
          connections.push(line);
        }
      }
    }

    camera.position.set(10, 5, 10);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      neurons.forEach((neuron, i) => {
        const pulse = Math.sin(time * 3 + i * 0.5);
        const scale = 1 + pulse * 0.3;
        neuron.scale.setScalar(scale);
        (neuron.material as THREE.MeshPhongMaterial).emissive.setRGB(
          0.5 + pulse * 0.3,
          0,
          0.2 + pulse * 0.2
        );
      });
      
      camera.position.x = Math.cos(time * 0.2) * 12;
      camera.position.z = Math.sin(time * 0.2) * 12;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const activateNeuron = () => {
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🧠 Brain Network 3D</span>
          <span className="text-sm">Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={activateNeuron} className="flex-1">Activate Neural Path</Button>
          <Button onClick={() => onComplete(score, total || 1)} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
