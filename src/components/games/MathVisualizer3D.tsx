import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as THREE from 'three';

interface MathVisualizer3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const MathVisualizer3D: React.FC<MathVisualizer3DProps> = ({ level, subtopic, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [answer, setAnswer] = useState('');
  const [currentProblem, setCurrentProblem] = useState({ question: '', answer: 0 });

  useEffect(() => {
    generateProblem();
  }, [level]);

  const generateProblem = () => {
    const max = level === 'easy' ? 10 : level === 'intermediate' ? 50 : 100;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    setCurrentProblem({ 
      question: `${a} + ${b}`,
      answer: a + b
    });
  };

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
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Create 3D equation visualization
    const shapes: THREE.Mesh[] = [];
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 100);
      const material = new THREE.MeshPhongMaterial({ 
        color: Math.random() * 0xffffff,
        emissive: 0x220044
      });
      const torus = new THREE.Mesh(geometry, material);
      torus.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
      );
      scene.add(torus);
      shapes.push(torus);
    }

    camera.position.z = 20;

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      shapes.forEach((shape, i) => {
        shape.rotation.x += 0.01;
        shape.rotation.y += 0.01;
        shape.position.y = Math.sin(time + i) * 5;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const handleSubmit = () => {
    const userAnswer = parseInt(answer);
    const correct = userAnswer === currentProblem.answer;
    if (correct) setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
    setAnswer('');
    generateProblem();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>3D Math Equation Solver</span>
          <span className="text-sm">Score: {score}/{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[300px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">{currentProblem.question} = ?</p>
          <div className="flex gap-2">
            <Input 
              type="number" 
              value={answer} 
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
        <Button onClick={() => onComplete(score, total || 1)} variant="outline" className="w-full">
          Complete
        </Button>
      </CardContent>
    </Card>
  );
};
