import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import * as THREE from 'three';

interface NetworkSimulator3DProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

export const NetworkSimulator3D: React.FC<NetworkSimulator3DProps> = ({
  level,
  subtopic,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentPacket, setCurrentPacket] = useState<{ source: number; destination: number } | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');

  useEffect(() => {
    if (!containerRef.current) return;

    const nodeCount = level === 'easy' ? 5 : level === 'intermediate' ? 8 : 12;
    const targetScore = level === 'easy' ? 5 : level === 'intermediate' ? 8 : 10;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 30;
    camera.position.y = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00ffff, 2, 100);
    pointLight.position.set(0, 20, 10);
    scene.add(pointLight);

    // Create network nodes in 3D space
    const nodes: THREE.Mesh[] = [];
    const nodePositions: THREE.Vector3[] = [];
    const radius = 15;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(i * 0.5) * 3;

      const geometry = new THREE.SphereGeometry(0.8, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00ffaa,
        emissive: 0x00ffaa,
        emissiveIntensity: 0.5,
      });
      
      const node = new THREE.Mesh(geometry, material);
      node.position.set(x, y, z);
      scene.add(node);
      nodes.push(node);
      nodePositions.push(new THREE.Vector3(x, y, z));

      // Add node label
      const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffaa,
        transparent: true,
        opacity: 0.2,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(node.position);
      scene.add(glow);
    }

    // Create connections
    for (let i = 0; i < nodeCount; i++) {
      const nextNode = (i + 1) % nodeCount;
      const points = [nodePositions[i], nodePositions[nextNode]];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x00aa88, transparent: true, opacity: 0.4 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);
    }

    // Packet visualization
    let packet: THREE.Mesh | null = null;
    let packetSource: number = -1;
    let packetDest: number = -1;
    let packetProgress: number = 0;

    const generatePacket = () => {
      const source = Math.floor(Math.random() * nodeCount);
      let destination = Math.floor(Math.random() * nodeCount);
      while (destination === source) {
        destination = Math.floor(Math.random() * nodeCount);
      }

      packetSource = source;
      packetDest = destination;
      packetProgress = 0;

      setCurrentPacket({ source, destination });

      // Create packet mesh
      if (packet) scene.remove(packet);
      const packetGeometry = new THREE.OctahedronGeometry(0.5, 0);
      const packetMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0088,
        emissive: 0xff0088,
        emissiveIntensity: 0.8,
      });
      packet = new THREE.Mesh(packetGeometry, packetMaterial);
      packet.position.copy(nodePositions[source]);
      scene.add(packet);
    };

    generatePacket();

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodes);

      if (intersects.length > 0 && packet) {
        const clickedNodeIndex = nodes.indexOf(intersects[0].object as THREE.Mesh);
        
        if (clickedNodeIndex === packetDest) {
          // Correct destination
          const newScore = {
            correct: score.correct + 1,
            total: score.total + 1,
          };
          setScore(newScore);
          toast.success('Packet routed successfully!');

          // Animate packet to destination
          packetProgress = 0;
          const animatePacket = () => {
            if (!packet) return;
            packetProgress += 0.05;
            if (packetProgress >= 1) {
              if (newScore.total >= targetScore) {
                setGameState('completed');
                onComplete(newScore.correct, newScore.total);
              } else {
                setTimeout(generatePacket, 500);
              }
              return;
            }
            
            const start = nodePositions[packetSource];
            const end = nodePositions[packetDest];
            packet.position.lerpVectors(start, end, packetProgress);
            requestAnimationFrame(animatePacket);
          };
          animatePacket();
        } else {
          const newScore = {
            correct: score.correct,
            total: score.total + 1,
          };
          setScore(newScore);
          toast.error('Wrong destination!');
          
          if (newScore.total >= targetScore) {
            setGameState('completed');
            onComplete(newScore.correct, newScore.total);
          } else {
            setTimeout(generatePacket, 1000);
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate nodes
      nodes.forEach((node, i) => {
        node.rotation.y += 0.01;
        node.rotation.x += 0.005;
        
        // Pulse effect
        const scale = 1 + Math.sin(Date.now() * 0.003 + i) * 0.1;
        node.scale.set(scale, scale, scale);
      });

      // Rotate packet
      if (packet) {
        packet.rotation.y += 0.1;
        packet.rotation.x += 0.05;
      }

      // Camera orbit
      camera.position.x = Math.sin(Date.now() * 0.0002) * 35;
      camera.position.z = Math.cos(Date.now() * 0.0002) * 35;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('click', onMouseClick);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [level]);

  if (gameState === 'completed') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-4">3D Network Complete!</h2>
          <p className="text-lg mb-4">
            Score: {score.correct} / {score.total}
          </p>
          <p className="text-muted-foreground mb-6">
            Accuracy: {Math.round((score.correct / score.total) * 100)}%
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>3D Network Packet Routing</CardTitle>
          <Badge variant="secondary">
            Score: {score.correct}/{score.total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPacket !== null && (
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm font-semibold">
              Route packet from Node {currentPacket.source} to Node {currentPacket.destination}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Click on the destination node in the 3D network
            </p>
          </div>
        )}
        <div 
          ref={containerRef} 
          className="w-full h-[500px] rounded-lg overflow-hidden border border-border"
        />
      </CardContent>
    </Card>
  );
};
