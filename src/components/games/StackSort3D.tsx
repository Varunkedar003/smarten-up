import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { toast } from 'sonner';

interface StackSort3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const StackSort3D: React.FC<StackSort3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [stack, setStack] = useState<number[]>([]);
  const [targetStack, setTargetStack] = useState<number[]>([]);
  const [auxiliaryStack, setAuxiliaryStack] = useState<number[]>([]);
  const [selected, setSelected] = useState<'main' | 'target' | 'aux' | null>(null);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);

  const elementCount = level === 'easy' ? 3 : level === 'intermediate' ? 4 : 5;

  useEffect(() => {
    // Initialize stacks
    const nums = Array.from({ length: elementCount }, (_, i) => i + 1);
    const shuffled = nums.sort(() => Math.random() - 0.5);
    setStack(shuffled);
    setTargetStack([]);
    setAuxiliaryStack([]);
  }, [elementCount]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x1a1a2e);
    
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    camera.position.set(0, 8, 15);
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
    
    // Clear previous boxes
    while (sceneRef.current.children.length > 2) {
      sceneRef.current.remove(sceneRef.current.children[2]);
    }

    // Draw stacks
    const drawStack = (stackArray: number[], xPos: number, color: number) => {
      stackArray.forEach((value, idx) => {
        const geometry = new THREE.BoxGeometry(2, 0.8, 2);
        const material = new THREE.MeshPhongMaterial({ 
          color,
          emissive: color,
          emissiveIntensity: 0.2
        });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(xPos, idx * 0.9, 0);
        sceneRef.current!.add(box);

        // Add text
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toString(), 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(labelMaterial);
        sprite.scale.set(0.8, 0.8, 1);
        sprite.position.set(xPos, idx * 0.9, 1.2);
        sceneRef.current!.add(sprite);
      });

      // Base platform
      const baseGeo = new THREE.BoxGeometry(2.5, 0.2, 2.5);
      const baseMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(xPos, -0.5, 0);
      sceneRef.current!.add(base);
    };

    drawStack(stack, -5, 0x3498db);
    drawStack(targetStack, 0, 0x2ecc71);
    drawStack(auxiliaryStack, 5, 0xe74c3c);

    // Check if sorted
    if (targetStack.length === elementCount) {
      const isSorted = targetStack.every((val, idx) => val === idx + 1);
      if (isSorted && !completed) {
        setCompleted(true);
        toast.success(`Sorted in ${moves} moves!`);
        setTimeout(() => onComplete(1, 1), 1500);
      }
    }
  }, [stack, targetStack, auxiliaryStack, elementCount, moves, completed, onComplete]);

  const moveElement = (from: 'main' | 'target' | 'aux', to: 'main' | 'target' | 'aux') => {
    if (from === to) return;

    const fromStack = from === 'main' ? stack : from === 'target' ? targetStack : auxiliaryStack;
    const toStack = to === 'main' ? stack : to === 'target' ? targetStack : auxiliaryStack;

    if (fromStack.length === 0) {
      toast.error('Cannot move from empty stack!');
      return;
    }

    const element = fromStack[fromStack.length - 1];
    const topOfTo = toStack[toStack.length - 1];

    if (toStack.length > 0 && element > topOfTo) {
      toast.error('Cannot place larger element on smaller one!');
      return;
    }

    const newFrom = [...fromStack];
    const moved = newFrom.pop()!;
    const newTo = [...toStack, moved];

    if (from === 'main') setStack(newFrom);
    else if (from === 'target') setTargetStack(newFrom);
    else setAuxiliaryStack(newFrom);

    if (to === 'main') setStack(newTo);
    else if (to === 'target') setTargetStack(newTo);
    else setAuxiliaryStack(newTo);

    setMoves(prev => prev + 1);
    setSelected(null);
  };

  const handleStackClick = (stackName: 'main' | 'target' | 'aux') => {
    if (!selected) {
      setSelected(stackName);
    } else {
      moveElement(selected, stackName);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🎯 Stack Sorting Challenge</span>
          <span className="text-sm">Moves: {moves}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[350px] rounded-lg overflow-hidden border-2 border-primary/20" />
        
        <div className="space-y-2">
          <p className="text-sm font-medium">Sort all elements to the Target Stack in ascending order (1 at bottom)</p>
          <p className="text-xs text-muted-foreground">Rule: You can only place a smaller element on top of a larger one</p>
          
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={selected === 'main' ? 'default' : 'outline'}
              onClick={() => handleStackClick('main')}
              className="h-auto py-3"
            >
              <div className="text-center">
                <div className="font-bold">Source Stack</div>
                <div className="text-xs opacity-70">{stack.length} elements</div>
              </div>
            </Button>
            
            <Button 
              variant={selected === 'target' ? 'default' : 'outline'}
              onClick={() => handleStackClick('target')}
              className="h-auto py-3"
            >
              <div className="text-center">
                <div className="font-bold">Target Stack</div>
                <div className="text-xs opacity-70">{targetStack.length} elements</div>
              </div>
            </Button>
            
            <Button 
              variant={selected === 'aux' ? 'default' : 'outline'}
              onClick={() => handleStackClick('aux')}
              className="h-auto py-3"
            >
              <div className="text-center">
                <div className="font-bold">Auxiliary Stack</div>
                <div className="text-xs opacity-70">{auxiliaryStack.length} elements</div>
              </div>
            </Button>
          </div>

          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => {
              const nums = Array.from({ length: elementCount }, (_, i) => i + 1);
              const shuffled = nums.sort(() => Math.random() - 0.5);
              setStack(shuffled);
              setTargetStack([]);
              setAuxiliaryStack([]);
              setMoves(0);
              setCompleted(false);
              setSelected(null);
            }}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
