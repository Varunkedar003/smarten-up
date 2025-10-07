import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface ReactionChamber3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const ReactionChamber3D: React.FC<ReactionChamber3DProps> = ({ level, subtopic, onComplete }) => {
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
      { q: 'What speeds up a reaction?', opts: ['Catalyst', 'Inhibitor', 'Water'], correct: 0 },
      { q: 'What is equilibrium?', opts: ['Forward = Reverse rate', 'No reaction', 'Only forward'], correct: 0 },
      { q: 'What is activation energy?', opts: ['Energy to start reaction', 'Product energy', 'Total energy'], correct: 0 },
      { q: 'What happens when you heat a reaction?', opts: ['Usually speeds up', 'Always slows down', 'No effect'], correct: 0 },
      { q: 'What is an exothermic reaction?', opts: ['Releases heat', 'Absorbs heat', 'No heat change'], correct: 0 },
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
    scene.background = new THREE.Color(0x0f0f1e);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xff6600, 2, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // Reaction chamber (cylinder)
    const chamberGeometry = new THREE.CylinderGeometry(4, 4, 8, 32, 1, true);
    const chamberMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2244aa,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const chamber = new THREE.Mesh(chamberGeometry, chamberMaterial);
    scene.add(chamber);

    // Molecules (particles)
    const moleculeCount = level === 'easy' ? 30 : level === 'intermediate' ? 50 : 80;
    const molecules: THREE.Mesh[] = [];

    for (let i = 0; i < moleculeCount; i++) {
      const geometry = new THREE.SphereGeometry(0.2, 8, 8);
      const material = new THREE.MeshPhongMaterial({ 
        color: i % 2 === 0 ? 0xff0000 : 0x0000ff,
        emissive: i % 2 === 0 ? 0x660000 : 0x000066
      });
      const molecule = new THREE.Mesh(geometry, material);
      
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3.5;
      molecule.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 7,
        Math.sin(angle) * radius
      );
      
      molecule.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );
      
      scene.add(molecule);
      molecules.push(molecule);
    }

    camera.position.set(8, 5, 10);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);
      
      const speed = 1.5;
      
      molecules.forEach(molecule => {
        molecule.position.add(molecule.userData.velocity.multiplyScalar(speed));
        
        // Bounce off walls
        const radius = 3.5;
        const height = 3.5;
        
        if (Math.sqrt(molecule.position.x ** 2 + molecule.position.z ** 2) > radius) {
          const angle = Math.atan2(molecule.position.z, molecule.position.x);
          molecule.position.x = Math.cos(angle) * radius;
          molecule.position.z = Math.sin(angle) * radius;
          molecule.userData.velocity.x *= -0.8;
          molecule.userData.velocity.z *= -0.8;
        }
        
        if (Math.abs(molecule.position.y) > height) {
          molecule.position.y = Math.sign(molecule.position.y) * height;
          molecule.userData.velocity.y *= -0.8;
        }
      });
      
      chamber.rotation.y += 0.005;
      
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
          <span>⚗️ Chemical Reactions Challenge</span>
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
