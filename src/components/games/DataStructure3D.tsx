import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

interface DataStructure3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const DataStructure3D: React.FC<DataStructure3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const maxRounds = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 10;
  const sceneRef = useRef<{ scene: THREE.Scene; camera: THREE.Camera; renderer: THREE.WebGLRenderer; nodes: THREE.Mesh[] } | null>(null);

  const generateQuestion = () => {
    const questions = [
      { q: 'What traversal visits nodes level by level?', opts: ['BFS (Breadth-First)', 'DFS (Depth-First)', 'Inorder', 'Postorder'], correct: 0 },
      { q: 'In a binary search tree, where is the smallest value?', opts: ['Leftmost node', 'Rightmost node', 'Root node', 'Any leaf'], correct: 0 },
      { q: 'Which traversal processes left subtree, root, then right?', opts: ['Inorder', 'Preorder', 'Postorder', 'Level-order'], correct: 0 },
      { q: 'What is the height of a tree with 7 nodes in perfect balance?', opts: ['3', '2', '4', '7'], correct: 1 },
      { q: 'In preorder traversal, what is processed first?', opts: ['Root', 'Left child', 'Right child', 'Leaves'], correct: 0 },
    ];
    const selected = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(selected.q);
    setOptions(selected.opts);
    setCorrectIndex(selected.correct);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    generateQuestion();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00ff88, 1, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // Create tree structure
    const nodes: THREE.Mesh[] = [];
    const nodeCount = level === 'easy' ? 7 : level === 'intermediate' ? 15 : 31;
    
    for (let i = 0; i < nodeCount; i++) {
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ffaa,
        emissive: 0x002200,
        shininess: 100
      });
      const node = new THREE.Mesh(geometry, material);
      
      const level = Math.floor(Math.log2(i + 1));
      const posInLevel = i - (Math.pow(2, level) - 1);
      const spacing = 8 / Math.pow(2, level);
      
      node.position.x = (posInLevel - Math.pow(2, level) / 2) * spacing;
      node.position.y = 10 - level * 3;
      node.position.z = 0;
      
      scene.add(node);
      nodes.push(node);
      
      // Add connecting lines
      if (i > 0) {
        const parentIdx = Math.floor((i - 1) / 2);
        const material = new THREE.LineBasicMaterial({ color: 0x0088ff });
        const points = [nodes[parentIdx].position, node.position];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
      }
    }

    camera.position.z = 20;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    sceneRef.current = { scene, camera, renderer, nodes };

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      nodes.forEach((node, i) => {
        node.position.y += Math.sin(time + i * 0.5) * 0.01;
        node.rotation.y += 0.02;
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
          <span>3D Binary Tree Challenge</span>
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
