import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface VectorQuest3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const VectorQuest3D: React.FC<VectorQuest3DProps> = ({ level, subtopic, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const maxRounds = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 10;

  const generateQuestion = () => {
    const questions = [
      { q: 'What is a vector?', opts: ['Magnitude and direction', 'Just magnitude', 'Just direction'], correct: 0 },
      { q: 'What is the dot product used for?', opts: ['Finding angle', 'Cross product', 'Addition'], correct: 0 },
      { q: 'What is vector magnitude?', opts: ['Length/size', 'Direction', 'Components'], correct: 0 },
      { q: 'How to add vectors?', opts: ['Add components', 'Multiply', 'Divide'], correct: 0 },
      { q: 'What is a unit vector?', opts: ['Magnitude of 1', 'Magnitude of 0', 'Infinite magnitude'], correct: 0 },
    ];
    const selected = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(selected.q);
    setOptions(selected.opts);
    setCorrectIndex(selected.correct);
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x00ff00, 0x004400);
    scene.add(gridHelper);

    // Axes helper
    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    // Create vector arrows
    const vectorCount = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 8;
    const vectors: THREE.ArrowHelper[] = [];

    for (let i = 0; i < vectorCount; i++) {
      const direction = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      
      const length = 2 + Math.random() * 3;
      const color = new THREE.Color().setHSL(i / vectorCount, 0.8, 0.5);
      
      const arrow = new THREE.ArrowHelper(
        direction,
        new THREE.Vector3(0, 0, 0),
        length,
        color.getHex(),
        0.5,
        0.3
      );
      
      scene.add(arrow);
      vectors.push(arrow);
    }

    // Target sphere
    const targetGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const targetMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      emissive: 0x666600
    });
    const target = new THREE.Mesh(targetGeometry, targetMaterial);
    target.position.set(5, 2, 5);
    scene.add(target);

    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      vectors.forEach((arrow, i) => {
        const angle = time + i * (Math.PI * 2 / vectors.length);
        const newDir = new THREE.Vector3(
          Math.cos(angle),
          Math.sin(time * 0.5 + i),
          Math.sin(angle)
        ).normalize();
        arrow.setDirection(newDir);
      });
      
      target.position.y = 2 + Math.sin(time) * 1;
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [level]);

  const handleAnswer = (selectedIndex: number) => {
    const correct = selectedIndex === correctIndex;
    if (correct) setScore(prev => prev + 1);
    setTotal(prev => prev + 1);
    
    const newRounds = roundsPlayed + 1;
    setRoundsPlayed(newRounds);
    
    if (newRounds >= maxRounds) {
      onComplete(score + (correct ? 1 : 0), total + 1);
    } else {
      generateQuestion();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📐 Vector Mathematics Challenge</span>
          <span className="text-sm">Score: {score}/{total} • Round {roundsPlayed + 1}/{maxRounds}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[300px] rounded-lg overflow-hidden border-2 border-primary/20" />
        
        <div className="space-y-2">
          <p className="text-sm font-medium">{question}</p>
          <div className="grid gap-2 pt-2">
            {options.map((option, idx) => (
              <Button 
                key={idx} 
                variant="outline" 
                className="justify-start h-auto py-3"
                onClick={() => handleAnswer(idx)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
