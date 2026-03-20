import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.8);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0x6366f1, 1.5);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x10b981, 0.8);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // Object 1: Central torus knot
    const torusKnotGeo = new THREE.TorusKnotGeometry(1, 0.3, 128, 16);
    const torusKnotMat = new THREE.MeshPhongMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.15,
      wireframe: false,
    });
    const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
    torusKnot.position.x = 2;
    scene.add(torusKnot);

    // Object 2: Outer wireframe icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(2.2, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    scene.add(icosahedron);

    // Object 3: Particle system
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 16;
      velocities[i] = (Math.random() - 0.5) * 0.001;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.02,
      transparent: true,
      opacity: 0.4,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Object 4: Small floating octahedrons
    const octahedrons: THREE.Mesh[] = [];
    const octaOffsets: number[] = [];
    const colors = [0x6366f1, 0x10b981, 0x6366f1, 0x10b981, 0x6366f1, 0x10b981];
    for (let i = 0; i < 6; i++) {
      const octGeo = new THREE.OctahedronGeometry(0.12);
      const octMat = new THREE.MeshPhongMaterial({
        color: colors[i],
        transparent: true,
        opacity: 0.5,
      });
      const oct = new THREE.Mesh(octGeo, octMat);
      oct.position.set(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 4
      );
      octaOffsets.push(Math.random() * Math.PI * 2);
      scene.add(oct);
      octahedrons.push(oct);
    }

    // Animation loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Torus knot rotation
      torusKnot.rotation.x += 0.003;
      torusKnot.rotation.y += 0.005;

      // Icosahedron rotation (opposite)
      icosahedron.rotation.y -= 0.002;
      icosahedron.rotation.x += 0.001;

      // Particle drift
      const pos = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        pos.array[i * 3] = (pos.array[i * 3] as number) + velocities[i * 3];
        pos.array[i * 3 + 1] = (pos.array[i * 3 + 1] as number) + velocities[i * 3 + 1];
        pos.array[i * 3 + 2] = (pos.array[i * 3 + 2] as number) + velocities[i * 3 + 2];
        // Wrap around
        if (Math.abs(pos.array[i * 3] as number) > 8) velocities[i * 3] *= -1;
        if (Math.abs(pos.array[i * 3 + 1] as number) > 8) velocities[i * 3 + 1] *= -1;
        if (Math.abs(pos.array[i * 3 + 2] as number) > 8) velocities[i * 3 + 2] *= -1;
      }
      pos.needsUpdate = true;

      // Octahedrons float
      octahedrons.forEach((oct, i) => {
        oct.rotation.x += 0.01 + i * 0.002;
        oct.rotation.y += 0.008 + i * 0.001;
        oct.position.y += Math.sin(elapsed + octaOffsets[i]) * 0.003;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      torusKnotGeo.dispose();
      torusKnotMat.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      octahedrons.forEach(o => {
        (o.geometry as THREE.BufferGeometry).dispose();
        ((o.material as THREE.Material)).dispose();
      });
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
