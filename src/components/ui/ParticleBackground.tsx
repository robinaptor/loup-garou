import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  type: 'star' | 'leaf' | 'ember';
}

export const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phase = useGameStore(s => s.phase);
  const isNight = phase === 'nuit' || phase === 'distribution-roles' || phase === 'lobby' || phase === 'fin';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animFrame: number;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: isNight ? -0.3 - Math.random() * 0.3 : 0.2 + Math.random() * 0.4,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      type: isNight ? 'star' : Math.random() > 0.5 ? 'leaf' : 'ember',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        
        if (p.type === 'star') {
          ctx.fillStyle = '#c9a84c';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#c9a84c';
          ctx.fill();
        } else if (p.type === 'ember') {
          ctx.fillStyle = '#ff6b35';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ff4500';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `hsl(${100 + Math.random() * 40}, 30%, 25%)`;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size, p.size * 2, p.x * 0.01, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.opacity += Math.sin(Date.now() * 0.002 + p.x) * 0.003;

        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        p.opacity = Math.max(0.1, Math.min(0.8, p.opacity));
      });

      animFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [isNight]);

  return (
    <>
      <div
        className="fixed inset-0 transition-colors duration-[3000ms] -z-20"
        style={{
          background: isNight
            ? 'radial-gradient(ellipse at top, #0d1b3e 0%, #0a0a0f 60%)'
            : 'radial-gradient(ellipse at top, #3d1a00 0%, #1a0a00 40%, #0a0a0f 100%)',
        }}
      />
      <div className="fixed bottom-0 left-0 right-0 -z-10 pointer-events-none">
        <svg viewBox="0 0 1440 200" className="w-full opacity-40">
          <path
            d="M0,200 L0,120 Q30,80 60,100 Q80,60 100,90 Q130,40 160,70 Q180,30 200,60 L200,200Z"
            fill="#0a0f0a"
          />
          <path
            d="M1240,200 L1240,110 Q1270,70 1300,95 Q1320,50 1350,80 Q1370,35 1390,65 Q1410,25 1440,55 L1440,200Z"
            fill="#0a0f0a"
          />
        </svg>
      </div>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none"
      />
    </>
  );
};
