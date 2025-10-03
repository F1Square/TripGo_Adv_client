import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Text, Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

const FloatingCar = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <Box ref={meshRef} args={[2, 0.8, 4]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#667eea"
          attach="material"
          distort={0.1}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Box>
      {/* Car wheels */}
      <Sphere args={[0.3]} position={[-0.8, -0.6, 1.2]}>
        <meshStandardMaterial color="#333333" />
      </Sphere>
      <Sphere args={[0.3]} position={[0.8, -0.6, 1.2]}>
        <meshStandardMaterial color="#333333" />
      </Sphere>
      <Sphere args={[0.3]} position={[-0.8, -0.6, -1.2]}>
        <meshStandardMaterial color="#333333" />
      </Sphere>
      <Sphere args={[0.3]} position={[0.8, -0.6, -1.2]}>
        <meshStandardMaterial color="#333333" />
      </Sphere>
    </Float>
  );
};

const AnimatedSphere = ({ position, color }: { position: [number, number, number]; color: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Sphere ref={meshRef} args={[0.5]} position={position}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.2}
        speed={3}
        roughness={0.1}
        metalness={0.5}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
};

const TrackingPath = () => {
  const pathRef = useRef<THREE.Line | null>(null);
  
  useEffect(() => {
    if (pathRef.current) {
      const points = [];
      for (let i = 0; i <= 50; i++) {
        const t = i / 50;
        const x = (t - 0.5) * 10;
        const y = Math.sin(t * Math.PI * 2) * 2;
        const z = Math.cos(t * Math.PI * 1.5) * 3;
        points.push(new THREE.Vector3(x, y, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      if (pathRef.current.geometry) {
        pathRef.current.geometry = geometry;
      }
    }
  }, []);

  return (
    <line>
      <bufferGeometry />
      <lineBasicMaterial color="#28a745" />
    </line>
  );
};

const Scene3D: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <Environment preset="city" />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#667eea" />
        
        <FloatingCar />
        <TrackingPath />
        
        {/* Floating UI elements */}
        <AnimatedSphere position={[-4, 2, 2]} color="#28a745" />
        <AnimatedSphere position={[4, -1, 1]} color="#dc3545" />
        <AnimatedSphere position={[0, 3, -2]} color="#ffc107" />
        
        {/* 3D Text */}
        <Float speed={2} rotationIntensity={0.1}>
          <Text
            position={[0, 4, 0]}
            fontSize={0.8}
            color="#667eea"
            anchorX="center"
            anchorY="middle"
            font="/fonts/Inter-Bold.woff"
          >
            GPS TRACKING
          </Text>
        </Float>
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default Scene3D;