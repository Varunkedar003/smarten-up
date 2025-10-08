import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { toast } from 'sonner';

interface ArraySort3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const ArraySort3D: React.FC<ArraySort3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  const [arr, setArr] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);

  const length = level === 'easy' ? 5 : level === 'intermediate' ? 6 : 7;

  useEffect(() => {
    const nums = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
    setArr(nums);
    setMoves(0);
    setCompleted(false);
  }, [length]);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x071422);

    const camera = new THREE.PerspectiveCamera(70, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    camera.position.set(0, 8, 16);
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

    // Clear scene except lights (first two)
    while (sceneRef.current.children.length > 2) {
      sceneRef.current.remove(sceneRef.current.children[2]);
    }

    const spacing = 2.2;
    const baseY = -1;

    arr.forEach((value, i) => {
      const height = Math.max(1, (value / 100) * 6);
      const geometry = new THREE.BoxGeometry(1.6, height, 1.6);
      const material = new THREE.MeshPhongMaterial({ color: 0x3498db, emissive: 0x1f6391, emissiveIntensity: 0.25 });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.set((i - (arr.length - 1) / 2) * spacing, baseY + height / 2, 0);
      sceneRef.current!.add(bar);

      // Label
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toString(), 64, 64);
      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      sprite.scale.set(1.2, 1.2, 1);
      sprite.position.set((i - (arr.length - 1) / 2) * spacing, baseY + height + 0.8, 0);
      sceneRef.current!.add(sprite);
    });
  }, [arr]);

  const swap = (i: number, j: number) => {
    if (i === j) return;
    const next = [...arr];
    const t = next[i]; next[i] = next[j]; next[j] = t;
    setArr(next);
    setMoves(m => m + 1);
  };

  const moveLeft = (i: number) => {
    if (i <= 0) return;
    swap(i, i - 1);
  };

  const moveRight = (i: number) => {
    if (i >= arr.length - 1) return;
    swap(i, i + 1);
  };

  const checkSorted = () => {
    const ok = arr.every((v, i, a) => i === 0 || a[i - 1] <= v);
    if (ok) {
      toast.success(`Sorted correctly in ${moves} moves! 🎉`);
      setCompleted(true);
      setTimeout(() => onComplete(1, 1), 1200);
    } else {
      toast.error('Not sorted ascending. Try again.');
    }
  };

  const regenerate = () => {
    const nums = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
    setArr(nums);
    setMoves(0);
    setCompleted(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🧩 Array Sorting 3D</span>
          <span className="text-sm">Moves: {moves}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[350px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="space-y-3">
          <p className="text-sm font-medium">Arrange the bars in ascending order (small → large), then Submit.</p>
          <div className="grid gap-2">
            {arr.map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded border bg-secondary/40">
                <span className="text-xs">Index {i}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => moveLeft(i)}>← Left</Button>
                  <Button size="sm" variant="outline" onClick={() => moveRight(i)}>Right →</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={checkSorted} disabled={completed}>Submit</Button>
            <Button variant="secondary" onClick={regenerate}>Shuffle</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
