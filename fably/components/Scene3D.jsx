"use client";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const Avatar3D = dynamic(() => import("./avatarGLB"), {
  ssr: false,
  loading: () => <div>Loading model...</div>,
});

export default function Scene3D() {
  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Suspense fallback={<div>Loading scene...</div>}>
        <Canvas
          style={{ background: "transparent" }}
          camera={{ position: [0, 0, 5], fov: 50 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 5]} intensity={1} />
          <Avatar3D />
        </Canvas>
      </Suspense>
    </div>
  );
}
