import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { toast } from 'sonner';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  position: THREE.Vector3;
}

interface TreeTraversal3DProps {
  level: string;
  subtopic?: string;
  onComplete: (correct: number, total: number) => void;
}

export const TreeTraversal3D: React.FC<TreeTraversal3DProps> = ({ level, subtopic, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [traversalType, setTraversalType] = useState<'BFS' | 'DFS-Pre' | 'DFS-In' | 'DFS-Post'>('BFS');
  const [userPath, setUserPath] = useState<number[]>([]);
  const [correctPath, setCorrectPath] = useState<number[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set());

  const createTree = (): TreeNode => {
    const depth = level === 'easy' ? 3 : level === 'intermediate' ? 4 : 5;
    let nodeValue = 1;

    const createNode = (currentDepth: number, x: number, y: number, spread: number): TreeNode | null => {
      if (currentDepth > depth) return null;
      
      const node: TreeNode = {
        value: nodeValue++,
        left: null,
        right: null,
        position: new THREE.Vector3(x, y, 0)
      };

      if (currentDepth < depth && Math.random() > 0.2) {
        node.left = createNode(currentDepth + 1, x - spread, y - 2, spread * 0.6);
      }
      if (currentDepth < depth && Math.random() > 0.2) {
        node.right = createNode(currentDepth + 1, x + spread, y - 2, spread * 0.6);
      }

      return node;
    };

    return createNode(1, 0, 8, 4)!;
  };

  useEffect(() => {
    const newTree = createTree();
    setTree(newTree);
    setUserPath([]);
    setHighlightedNodes(new Set());
    calculateCorrectPath(newTree, traversalType);
  }, [level, traversalType]);

  const calculateCorrectPath = (root: TreeNode | null, type: string) => {
    if (!root) return;
    const path: number[] = [];

    if (type === 'BFS') {
      const queue: TreeNode[] = [root];
      while (queue.length > 0) {
        const node = queue.shift()!;
        path.push(node.value);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
    } else if (type === 'DFS-Pre') {
      const traverse = (node: TreeNode | null) => {
        if (!node) return;
        path.push(node.value);
        traverse(node.left);
        traverse(node.right);
      };
      traverse(root);
    } else if (type === 'DFS-In') {
      const traverse = (node: TreeNode | null) => {
        if (!node) return;
        traverse(node.left);
        path.push(node.value);
        traverse(node.right);
      };
      traverse(root);
    } else if (type === 'DFS-Post') {
      const traverse = (node: TreeNode | null) => {
        if (!node) return;
        traverse(node.left);
        traverse(node.right);
        path.push(node.value);
      };
      traverse(root);
    }

    setCorrectPath(path);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0520);
    
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    camera.position.set(0, 5, 15);
    camera.lookAt(0, 3, 0);

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
    if (!sceneRef.current || !tree) return;
    
    // Clear previous objects
    while (sceneRef.current.children.length > 2) {
      sceneRef.current.remove(sceneRef.current.children[2]);
    }

    const drawNode = (node: TreeNode | null) => {
      if (!node) return;

      const isHighlighted = highlightedNodes.has(node.value);
      const isInPath = userPath.includes(node.value);
      
      const geometry = new THREE.SphereGeometry(0.5, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: isHighlighted ? 0x2ecc71 : isInPath ? 0xf39c12 : 0x3498db,
        emissive: isHighlighted ? 0x27ae60 : isInPath ? 0xe67e22 : 0x2980b9,
        emissiveIntensity: 0.3
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.copy(node.position);
      sceneRef.current!.add(sphere);

      // Draw edges
      if (node.left) {
        const points = [node.position, node.left.position];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x888888 });
        const line = new THREE.Line(lineGeo, lineMat);
        sceneRef.current!.add(line);
        drawNode(node.left);
      }
      if (node.right) {
        const points = [node.position, node.right.position];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x888888 });
        const line = new THREE.Line(lineGeo, lineMat);
        sceneRef.current!.add(line);
        drawNode(node.right);
      }

      // Add label
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.value.toString(), 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.8, 0.8, 1);
      sprite.position.copy(node.position);
      sceneRef.current!.add(sprite);
    };

    drawNode(tree);
  }, [tree, userPath, highlightedNodes]);

  const handleNodeClick = (value: number) => {
    const newPath = [...userPath, value];
    setUserPath(newPath);
    setHighlightedNodes(new Set(newPath));

    if (newPath.length === correctPath.length) {
      const isCorrect = newPath.every((v, i) => v === correctPath[i]);
      if (isCorrect) {
        toast.success('Perfect traversal! 🎉');
        setTimeout(() => onComplete(1, 1), 1500);
      } else {
        toast.error('Incorrect path! Try again.');
        setTimeout(() => {
          setUserPath([]);
          setHighlightedNodes(new Set());
        }, 1500);
      }
    }
  };

  const getAllNodes = (node: TreeNode | null): TreeNode[] => {
    if (!node) return [];
    return [node, ...getAllNodes(node.left), ...getAllNodes(node.right)];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🌳 Tree Traversal Challenge</span>
          <span className="text-sm">{userPath.length}/{correctPath.length} nodes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[350px] rounded-lg overflow-hidden border-2 border-primary/20" />
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button 
              variant={traversalType === 'BFS' ? 'default' : 'outline'}
              onClick={() => setTraversalType('BFS')}
              size="sm"
            >
              BFS
            </Button>
            <Button 
              variant={traversalType === 'DFS-Pre' ? 'default' : 'outline'}
              onClick={() => setTraversalType('DFS-Pre')}
              size="sm"
            >
              DFS Pre-order
            </Button>
            <Button 
              variant={traversalType === 'DFS-In' ? 'default' : 'outline'}
              onClick={() => setTraversalType('DFS-In')}
              size="sm"
            >
              DFS In-order
            </Button>
            <Button 
              variant={traversalType === 'DFS-Post' ? 'default' : 'outline'}
              onClick={() => setTraversalType('DFS-Post')}
              size="sm"
            >
              DFS Post-order
            </Button>
          </div>

          <p className="text-sm font-medium">Click nodes in {traversalType} order</p>
          
          <div className="grid grid-cols-4 gap-2">
            {tree && getAllNodes(tree).map((node) => (
              <Button
                key={node.value}
                variant={userPath.includes(node.value) ? 'default' : 'outline'}
                onClick={() => handleNodeClick(node.value)}
                disabled={userPath.includes(node.value)}
                size="sm"
              >
                Node {node.value}
              </Button>
            ))}
          </div>

          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => {
              setUserPath([]);
              setHighlightedNodes(new Set());
            }}
          >
            Reset Path
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
