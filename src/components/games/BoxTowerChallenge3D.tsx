import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as THREE from 'three';
import { toast } from 'sonner';

interface BoxTowerChallenge3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const BoxTowerChallenge3D: React.FC<BoxTowerChallenge3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [stack, setStack] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const maxSize = level === 'easy' ? 5 : level === 'intermediate' ? 7 : 10;

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f1419);

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
    camera.lookAt(0, 2, 0);

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

    const baseGeo = new THREE.BoxGeometry(3, 0.2, 3);
    const baseMat = new THREE.MeshPhongMaterial({ color: 0x334155 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, -0.1, 0);
    sceneRef.current!.add(base);

    stack.forEach((value, i) => {
      const boxGeo = new THREE.BoxGeometry(2, 0.8, 2);
      const hue = (i * 30) % 360;
      const color = new THREE.Color(`hsl(${hue}, 70%, 50%)`);
      const boxMat = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 0.25 
      });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.set(0, i * 0.85 + 0.4, 0);
      sceneRef.current!.add(box);

      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toString(), 64, 64);
      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      sprite.scale.set(1.2, 1.2, 1);
      sprite.position.set(0, i * 0.85 + 0.4, 1.2);
      sceneRef.current!.add(sprite);
    });
  }, [stack]);

  const push = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      toast.error('Please enter a valid number');
      return;
    }
    if (stack.length >= maxSize) {
      toast.error('Stack overflow!');
      return;
    }
    setStack([...stack, value]);
    setInputValue('');
    toast.success(`Pushed ${value} onto stack! 📦`);
  };

  const pop = () => {
    if (stack.length === 0) {
      toast.error('Stack underflow!');
      return;
    }
    const popped = stack[stack.length - 1];
    setStack(stack.slice(0, -1));
    toast.success(`Popped ${popped} from stack! 📦`);
  };

  const peek = () => {
    if (stack.length === 0) {
      toast.info('Stack is empty');
      return;
    }
    toast.info(`Top element: ${stack[stack.length - 1]}`);
  };

  const completeGame = () => {
    toast.success('Great job understanding stacks! 🎉');
    setTimeout(() => onComplete(1, 1), 1200);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📦 Box Tower Challenge</span>
          <span className="text-sm text-muted-foreground">Stack: {stack.length}/{maxSize}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[350px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="space-y-3">
          <p className="text-sm">
            <strong>Stacks</strong> follow LIFO (Last In, First Out). You can only add/remove from the top!
          </p>
          <Input
            type="number"
            placeholder="Enter a number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && push()}
          />
          <div className="flex gap-2 flex-wrap">
            <Button onClick={push}>Push</Button>
            <Button onClick={pop} variant="destructive">Pop</Button>
            <Button onClick={peek} variant="outline">Peek</Button>
            <Button onClick={completeGame} variant="secondary">Complete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
