import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createNoise3D } from 'simplex-noise';
import { HexColorPicker } from "react-colorful";
import './App.css';

const noise3D = createNoise3D();

function Petal({ position, rotation, scale, elongation, compression, twist, noiseScale, noiseSpeed, color }) {
  const meshRef = useRef();
  const initialPositions = useRef();
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta * noiseSpeed;
    if (meshRef.current) {
      const geometry = meshRef.current.geometry;
      const positionAttribute = geometry.attributes.position;

      if (!initialPositions.current) {
        initialPositions.current = positionAttribute.array.slice();
      }

      for (let i = 0; i < positionAttribute.count; i++) {
        let x = initialPositions.current[i * 3];
        let y = initialPositions.current[i * 3 + 1];
        let z = initialPositions.current[i * 3 + 2];

        // Apply noise
        const noiseValue = noise3D(x * noiseScale, y * noiseScale, time.current) * 0.2;
        x += noiseValue;
        y += noiseValue;
        z += noiseValue;

        // Apply elongation
        y *= 1 + (elongation - 1) * Math.abs(y);

        // Apply compression
        const compressionFactor = 1 + (compression - 1) * (1 - Math.abs(y));
        x *= compressionFactor;
        z *= compressionFactor;

        // Apply twist
        const twistAngle = y * twist * Math.PI * 2;
        const cosAngle = Math.cos(twistAngle);
        const sinAngle = Math.sin(twistAngle);
        const newX = x * cosAngle - z * sinAngle;
        const newZ = x * sinAngle + z * cosAngle;

        positionAttribute.setXYZ(i, newX, y, newZ);
      }

      positionAttribute.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Flower({ petalCount, petalSize, elongation, compression, twist, noiseScale, noiseSpeed, color }) {
  const petals = useMemo(() => {
    const petalArray = [];
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const x = Math.cos(angle) * petalSize * 0.5;
      const y = Math.sin(angle) * petalSize * 0.5;
      petalArray.push(
        <Petal
          key={i}
          position={[x, y, 0]}
          rotation={[0, 0, angle]}
          scale={[petalSize * 0.2, petalSize * 0.2, petalSize * 0.2]}
          elongation={elongation}
          compression={compression}
          twist={twist}
          noiseScale={noiseScale}
          noiseSpeed={noiseSpeed}
          color={color}
        />
      );
    }
    return petalArray;
  }, [petalCount, petalSize, elongation, compression, twist, noiseScale, noiseSpeed, color]);

  return <>{petals}</>;
}

function App() {
  const [petalCount, setPetalCount] = useState(5);
  const [petalSize, setPetalSize] = useState(2);
  const [elongation, setElongation] = useState(1);
  const [compression, setCompression] = useState(1);
  const [twist, setTwist] = useState(0);
  const [noiseScale, setNoiseScale] = useState(1);
  const [noiseSpeed, setNoiseSpeed] = useState(0.5);
  const [color, setColor] = useState("#ff88cc");

  return (
    <div className="App">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Flower
          petalCount={petalCount}
          petalSize={petalSize}
          elongation={elongation}
          compression={compression}
          twist={twist}
          noiseScale={noiseScale}
          noiseSpeed={noiseSpeed}
          color={color}
        />
        <OrbitControls />
      </Canvas>
      <div className="controls">
        <label>
          Petal Count:
          <input type="range" min="1" max="20" value={petalCount} onChange={(e) => setPetalCount(parseInt(e.target.value))} />
          {petalCount}
        </label>
        <label>
          Petal Size:
          <input type="range" min="0.5" max="5" step="0.1" value={petalSize} onChange={(e) => setPetalSize(parseFloat(e.target.value))} />
          {petalSize.toFixed(1)}
        </label>
        <label>
          Elongation:
          <input type="range" min="0.5" max="2" step="0.1" value={elongation} onChange={(e) => setElongation(parseFloat(e.target.value))} />
          {elongation.toFixed(1)}
        </label>
        <label>
          Compression:
          <input type="range" min="0.5" max="2" step="0.1" value={compression} onChange={(e) => setCompression(parseFloat(e.target.value))} />
          {compression.toFixed(1)}
        </label>
        <label>
          Twist:
          <input type="range" min="-2" max="2" step="0.1" value={twist} onChange={(e) => setTwist(parseFloat(e.target.value))} />
          {twist.toFixed(1)}
        </label>
        <label>
          Noise Scale:
          <input type="range" min="0.1" max="5" step="0.1" value={noiseScale} onChange={(e) => setNoiseScale(parseFloat(e.target.value))} />
          {noiseScale.toFixed(1)}
        </label>
        <label>
          Noise Speed:
          <input type="range" min="0" max="2" step="0.1" value={noiseSpeed} onChange={(e) => setNoiseSpeed(parseFloat(e.target.value))} />
          {noiseSpeed.toFixed(1)}
        </label>
        <label>
          Color:
          <HexColorPicker color={color} onChange={setColor} />
        </label>
      </div>
    </div>
  );
}

export default App;