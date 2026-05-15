import React, { useRef, useEffect, useState } from 'react';

interface ControlsProps {
  onInput: (vector: { x: number, y: number }, isAttacking: boolean) => void;
  onSkill: (id: number) => boolean;
  skillCooldowns: Record<number, number>;
}

const Controls: React.FC<ControlsProps> = ({ onInput, onSkill, skillCooldowns }) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  
  // Use refs for tracking drag state to avoid stale closures in window event listeners
  const touchIdRef = useRef<number | null>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // Visual state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isAttacking, setIsAttacking] = useState(false);
  
  // Track visual cooldowns for all 3 skills
  const [cooldowns, setCooldowns] = useState<{ [key: number]: number }>({ 1: 0, 2: 0, 3: 0 });
  
  // Config for cooldowns (Matches App.tsx logic where applicable)
  const COOLDOWN_DURATIONS: { [key: number]: number } = {
      3: 10000 // Pyro
      // Spin and Nanobot don't have hard cooldowns in App.tsx (MP based), but we support visualization if added.
  };

  // Output refs
  const vectorRef = useRef({ x: 0, y: 0 });
  const attackingRef = useRef(false);

  // Animation loop to feed input
  useEffect(() => {
    let animationFrame: number;
    const loop = () => {
      onInput(vectorRef.current, attackingRef.current);
      animationFrame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrame);
  }, [onInput]);

  // Sync cooldown visualization with props
  useEffect(() => {
    let frame: number;
    const updateCooldowns = () => {
       const now = Date.now();
       const newCooldowns: { [key: number]: number } = {};
       let active = false;

       [1, 2, 3].forEach(id => {
           const end = skillCooldowns[id] || 0;
           const remaining = end - now;
           const total = COOLDOWN_DURATIONS[id] || 1000; // Default to 1s if unknown to avoid div by zero
           
           if (remaining > 0) {
               newCooldowns[id] = remaining / total;
               active = true;
           } else {
               newCooldowns[id] = 0;
           }
       });
       
       setCooldowns(newCooldowns);

       if (active) {
           frame = requestAnimationFrame(updateCooldowns);
       }
    };
    
    // Trigger if any cooldown is active in props
    const hasActive = Object.values(skillCooldowns).some((t: number) => t > Date.now());
    if (hasActive) {
        updateCooldowns();
    } else {
        setCooldowns({ 1: 0, 2: 0, 3: 0 });
    }

    return () => cancelAnimationFrame(frame);
  }, [skillCooldowns]);

  // Input Logic
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    // Prevent default to stop scrolling/zooming on mobile
    if (e.cancelable) e.preventDefault();
    
    // Determine start position and ID
    let clientX, clientY;
    if ('touches' in e) {
      const touchEvent = e as React.TouchEvent;
      const touch = touchEvent.changedTouches[0];
      touchIdRef.current = touch.identifier;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      const mouseEvent = e as React.MouseEvent;
      clientX = mouseEvent.clientX;
      clientY = mouseEvent.clientY;
    }

    if (joystickRef.current) {
        const rect = joystickRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        originRef.current = { x: centerX, y: centerY };
        
        isDraggingRef.current = true;
        setPosition({ x: 0, y: 0 });
        
        // Attach window listeners for robust dragging (allows dragging outside the box)
        if ('touches' in e) {
             window.addEventListener('touchmove', handleWindowMove, { passive: false });
             window.addEventListener('touchend', handleWindowEnd);
        } else {
             window.addEventListener('mousemove', handleWindowMove);
             window.addEventListener('mouseup', handleWindowEnd);
        }
    }
  };

  const handleWindowMove = (e: TouchEvent | MouseEvent) => {
    if (!isDraggingRef.current) return;
    if (e.cancelable) e.preventDefault();

    let clientX, clientY;
    
    if ('changedTouches' in e) {
        const touchEvent = e as TouchEvent;
        let touch: Touch | undefined;
        for (let i = 0; i < touchEvent.changedTouches.length; i++) {
            if (touchEvent.changedTouches[i].identifier === touchIdRef.current) {
                touch = touchEvent.changedTouches[i];
                break;
            }
        }
        if (!touch) return;
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        const mouseEvent = e as MouseEvent;
        clientX = mouseEvent.clientX;
        clientY = mouseEvent.clientY;
    }

    const dx = clientX - originRef.current.x;
    const dy = clientY - originRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 40; // Max joystick radius

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(distance, maxDist);

    const x = Math.cos(angle) * clampedDist;
    const y = Math.sin(angle) * clampedDist;

    setPosition({ x, y });

    // Normalize for output (-1 to 1)
    vectorRef.current = {
        x: x / maxDist,
        y: y / maxDist
    };
  };

  const handleWindowEnd = () => {
    isDraggingRef.current = false;
    touchIdRef.current = null;
    setPosition({ x: 0, y: 0 });
    vectorRef.current = { x: 0, y: 0 };

    // Clean up window listeners
    window.removeEventListener('touchmove', handleWindowMove);
    window.removeEventListener('touchend', handleWindowEnd);
    window.removeEventListener('mousemove', handleWindowMove);
    window.removeEventListener('mouseup', handleWindowEnd);
  };

  // Attack Button Logic
  const handleAttackDown = (e: React.SyntheticEvent) => {
      e.preventDefault();
      setIsAttacking(true);
      attackingRef.current = true;
  };
  
  const handleAttackUp = (e: React.SyntheticEvent) => {
      e.preventDefault();
      setIsAttacking(false);
      attackingRef.current = false;
  };

  // Skill Press Helper
  const handleSkillPress = (e: React.SyntheticEvent, id: number) => {
     e.preventDefault();
     if (cooldowns[id] > 0) return;
     onSkill(id); 
  };

  // Doughnut Math (Fixed Size for 56px button)
  const size = 56;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2; 
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const renderSkillButton = (id: number, icon: string, label: string, colorClass: string, borderColor: string, positionClass: string) => {
      const cd = cooldowns[id] || 0;
      return (
         <div className={`absolute ${positionClass} group`}>
             <button
                className={`w-14 h-14 rounded-full bg-slate-900/90 border ${colorClass} shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden active:scale-95 transition-all ${cd > 0 ? 'cursor-not-allowed opacity-80' : 'hover:scale-105 hover:brightness-125'}`}
                onTouchStart={(e) => handleSkillPress(e, id)}
                onMouseDown={(e) => handleSkillPress(e, id)}
             >
                <span className={`text-2xl relative z-10 drop-shadow-md ${cd > 0 ? 'grayscale opacity-50' : ''}`}>{icon}</span>
                
                {/* Doughnut Cooldown Timer */}
                {cd > 0 && (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                         <svg className="rotate-[-90deg] w-full h-full">
                            <circle r={radius} cx={center} cy={center} stroke="rgba(0,0,0,0.8)" strokeWidth={strokeWidth} fill="transparent" />
                            <circle 
                                r={radius} cx={center} cy={center} 
                                stroke={borderColor} strokeWidth={strokeWidth} fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference * (1 - cd)}
                                strokeLinecap="round"
                                className="transition-all duration-75 ease-linear"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold font-mono drop-shadow-md">
                                {Math.ceil(cd * ((COOLDOWN_DURATIONS[id] || 1000) / 1000))}
                            </span>
                        </div>
                    </div>
                )}
             </button>
             <span className={`absolute -bottom-3 w-full text-center text-[7px] font-cyber font-bold bg-black/80 px-1 rounded border border-white/10 uppercase tracking-widest ${id === 3 ? 'text-orange-400' : (id === 2 ? 'text-green-400' : 'text-cyan-400')}`}>
                 {label}
             </span>
         </div>
      );
  };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden">
      {/* Joystick Area - Bottom Left */}
      <div 
        className="absolute bottom-12 left-8 w-32 h-32 pointer-events-auto"
        ref={joystickRef}
        onTouchStart={handleStart}
        onMouseDown={handleStart}
      >
        <div className="w-full h-full rounded-full bg-black/40 border-2 border-cyan-900/50 backdrop-blur-sm relative flex items-center justify-center shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]">
            <div 
                className="w-12 h-12 rounded-full bg-gradient-to-t from-cyan-900 to-slate-800 shadow-[0_0_10px_rgba(6,182,212,0.5)] border border-cyan-500/50 relative"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out'
                }}
            >
                <div className="absolute inset-2 rounded-full bg-cyan-400 opacity-20 blur-sm"></div>
            </div>
        </div>
      </div>

      {/* Action Cluster - Bottom Right */}
      <div className="absolute bottom-6 right-6 pointer-events-auto w-48 h-48 flex items-end justify-end">
         
         {/* Skill 1: Spin (Left) */}
         {renderSkillButton(1, '🌪️', 'SPIN', 'border-cyan-500/50 shadow-cyan-500/20', '#22d3ee', 'bottom-4 right-24')}

         {/* Skill 2: Nanobot (Diagonal) */}
         {renderSkillButton(2, '✨', 'NANO', 'border-green-500/50 shadow-green-500/20', '#4ade80', 'bottom-20 right-20')}

         {/* Skill 3: Pyro (Top) */}
         {renderSkillButton(3, '🔥', 'PYRO', 'border-orange-500/50 shadow-orange-500/20', '#f97316', 'bottom-24 right-4')}

         {/* Main Attack Button */}
         <button 
            className={`w-20 h-20 rounded-full border-[3px] shadow-[0_0_25px_rgba(180,83,9,0.4)] flex items-center justify-center transition-all duration-100 relative overflow-hidden group absolute bottom-0 right-0 ${isAttacking ? 'scale-90 brightness-75' : 'hover:scale-105'}`}
            style={{
                background: 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
                borderColor: '#fbbf24'
            }}
            onTouchStart={handleAttackDown}
            onTouchEnd={handleAttackUp}
            onMouseDown={handleAttackDown}
            onMouseUp={handleAttackUp}
            onMouseLeave={handleAttackUp}
         >
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/20 to-transparent pointer-events-none"></div>
            <div className="pointer-events-none relative z-10 transform group-hover:rotate-12 transition-transform duration-300">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'}}>
                    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                    <path d="M13 19l6-6" />
                    <path d="M16 16l4 4" />
                    <path d="M19 21l2-2" />
                </svg>
            </div>
         </button>
      </div>
    </div>
  );
};

export default Controls;