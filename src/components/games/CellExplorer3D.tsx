import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface CellExplorer3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const CellExplorer3D: React.FC<CellExplorer3DProps> = ({ level, subtopic, onComplete }) => {
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
      { q: 'What is the powerhouse of the cell?', opts: ['Mitochondria', 'Nucleus', 'Ribosome'], correct: 0 },
      { q: 'Where is DNA stored?', opts: ['Nucleus', 'Mitochondria', 'Cytoplasm'], correct: 0 },
      { q: 'What makes proteins?', opts: ['Ribosomes', 'Nucleus', 'Membrane'], correct: 0 },
      { q: 'What controls what enters/exits?', opts: ['Cell membrane', 'Nucleus', 'Cytoplasm'], correct: 0 },
      { q: 'What is photosynthesis done in?', opts: ['Chloroplast', 'Mitochondria', 'Nucleus'], correct: 0 },
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
    scene.background = new THREE.Color(0xf0e5d8);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Cell membrane (outer sphere)
    const membraneGeometry = new THREE.SphereGeometry(8, 32, 32);
    const membraneMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffccaa,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial);
    scene.add(membrane);

    // Nucleus
    const nucleusGeometry = new THREE.SphereGeometry(2, 32, 32);
    const nucleusMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x663399,
      emissive: 0x220055
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    scene.add(nucleus);

    // Mitochondria
    const mitochondriaCount = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 8;
    const organelles: THREE.Mesh[] = [];

    for (let i = 0; i < mitochondriaCount; i++) {
      const geometry = new THREE.CapsuleGeometry(0.4, 1.5, 8, 16);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0xff6600,
        emissive: 0x663300
      });
      const mito = new THREE.Mesh(geometry, material);
      
      const angle = (i / mitochondriaCount) * Math.PI * 2;
      mito.position.x = Math.cos(angle) * 4;
      mito.position.z = Math.sin(angle) * 4;
      mito.position.y = Math.sin(i) * 2;
      
      scene.add(mito);
      organelles.push(mito);
    }

    // Ribosomes (small spheres)
    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.SphereGeometry(0.15, 8, 8);
      const material = new THREE.MeshPhongMaterial({ color: 0x00aa66 });
      const ribosome = new THREE.Mesh(geometry, material);
      
      ribosome.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12
      );
      
      scene.add(ribosome);
    }

    camera.position.set(10, 8, 12);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      nucleus.rotation.y += 0.005;
      
      organelles.forEach((org, i) => {
        const angle = time + (i / organelles.length) * Math.PI * 2;
        org.position.x = Math.cos(angle) * 4;
        org.position.z = Math.sin(angle) * 4;
        org.rotation.z += 0.02;
      });
      
      membrane.rotation.y += 0.002;
      
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
          <span>🔬 Cell Biology Challenge</span>
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
