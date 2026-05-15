import React, { useState } from 'react';
import { PlayerStats, Item } from '../types';

interface UIOverlayProps {
  stats: PlayerStats;
  openShop: () => void;
  openInventory: () => void;
  equippedItems: Item[];
  wave: number;
  isAutoplay: boolean;
  isPaused: boolean;
  isMuted: boolean;
  toggleAutoplay: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onUseSkill: (id: number) => void;
  onToggleMute: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  stats, 
  openShop, 
  openInventory, 
  equippedItems, 
  wave, 
  isAutoplay, 
  isPaused,
  isMuted,
  toggleAutoplay, 
  onTogglePause,
  onRestart,
  onUseSkill,
  onToggleMute
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden font-tech text-cyan-50">
      
      {/* --- TOP RIGHT: SYSTEM COMMAND DECK --- */}
      {/* Moved to Top Right (above Minimap) as a row */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 pointer-events-auto animate-in slide-in-from-right duration-300 z-50">
         
         {/* 1. Inventory */}
         <button 
            onClick={openInventory} 
            className="w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-cyan-500/50 flex items-center justify-center hover:bg-cyan-900/50 hover:border-cyan-400 hover:shadow-[0_0_10px_#06b6d4] transition-all group rounded-lg" 
            title="Inventory"
         >
            <span className="text-xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">🎒</span>
         </button>

         {/* 2. Shop */}
         <button 
            onClick={openShop} 
            className="w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-pink-500/50 flex items-center justify-center hover:bg-pink-900/50 hover:border-pink-400 hover:shadow-[0_0_10px_#ec4899] transition-all group rounded-lg" 
            title="Shop"
         >
            <span className="text-xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">⚖️</span>
         </button>

         {/* 3. Auto Toggle */}
         <button 
            onClick={toggleAutoplay} 
            className={`h-8 px-2 flex items-center gap-1.5 rounded-lg border backdrop-blur-md transition-all ${isAutoplay ? 'bg-green-900/80 border-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-900/80 border-slate-600 hover:border-slate-400'}`}
            title="Toggle Autoplay"
         >
            <div className={`w-1.5 h-1.5 rounded-full ${isAutoplay ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`}></div>
            <span className={`text-[9px] font-bold font-cyber tracking-wider ${isAutoplay ? 'text-green-300' : 'text-slate-400'}`}>AUTO</span>
         </button>

         {/* 4. Sound Toggle */}
         <button 
            onClick={onToggleMute} 
            className={`w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-slate-600 flex items-center justify-center hover:border-cyan-400 hover:bg-slate-800 transition-all rounded-lg group ${!isMuted ? 'border-cyan-500/50' : ''}`}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
         >
            <span className={`text-lg transition-transform group-hover:scale-110 ${isMuted ? 'opacity-50 grayscale' : 'opacity-100 text-cyan-400'}`}>
                {isMuted ? '🔇' : '🔊'}
            </span>
         </button>

         {/* 5. Settings Button */}
         <div className="relative">
             <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`w-10 h-10 bg-slate-900/80 backdrop-blur-md border border-slate-600 flex items-center justify-center hover:border-slate-400 hover:bg-slate-700 transition-all rounded-lg ${isSettingsOpen ? 'bg-slate-700 border-slate-400' : ''}`}
                title="Settings"
             >
                <span className="text-xl opacity-80">⚙️</span>
             </button>
             
