import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface MatrixMaze3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const MatrixMaze3D: React.FC<MatrixMaze3DProps> = ({ level, subtopic, onComplete }) => {
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
      { q: 'What is matrix addition?', opts: ['Element-wise sum', 'Row by column', 'Determinant'], correct: 0 },
      { q: 'In matrix multiplication AxB, what must match?', opts: ['Columns of A = Rows of B', 'Rows of A = Rows of B', 'Any size'], correct: 0 },
      { q: 'What is the identity matrix?', opts: ['Diagonal 1s, rest 0s', 'All 1s', 'All 0s'], correct: 0 },
      { q: 'What is a transpose?', opts: ['Swap rows and columns', 'Inverse', 'Square'], correct: 0 },
      { q: 'What is the determinant used for?', opts: ['Invertibility', 'Size', 'Type'], correct: 0 },
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
    scene.background = new THREE.Color(0x0a0a0a);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x00ff00, 0.3);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ff00, 2, 50);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Create matrix grid
    const gridSize = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 10;
    const cubes: THREE.Mesh[] = [];

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x00ff00,
          emissive: 0x003300,
          transparent: true,
          opacity: 0.6
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = (x - gridSize / 2) * 1.2;
        cube.position.z = (z - gridSize / 2) * 1.2;
        cube.position.y = 0;
        scene.add(cube);
        cubes.push(cube);
      }
    }

    // Player
    const playerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const playerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      emissive: 0x666600
    });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.y = 1;
    scene.add(player);

    camera.position.set(gridSize * 0.8, gridSize * 1.2, gridSize * 0.8);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      cubes.forEach((cube, i) => {
        cube.position.y = Math.sin(time + i * 0.1) * 0.3;
        (cube.material as THREE.MeshPhongMaterial).opacity = 0.4 + Math.sin(time + i * 0.2) * 0.2;
      });
      
      player.rotation.y += 0.02;
      
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
          <span>🔢 Matrix Maze Challenge</span>
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
