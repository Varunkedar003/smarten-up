import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface NeuralNexus3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const NeuralNexus3D: React.FC<NeuralNexus3DProps> = ({ level, subtopic, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f1e);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ffaa, 2, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Create neural network layers
    const layers = level === 'easy' ? 3 : level === 'intermediate' ? 4 : 5;
    const neuronsPerLayer = level === 'easy' ? 4 : level === 'intermediate' ? 6 : 8;
    
    const neurons: THREE.Mesh[][] = [];
    
    for (let layer = 0; layer < layers; layer++) {
      const layerNeurons: THREE.Mesh[] = [];
      for (let i = 0; i < neuronsPerLayer; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x00ffaa,
          emissive: 0x003322
        });
        const neuron = new THREE.Mesh(geometry, material);
        
        neuron.position.x = layer * 4 - (layers * 2);
        neuron.position.y = (i - neuronsPerLayer / 2) * 1.5;
        neuron.position.z = 0;
        
        scene.add(neuron);
        layerNeurons.push(neuron);
        
        // Connect to previous layer
        if (layer > 0) {
          neurons[layer - 1].forEach(prevNeuron => {
            const points = [prevNeuron.position, neuron.position];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ 
              color: 0x00ffaa,
              opacity: 0.3,
              transparent: true
            });
            const line = new THREE.Line(geometry, material);
            scene.add(line);
          });
        }
      }
      neurons.push(layerNeurons);
    }

    camera.position.z = 15;
    camera.position.y = 0;

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      neurons.forEach((layer, layerIdx) => {
        layer.forEach((neuron, i) => {
          const pulse = Math.sin(time * 2 + layerIdx + i) * 0.5 + 0.5;
          (neuron.material as THREE.MeshPhongMaterial).emissive.setRGB(0, pulse * 0.5, pulse * 0.3);
          neuron.scale.setScalar(1 + pulse * 0.2);
        });
      });
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const trainNetwork = () => {
    setAccuracy(prev => Math.min(100, prev + 10));
    setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🧠 Neural Nexus 3D</span>
          <span className="text-sm">Accuracy: {accuracy}% | Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="flex gap-2">
          <Button onClick={trainNetwork} className="flex-1">Train Network</Button>
          <Button onClick={() => onComplete(score, total || 1)} variant="outline">Complete</Button>
        </div>
      </CardContent>
    </Card>
  );
};
