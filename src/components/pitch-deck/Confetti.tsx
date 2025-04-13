
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
    
    // Modern particle animation system
    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      speed: number;
      opacity: number;
      rotation: number;
      rotationSpeed: number;
      type: 'circle' | 'star' | 'square' | 'triangle';
    }[] = [];
    
    const colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
      '#9b59b6', '#1abc9c', '#e67e22', '#27ae60',
      '#d35400', '#2980b9', '#8e44ad', '#c0392b',
      '#16a085', '#f1c40f', '#ecf0f1', '#95a5a6'
    ];
    
    const shapes = ['circle', 'star', 'square', 'triangle'] as const;
    
    // Generate particles
    const particleCount = 100; // Reduced from 120
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height * 0.5,
        size: Math.random() * 8 + 4, // Slightly smaller sizes
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 1.5 + 0.8, // Slightly slower
        opacity: Math.random() * 0.4 + 0.3, // Lower opacity
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        type: shapes[Math.floor(Math.random() * shapes.length)]
      });
    }
    
    // Draw a star shape
    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, spikes: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? radius : radius * 0.4;
        const angle = (i * Math.PI) / spikes;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };
    
    // Draw a triangle
    const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    };
    
    // Draw particles based on their type
    const drawParticle = (particle: typeof particles[0]) => {
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      
      switch (particle.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          ctx.restore();
          break;
        case 'star':
          drawStar(ctx, particle.x, particle.y, particle.size / 2, 5, particle.rotation);
          break;
        case 'triangle':
          drawTriangle(ctx, particle.x, particle.y, particle.size, particle.rotation);
          break;
      }
    };
    
    // Animation loop
    const animate = () => {
      if (!ctx) return;
      
      // Clear canvas completely each frame to prevent buildup
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach((particle, index) => {
        // Update position
        particle.y += particle.speed;
        particle.rotation += particle.rotationSpeed;
        
        // Add some horizontal drift
        particle.x += Math.sin(particle.y * 0.01) * 0.5;
        
        // Draw the particle
        drawParticle(particle);
        
        // Reset particles that go offscreen
        if (particle.y > canvas.height) {
          particles[index] = {
            ...particle,
            x: Math.random() * canvas.width,
            y: -particle.size,
            size: Math.random() * 8 + 4,
            speed: Math.random() * 1.5 + 0.8,
            opacity: Math.random() * 0.4 + 0.3
          };
        }
      });
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive]);
  
  if (!isActive) return null;
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ 
        opacity: 0.8, // Updated to 80% opacity as requested
        mixBlendMode: 'normal'
      }}
    />
  );
};

export default Confetti;
