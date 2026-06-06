import { useEffect, useRef, useState } from 'react';

interface City {
  name: string;
  arabicName: string;
  lat: number;
  lon: number;
  color: string;
}

interface FlightRoute {
  from: string;
  to: string;
  color: string;
}

interface ThreeGlobeProps {
  className?: string;
  size?: number;
}

export default function ThreeGlobe({ className = '', size = 400 }: ThreeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotation = useRef({ x: 0.3, y: 1.0 }); // initial angles
  const velocity = useRef({ x: 0, y: 0.03 }); // automatic spin speed

  // Famous tourist destinations for Kemet travel portal
  const cities: City[] = [
    { name: 'Cairo', arabicName: 'القاهرة', lat: 30.0444, lon: 31.2357, color: '#f59e0b' },
    { name: 'Luxor', arabicName: 'الأقصر', lat: 25.6872, lon: 32.6396, color: '#fbbf24' },
    { name: 'Aswan', arabicName: 'أسوان', lat: 24.0889, lon: 32.8998, color: '#f59e0b' },
    { name: 'London', arabicName: 'لندن', lat: 51.5074, lon: -0.1278, color: '#3b82f6' },
    { name: 'Rome', arabicName: 'روما', lat: 41.9028, lon: 12.4964, color: '#3b82f6' },
    { name: 'New York', arabicName: 'نيويورك', lat: 40.7128, lon: -74.0060, color: '#10b981' },
    { name: 'Tokyo', arabicName: 'طوكيو', lat: 35.6762, lon: 139.6503, color: '#ec4899' },
    { name: 'Dubai', arabicName: 'دبي', lat: 25.2048, lon: 55.2708, color: '#10b981' },
  ];

  // Flight paths connecting to Cairo (Kemet center)
  const flightRoutes: FlightRoute[] = [
    { from: 'London', to: 'Cairo', color: 'rgba(59, 130, 246, 0.6)' },
    { from: 'Rome', to: 'Cairo', color: 'rgba(59, 130, 246, 0.6)' },
    { from: 'New York', to: 'Cairo', color: 'rgba(16, 185, 129, 0.6)' },
    { from: 'Tokyo', to: 'Cairo', color: 'rgba(236, 72, 153, 0.6)' },
    { from: 'Dubai', to: 'Cairo', color: 'rgba(16, 185, 129, 0.6)' },
    { from: 'Cairo', to: 'Luxor', color: 'rgba(245, 158, 11, 0.7)' },
    { from: 'Luxor', to: 'Aswan', color: 'rgba(245, 158, 11, 0.7)' },
  ];

  // Helper to approximate Earth's continents mathematically
  const isLand = (lat: number, lon: number): boolean => {
    // Bounding approximations of major continents for a clean dotted aesthetic
    // Africa
    if (lat >= -35 && lat <= 36 && lon >= -17 && lon <= 51) {
      if (lat > 12 && lon > 40 && lat < 28 && lon < 45) return false; // Red Sea
      return true;
    }
    // Europe & Northern/Central Asia
    if (lat >= 35 && lat <= 78 && lon >= -10 && lon <= 160) {
      if (lat > 55 && lon > 10 && lat < 68 && lon < 30) return false; // Baltic
      if (lat > 40 && lon > 25 && lat < 47 && lon < 42) return false; // Black Sea
      return true;
    }
    // South Asia / India / Southeast Asia
    if (lat >= 1 && lat <= 35 && lon >= 60 && lon <= 140) {
      return true;
    }
    // North America
    if (lat >= 8 && lat <= 78 && lon >= -168 && lon <= -52) {
      if (lat > 20 && lon > -97 && lat < 30 && lon < -80) return false; // Gulf of Mexico
      return true;
    }
    // South America
    if (lat >= -56 && lat <= 12 && lon >= -82 && lon <= -34) {
      return true;
    }
    // Australia
    if (lat >= -44 && lat <= -10 && lon >= 113 && lon <= 154) {
      return true;
    }
    // Greenland
    if (lat >= 60 && lat <= 83 && lon >= -73 && lon <= -12) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const radius = size * 0.35; // sphere radius

    // 1. Generate points on the sphere
    const dots: { x: number; y: number; z: number; isLand: boolean }[] = [];
    const latStep = 4;
    const lonStep = 4.5;

    for (let lat = -80; lat <= 80; lat += latStep) {
      const latRad = lat * (Math.PI / 180);
      const cosLat = Math.cos(latRad);
      const sinLat = Math.sin(latRad);

      for (let lon = -180; lon <= 180; lon += lonStep) {
        const lonRad = lon * (Math.PI / 180);

        const land = isLand(lat, lon);

        // Convert spherical coords to 3D Cartesian coordinates
        // X = right, Y = up, Z = deep (pointing out of screen)
        const x = radius * cosLat * Math.sin(lonRad);
        const y = radius * sinLat;
        const z = radius * cosLat * Math.cos(lonRad);

        dots.push({ x, y, z, isLand: land });
      }
    }

    // Helper: Convert lat/lon of a city directly to 3D Cartesian coordinate on the globe sphere
    const getCartesian = (lat: number, lon: number, r: number) => {
      const latRad = lat * (Math.PI / 180);
      const lonRad = lon * (Math.PI / 180);
      return {
        x: r * Math.cos(latRad) * Math.sin(lonRad),
        y: r * Math.sin(latRad),
        z: r * Math.cos(latRad) * Math.cos(lonRad),
      };
    };

    let animationFrameId: number;

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Spin decay and auto rotation
      if (!isDragging) {
        rotation.current.y += velocity.current.y;
        rotation.current.x += velocity.current.x;

        // Apply friction to user spin
        velocity.current.y *= 0.95;
        velocity.current.x *= 0.95;

        // Minimal default auto-rotation
        if (Math.abs(velocity.current.y) < 0.002) {
          rotation.current.y += 0.004;
        }
      }

      // Keep angles clean
      rotation.current.y %= Math.PI * 2;
      rotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotation.current.x)); // Limit up/down rotation

      // Clear
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const scaleVal = zoom;

      // Rotation matrix values
      const cosY = Math.cos(rotation.current.y);
      const sinY = Math.sin(rotation.current.y);
      const cosX = Math.cos(rotation.current.x);
      const sinX = Math.sin(rotation.current.x);

      // 3D rotation transform function
      const rotatePoint = (pt: { x: number; y: number; z: number }) => {
        // Rotate Y axis
        let x1 = pt.x * cosY - pt.z * sinY;
        let z1 = pt.x * sinY + pt.z * cosY;
        // Rotate X axis
        let y2 = pt.y * cosX - z1 * sinX;
        let z2 = pt.y * sinX + z1 * cosX;

        return { x: x1, y: y2, z: z2 };
      };

      // Project 3D point to 2D screen coordinate
      const project = (pt: { x: number; y: number; z: number }) => {
        const rPt = rotatePoint(pt);
        // Perspective projection
        const distance = radius * 3.5;
        const fov = radius * 3.5;
        const perspective = fov / (distance + rPt.z);
        
        return {
          x: centerX + rPt.x * perspective * scaleVal,
          y: centerY - rPt.y * perspective * scaleVal,
          z: rPt.z, // depth
          scale: perspective * scaleVal
        };
      };

      // Draw faint blue atmosphere glow around the globe base
      const glowGrad = ctx.createRadialGradient(centerX, centerY, radius * 0.95 * scaleVal, centerX, centerY, radius * 1.25 * scaleVal);
      glowGrad.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
      glowGrad.addColorStop(0.3, 'rgba(59, 130, 246, 0.08)');
      glowGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.35 * scaleVal, 0, Math.PI * 2);
      ctx.fill();

      // Render Globe grid lines (behind)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
      ctx.lineWidth = 1;
      // Draw grid circles
      for (let r = 0.2; r < 1.0; r += 0.2) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * r * scaleVal, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Sort and Draw Globe dots (depth sorting not strictly required for small points, but we can divide them by hemisphere)
      dots.forEach((dot) => {
        const proj = project(dot);
        
        // Front hemisphere (Z >= 0) vs Back hemisphere (Z < 0)
        const isFront = proj.z > -20;
        
        if (dot.isLand) {
          // Land: vibrant gold/amber color
          ctx.fillStyle = isFront ? 'rgba(245, 158, 11, 0.75)' : 'rgba(245, 158, 11, 0.15)';
          const dotRadius = (dot.isLand ? 1.2 : 0.6) * proj.scale;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, Math.max(0.5, dotRadius), 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Water dots: tiny, faint blue/slate dots
          ctx.fillStyle = isFront ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.04)';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, Math.max(0.3, 0.5 * proj.scale), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3. Draw connection arcs (Flights routes)
      flightRoutes.forEach((route) => {
        const fromCity = cities.find(c => c.name === route.from);
        const toCity = cities.find(c => c.name === route.to);
        if (!fromCity || !toCity) return;

        // Convert cities to 3D coords on the sphere
        const ptA = getCartesian(fromCity.lat, fromCity.lon, radius);
        const ptB = getCartesian(toCity.lat, toCity.lon, radius);

        // Calculate control point for 3D bezier arc curve (raised above globe)
        const midPt = {
          x: (ptA.x + ptB.x) / 2,
          y: (ptA.y + ptB.y) / 2,
          z: (ptA.z + ptB.z) / 2
        };
        const len = Math.sqrt(midPt.x**2 + midPt.y**2 + midPt.z**2);
        const arcHeight = 1.35; // Bezier control point height factor
        const ctrlPt = {
          x: (midPt.x / len) * radius * arcHeight,
          y: (midPt.y / len) * radius * arcHeight,
          z: (midPt.z / len) * radius * arcHeight
        };

        // Draw bezier arc segment by segment in 3D space to handle rotation correctly
        const segments = 24;
        ctx.beginPath();
        const startProj = project(ptA);
        ctx.moveTo(startProj.x, startProj.y);

        let avgZ = 0;
        for (let i = 1; i <= segments; i++) {
          const t = i / segments;
          // Quadratic Bezier interpolation in 3D: P(t) = (1-t)^2 * A + 2(1-t)t * C + t^2 * B
          const t1 = (1 - t)**2;
          const t2 = 2 * (1 - t) * t;
          const t3 = t**2;
          
          const pt = {
            x: t1 * ptA.x + t2 * ctrlPt.x + t3 * ptB.x,
            y: t1 * ptA.y + t2 * ctrlPt.y + t3 * ptB.y,
            z: t1 * ptA.z + t2 * ctrlPt.z + t3 * ptB.z
          };
          
          const ptProj = project(pt);
          avgZ += ptProj.z;
          ctx.lineTo(ptProj.x, ptProj.y);
        }
        avgZ /= segments;

        // Occlusion opacity: fade lines that are on the back side of the Earth
        const opacity = avgZ > -50 ? 0.6 : 0.08;
        ctx.strokeStyle = route.color.replace('0.6', opacity.toString()).replace('0.7', opacity.toString());
        ctx.lineWidth = 1.2 * scaleVal;
        ctx.stroke();

        // Animate flight photon pulse along the line
        const speedFactor = 0.45;
        const photonT = ((time * 0.001 * speedFactor) + (cities.indexOf(fromCity) * 0.15)) % 1.0;
        const t1 = (1 - photonT)**2;
        const t2 = 2 * (1 - photonT) * photonT;
        const t3 = photonT**2;
        const photonPt = {
          x: t1 * ptA.x + t2 * ctrlPt.x + t3 * ptB.x,
          y: t1 * ptA.y + t2 * ctrlPt.y + t3 * ptB.y,
          z: t1 * ptA.z + t2 * ctrlPt.z + t3 * ptB.z
        };
        const photonProj = project(photonPt);
        
        // Only draw photon if it is on the visible front face
        if (photonProj.z > -10) {
          ctx.beginPath();
          ctx.arc(photonProj.x, photonProj.y, 3 * scaleVal, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = route.color.includes('rgba(245') ? '#fbbf24' : '#60a5fa';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      // 4. Draw city pins and text labels
      cities.forEach((city) => {
        const pt = getCartesian(city.lat, city.lon, radius);
        const proj = project(pt);

        // Hide cities on the back side of the Earth
        if (proj.z < -10) return;

        // Bouncing animation height for pins
        const bounce = Math.sin(time * 0.005 + cities.indexOf(city)) * 3;

        // Draw pin dot pulse
        const pulseSize = 4 + (Math.sin(time * 0.008 + cities.indexOf(city)) + 1) * 3;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, pulseSize * scaleVal, 0, Math.PI * 2);
        ctx.fillStyle = city.color + '33'; // transparent
        ctx.fill();

        // Pin core
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 3 * scaleVal, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = city.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Drawing labeled lines and name tags
        ctx.beginPath();
        ctx.moveTo(proj.x, proj.y);
        ctx.lineTo(proj.x + 8 * scaleVal, proj.y - 8 * scaleVal + bounce);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // City Name Text Box
        ctx.font = 'bold 9px sans-serif';
        const labelText = city.arabicName;
        const textWidth = ctx.measureText(labelText).width;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; // slate-900 transparent
        ctx.fillRect(proj.x + 10 * scaleVal, proj.y - 15 * scaleVal + bounce, textWidth + 8, 12);
        ctx.strokeStyle = city.color + '88';
        ctx.strokeRect(proj.x + 10 * scaleVal, proj.y - 15 * scaleVal + bounce, textWidth + 8, 12);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(labelText, proj.x + 14 * scaleVal, proj.y - 6 * scaleVal + bounce);
      });
    };

    animationFrameId = requestAnimationFrame(animate);

    // Mouse Drag events for rotation interaction
    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;

      // Calculate new rotation values
      rotation.current.y += dx * 0.005;
      rotation.current.x += dy * 0.005;

      // Update spin momentum velocity
      velocity.current.y = dx * 0.005;
      velocity.current.x = dy * 0.005;

      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Zoom support via scroll wheel
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((prevZoom) => Math.max(0.6, Math.min(2.0, prevZoom - e.deltaY * 0.001)));
    };

    const canvasEl = canvas;
    canvasEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvasEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('wheel', handleWheel);
    };
  }, [size, isDragging, zoom]);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
      {/* Mini zoom indicator */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-300 backdrop-blur-sm shadow-lg">
        <span>🖱️ Drag to rotate</span>
        <span className="text-slate-500">|</span>
        <span>🔍 Scroll to zoom (x{zoom.toFixed(1)})</span>
      </div>
    </div>
  );
}
