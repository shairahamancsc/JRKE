// src/components/layout/floating-shapes-background.tsx
'use client';

import React, { useEffect, useState } from 'react';

const FloatingShapesBackground = () => {
  const [shapes, setShapes] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);
  const shapeCount = 10; // Number of shapes

  useEffect(() => {
    const generateShapes = () => {
      const newShapes = Array.from({ length: shapeCount }).map((_, index) => ({
        id: index,
        style: {
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 15 + 10}s`, // 10s to 25s
          animationDelay: `${Math.random() * 10}s`, // 0s to 10s delay
          width: `${Math.random() * 50 + 20}px`, // 20px to 70px
          height: `${Math.random() * 50 + 20}px`, // 20px to 70px
          opacity: Math.random() * 0.08 + 0.03, // 0.03 to 0.11
        },
      }));
      setShapes(newShapes);
    };

    generateShapes();
    // Regenerate shapes on window resize to adjust positions, if desired,
    // but for now, keep them static after initial generation for performance.
    // window.addEventListener('resize', generateShapes);
    // return () => window.removeEventListener('resize', generateShapes);
  }, []);


  if (!shapes.length) {
    return null; // Don't render until shapes are generated to avoid SSR/hydration issues with Math.random
  }

  return (
    <div className="floating-shapes-container" aria-hidden="true">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="floating-shape"
          style={shape.style}
        />
      ))}
    </div>
  );
};

export default FloatingShapesBackground;
