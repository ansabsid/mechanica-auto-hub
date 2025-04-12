
import React, { useEffect, useRef } from 'react';

interface ConfettiProps {
  isActive: boolean;
}

const Confetti: React.FC<ConfettiProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const pieces: {
      x: number;
      y: number;
      size: number;
      speed: number;
      color: string;
      rotation: number;
      rotationSpeed: number;
    }[] = [];
    
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4CAF50', '#8BC34A', '#CDDC39', 
      '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
    ];
    
    // Create confetti pieces
    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 10 + 5,
        speed: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() * 2) - 1
      });
    }
    
    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      pieces.forEach(piece => {
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate((piece.rotation * Math.PI) / 180);
        
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
        
        ctx.restore();
        
        // Update position and rotation
        piece.y += piece.speed;
        piece.rotation += piece.rotationSpeed;
        
        // Reset pieces that fall off the screen
        if (piece.y > canvas.height) {
          piece.y = -piece.size;
          piece.x = Math.random() * canvas.width;
        }
      });
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive]);
  
  if (!isActive) return null;
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

export default Confetti;
