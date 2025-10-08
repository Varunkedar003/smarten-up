import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import { toast } from 'sonner';

interface Router {
  id: number;
  position: THREE.Vector3;
  connections: number[];
}

interface Packet {
  id: number;
  currentRouter: number;
  targetRouter: number;
  path: number[];
}

interface PacketRouter3DProps {
  level: string;
  onComplete: (correct: number, total: number) => void;
}

export const PacketRouter3D: React.FC<PacketRouter3DProps> = ({ level, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [routers, setRouters] = useState<Router[]>([]);
  const [packet, setPacket] = useState<Packet | null>(null);
  const [selectedRouter, setSelectedRouter] = useState<number | null>(null);
  const [packetsDelivered, setPacketsDelivered] = useState(0);
  const [totalPackets] = useState(level === 'easy' ? 3 : level === 'intermediate' ? 5 : 7);

  const createNetworkTopology = () => {
    const routerCount = level === 'easy' ? 4 : level === 'intermediate' ? 6 : 8;
    const newRouters: Router[] = [];

    for (let i = 0; i < routerCount; i++) {
      const angle = (i / routerCount) * Math.PI * 2;
      const radius = 5;
      newRouters.push({
        id: i,
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle * 0.5) * 2,
          Math.sin(angle) * radius
        ),
        connections: []
      });
    }

    // Create connections (mesh network)
    for (let i = 0; i < routerCount; i++) {
      // Connect to next router
      newRouters[i].connections.push((i + 1) % routerCount);
      // Connect to router across (for shortcuts)
      if (routerCount > 4) {
        newRouters[i].connections.push((i + Math.floor(routerCount / 2)) % routerCount);
      }
      // Random additional connection
      if (Math.random() > 0.5 && routerCount > 5) {
        const randomRouter = Math.floor(Math.random() * routerCount);
        if (randomRouter !== i && !newRouters[i].connections.includes(randomRouter)) {
          newRouters[i].connections.push(randomRouter);
        }
      }
    }

    setRouters(newRouters);
    createNewPacket(newRouters);
  };

  const createNewPacket = (routerList: Router[]) => {
    const start = Math.floor(Math.random() * routerList.length);
    let target = Math.floor(Math.random() * routerList.length);
    while (target === start) {
      target = Math.floor(Math.random() * routerList.length);
    }

    setPacket({
      id: Date.now(),
      currentRouter: start,
      targetRouter: target,
      path: [start]
    });
    setSelectedRouter(null);
  };

  useEffect(() => {
    createNetworkTopology();
  }, [level]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a1628);
    
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00aaff, 1.5);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    camera.position.set(0, 12, 12);
    camera.lookAt(0, 0, 0);

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;
      camera.position.x = Math.cos(time * 0.2) * 15;
      camera.position.z = Math.sin(time * 0.2) * 15;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || routers.length === 0) return;
    
    // Clear scene
    while (sceneRef.current.children.length > 2) {
      sceneRef.current.remove(sceneRef.current.children[2]);
    }

    // Draw connections
    routers.forEach(router => {
      router.connections.forEach(connId => {
        const targetRouter = routers[connId];
        const points = [router.position, targetRouter.position];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
          color: 0x00aaff,
          transparent: true,
          opacity: 0.3
        });
        const line = new THREE.Line(geometry, material);
        sceneRef.current!.add(line);
      });
    });

    // Draw routers
    routers.forEach(router => {
      const isSource = packet?.currentRouter === router.id;
      const isTarget = packet?.targetRouter === router.id;
      const isSelected = selectedRouter === router.id;
      
      const geometry = new THREE.OctahedronGeometry(0.5);
      const material = new THREE.MeshPhongMaterial({ 
        color: isTarget ? 0x2ecc71 : isSource ? 0xe74c3c : isSelected ? 0xf39c12 : 0x3498db,
        emissive: isTarget ? 0x27ae60 : isSource ? 0xc0392b : isSelected ? 0xe67e22 : 0x2980b9,
        emissiveIntensity: 0.5
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(router.position);
      sceneRef.current!.add(mesh);

      // Router label
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'white';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`R${router.id}`, 32, 32);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1, 1, 1);
      sprite.position.set(router.position.x, router.position.y + 1, router.position.z);
      sceneRef.current!.add(sprite);
    });
  }, [routers, packet, selectedRouter]);

  const handleRouterClick = (routerId: number) => {
    if (!packet) return;

    const currentRouter = routers.find(r => r.id === packet.currentRouter);
    if (!currentRouter) return;

    // Check if it's a valid connection
    if (!currentRouter.connections.includes(routerId)) {
      toast.error('Not directly connected! Choose a connected router.');
      return;
    }

    const newPath = [...packet.path, routerId];
    
    if (routerId === packet.targetRouter) {
      toast.success(`Packet delivered in ${newPath.length - 1} hops! 🎉`);
      const newDelivered = packetsDelivered + 1;
      setPacketsDelivered(newDelivered);
      
      if (newDelivered >= totalPackets) {
        setTimeout(() => onComplete(newDelivered, totalPackets), 1500);
      } else {
        setTimeout(() => createNewPacket(routers), 1000);
      }
    } else {
      setPacket({
        ...packet,
        currentRouter: routerId,
        path: newPath
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📡 Packet Routing Challenge</span>
          <span className="text-sm">Delivered: {packetsDelivered}/{totalPackets}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={containerRef} className="w-full h-[350px] rounded-lg overflow-hidden border-2 border-primary/20" />
        
        {packet && (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-secondary/50 p-3 rounded">
              <div>
                <span className="text-xs text-muted-foreground">Current:</span>
                <span className="ml-2 font-bold text-red-500">R{packet.currentRouter}</span>
              </div>
              <span className="text-xs">→</span>
              <div>
                <span className="text-xs text-muted-foreground">Target:</span>
                <span className="ml-2 font-bold text-green-500">R{packet.targetRouter}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Hops:</span>
                <span className="ml-2 font-bold">{packet.path.length - 1}</span>
              </div>
            </div>

            <p className="text-sm font-medium">Click a connected router to forward the packet:</p>
            
            <div className="grid grid-cols-4 gap-2">
              {routers.map(router => {
                const currentRouter = routers.find(r => r.id === packet.currentRouter);
                const isConnected = currentRouter?.connections.includes(router.id);
                const isCurrent = router.id === packet.currentRouter;
                
                return (
                  <Button
                    key={router.id}
                    variant={isCurrent ? 'destructive' : isConnected ? 'default' : 'outline'}
                    onClick={() => handleRouterClick(router.id)}
                    disabled={!isConnected || isCurrent}
                    size="sm"
                  >
                    R{router.id}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
