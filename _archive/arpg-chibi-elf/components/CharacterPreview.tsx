import React, { useEffect, useState } from 'react';
import { PlayerStats, Item, ItemType } from '../types';
import { getArmorColors, getHeroDefs, getHeroParts, getWeaponSvg } from '../constants';

interface CharacterPreviewProps {
  stats: PlayerStats;
  equippedItems: Item[];
}

const CharacterPreview: React.FC<CharacterPreviewProps> = ({ stats, equippedItems }) => {
  const armor = equippedItems.find(i => i.type === ItemType.ARMOR);
  const weapon = equippedItems.find(i => i.type === ItemType.WEAPON);
  
  const colors = getArmorColors(armor?.name);
  const defs = getHeroDefs(colors);
  const parts = getHeroParts(armor?.name);
  const weaponSvg = getWeaponSvg(weapon?.name);

  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const blinkLoop = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
      const nextBlink = Math.random() * 3000 + 2000;
      timeoutId = setTimeout(blinkLoop, nextBlink);
    };
    timeoutId = setTimeout(blinkLoop, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  const { usePhoto, photoUrl } = stats.avatarConfig;

  return (
    <div className="relative w-full aspect-[3/4] flex items-center justify-center bg-gradient-to-b from-slate-900 to-black border border-slate-700 rounded-lg overflow-hidden shadow-inner group">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative w-full h-full">
        <svg 
            viewBox="0 0 400 500" 
            className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
        >
            <defs dangerouslySetInnerHTML={{ __html: defs }} />
            {usePhoto && (
                <defs>
                    <clipPath id="previewFaceClip">
                        <ellipse cx="200" cy="175" rx="80" ry="70" />
                    </clipPath>
                </defs>
            )}
            
            <g transform="translate(50, 0)" dangerouslySetInnerHTML={{ __html: parts.armL }} />
            <g dangerouslySetInnerHTML={{ __html: parts.legL }} />
            <g dangerouslySetInnerHTML={{ __html: parts.body }} />
            
            {/* Avatar Photo Overlay (Larger & Integrated) */}
            {usePhoto && photoUrl && (
                <g>
                    <image 
                        href={photoUrl} 
                        x="120" y="105" 
                        width="160" height="140" 
                        clipPath="url(#previewFaceClip)"
                        preserveAspectRatio="xMidYMid slice"
                    />
                    {/* Inner Shadow / Ring to blend */}
                    <ellipse cx="200" cy="175" rx="80" ry="70" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="4" />
                </g>
            )}

            <g dangerouslySetInnerHTML={{ __html: parts.legR }} />
            <g transform="translate(-50, 0)" dangerouslySetInnerHTML={{ __html: parts.armR }} />
            <g transform="translate(-50, 0)" dangerouslySetInnerHTML={{ __html: weaponSvg }} />

            {/* Blink Overlay (Hidden if photo) */}
            {isBlinking && !usePhoto && (
                <g transform="translate(100, 50)">
                    <ellipse cx="35" cy="130" rx="10" ry="9" fill="#fecdd3" />
                    <path d="M25 132 Q35 136 45 132" stroke="#b45309" strokeWidth="2" fill="none" />
                    <ellipse cx="165" cy="130" rx="10" ry="9" fill="#fecdd3" />
                    <path d="M155 132 Q165 136 175 132" stroke="#b45309" strokeWidth="2" fill="none" />
                </g>
            )}
        </svg>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm p-2 rounded border border-slate-700/50 flex justify-between text-[10px] font-mono text-cyan-300">
         <span>ATK: {stats.attack}</span>
         <span>DEF: {stats.defense}</span>
         <span>HP: {stats.maxHp}</span>
      </div>
    </div>
  );
};

export default CharacterPreview;