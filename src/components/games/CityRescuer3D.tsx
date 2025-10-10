import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { toast } from 'sonner';

interface CityRescuer3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const CityRescuer3D: React.FC<CityRescuer3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [maze, setMaze] = useState<number[][]>([]);
  const [path, setPath] = useState<[number, number][]>([]);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const size = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 9;
  const start: [number, number] = [0, 0];
  const end: [number, number] = [size - 1, size - 1];

  useEffect(() => {
    generateMaze();
  }, [size]);

  const generateMaze = () => {
    const newMaze: number[][] = Array(size).fill(0).map(() => 
      Array(size).fill(0).map(() => Math.random() > 0.3 ? 0 : 1)
    );
    newMaze[0][0] = 0;
    newMaze[size - 1][size - 1] = 0;
    setMaze(newMaze);
    setPath([]);
    setVisited(new Set());
    setCompleted(false);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1a1a);

    const camera = new THREE.PerspectiveCamera(70, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    camera.position.set(size * 1.2, size * 1.5, size * 1.2);
    camera.lookAt(size / 2, 0, size / 2);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [size]);

  useEffect(() => {
    if (!sceneRef.current || maze.length === 0) return;

    while (sceneRef.current.children.length > 2) {
      sceneRef.current.remove(sceneRef.current.children[2]);
    }

    const cellSize = 1;
    const offset = (size * cellSize) / 2;

    maze.forEach((row, i) => {
      row.forEach((cell, j) => {
        const geometry = new THREE.BoxGeometry(cellSize, 0.2, cellSize);
        let color = 0x1e3a3a;
        
        if (i === start[0] && j === start[1]) color = 0x10b981;
        else if (i === end[0] && j === end[1]) color = 0xf43f5e;
        else if (cell === 1) color = 0x334155;
        else if (visited.has(`${i},${j}`)) color = 0x06b6d4;
        else if (path.some(([pi, pj]) => pi === i && pj === j)) color = 0xfbbf24;
        
        const material = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.2 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(j * cellSize - offset, cell === 1 ? 0.5 : 0, i * cellSize - offset);
        sceneRef.current!.add(cube);
      });
    });
  }, [maze, path, visited, size, start, end]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const bfs = async () => {
    setSearching(true);
    const visitedSet = new Set<string>();
    const queue: Array<{ pos: [number, number], path: [number, number][] }> = [
      { pos: start, path: [start] }
    ];
    visitedSet.add(`${start[0]},${start[1]}`);
    
    while (queue.length > 0) {
      const { pos: [i, j], path: currentPath } = queue.shift()!;
      
      setVisited(new Set(visitedSet));
      setPath(currentPath);
      await sleep(250);
      
      if (i === end[0] && j === end[1]) {
        setSearching(false);
        toast.success('Shortest path found with BFS! 🎉');
        setCompleted(true);
        setTimeout(() => onComplete(1, 1), 1200);
        return;
      }
      
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      
      for (const [di, dj] of directions) {
        const ni = i + di;
        const nj = j + dj;
        const key = `${ni},${nj}`;
        
        if (ni >= 0 && ni < size && nj >= 0 && nj < size && 
            maze[ni][nj] === 0 && !visitedSet.has(key)) {
          visitedSet.add(key);
          queue.push({ pos: [ni, nj], path: [...currentPath, [ni, nj]] });
        }
      }
    }
    
    setSearching(false);
    toast.error('No path found!');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🚁 City Rescuer</span>
          <span className="text-sm text-muted-foreground">BFS Pathfinding</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="space-y-3">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-emerald-500 rounded" />
              <span className="text-xs">Start</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-rose-500 rounded" />
              <span className="text-xs">Target</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-slate-600 rounded" />
              <span className="text-xs">Building</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-cyan-500 rounded" />
              <span className="text-xs">Explored</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-amber-400 rounded" />
              <span className="text-xs">Path</span>
            </div>
          </div>
          <p className="text-sm">
            <strong>Breadth-First Search (BFS)</strong> explores all neighbors at the current depth before moving deeper. 
            It guarantees the shortest path!
          </p>
          <div className="flex gap-2">
            <Button onClick={bfs} disabled={searching || completed}>
              {searching ? 'Searching...' : 'Start BFS'}
            </Button>
            <Button variant="secondary" onClick={generateMaze} disabled={searching}>
              New City
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
