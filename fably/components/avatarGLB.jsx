"use client";
import React, { useRef, useEffect } from "react";
import { useGLTF, OrbitControls } from "@react-three/drei";

function Avatar3D() {
  const group = useRef();
  const { scene } = useGLTF("/models/avatar.glb");

  useEffect(() => {
    if (scene) {
      scene.scale.set(2, 2, 2);
      scene.position.set(0, -1, 0);
    }
  }, [scene]);

  return (
    <>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.5}
      />
      <group ref={group}>
        <primitive object={scene} />
      </group>
    </>
  );
}

export default Avatar3D;
