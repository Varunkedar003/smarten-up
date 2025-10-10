import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as THREE from 'three';
import { toast } from 'sonner';

interface AirportRunway3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const AirportRunway3D: React.FC<AirportRunway3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [queue, setQueue] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const maxSize = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 10;

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1520);

    const camera = new THREE.PerspectiveCamera(70, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    camera.position.set(0, 6, 10);
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
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    while (sceneRef.current.children.length > 2) {
      sceneRef.current.remove(sceneRef.current.children[2]);
    }

    const runwayGeo = new THREE.BoxGeometry(queue.length * 2 + 4, 0.1, 2);
    const runwayMat = new THREE.MeshPhongMaterial({ color: 0x1e293b });
    const runway = new THREE.Mesh(runwayGeo, runwayMat);
    runway.position.set(0, -0.5, 0);
    sceneRef.current!.add(runway);

    queue.forEach((value, i) => {
      const planeGeo = new THREE.ConeGeometry(0.4, 1.2, 8);
      const hue = (i * 40) % 360;
      const color = new THREE.Color(`hsl(${hue}, 70%, 55%)`);
      const planeMat = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 0.3 
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.z = -Math.PI / 2;
      plane.position.set(i * 2 - (queue.length - 1), 0, 0);
      sceneRef.current!.add(plane);

      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toString(), 64, 64);
      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      sprite.scale.set(1, 1, 1);
      sprite.position.set(i * 2 - (queue.length - 1), 0.8, 0);
      sceneRef.current!.add(sprite);
    });
  }, [queue]);

  const enqueue = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      toast.error('Please enter a valid flight number');
      return;
    }
    if (queue.length >= maxSize) {
      toast.error('Runway full!');
      return;
    }
    setQueue([...queue, value]);
    setInputValue('');
    toast.success(`Flight ${value} added to queue! ✈️`);
  };

  const dequeue = () => {
    if (queue.length === 0) {
      toast.error('No flights in queue!');
      return;
    }
    const departed = queue[0];
    setQueue(queue.slice(1));
    toast.success(`Flight ${departed} departed! ✈️`);
  };

  const peek = () => {
    if (queue.length === 0) {
      toast.info('No flights in queue');
      return;
    }
    toast.info(`Next flight: ${queue[0]}`);
  };

  const completeGame = () => {
    toast.success('Great job managing the airport queue! 🎉');
    setTimeout(() => onComplete(1, 1), 1200);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>✈️ Airport Runway Manager</span>
          <span className="text-sm text-muted-foreground">Queue: {queue.length}/{maxSize}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[350px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="space-y-3">
          <p className="text-sm">
            <strong>Queues</strong> follow FIFO (First In, First Out). First plane to arrive is first to depart!
          </p>
          <Input
            type="number"
            placeholder="Enter flight number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && enqueue()}
          />
          <div className="flex gap-2 flex-wrap">
            <Button onClick={enqueue}>Enqueue</Button>
            <Button onClick={dequeue} variant="destructive">Dequeue</Button>
            <Button onClick={peek} variant="outline">Peek</Button>
            <Button onClick={completeGame} variant="secondary">Complete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
