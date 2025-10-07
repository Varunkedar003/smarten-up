import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface BridgeBuilder3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const BridgeBuilder3D: React.FC<BridgeBuilder3DProps> = ({ level, onComplete }) => {
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
      { q: 'Which bridge type is strongest for long spans?', opts: ['Suspension', 'Beam', 'Arch'], correct: 0 },
      { q: 'What force pulls down on a bridge?', opts: ['Gravity/Weight', 'Friction', 'Magnetism'], correct: 0 },
      { q: 'What is tension in a cable?', opts: ['Pulling force', 'Pushing force', 'Twisting force'], correct: 0 },
      { q: 'What is compression in a column?', opts: ['Pushing/squeezing force', 'Pulling force', 'Bending force'], correct: 0 },
      { q: 'What material is strongest?', opts: ['Steel', 'Wood', 'Concrete'], correct: 0 },
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
    scene.background = new THREE.Color(0x87ceeb);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Ground/Water
    const waterGeometry = new THREE.PlaneGeometry(50, 50);
    const waterMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x0066aa,
      transparent: true,
      opacity: 0.7
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -2;
    scene.add(water);

    // Bridge supports
    const pillarCount = level === 'easy' ? 2 : level === 'intermediate' ? 3 : 4;
    for (let i = 0; i <= pillarCount; i++) {
      const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
      const pillarMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.x = (i / pillarCount) * 12 - 6;
      pillar.position.y = 0;
      scene.add(pillar);
    }

    // Bridge deck
    const deckGeometry = new THREE.BoxGeometry(13, 0.3, 2);
    const deckMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 2;
    scene.add(deck);

    // Cables
    for (let i = 0; i < pillarCount + 1; i++) {
      const cableGeometry = new THREE.CylinderGeometry(0.05, 0.05, 5, 8);
      const cableMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
      const cable = new THREE.Mesh(cableGeometry, cableMaterial);
      cable.position.x = (i / pillarCount) * 12 - 6;
      cable.position.y = 3.5;
      cable.rotation.z = Math.PI / 6;
      scene.add(cable);
    }

    camera.position.set(8, 5, 12);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
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
          <span>🌉 Bridge Engineering Challenge</span>
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
