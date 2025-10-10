import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { toast } from 'sonner';

interface PivotQuest3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const PivotQuest3D: React.FC<PivotQuest3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [arr, setArr] = useState<number[]>([]);
  const [pivot, setPivot] = useState<number>(-1);
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
    setPivot(-1);
    setCompleted(false);
  }, [length]);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f0a1a);

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

    const spacing = 2.2;
    const baseY = -2;

    arr.forEach((value, i) => {
      const height = Math.max(1, (value / 100) * 7);
      const geometry = new THREE.BoxGeometry(1.8, height, 1.8);
      
      let color = 0x6366f1;
      if (sorted.includes(i)) color = 0x22c55e;
      else if (i === pivot) color = 0xef4444;
      else if (comparing.includes(i)) color = 0xf59e0b;
      
      const material = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 0.25 
      });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set((i - (arr.length - 1) / 2) * spacing, baseY + height / 2, 0);
      sceneRef.current!.add(bar);

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
  }, [arr, comparing, sorted, pivot]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const partition = async (low: number, high: number, arrCopy: number[]) => {
    const pivotValue = arrCopy[high];
    setPivot(high);
    await sleep(600);
    
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      setComparing([j, high]);
      await sleep(400);
      
      if (arrCopy[j] < pivotValue) {
        i++;
        [arrCopy[i], arrCopy[j]] = [arrCopy[j], arrCopy[i]];
        setArr([...arrCopy]);
        await sleep(300);
      }
    }
    
    [arrCopy[i + 1], arrCopy[high]] = [arrCopy[high], arrCopy[i + 1]];
    setArr([...arrCopy]);
    setSorted(prev => [...prev, i + 1]);
    setPivot(-1);
    await sleep(400);
    
    return i + 1;
  };

  const quickSortHelper = async (low: number, high: number, arrCopy: number[]) => {
    if (low < high) {
      const pi = await partition(low, high, arrCopy);
      await quickSortHelper(low, pi - 1, arrCopy);
      await quickSortHelper(pi + 1, high, arrCopy);
    } else if (low === high) {
      setSorted(prev => [...prev, low]);
    }
  };

  const quickSort = async () => {
    setSorting(true);
    const arrCopy = [...arr];
    await quickSortHelper(0, arrCopy.length - 1, arrCopy);
    setComparing([]);
    setPivot(-1);
    setSorting(false);
    setCompleted(true);
    toast.success('Quick sort complete! 🎉');
    setTimeout(() => onComplete(1, 1), 1200);
  };

  const shuffle = () => {
    const nums = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
    setArr(nums);
    setSorted([]);
    setComparing([]);
    setPivot(-1);
    setCompleted(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎯 Pivot Quest</span>
          <span className="text-sm text-muted-foreground">Quick Sort Visualizer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="space-y-3">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-indigo-500 rounded" />
              <span className="text-xs">Unsorted</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-xs">Pivot</span>
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
            <strong>Quick Sort</strong> picks a pivot element and partitions the array so smaller elements go left and larger go right. 
            Then it recursively sorts both sides!
          </p>
          <div className="flex gap-2">
            <Button onClick={quickSort} disabled={sorting || completed}>
              {sorting ? 'Sorting...' : 'Start Quick Sort'}
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
