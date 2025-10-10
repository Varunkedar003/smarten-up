import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { toast } from 'sonner';

interface MergeFactory3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const MergeFactory3D: React.FC<MergeFactory3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [arr, setArr] = useState<number[]>([]);
  const [merging, setMerging] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [sorting, setSorting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const length = level === 'easy' ? 6 : level === 'intermediate' ? 8 : 12;

  useEffect(() => {
    const nums = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
    setArr(nums);
    setSorted([]);
    setMerging([]);
    setCompleted(false);
  }, [length]);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1a0f);

    const camera = new THREE.PerspectiveCamera(70, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    camera.position.set(0, 8, 20);
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

    const spacing = 1.8;
    const baseY = -2;

    arr.forEach((value, i) => {
      const height = Math.max(1, (value / 100) * 7);
      const geometry = new THREE.BoxGeometry(1.5, height, 1.5);
      
      let color = 0x8b5cf6;
      if (sorted.includes(i)) color = 0x22c55e;
      else if (merging.includes(i)) color = 0x06b6d4;
      
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
      ctx.font = 'bold 56px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toString(), 64, 64);
      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      sprite.scale.set(1.3, 1.3, 1);
      sprite.position.set((i - (arr.length - 1) / 2) * spacing, baseY + height + 1.2, 0);
      sceneRef.current!.add(sprite);
    });
  }, [arr, merging, sorted]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const merge = async (arrCopy: number[], left: number, mid: number, right: number) => {
    const mergingIndices = [];
    for (let i = left; i <= right; i++) {
      mergingIndices.push(i);
    }
    setMerging(mergingIndices);
    await sleep(500);

    const leftArr = arrCopy.slice(left, mid + 1);
    const rightArr = arrCopy.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    
    while (i < leftArr.length && j < rightArr.length) {
      await sleep(300);
      if (leftArr[i] <= rightArr[j]) {
        arrCopy[k] = leftArr[i];
        i++;
      } else {
        arrCopy[k] = rightArr[j];
        j++;
      }
      setArr([...arrCopy]);
      k++;
    }
    
    while (i < leftArr.length) {
      arrCopy[k] = leftArr[i];
      setArr([...arrCopy]);
      i++;
      k++;
      await sleep(300);
    }
    
    while (j < rightArr.length) {
      arrCopy[k] = rightArr[j];
      setArr([...arrCopy]);
      j++;
      k++;
      await sleep(300);
    }

    setSorted(prev => [...prev, ...mergingIndices]);
    setMerging([]);
    await sleep(200);
  };

  const mergeSortHelper = async (arrCopy: number[], left: number, right: number) => {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      await mergeSortHelper(arrCopy, left, mid);
      await mergeSortHelper(arrCopy, mid + 1, right);
      await merge(arrCopy, left, mid, right);
    }
  };

  const mergeSort = async () => {
    setSorting(true);
    const arrCopy = [...arr];
    await mergeSortHelper(arrCopy, 0, arrCopy.length - 1);
    setMerging([]);
    setSorting(false);
    setCompleted(true);
    toast.success('Merge sort complete! 🎉');
    setTimeout(() => onComplete(1, 1), 1200);
  };

  const shuffle = () => {
    const nums = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
    setArr(nums);
    setSorted([]);
    setMerging([]);
    setCompleted(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🏭 Merge Factory</span>
          <span className="text-sm text-muted-foreground">Merge Sort Visualizer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="space-y-3">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-purple-500 rounded" />
              <span className="text-xs">Unsorted</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-cyan-500 rounded" />
              <span className="text-xs">Merging</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-xs">Sorted</span>
            </div>
          </div>
          <p className="text-sm">
            <strong>Merge Sort</strong> divides the array into halves, sorts them recursively, and then merges the sorted halves. 
            It's efficient and stable!
          </p>
          <div className="flex gap-2">
            <Button onClick={mergeSort} disabled={sorting || completed}>
              {sorting ? 'Sorting...' : 'Start Merge Sort'}
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