             {/* Settings Dropdown */}
             {isSettingsOpen && (
                 <div className="absolute top-full right-0 mt-2 w-44 bg-slate-900/95 border border-slate-600 p-2 shadow-xl flex flex-col gap-1 rounded-lg animate-in fade-in slide-in-from-top-2">
                     <button 
                        onClick={() => { onTogglePause(); setIsSettingsOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-cyber hover:bg-slate-800 hover:text-cyan-400 transition-colors border border-transparent hover:border-slate-700 rounded"
                     >
                        {isPaused ? '▶ RESUME GAME' : '⏸ PAUSE GAME'}
                     </button>
                     <button 
                        onClick={() => { onRestart(); setIsSettingsOpen(false); }}
                        className="w-full text-left px-3 py-2 text-xs font-cyber text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors border border-transparent hover:border-red-900/50 rounded"
                     >
                        ↺ RESTART GAME
                     </button>
                 </div>
             )}
         </div>
      </div>

      {/* --- PLAYER HUD (Top Left Cluster) --- */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 pointer-events-auto max-w-[85vw] sm:max-w-md">
        
        {/* Row 1: Vitals (Level + Bars) */}
        <div className="flex items-center gap-2 sm:gap-3">
            {/* Level Hexagon */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 z-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-slate-900/80 border-2 border-cyan-500 clip-path-hexagon shadow-[0_0_15px_#06b6d4]"></div>
                <div className="relative flex flex-col items-center justify-center">
                    <span className="text-[8px] sm:text-[10px] text-cyan-400 uppercase tracking-widest leading-none">LVL</span>
                    <span className="font-cyber font-bold text-lg sm:text-xl text-white neon-text">{stats.level}</span>
                </div>
            </div>

            {/* Bars Container - Compacted width on mobile */}
            <div className="flex flex-col gap-1.5 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                {/* HP Bar */}
                <div className="w-28 sm:w-64 h-4 sm:h-5 bg-slate-900/80 border border-slate-600 skew-x-[-15deg] overflow-hidden relative group">
                     <div className="h-full bg-gradient-to-r from-pink-900 via-pink-600 to-pink-500 transition-all duration-300 shadow-[0_0_10px_#ec4899]" style={{width: `${(stats.hp / stats.maxHp)*100}%`}}>
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] w-full animate-shine"></div>
                     </div>
                     <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[10px] font-bold tracking-widest skew-x-[15deg] text-white/90 font-cyber z-10">
                        HP: {Math.floor(stats.hp)}
                     </span>
                </div>
                {/* MP Bar */}
                <div className="w-20 sm:w-48 h-2.5 sm:h-3 bg-slate-900/80 border border-slate-600 skew-x-[-15deg] overflow-hidden relative">
                     <div className="h-full bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-400 transition-all duration-300 shadow-[0_0_10px_#22d3ee]" style={{width: `${(stats.mp / stats.maxMp)*100}%`}}></div>
                </div>
                {/* XP Bar */}
                <div className="w-16 sm:w-40 h-1 sm:h-1.5 bg-slate-900/80 border border-slate-700 skew-x-[-15deg] overflow-hidden relative" title={`XP: ${stats.xp} / ${stats.maxXp}`}>
                    <div 
                        className="h-full bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-300 transition-all duration-700 ease-out shadow-[0_0_5px_rgba(234,179,8,0.5)]" 
                        style={{ width: `${Math.min(100, (stats.xp / stats.maxXp) * 100)}%` }}
                    >
                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Row 2: Control Panel (Resources Only) */}
        <div className="flex items-center gap-4 pl-2 animate-in slide-in-from-left duration-300">
             {/* Resource Data Block */}
             <div className="flex items-center gap-2 sm:gap-4 bg-slate-900/70 backdrop-blur border border-cyan-500/30 px-3 sm:px-4 py-1 skew-x-[-15deg] shadow-lg">
                 <div className="skew-x-[15deg] flex flex-col items-center leading-none">
                     <span className="text-[7px] sm:text-[9px] text-cyan-400 uppercase tracking-widest font-cyber">Wave</span>
                     <span className="text-xs sm:text-sm font-bold text-white neon-text">{wave}</span>
                 </div>
                 <div className="skew-x-[15deg] w-px h-6 bg-cyan-500/30"></div>
                 <div className="skew-x-[15deg] flex flex-col items-center leading-none">
                     <span className="text-[7px] sm:text-[9px] text-yellow-400 uppercase tracking-widest font-cyber">Creds</span>
                     <span className="text-xs sm:text-sm font-bold text-yellow-200 font-mono">{stats.gold}</span>
                 </div>
                 <div className="skew-x-[15deg] w-px h-6 bg-cyan-500/30"></div>
                 <div className="skew-x-[15deg] flex flex-col items-center leading-none">
                     <span className="text-[7px] sm:text-[9px] text-purple-400 uppercase tracking-widest font-cyber">Runes</span>
                     <span className="text-xs sm:text-sm font-bold text-purple-200 font-mono">{stats.runes}</span>
                 </div>
             </div>
        </div>

        {/* Buffs Row (Below Panel) */}
        <div className="flex gap-2 mt-1 pl-2">
             {equippedItems.map((item, i) => (
                 <div key={i} className="w-8 h-8 sm:w-9 sm:h-9 border border-cyan-500/30 bg-black/60 shadow-[0_0_5px_rgba(6,182,212,0.2)] relative group overflow-hidden skew-x-[-6deg]">
                     <img src={item.image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 skew-x-[6deg] scale-110" alt="buff" />
                     <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent pointer-events-none"></div>
                 </div>
             ))}
        </div>

      </div>

      {/* --- PAUSE OVERLAY --- */}
      {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-[2px] pointer-events-auto">
              <div className="bg-slate-900/90 border border-cyan-500 p-6 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center">
                  <h2 className="text-3xl font-cyber font-bold text-white tracking-widest animate-pulse">PAUSED</h2>
                  <button 
                    onClick={onTogglePause}
                    className="mt-4 px-6 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-cyber text-sm tracking-wider clip-path-corner transition-all"
                  >
                      RESUME MISSION
                  </button>
              </div>
          </div>
      )}

      {/* Combat Controls were here, now moved to Controls.tsx */}
      
      <style>{`
        .clip-path-hexagon {
          clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
        }
        .clip-path-corner {
          clip-path: polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%);
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default UIOverlay;