import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { toast } from 'sonner';

interface BubbleUpArena3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const BubbleUpArena3D: React.FC<BubbleUpArena3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const barsRef = useRef<THREE.Mesh[]>([]);
  const [arr, setArr] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [sorting, setSorting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const length = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 10;

  useEffect(() => {
    const nums = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
    setArr(nums);
    setSorted([]);
    setComparing([]);
    setCompleted(false);
  }, [length]);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1a);

    const camera = new THREE.PerspectiveCamera(70, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    camera.position.set(0, 8, 18);
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
    barsRef.current = [];

    const spacing = 2.2;
    const baseY = -2;

    arr.forEach((value, i) => {
      const height = Math.max(1, (value / 100) * 7);
      const geometry = new THREE.BoxGeometry(1.8, height, 1.8);
      
      let color = 0x3b82f6;
      if (sorted.includes(i)) color = 0x22c55e;
      else if (comparing.includes(i)) color = 0xf59e0b;
      
      const material = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 0.2 
      });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set((i - (arr.length - 1) / 2) * spacing, baseY + height / 2, 0);
      sceneRef.current!.add(bar);
      barsRef.current.push(bar);

      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toString(), 64, 64);
      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      sprite.scale.set(1.5, 1.5, 1);
      sprite.position.set((i - (arr.length - 1) / 2) * spacing, baseY + height + 1.2, 0);
      sceneRef.current!.add(sprite);
    });
  }, [arr, comparing, sorted]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const bubbleSort = async () => {
    setSorting(true);
    const arrCopy = [...arr];
    const n = arrCopy.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1]);
        await sleep(600);
        
        if (arrCopy[j] > arrCopy[j + 1]) {
          const temp = arrCopy[j];
          arrCopy[j] = arrCopy[j + 1];
          arrCopy[j + 1] = temp;
          setArr([...arrCopy]);
          await sleep(400);
        }
      }
      setSorted(prev => [...prev, n - i - 1]);
    }
    setSorted(prev => [...prev, 0]);
    setComparing([]);
    setSorting(false);
    setCompleted(true);
    toast.success('Bubble sort complete! 🎉');
    setTimeout(() => onComplete(1, 1), 1200);
  };

  const shuffle = () => {
    const nums = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
    setArr(nums);
    setSorted([]);
    setComparing([]);
    setCompleted(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🫧 Bubble Up Arena</span>
          <span className="text-sm text-muted-foreground">Bubble Sort Visualizer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span className="text-xs">Unsorted</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-amber-500 rounded" />
              <span className="text-xs">Comparing</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-xs">Sorted</span>
            </div>
          </div>
          <p className="text-sm">
            Watch how <strong>Bubble Sort</strong> compares adjacent elements and swaps them if they're in the wrong order. 
            Larger values "bubble up" to the end!
          </p>
          <div className="flex gap-2">
            <Button onClick={bubbleSort} disabled={sorting || completed}>
              {sorting ? 'Sorting...' : 'Start Bubble Sort'}
            </Button>
            <Button variant="secondary" onClick={shuffle} disabled={sorting}>
              Shuffle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
