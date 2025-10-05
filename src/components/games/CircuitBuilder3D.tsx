import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface CircuitBuilder3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const CircuitBuilder3D: React.FC<CircuitBuilder3DProps> = ({ level, onComplete }) => {
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
      { q: 'AND gate: 1 AND 0 = ?', opts: ['0', '1', 'ERROR'], correct: 0 },
      { q: 'OR gate: 1 OR 0 = ?', opts: ['1', '0', 'ERROR'], correct: 0 },
      { q: 'NOT gate: NOT 1 = ?', opts: ['0', '1', 'ERROR'], correct: 0 },
      { q: 'XOR gate: 1 XOR 1 = ?', opts: ['0', '1', 'ERROR'], correct: 0 },
      { q: 'NAND gate: 1 NAND 1 = ?', opts: ['0', '1', 'ERROR'], correct: 0 },
      { q: 'Which gate always outputs 0 when both inputs are 0?', opts: ['AND', 'OR', 'XOR'], correct: 0 },
      { q: 'Which is a universal logic gate?', opts: ['NAND', 'AND', 'OR'], correct: 0 },
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
    scene.background = new THREE.Color(0x000510);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Circuit board
    const boardGeometry = new THREE.BoxGeometry(10, 0.2, 6);
    const boardMaterial = new THREE.MeshPhongMaterial({ color: 0x006400 });
    const board = new THREE.Mesh(boardGeometry, boardMaterial);
    board.position.y = -1;
    scene.add(board);

    // Logic gates (as cubes)
    const gateCount = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 8;
    const gates: THREE.Mesh[] = [];
    
    for (let i = 0; i < gateCount; i++) {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0xff6600,
        emissive: 0x330000
      });
      const gate = new THREE.Mesh(geometry, material);
      gate.position.x = (i - gateCount / 2) * 2;
      gate.position.y = 1;
      scene.add(gate);
      gates.push(gate);
      
      // Connecting wires
      const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
      const wireMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
      const wire = new THREE.Mesh(wireGeometry, wireMaterial);
      wire.position.x = gate.position.x;
      wire.position.y = 0;
      wire.rotation.z = Math.PI / 2;
      scene.add(wire);
    }

    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      gates.forEach((gate, i) => {
        gate.rotation.y += 0.01;
        const brightness = Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5;
        (gate.material as THREE.MeshPhongMaterial).emissive.setRGB(0, brightness * 0.5, 0);
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
          <span>3D Digital Logic Challenge</span>
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
