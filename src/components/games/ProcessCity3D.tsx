import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface ProcessCity3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const ProcessCity3D: React.FC<ProcessCity3DProps> = ({ level, subtopic, onComplete }) => {
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
      { q: 'What is a process?', opts: ['Running program instance', 'Hard disk file', 'Network connection'], correct: 0 },
      { q: 'What is a deadlock?', opts: ['Processes waiting on each other', 'Process finished', 'Fast execution'], correct: 0 },
      { q: 'Which schedules CPU time?', opts: ['OS Scheduler', 'Compiler', 'Memory'], correct: 0 },
      { q: 'What is virtual memory?', opts: ['Disk as RAM extension', 'Physical RAM', 'Cache'], correct: 0 },
      { q: 'What is a thread?', opts: ['Lightweight process unit', 'Heavy process', 'File pointer'], correct: 0 },
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
    scene.background = new THREE.Color(0x0a1428);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Create city of processes
    const buildings: THREE.Mesh[] = [];
    const processCount = level === 'easy' ? 6 : level === 'intermediate' ? 10 : 15;
    
    for (let i = 0; i < processCount; i++) {
      const height = 2 + Math.random() * 4;
      const geometry = new THREE.BoxGeometry(1.5, height, 1.5);
      const material = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
        emissive: 0x111111
      });
      const building = new THREE.Mesh(geometry, material);
      
      const gridSize = Math.ceil(Math.sqrt(processCount));
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      building.position.x = (col - gridSize / 2) * 3;
      building.position.z = (row - gridSize / 2) * 3;
      building.position.y = height / 2;
      
      scene.add(building);
      buildings.push(building);
    }

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a2e });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      buildings.forEach((building, i) => {
        (building.material as THREE.MeshPhongMaterial).emissive.setRGB(
          Math.sin(time + i) * 0.2 + 0.2,
          0,
          Math.cos(time + i) * 0.2 + 0.2
        );
      });
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
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
          <span>🏙️ Process City Challenge</span>
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