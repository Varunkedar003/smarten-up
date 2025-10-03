import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import * as THREE from 'three';

interface PhysicsWorld3DProps {
  level: 'easy' | 'intermediate' | 'hard';
  subtopic: string;
  onComplete: (correct: number, total: number) => void;
}

export const PhysicsWorld3D: React.FC<PhysicsWorld3DProps> = ({
  level,
  subtopic,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
  const [currentChallenge, setCurrentChallenge] = useState<string>('');
  const [projectileSpeed, setProjectileSpeed] = useState(20);

  const challenges = {
    easy: [
      'Hit the target with the projectile',
      'Adjust speed to reach the platform',
      'Launch at the correct angle',
    ],
    intermediate: [
      'Calculate trajectory to hit moving target',
      'Account for gravity in your shot',
      'Hit multiple targets in sequence',
    ],
    hard: [
      'Compensate for wind resistance',
      'Hit target with ricochets',
      'Predict collision points',
    ],
  };

  useEffect(() => {
    const challengeList = challenges[level];
    setCurrentChallenge(challengeList[Math.floor(Math.random() * challengeList.length)]);
  }, [level]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 10, 100);

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Launcher (cannon)
    const launcherGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 32);
    const launcherMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
    const launcher = new THREE.Mesh(launcherGeometry, launcherMaterial);
    launcher.position.set(-15, 1.5, 0);
    launcher.rotation.z = Math.PI / 6;
    launcher.castShadow = true;
    scene.add(launcher);

    // Target
    const targetGeometry = new THREE.BoxGeometry(2, 4, 2);
    const targetMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const target = new THREE.Mesh(targetGeometry, targetMaterial);
    target.position.set(15, 2, 0);
    target.castShadow = true;
    scene.add(target);

    // Target glow
    const glowGeometry = new THREE.BoxGeometry(2.5, 4.5, 2.5);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
    });
    const targetGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    targetGlow.position.copy(target.position);
    scene.add(targetGlow);

    // Projectile
    let projectile: THREE.Mesh | null = null;
    let projectileVelocity = new THREE.Vector3();
    let projectileActive = false;

    const launchProjectile = () => {
      if (projectileActive) return;

      projectileActive = true;

      const projectileGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const projectileMaterial = new THREE.MeshPhongMaterial({
        color: 0xffff00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.5,
      });
      
      if (projectile) scene.remove(projectile);
      projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
      projectile.position.copy(launcher.position);
      projectile.castShadow = true;
      scene.add(projectile);

      // Calculate initial velocity
      const angle = Math.PI / 4; // 45 degrees
      const speed = projectileSpeed;
      projectileVelocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0
      );
    };

    // Animation loop
    let animationId: number;
    const gravity = -9.8;
    const deltaTime = 1 / 60;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Target animation
      target.rotation.y += 0.01;
      targetGlow.rotation.y += 0.01;
      target.position.y = 2 + Math.sin(Date.now() * 0.002) * 0.5;
      targetGlow.position.copy(target.position);

      // Projectile physics
      if (projectile && projectileActive) {
        projectileVelocity.y += gravity * deltaTime;
        projectile.position.add(projectileVelocity.clone().multiplyScalar(deltaTime));
        projectile.rotation.x += 0.2;

        // Check collision with target
        const distance = projectile.position.distanceTo(target.position);
        if (distance < 2.5) {
          projectileActive = false;
          scene.remove(projectile);
          projectile = null;

          const newScore = {
            correct: score.correct + 1,
            total: score.total + 1,
          };
          setScore(newScore);
          toast.success('Target hit! 🎯');

          const targetScore = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 7;
          if (newScore.total >= targetScore) {
            setGameState('completed');
            onComplete(newScore.correct, newScore.total);
          }
        }

        // Reset if projectile falls
        if (projectile && projectile.position.y < -5) {
          projectileActive = false;
          scene.remove(projectile);
          projectile = null;

          const newScore = {
            correct: score.correct,
            total: score.total + 1,
          };
          setScore(newScore);
          toast.error('Missed target!');

          const targetScore = level === 'easy' ? 3 : level === 'intermediate' ? 5 : 7;
          if (newScore.total >= targetScore) {
            setGameState('completed');
            onComplete(newScore.correct, newScore.total);
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [projectileSpeed]);

  if (gameState === 'completed') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-4">Physics Challenge Complete!</h2>
          <p className="text-lg mb-4">
            Score: {score.correct} / {score.total}
          </p>
          <p className="text-muted-foreground mb-6">
            Accuracy: {Math.round((score.correct / score.total) * 100)}%
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>3D Physics Simulator</CardTitle>
          <Badge variant="secondary">
            Score: {score.correct}/{score.total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm font-semibold">{currentChallenge}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Adjust the launch speed and fire!
          </p>
        </div>

        <div 
          ref={containerRef} 
          className="w-full h-[400px] rounded-lg overflow-hidden border border-border"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Launch Speed: {projectileSpeed}</label>
          <input
            type="range"
            min="10"
            max="40"
            value={projectileSpeed}
            onChange={(e) => setProjectileSpeed(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <Button 
          onClick={() => {
            // Trigger launch via re-render
            setProjectileSpeed(prev => prev);
          }} 
          className="w-full"
        >
          Launch Projectile 🚀
        </Button>
      </CardContent>
    </Card>
  );
};
