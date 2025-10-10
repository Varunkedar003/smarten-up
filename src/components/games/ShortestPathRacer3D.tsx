import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { toast } from 'sonner';

interface ShortestPathRacer3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const ShortestPathRacer3D: React.FC<ShortestPathRacer3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [graph, setGraph] = useState<Map<string, Array<{node: string, weight: number}>>>(new Map());
  const [nodes, setNodes] = useState<string[]>([]);
  const [distances, setDistances] = useState<Map<string, number>>(new Map());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState<string>('');
  const [path, setPath] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  const nodeCount = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 9;

  useEffect(() => {
    generateGraph();
  }, [nodeCount]);

  const generateGraph = () => {
    const newNodes: string[] = [];
    for (let i = 0; i < nodeCount; i++) {
      newNodes.push(String.fromCharCode(65 + i));
    }
    
    const newGraph = new Map<string, Array<{node: string, weight: number}>>();
    newNodes.forEach(node => newGraph.set(node, []));
    
    newNodes.forEach((node, i) => {
      const connections = level === 'easy' ? 2 : level === 'intermediate' ? 3 : 4;
      for (let j = 0; j < connections && i + j + 1 < nodeCount; j++) {
        const target = newNodes[i + j + 1];
        const weight = Math.floor(Math.random() * 9) + 1;
        newGraph.get(node)?.push({ node: target, weight });
        newGraph.get(target)?.push({ node, weight });
      }
    });
    
    setGraph(newGraph);
    setNodes(newNodes);
    setDistances(new Map());
    setVisited(new Set());
    setCurrent('');
    setPath([]);
    setCompleted(false);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f0a1a);

    const camera = new THREE.PerspectiveCamera(70, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    camera.position.set(0, 8, 12);
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
    if (!sceneRef.current || nodes.length === 0) return;

    while (sceneRef.current.children.length > 2) {
      sceneRef.current.remove(sceneRef.current.children[2]);
    }

    const radius = 5;
    const nodePositions = new Map<string, THREE.Vector3>();

    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      nodePositions.set(node, new THREE.Vector3(x, 0, z));
    });

    graph.forEach((edges, node) => {
      edges.forEach(edge => {
        const start = nodePositions.get(node)!;
        const end = nodePositions.get(edge.node)!;
        
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineBasicMaterial({ color: 0x4b5563 });
        const line = new THREE.Line(geometry, material);
        sceneRef.current!.add(line);
        
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.weight.toString(), 32, 32);
        const tex = new THREE.CanvasTexture(canvas);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
        sprite.scale.set(0.8, 0.8, 1);
        sprite.position.copy(mid);
        sceneRef.current!.add(sprite);
      });
    });

    nodes.forEach(node => {
      const pos = nodePositions.get(node)!;
      let color = 0x6366f1;
      if (node === nodes[0]) color = 0x22c55e;
      else if (node === nodes[nodes.length - 1]) color = 0xef4444;
      else if (path.includes(node)) color = 0xfbbf24;
      else if (node === current) color = 0x06b6d4;
      else if (visited.has(node)) color = 0x8b5cf6;
      
      const geometry = new THREE.SphereGeometry(0.5, 16, 16);
      const material = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(pos);
      sceneRef.current!.add(sphere);
      
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node, 64, 64);
      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      sprite.scale.set(1.2, 1.2, 1);
      sprite.position.set(pos.x, pos.y + 1, pos.z);
      sceneRef.current!.add(sprite);
    });
  }, [graph, nodes, visited, current, path]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const dijkstra = async () => {
    setSearching(true);
    const start = nodes[0];
    const end = nodes[nodes.length - 1];
    
    const dist = new Map<string, number>();
    const prev = new Map<string, string | null>();
    const unvisited = new Set(nodes);
    
    nodes.forEach(node => {
      dist.set(node, node === start ? 0 : Infinity);
      prev.set(node, null);
    });
    
    const visitedSet = new Set<string>();
    
    while (unvisited.size > 0) {
      let minNode = '';
      let minDist = Infinity;
      unvisited.forEach(node => {
        if (dist.get(node)! < minDist) {
          minDist = dist.get(node)!;
          minNode = node;
        }
      });
      
      if (minDist === Infinity) break;
      
      unvisited.delete(minNode);
      visitedSet.add(minNode);
      setCurrent(minNode);
      setVisited(new Set(visitedSet));
      setDistances(new Map(dist));
      await sleep(500);
      
      if (minNode === end) break;
      
      graph.get(minNode)?.forEach(({ node: neighbor, weight }) => {
        if (unvisited.has(neighbor)) {
          const alt = dist.get(minNode)! + weight;
          if (alt < dist.get(neighbor)!) {
            dist.set(neighbor, alt);
            prev.set(neighbor, minNode);
          }
        }
      });
    }
    
    const finalPath: string[] = [];
    let curr: string | null = end;
    while (curr) {
      finalPath.unshift(curr);
      curr = prev.get(curr)!;
    }
    
    setPath(finalPath);
    setCurrent('');
    setSearching(false);
    
    if (finalPath.length > 0) {
      toast.success(`Shortest path found! Distance: ${dist.get(end)} 🎉`);
      setCompleted(true);
      setTimeout(() => onComplete(1, 1), 1200);
    } else {
      toast.error('No path found!');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🏁 Shortest Path Racer</span>
          <span className="text-sm text-muted-foreground">Dijkstra's Algorithm</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="space-y-3">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-xs">Start</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full" />
              <span className="text-xs">End</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-cyan-500 rounded-full" />
              <span className="text-xs">Current</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full" />
              <span className="text-xs">Visited</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-amber-400 rounded-full" />
              <span className="text-xs">Path</span>
            </div>
          </div>
          <p className="text-sm">
            <strong>Dijkstra's Algorithm</strong> finds the shortest path in a weighted graph by always exploring the node with the smallest known distance first.
          </p>
          <div className="flex gap-2">
            <Button onClick={dijkstra} disabled={searching || completed}>
              {searching ? 'Finding Path...' : 'Start Dijkstra'}
            </Button>
            <Button variant="secondary" onClick={generateGraph} disabled={searching}>
              New Graph
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
