import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface DatabaseDesigner3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const DatabaseDesigner3D: React.FC<DatabaseDesigner3DProps> = ({ level, onComplete }) => {
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
      { q: 'Which SQL keyword retrieves data from a database?', opts: ['SELECT', 'INSERT', 'UPDATE'], correct: 0 },
      { q: 'What does INNER JOIN do?', opts: ['Returns matching rows from both tables', 'Returns all rows from left table', 'Deletes rows'], correct: 0 },
      { q: 'What is a primary key?', opts: ['Unique identifier for rows', 'Foreign reference', 'Index'], correct: 0 },
      { q: 'Which is fastest for lookups?', opts: ['Indexed column', 'Non-indexed column', 'Text field'], correct: 0 },
      { q: 'What is normalization?', opts: ['Removing redundancy', 'Adding indexes', 'Backing up'], correct: 0 },
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
    scene.background = new THREE.Color(0x0d1117);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0x00aaff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Create database tables as 3D boxes
    const tableCount = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 8;
    const tables: THREE.Mesh[] = [];
    
    for (let i = 0; i < tableCount; i++) {
      const geometry = new THREE.BoxGeometry(2, 3, 0.5);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x0066cc,
        emissive: 0x001133
      });
      const table = new THREE.Mesh(geometry, material);
      
      const angle = (i / tableCount) * Math.PI * 2;
      const radius = 8;
      table.position.x = Math.cos(angle) * radius;
      table.position.z = Math.sin(angle) * radius;
      table.position.y = 0;
      table.lookAt(0, 0, 0);
      
      scene.add(table);
      tables.push(table);
      
      // Add connecting lines (relationships)
      if (i > 0) {
        const material = new THREE.LineBasicMaterial({ color: 0x00ff88 });
        const points = [tables[0].position.clone(), table.position.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
      }
    }

    camera.position.y = 10;
    camera.position.z = 15;
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      tables.forEach((table, i) => {
        table.rotation.y = time + i * 0.5;
        table.position.y = Math.sin(time + i) * 0.5;
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
          <span>3D Database Design Challenge</span>
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