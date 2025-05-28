
"use client";

import React, { useEffect, useRef } from 'react';

const FloatingShapesBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createShape = () => {
      const shape = document.createElement('div');
      shape.classList.add('floating-shape');
      
      const size = Math.random() * 60 + 20; // 20px to 80px
      shape.style.width = `${size}px`;
      shape.style.height = `${size}px`;
      
      shape.style.left = `${Math.random() * 100}%`;
      shape.style.top = `${Math.random() * 100}%`; // Start at random positions
      
      const duration = Math.random() * 20 + 15; // 15s to 35s
      shape.style.animationDuration = `${duration}s`;
      
      const delay = Math.random() * 5; // 0s to 5s
      shape.style.animationDelay = `-${delay}s`; // Negative delay to start mid-animation

      const opacity = Math.random() * 0.3 + 0.1; // 0.1 to 0.4
      shape.style.opacity = opacity.toString();


      // Randomize shape type
      const shapeType = Math.random();
      if (shapeType < 0.33) {
        // Circle (default)
      } else if (shapeType < 0.66) {
        shape.style.borderRadius = '10%'; // Squarish
      } else {
        shape.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'; // Triangle
        shape.style.borderRadius = '0';
      }
      
      container.appendChild(shape);

      // Remove shape after animation finishes to prevent too many elements
      setTimeout(() => {
        if (shape.parentElement) {
          shape.parentElement.removeChild(shape);
        }
      }, (duration + delay) * 1000 + 500); // Add a little buffer
    };

    const numShapes = 15; // Adjust number of shapes
    for (let i = 0; i < numShapes; i++) {
      createShape();
    }

    return () => {
      if (container) {
        container.innerHTML = ''; // Clear shapes on component unmount
      }
    };
  }, []);

  return <div ref={containerRef} className="floating-shapes-container" aria-hidden="true"></div>;
};

export default FloatingShapesBackground;
