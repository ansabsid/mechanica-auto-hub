
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
    
    // Modern confetti with various shapes and better movement
    const confettiCount = 150;
    const gravity = 0.35;
    const terminalVelocity = 5;
    const drag = 0.075;
    
    const particles: {
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
      tilt: number;
      tiltAngleIncrement: number;
      tiltAngle: number;
      velocity: {x: number, y: number};
      shape: 'circle' | 'square' | 'triangle' | 'line';
      opacity: number;
      opacityDecrement: number;
    }[] = [];
    
    const colors = [
      '#3498db', '#9b59b6', '#e74c3c', '#2ecc71', 
      '#f39c12', '#1abc9c', '#d35400', '#c0392b',
      '#16a085', '#8e44ad', '#2980b9', '#f1c40f',
      '#27ae60', '#e67e22', '#ecf0f1', '#95a5a6'
    ];
    
    const shapes = ['circle', 'square', 'triangle', 'line'] as const;
    
    // Create confetti particles
    for (let i = 0; i < confettiCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5 - canvas.height * 0.25,
        width: Math.random() * 8 + 6,
        height: Math.random() * 4 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncrement: Math.random() * 0.1 + 0.05,
        tiltAngle: 0,
        velocity: {
          x: Math.random() * 4 - 2,
          y: Math.random() * 2 + 0.1
        },
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: 1,
        opacityDecrement: Math.random() * 0.01 + 0.01
      });
    }
    
    const drawParticle = (particle: typeof particles[0]) => {
      ctx.beginPath();
      ctx.setTransform(
        1,
        particle.tilt,
        0,
        1,
        particle.x,
        particle.y
      );
      
      ctx.globalAlpha = particle.opacity;
      
      switch (particle.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, particle.width / 2, 0, Math.PI * 2, false);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(-particle.width / 2, particle.height / 2);
          ctx.lineTo(particle.width / 2, particle.height / 2);
          ctx.lineTo(0, -particle.height / 2);
          ctx.closePath();
          ctx.fill();
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(-particle.width / 2, 0);
          ctx.lineTo(particle.width / 2, 0);
          ctx.lineWidth = particle.height;
          ctx.stroke();
          break;
      }
      
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    
    const updateParticles = () => {
      particles.forEach((particle, index) => {
        // Apply gravity and drag
        particle.velocity.y = Math.min(particle.velocity.y + gravity, terminalVelocity);
        particle.velocity.x *= (1 - drag);
        
        // Update position
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        
        // Update tilt
        particle.tiltAngle += particle.tiltAngleIncrement;
        particle.tilt = Math.sin(particle.tiltAngle) * 10;
        
        // Reduce opacity gradually
        particle.opacity = Math.max(0, particle.opacity - particle.opacityDecrement);
        
        // Reset particles that fall off the screen or become invisible
        if (particle.y > canvas.height || particle.opacity <= 0) {
          if (Math.random() > 0.9 || particle.y > canvas.height) {
            particles[index] = {
              ...particle,
              x: Math.random() * canvas.width,
              y: -20,
              tiltAngle: 0,
              opacity: 1
            };
          }
        }
      });
    };
    
    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      
      updateParticles();
      
      // Draw all particles
      particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.strokeStyle = particle.color;
        drawParticle(particle);
      });
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
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
    />
  );
};

export default Confetti;
