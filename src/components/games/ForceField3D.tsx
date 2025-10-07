import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface ForceField3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const ForceField3D: React.FC<ForceField3DProps> = ({ level, subtopic, onComplete }) => {
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
      { q: 'What is Newton\'s 2nd Law?', opts: ['F = ma', 'E = mc²', 'v = d/t'], correct: 0 },
      { q: 'What opposes motion?', opts: ['Friction', 'Gravity', 'Momentum'], correct: 0 },
      { q: 'What is momentum?', opts: ['Mass × Velocity', 'Force × Time', 'Mass × Acceleration'], correct: 0 },
      { q: 'For every action there is...', opts: ['Equal opposite reaction', 'No reaction', 'Bigger reaction'], correct: 0 },
      { q: 'What is the unit of force?', opts: ['Newton (N)', 'Joule (J)', 'Watt (W)'], correct: 0 },
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
    scene.background = new THREE.Color(0x001122);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00aaff, 2, 50);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Create force vectors
    const vectorCount = level === 'easy' ? 4 : level === 'intermediate' ? 6 : 10;
    const vectors: THREE.Group[] = [];

    for (let i = 0; i < vectorCount; i++) {
      const group = new THREE.Group();
      
      // Arrow shaft
      const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
      const shaftMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(i / vectorCount, 0.8, 0.5)
      });
      const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
      shaft.position.y = 1.5;
      group.add(shaft);
      
      // Arrow head
      const headGeometry = new THREE.ConeGeometry(0.3, 0.6, 8);
      const head = new THREE.Mesh(headGeometry, shaftMaterial);
      head.position.y = 3.3;
      group.add(head);
      
      const angle = (i / vectorCount) * Math.PI * 2;
      group.position.x = Math.cos(angle) * 5;
      group.position.z = Math.sin(angle) * 5;
      group.rotation.z = angle;
      
      scene.add(group);
      vectors.push(group);
    }

    // Central object
    const objectGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const objectMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      emissive: 0x666600
    });
    const object = new THREE.Mesh(objectGeometry, objectMaterial);
    scene.add(object);

    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      vectors.forEach((vec, i) => {
        vec.position.y = Math.sin(time + i) * 0.5;
      });
      
      object.rotation.y += 0.02;
      
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
          <span>⚡ Forces & Motion Challenge</span>
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
