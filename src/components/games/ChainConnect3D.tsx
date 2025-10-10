import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as THREE from 'three';
import { toast } from 'sonner';

interface ChainConnect3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const ChainConnect3D: React.FC<ChainConnect3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [list, setList] = useState<number[]>([5, 10, 15, 20]);
  const [inputValue, setInputValue] = useState('');
  const [insertIndex, setInsertIndex] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1220);

    const camera = new THREE.PerspectiveCamera(70, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    scene.add(dir);

    camera.position.set(0, 5, 12);
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

    const spacing = 2.5;
    const offset = (list.length - 1) * spacing / 2;

    list.forEach((value, i) => {
      const nodeGeo = new THREE.BoxGeometry(1.8, 1.2, 1.2);
      const nodeMat = new THREE.MeshPhongMaterial({ 
        color: 0x3b82f6, 
        emissive: 0x1e40af, 
        emissiveIntensity: 0.3 
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(i * spacing - offset, 0, 0);
      sceneRef.current!.add(node);

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
      sprite.scale.set(1.4, 1.4, 1);
      sprite.position.set(i * spacing - offset, 0, 0);
      sceneRef.current!.add(sprite);

      if (i < list.length - 1) {
        const arrowGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
        const arrowMat = new THREE.MeshPhongMaterial({ color: 0x10b981 });
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.rotation.z = Math.PI / 2;
        arrow.position.set(i * spacing - offset + 1.25, 0, 0);
        sceneRef.current!.add(arrow);

        const coneGeo = new THREE.ConeGeometry(0.15, 0.3, 8);
        const cone = new THREE.Mesh(coneGeo, arrowMat);
        cone.rotation.z = -Math.PI / 2;
        cone.position.set(i * spacing - offset + 1.75, 0, 0);
        sceneRef.current!.add(cone);
      }
    });
  }, [list]);

  const insertNode = () => {
    const value = parseInt(inputValue);
    const index = parseInt(insertIndex);
    
    if (isNaN(value)) {
      toast.error('Please enter a valid number');
      return;
    }
    
    if (isNaN(index) || index < 0 || index > list.length) {
      toast.error(`Index must be between 0 and ${list.length}`);
      return;
    }
    
    const newList = [...list];
    newList.splice(index, 0, value);
    setList(newList);
    setInputValue('');
    setInsertIndex('');
    toast.success(`Inserted ${value} at index ${index}! 🔗`);
  };

  const deleteNode = () => {
    const index = parseInt(insertIndex);
    
    if (isNaN(index) || index < 0 || index >= list.length) {
      toast.error(`Index must be between 0 and ${list.length - 1}`);
      return;
    }
    
    const newList = [...list];
    const removed = newList.splice(index, 1)[0];
    setList(newList);
    setInsertIndex('');
    toast.success(`Removed ${removed} from index ${index}! 🔗`);
  };

  const completeGame = () => {
    toast.success('Great job understanding linked lists! 🎉');
    setTimeout(() => onComplete(1, 1), 1200);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔗 Chain Connect</span>
          <span className="text-sm text-muted-foreground">Linked List Operations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[350px] rounded-lg overflow-hidden border-2 border-primary/20" />
        <div className="space-y-3">
          <p className="text-sm">
            <strong>Linked Lists</strong> store elements in nodes connected by pointers. Each node contains data and a reference to the next node.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              type="number"
              placeholder={`Index (0-${list.length})`}
              value={insertIndex}
              onChange={(e) => setInsertIndex(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={insertNode} variant="default">Insert</Button>
            <Button onClick={deleteNode} variant="destructive">Delete</Button>
            <Button onClick={completeGame} variant="secondary">Complete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
