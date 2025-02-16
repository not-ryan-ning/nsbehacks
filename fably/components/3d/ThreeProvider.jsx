'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

export function ThreeProvider({ children }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
      >
        <Suspense fallback={<div>Loading 3D elements...</div>}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
n