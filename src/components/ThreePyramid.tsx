import React, { useEffect, useRef, useState } from 'react';

interface ThreePyramidProps {
  className?: string;
  size?: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face {
  indices: number[];
  color: string;
}

export default function ThreePyramid({ className = '', size = 300 }: ThreePyramidProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // 3D Model: Square-based Pyramid
    // Y is up, X is right, Z is depth (pointing out of screen)
    const vertices: Point3D[] = [
      { x: 0, y: 1.1, z: 0 },      // 0: Apex (Top)
      { x: -0.9, y: -0.7, z: 0.9 },  // 1: Front-Left Base
      { x: 0.9, y: -0.7, z: 0.9 },   // 2: Front-Right Base
      { x: 0.9, y: -0.7, z: -0.9 },  // 3: Back-Right Base
      { x: -0.9, y: -0.7, z: -0.9 }, // 4: Back-Left Base
    ];

    // Define the 5 faces
    const faces: Face[] = [
      { indices: [0, 1, 2], color: 'gold' }, // Front Face
      { indices: [0, 2, 3], color: 'gold' }, // Right Face
      { indices: [0, 3, 4], color: 'gold' }, // Back Face
      { indices: [0, 4, 1], color: 'gold' }, // Left Face
      { indices: [4, 3, 2, 1], color: 'gold_base' }, // Bottom Base Face
    ];

    // Light Source Direction (normalized)
    const lightSource = { x: 1, y: 1, z: 1.5 };
    const length = Math.sqrt(lightSource.x ** 2 + lightSource.y ** 2 + lightSource.z ** 2);
    lightSource.x /= length;
    lightSource.y /= length;
    lightSource.z /= length;

    // Particles background
    const particles: { x: number; y: number; z: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 2,
        speed: 0.005 + Math.random() * 0.008,
        opacity: 0.2 + Math.random() * 0.6,
      });
    }

    let angleY = 0;
    let angleX = 0.25;
    let targetAngleY = 0;
    let targetAngleX = 0.25;
    let animationFrameId: number;
    let lastTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      mousePos.current = { x, y };

      // Interactive rotation offset based on mouse position
      targetAngleY = (x / (size / 2)) * 0.8;
      targetAngleX = 0.25 + (y / (size / 2)) * 0.5;
    };

    const handleMouseLeave = () => {
      mousePos.current = { x: 0, y: 0 };
      targetAngleX = 0.25;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Delta time
      if (!lastTime) lastTime = time;
      const dt = (time - lastTime) * 0.001;
      lastTime = time;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Auto-rotation around Y axis
      const autoRotationSpeed = isHovered ? 0.2 : 0.4;
      angleY += autoRotationSpeed * dt;

      // Smoothly interpolate towards target interactive angles
      const lerpFactor = 0.08;
      const currentAngleY = angleY + (targetAngleY - (angleY % (Math.PI * 2))) * lerpFactor;
      const currentAngleX = angleX + (targetAngleX - angleX) * lerpFactor;
      angleX = currentAngleX;

      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);
      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);

      // Centers
      const centerX = size / 2;
      const centerY = size / 2;

      // 1. Project and draw background particles
      ctx.fillStyle = '#f59e0b';
      particles.forEach((p) => {
        // Move particle up
        p.y -= p.speed;
        if (p.y < -1.8) {
          p.y = 1.8;
          p.x = (Math.random() - 0.5) * 3;
        }

        // Rotate particle in 3D
        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;
        // Rotate X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        // Perspective projection
        const fov = 280;
        const distance = 3.5;
        const scale = fov / (distance + z2);

        const px = centerX + x1 * scale;
        const py = centerY - y2 * scale;

        if (px >= 0 && px <= size && py >= 0 && py <= size) {
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, 1.2 * (scale / 100)), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity * (z2 > -1 ? 0.8 : 0.2)})`;
          ctx.fill();
        }
      });

      // 2. Rotate 3D vertices
      const transformedVertices = vertices.map((v) => {
        // Rotate Y axis
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.x * sinY + v.z * cosY;

        // Rotate X axis
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = v.y * sinX + z1 * cosX;

        // Perspective Projection
        const fov = 280;
        const distance = 3.5;
        const scale = fov / (distance + z2);

        return {
          x: centerX + x1 * scale,
          y: centerY - y2 * scale,
          z: z2, // keep depth for sorting
          orig: v,
          rotX: x1,
          rotY: y2,
          rotZ: z2,
        };
      });

      // 3. Compute face normals & sort faces by depth (Painter's Algorithm)
      const faceData = faces.map((face, index) => {
        const pts = face.indices.map((idx) => transformedVertices[idx]);

        // Calculate average Z depth for sorting
        let avgZ = 0;
        pts.forEach((pt) => {
          avgZ += pt.z;
        });
        avgZ /= pts.length;

        // Calculate 3D Face Normal vector (using original rotated coordinates)
        // Normal = crossProduct(V1 - V0, V2 - V0)
        const v0 = pts[0];
        const v1 = pts[1];
        const v2 = pts[2];

        const edge1 = { x: v1.rotX - v0.rotX, y: v1.rotY - v0.rotY, z: v1.rotZ - v0.rotZ };
        const edge2 = { x: v2.rotX - v0.rotX, y: v2.rotY - v0.rotY, z: v2.rotZ - v0.rotZ };

        // Cross product
        const normal = {
          x: edge1.y * edge2.z - edge1.z * edge2.y,
          y: edge1.z * edge2.x - edge1.x * edge2.z,
          z: edge1.x * edge2.y - edge1.y * edge2.x,
        };

        // Normalize normal
        const normalLength = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
        if (normalLength > 0) {
          normal.x /= normalLength;
          normal.y /= normalLength;
          normal.z /= normalLength;
        }

        // Dot product with Light Source (diffuse lighting)
        const dot = normal.x * lightSource.x + normal.y * lightSource.y + normal.z * lightSource.z;
        // Standard ambient + diffuse shading formula
        const intensity = Math.max(0.15, Math.min(1.0, 0.3 + dot * 0.7));

        return {
          face,
          pts,
          avgZ,
          intensity,
          index,
        };
      });

      // Sort: Draw back-faces first (lower Z value, i.e., further away)
      faceData.sort((a, b) => b.avgZ - a.avgZ);

      // 4. Render Faces
      faceData.forEach(({ face, pts, intensity }) => {
        // Draw face filled polygon
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.closePath();

        // Shading color calculations
        let r, g, bVal;
        if (face.color === 'gold_base') {
          // Darker base
          r = Math.floor(139 * intensity);
          g = Math.floor(101 * intensity);
          bVal = Math.floor(8 * intensity);
        } else {
          // Vibrant gold gradient: (212, 175, 55) up to (251, 191, 36)
          r = Math.floor(245 * intensity);
          g = Math.floor(158 * intensity);
          bVal = Math.floor(11 * intensity);
        }

        // Add specular gradient highlight
        const gradient = ctx.createRadialGradient(
          centerX + (size / 4) * lightSource.x,
          centerY - (size / 4) * lightSource.y,
          5,
          centerX,
          centerY,
          size / 2
        );
        gradient.addColorStop(0, `rgb(${Math.min(255, r + 40)}, ${Math.min(255, g + 40)}, ${Math.min(255, bVal + 40)})`);
        gradient.addColorStop(0.5, `rgb(${r}, ${g}, ${bVal})`);
        gradient.addColorStop(1, `rgb(${Math.max(20, r - 60)}, ${Math.max(10, g - 60)}, ${Math.max(0, bVal - 60)})`);

        ctx.fillStyle = gradient;
        ctx.fill();

        // Face outline with glowing neon effect
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 + intensity * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 5. Draw glowing vertices/corners for high-tech premium feel
      transformedVertices.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [size, isHovered]);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing drop-shadow-[0_15px_30px_rgba(245,158,11,0.25)]"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}
