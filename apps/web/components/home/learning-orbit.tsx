'use client';

import { Float, Line, OrbitControls, Sphere, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const nodes = ['Code', 'Phỏng vấn', 'Lộ trình', 'Mentor', 'Tài nguyên', 'CV'];

function OrbitScene() {
  const group = useRef<THREE.Group>(null);
  const nodePositions = useMemo(
    () =>
      nodes.map((_, index) => {
        const angle = (index / nodes.length) * Math.PI * 2;
        return new THREE.Vector3(
          Math.cos(angle) * 2.5,
          Math.sin(angle * 1.4) * 0.28,
          Math.sin(angle) * 1.55,
        );
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.elapsedTime * 0.16;
      group.current.rotation.x = Math.sin(clock.elapsedTime * 0.22) * 0.08;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.45}>
        <Sphere args={[0.72, 64, 64]}>
          <meshStandardMaterial
            color="#6D5DFE"
            emissive="#00D4FF"
            emissiveIntensity={0.65}
            roughness={0.24}
            metalness={0.25}
          />
        </Sphere>
      </Float>
      {nodePositions.map((position, index) => (
        <group key={nodes[index]} position={position}>
          <Line
            points={[new THREE.Vector3(0, 0, 0), position.clone().multiplyScalar(-1)]}
            color="#00D4FF"
            opacity={0.18}
            transparent
          />
          <Sphere args={[0.22, 32, 32]}>
            <meshStandardMaterial
              color={index % 2 ? '#00D4FF' : '#22C55E'}
              emissive={index % 2 ? '#00D4FF' : '#22C55E'}
              emissiveIntensity={0.35}
            />
          </Sphere>
          <Text
            position={[0, -0.44, 0]}
            fontSize={0.16}
            color="#F8FAFC"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.005}
            outlineColor="#07111F"
          >
            {nodes[index]}
          </Text>
        </group>
      ))}
      {Array.from({ length: 34 }).map((_, index) => {
        const angle = index * 1.7;
        const radius = 3.2 + (index % 5) * 0.13;
        return (
          <Sphere
            key={index}
            args={[0.015, 12, 12]}
            position={[Math.cos(angle) * radius, Math.sin(index) * 1.1, Math.sin(angle) * radius]}
          >
            <meshBasicMaterial color="#94A3B8" transparent opacity={0.45} />
          </Sphere>
        );
      })}
    </group>
  );
}

export function LearningOrbit() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-surface shadow-glow md:min-h-[520px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.22),transparent_35%),linear-gradient(135deg,rgba(109,93,254,0.2),rgba(34,197,94,0.08))]" />
      <Canvas
        camera={{ position: [0, 1.2, 5.4], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <pointLight position={[3, 3, 4]} intensity={8} color="#00D4FF" />
        <pointLight position={[-3, -2, 2]} intensity={3} color="#6D5DFE" />
        <OrbitScene />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
      </Canvas>
    </div>
  );
}
