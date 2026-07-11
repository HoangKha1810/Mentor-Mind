'use client';

import { Float, Line, OrbitControls, Sphere, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const nodes = ['Code', 'Phỏng vấn', 'Lộ trình', 'Mentor', 'Tài nguyên', 'CV'];

function OrbitScene({ active, mobile, reduceMotion }: OrbitSceneProps) {
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
    if (!active || reduceMotion || !group.current) return;
    group.current.rotation.y = clock.elapsedTime * (mobile ? 0.08 : 0.14);
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.22) * 0.06;
  });

  const sphereSegments = mobile ? 24 : 40;
  const particleCount = mobile ? 12 : 24;

  return (
    <group ref={group}>
      <Float
        speed={active && !reduceMotion ? 1.1 : 0}
        rotationIntensity={mobile ? 0.12 : 0.24}
        floatIntensity={mobile ? 0.18 : 0.3}
      >
        <Sphere args={[0.72, sphereSegments, sphereSegments]}>
          <meshStandardMaterial
            color="#6D5DFE"
            emissive="#00D4FF"
            emissiveIntensity={0.5}
            roughness={0.28}
            metalness={0.2}
          />
        </Sphere>
      </Float>
      {nodePositions.map((position, index) => (
        <group key={nodes[index]} position={position}>
          <Line
            points={[new THREE.Vector3(0, 0, 0), position.clone().multiplyScalar(-1)]}
            color="#00D4FF"
            opacity={0.16}
            transparent
          />
          <Sphere args={[0.22, mobile ? 16 : 24, mobile ? 16 : 24]}>
            <meshStandardMaterial
              color={index % 2 ? '#00D4FF' : '#22C55E'}
              emissive={index % 2 ? '#00D4FF' : '#22C55E'}
              emissiveIntensity={0.3}
            />
          </Sphere>
          {!mobile ? (
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
          ) : null}
        </group>
      ))}
      {Array.from({ length: particleCount }).map((_, index) => {
        const angle = index * 1.7;
        const radius = 3.2 + (index % 5) * 0.13;
        return (
          <Sphere
            key={index}
            args={[0.015, 6, 6]}
            position={[Math.cos(angle) * radius, Math.sin(index) * 1.1, Math.sin(angle) * radius]}
          >
            <meshBasicMaterial color="#94A3B8" transparent opacity={0.38} />
          </Sphere>
        );
      })}
    </group>
  );
}

export default function LearningOrbitScene(props: OrbitSceneProps) {
  const { active, mobile, reduceMotion } = props;
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 1.2, 5.4], fov: 45 }}
      dpr={[1, mobile ? 1.15 : 1.5]}
      frameloop={active && !reduceMotion ? 'always' : 'demand'}
      gl={{
        antialias: !mobile,
        alpha: true,
        powerPreference: mobile ? 'low-power' : 'high-performance',
      }}
      performance={{ min: 0.5 }}
    >
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 3, 4]} intensity={mobile ? 4 : 7} color="#00D4FF" />
      <pointLight position={[-3, -2, 2]} intensity={mobile ? 1.5 : 2.5} color="#6D5DFE" />
      <OrbitScene {...props} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={!mobile && !reduceMotion}
        enableDamping={!reduceMotion}
        autoRotate={false}
      />
    </Canvas>
  );
}

type OrbitSceneProps = {
  active: boolean;
  mobile: boolean;
  reduceMotion: boolean;
};
