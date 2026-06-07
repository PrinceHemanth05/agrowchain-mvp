import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  
  // We use refs instead of state for position to prevent React from re-rendering the whole page every single time the mouse moves by 1 pixel!
  const positionRef = useRef({ 
    mouseX: 0, 
    mouseY: 0, 
    destinationX: 0, 
    destinationY: 0 
  });

  useEffect(() => {
    // 1. Capture the exact mouse coordinates
    const handleMouseMove = (event) => {
      positionRef.current.mouseX = event.clientX;
      positionRef.current.mouseY = event.clientY;
    };

    document.addEventListener('mousemove', handleMouseMove);

    // 2. Create the smooth "trailing" physics effect using Linear Interpolation (Lerp)
    const followMouse = () => {
      positionRef.current.destinationX += (positionRef.current.mouseX - positionRef.current.destinationX) * 0.15;
      positionRef.current.destinationY += (positionRef.current.mouseY - positionRef.current.destinationY) * 0.15;

      if (cursorRef.current) {
        // Offset by 16px (half of the 32px width/height) to perfectly center the circle on the pointer
        cursorRef.current.style.transform = `translate3d(${positionRef.current.destinationX - 16}px, ${positionRef.current.destinationY - 16}px, 0)`;
      }
      
      requestAnimationFrame(followMouse);
    };
    
    // Start the animation loop
    requestAnimationFrame(followMouse);

    // Cleanup event listener when component unmounts
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 w-8 h-8 bg-emerald-400/20 border border-emerald-400/60 rounded-full z-[9999] shadow-[0_0_20px_rgba(52,211,153,0.4)] hidden md:block"
      style={{ 
        willChange: 'transform',
        backdropFilter: 'blur(2px)' 
      }}
    />
  );
}