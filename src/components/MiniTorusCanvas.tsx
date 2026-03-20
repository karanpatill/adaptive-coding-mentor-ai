import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function MiniTorusCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(80, 80);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 2.5;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x6366f1, 2);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    const geo = new THREE.TorusKnotGeometry(0.6, 0.2, 64, 12);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const knot = new THREE.Mesh(geo, mat);
    scene.add(knot);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      knot.rotation.x += 0.01;
      knot.rotation.y += 0.015;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: 80, height: 80 }} />;
}
