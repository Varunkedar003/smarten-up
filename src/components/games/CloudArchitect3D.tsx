import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface CloudArchitect3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const CloudArchitect3D: React.FC<CloudArchitect3DProps> = ({ level, subtopic, onComplete }) => {
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
      { q: 'What does AWS stand for?', opts: ['Amazon Web Services', 'Advanced Web System', 'Automated Web Server'], correct: 0 },
      { q: 'Which service provides scalable storage?', opts: ['S3', 'EC2', 'Lambda'], correct: 0 },
      { q: 'What is EC2 used for?', opts: ['Virtual servers', 'Storage', 'Databases'], correct: 0 },
      { q: 'What handles automatic scaling?', opts: ['Auto Scaling', 'S3', 'CloudFront'], correct: 0 },
      { q: 'Which distributes content globally?', opts: ['CloudFront CDN', 'EC2', 'RDS'], correct: 0 },
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
    scene.background = new THREE.Color(0x001a33);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00aaff, 2, 100);
    pointLight.position.set(0, 15, 10);
    scene.add(pointLight);

    // Create cloud infrastructure
    const servers: THREE.Mesh[] = [];
    const serverCount = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 8;
    
    for (let i = 0; i < serverCount; i++) {
      const geometry = new THREE.BoxGeometry(2, 3, 1);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x0088ff,
        emissive: 0x003366,
        transparent: true,
        opacity: 0.8
      });
      const server = new THREE.Mesh(geometry, material);
      
      const angle = (i / serverCount) * Math.PI * 2;
      const radius = 8;
      server.position.x = Math.cos(angle) * radius;
      server.position.z = Math.sin(angle) * radius;
      server.position.y = 0;
      
      scene.add(server);
      servers.push(server);
      
      // Add data flow lines
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        server.position.clone()
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      scene.add(line);
    }

    // Central cloud hub
    const hubGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const hubMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff,
      emissive: 0x0088ff,
      transparent: true,
      opacity: 0.9
    });
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    scene.add(hub);

    camera.position.set(0, 12, 15);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      
      hub.rotation.y += 0.02;
      servers.forEach((server, i) => {
        server.position.y = Math.sin(time + i * 0.5) * 0.5;
        server.rotation.y += 0.01;
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
          <span>☁️ Cloud Architect Challenge</span>
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