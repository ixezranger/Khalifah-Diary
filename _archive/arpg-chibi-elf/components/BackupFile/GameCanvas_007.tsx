import React, { useRef, useEffect, useState, useMemo } from 'react';
import { PlayerStats, Item, Position, Enemy, EnemyType, ItemType } from '../types';
import { TILE_SIZE, getArmorColors, getHeroDefs, getHeroParts, getWeaponSvg } from '../constants';

interface GameCanvasProps {
  isPaused: boolean;
  playerStats: PlayerStats;
  equippedItems: Item[];
  inputState: React.MutableRefObject<{ vector: { x: number, y: number }, isAttacking: boolean }>;
  skillTriggerRef: React.MutableRefObject<string | null>;
  isAutoplay: boolean;
  wave: number;
  onPlayerHit: (damage: number) => void;
  onEnemyKilled: (xp: number, gold: number, runes: number) => void;
  onWaveComplete: () => void;
  onRequestSkill: (skillId: number) => boolean;
  playSFX: (type: 'attack' | 'hit' | 'kill' | 'buy' | 'equip' | 'levelUp' | 'click' | 'skill') => void;
}

// Map Configuration
const MAP_W = 60;
const MAP_H = 60;

enum TileType {
  GRASS = 0,
  DIRT = 1,
  WATER = 2,
  STONE = 3,
  SAND = 4
}

// Enhanced Particle System
interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'blood' | 'smoke' | 'text' | 'shockwave' | 'walk' | 'flame' | 'rune' | 'boss_aura';
  color: string;
  size: number;
  text?: string;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  damage: number;
}

// Isometric Projection Helpers
const toIso = (x: number, y: number): { x: number, y: number } => {
  return {
    x: (x - y) * (TILE_SIZE / 2),
    y: (x + y) * (TILE_SIZE / 4)
  };
};

const BUSTER_SWORD_PATH = "M -4 -60 L 4 -60 L 4 0 L -4 0 Z"; 
const BUSTER_HILT_PATH = "M -2 0 L 2 0 L 2 12 L -2 12 Z";

// --- THEME HELPERS ---
const getBossTheme = (wave: number) => {
  const variant = (wave - 1) % 4;
  
  // 1. T-REX 🦖 (Primitive / Beast)
  if (variant === 0) return { 
      type: 'TREX',
      name: "PRIMEVAL REX", 
      colors: { skin: '#4d7c0f', dark: '#365314', accent: '#ecfccb', detail: '#1a2e05', glow: '#ef4444', aura: '#84cc16' }
  };
  
  // 2. LICH KING 💀 (Undead / Magic)
  if (variant === 1) return {
      type: 'LICH',
      name: "THE UNDYING KING",
      colors: { skin: '#e2e8f0', dark: '#1e293b', accent: '#7f1d1d', detail: '#fbbf24', glow: '#8b5cf6', aura: '#581c87' }
  };

  // 3. WRAITH LORD 👻 (Ghost / Void)
  if (variant === 2) return {
      type: 'WRAITH',
      name: "VOID REAPER",
      colors: { skin: '#0f172a', dark: '#020617', accent: '#0ea5e9', detail: '#94a3b8', glow: '#22d3ee', aura: '#0c4a6e' }
  };

  // 4. DRAGON 🐉 (Fire / Legend)
  return {
      type: 'DRAGON',
      name: "INFERNO DRAKE",
      colors: { skin: '#7f1d1d', dark: '#450a0a', accent: '#fdba74', detail: '#000000', glow: '#fbbf24', aura: '#b91c1c' }
  };
};

const getEnemyTheme = (type: EnemyType, wave: number) => {
    const tier = Math.floor((wave - 1) / 2);
    if (type === EnemyType.ZOMBIE) {
        const variants = [
            { skin: '#78716c', clothes: '#44403c', blood: '#881337', hair: '#1c1917' }, // Grey/Brown
            { skin: '#57534e', clothes: '#1e3a8a', blood: '#991b1b', hair: '#000000' }, // Dark/Blue
            { skin: '#3f6212', clothes: '#3f3f46', blood: '#450a0a', hair: '#1a2e05' }, // Green/Grey
            { skin: '#5b21b6', clothes: '#171717', blood: '#be123c', hair: '#2e1065' }, // Purple/Dark
        ];
        return variants[tier % variants.length];
    }
    if (type === EnemyType.GOBLIN) {
        const variants = [
            { skin: '#65a30d', gear: '#713f12', metal: '#a8a29e' },
            { skin: '#b91c1c', gear: '#451a03', metal: '#78716c' },
            { skin: '#0891b2', gear: '#1e3a8a', metal: '#94a3b8' },
            { skin: '#9333ea', gear: '#4c1d95', metal: '#cbd5e1' },
        ];
        return variants[tier % variants.length];
    }
    if (type === EnemyType.SKELETON) {
        const variants = [
            { bone: '#e2e8f0', shadow: '#94a3b8', gear: '#475569' },
            { bone: '#a8a29e', shadow: '#78716c', gear: '#7f1d1d' },
            { bone: '#bae6fd', shadow: '#7dd3fc', gear: '#1e40af' },
            { bone: '#fef08a', shadow: '#facc15', gear: '#854d0e' },
        ];
        return variants[tier % variants.length];
    }
    if (type === EnemyType.GHOST) {
        const variants = [
            { start: '#bfdbfe', end: 'rgba(191, 219, 254, 0)', eye: '#1e3a8a', shadow: '#60a5fa' },
            { start: '#bbf7d0', end: 'rgba(187, 247, 208, 0)', eye: '#14532d', shadow: '#4ade80' },
            { start: '#fecaca', end: 'rgba(254, 202, 202, 0)', eye: '#7f1d1d', shadow: '#ef4444' },
            { start: '#e9d5ff', end: 'rgba(233, 213, 255, 0)', eye: '#581c87', shadow: '#a855f7' },
        ];
        return variants[tier % variants.length];
    }
    return { skin: '#fff', clothes: '#000' };
};

// --- PROCEDURAL MAP GENERATION (Natural Curves) ---
const generateMapData = (width: number, height: number): TileType[][] => {
  let map: TileType[][] = Array(width).fill(0).map(() => Array(height).fill(TileType.GRASS));

  const drawBlob = (cx: number, cy: number, radius: number, type: TileType, roughness: number) => {
     for (let x = Math.floor(cx - radius); x <= cx + radius; x++) {
       for (let y = Math.floor(cy - radius); y <= cy + radius; y++) {
         if (x >= 0 && x < width && y >= 0 && y < height) {
           const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
           const noise = (Math.random() - 0.5) * roughness;
           if (dist + noise < radius) {
             map[x][y] = type;
           }
         }
       }
     }
  }

  // 1. Mini Lakes (Small Ponds)
  for(let i=0; i<6; i++) {
      drawBlob(Math.random() * width, Math.random() * height, 1.5 + Math.random() * 2, TileType.WATER, 1.0);
  }

  // 2. Dirt Patches (Organic)
  for(let i=0; i<15; i++) {
     drawBlob(Math.random() * width, Math.random() * height, 2 + Math.random() * 3, TileType.DIRT, 1.5);
  }

  // 3. Stone Outcroppings
  drawBlob(width * 0.85, height * 0.15, 3, TileType.STONE, 0.5);
  drawBlob(width * 0.15, height * 0.85, 3, TileType.STONE, 0.5);

  // 4. Sand Shores
  for(let x=0; x<width; x++){
      for(let y=0; y<height; y++){
          if(map[x][y] !== TileType.WATER && map[x][y] !== TileType.STONE) {
              let hasWater = false;
              [[0,1], [0,-1], [1,0], [-1,0]].forEach(([dx, dy]) => {
                  if(x+dx >= 0 && x+dx < width && y+dy >=0 && y+dy < height && map[x+dx][y+dy] === TileType.WATER) hasWater = true;
              });
              if(hasWater) map[x][y] = TileType.SAND;
          }
      }
  }

  // 5. SMOOTHING (Multiple passes for extra roundness)
  const smoothMap = (input: TileType[][]) => {
      const output = input.map(row => [...row]);
      for (let x = 1; x < width - 1; x++) {
          for (let y = 1; y < height - 1; y++) {
              const current = input[x][y];
              let neighbors = 0;
              for (let i = -1; i <= 1; i++) {
                  for (let j = -1; j <= 1; j++) {
                      if (i===0 && j===0) continue;
                      if (input[x+i][y+j] === current) neighbors++;
                  }
              }
              if (neighbors < 2) output[x][y] = TileType.GRASS;
              // If surrounded by another type, flip to it (e.g., fill holes in dirt)
              if (neighbors === 0) {
                   const dominant = input[x+1][y]; // simple pick
                   output[x][y] = dominant;
              }
          }
      }
      return output;
  };
  
  map = smoothMap(map);
  map = smoothMap(map);
  map = smoothMap(map);

  // Spawn Safe Zone
  drawBlob(30, 55, 3, TileType.GRASS, 0); 
  
  return map;
};

// --- NATURAL SPRITE GENERATION ---
const createTileTexture = (type: TileType): HTMLCanvasElement => {
    const size = TILE_SIZE * 2; 
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size; 
    const ctx = canvas.getContext('2d');
    if(!ctx) return canvas;

    const cx = size / 2;
    const cy = size / 2;
    const radius = TILE_SIZE * 0.85;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.5);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);

    switch(type) {
        case TileType.GRASS:
            ctx.clip(); 
            ctx.fillStyle = '#10b981'; 
            for(let i=0; i<12; i++) {
                const bx = (Math.random() - 0.5) * size;
                const by = (Math.random() - 0.5) * size;
                const h = 4 + Math.random() * 6;
                ctx.fillRect(bx, by, 1.5, h);
            }
            ctx.fillStyle = '#047857';
            for(let i=0; i<8; i++) {
                ctx.fillRect((Math.random()-0.5)*size, (Math.random()-0.5)*size, 2, 2);
            }
            break;

        case TileType.DIRT:
            ctx.fillStyle = '#451a03'; ctx.fill();
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = '#78350f'; 
            for(let i=0; i<20; i++) {
                ctx.beginPath();
                ctx.arc((Math.random()-0.5)*radius*1.5, (Math.random()-0.5)*radius*1.5, 3, 0, Math.PI*2);
                ctx.fill();
            }
            break;

        case TileType.WATER:
            ctx.fillStyle = '#172554'; ctx.fill();
            ctx.fillStyle = '#3b82f6';
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(radius*0.2, -radius*0.2, radius*0.4, 0, Math.PI*2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
            break;

        case TileType.SAND:
            ctx.fillStyle = '#92400e'; ctx.fill();
            ctx.fillStyle = '#d97706';
            ctx.globalCompositeOperation = 'source-atop';
            for(let i=0; i<30; i++) {
                ctx.fillRect((Math.random()-0.5)*radius*1.8, (Math.random()-0.5)*radius*1.8, 1, 1);
            }
            break;

        case TileType.STONE:
            ctx.restore(); ctx.save();
            ctx.translate(cx, cy);
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath(); ctx.ellipse(0, 10, 20, 10, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.moveTo(-15, 10); ctx.lineTo(-10, -20); ctx.lineTo(5, -25); ctx.lineTo(20, 5); ctx.lineTo(10, 15);
            ctx.fill();
            ctx.fillStyle = '#475569';
            ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(5, -25); ctx.lineTo(0, -10); ctx.fill();
            break;
    }

    ctx.restore();
    return canvas;
};

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  isPaused,
  playerStats, 
  equippedItems, 
  inputState, 
  skillTriggerRef,
  isAutoplay,
  wave,
  onPlayerHit,
  onEnemyKilled,
  onWaveComplete,
  onRequestSkill,
  playSFX
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State Refs
  const posRef = useRef<Position>({ x: 30, y: 55 }); 
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const shakeRef = useRef(0);
  const projectileIdCounter = useRef(0);

  const attackAnimRef = useRef(0);
  const hasDealtDamageRef = useRef(false);
  const spinAnimRef = useRef(0); 
  const facingRef = useRef(Math.PI / 4);
  const lastFacingLeftRef = useRef(false);
  const playerIFrameRef = useRef(0);

  // Auto Skills
  const requestSkillRef = useRef(onRequestSkill);
  const autoSkillTimerRef = useRef(0);
  const playerStatsRef = useRef(playerStats);
  
  const isPausedRef = useRef(isPaused);
  const waveRef = useRef(wave);
  const isAutoplayRef = useRef(isAutoplay);
  const equippedItemsRef = useRef(equippedItems);

  // Map Data
  const mapDataRef = useRef<TileType[][]>([]);
  const tileTexturesRef = useRef<Record<TileType, HTMLCanvasElement> | null>(null);

  // Assets
  const avatarPhotoRef = useRef<HTMLImageElement | null>(null);
  const spritesRef = useRef<Record<string, HTMLImageElement>>({});
  const [spritesLoaded, setSpritesLoaded] = useState(false);
  const blinkTimerRef = useRef(0);
  const nextBlinkRef = useRef(2000);
  
  const armor = equippedItems.find(i => i.type === ItemType.ARMOR);
  const armorName = armor?.name;

  // Initialize Map
  useEffect(() => {
     if (mapDataRef.current.length === 0) {
         mapDataRef.current = generateMapData(MAP_W, MAP_H);
         tileTexturesRef.current = {
             [TileType.GRASS]: createTileTexture(TileType.GRASS),
             [TileType.DIRT]: createTileTexture(TileType.DIRT),
             [TileType.WATER]: createTileTexture(TileType.WATER),
             [TileType.STONE]: createTileTexture(TileType.STONE),
             [TileType.SAND]: createTileTexture(TileType.SAND)
         };
     }
  }, []);

  useEffect(() => {
      requestSkillRef.current = onRequestSkill;
      playerStatsRef.current = playerStats;
      isPausedRef.current = isPaused;
      waveRef.current = wave;
      isAutoplayRef.current = isAutoplay;
      equippedItemsRef.current = equippedItems;
  }, [onRequestSkill, playerStats, isPaused, wave, isAutoplay, equippedItems]);

  useEffect(() => {
      if (playerStats.avatarConfig.usePhoto && playerStats.avatarConfig.photoUrl) {
          const img = new Image();
          img.src = playerStats.avatarConfig.photoUrl;
          img.onload = () => { avatarPhotoRef.current = img; };
      } else {
          avatarPhotoRef.current = null;
      }
  }, [playerStats.avatarConfig]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Armor Set (PNG paper-doll) ---
  const ARMOR_SETS = useMemo(() => ([
    'Armor_001',
    'Armor_002',
  ]), []);

  const [armorSet, setArmorSet] = useState<string>(ARMOR_SETS[0] ?? 'Armor_001');

  useEffect(() => {
    // Prefer PNG layered armor parts (paper-doll). Falls back to SVG parts if PNGs aren't available.
    const BASE = (import.meta as any).env?.BASE_URL ?? '/';

    const loadPng = (key: string, url: string): Promise<[string, HTMLImageElement]> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve([key, img]);
        img.onerror = () => resolve([key, img]);
      });
    };

    const pngBase = `${BASE}assets/hero/chibi-elf/sets/${armorSet}/parts`;

    const weaponFile =
      armorSet === 'Armor_002' ? 'Weapon_Swords_002.png' : 'Weapon_Swords_001.png';
    const weaponBase = `${BASE}assets/hero/chibi-elf/weapons`;


    Promise.all([
      loadPng('legL', `${pngBase}/legL.png`),
      loadPng('legR', `${pngBase}/legR.png`),
      loadPng('armL', `${pngBase}/armL.png`),
      loadPng('armR', `${pngBase}/armR.png`),
      loadPng('weapon', `${weaponBase}/${weaponFile}`),
      loadPng('body', `${pngBase}/body.png`),
      loadPng('head', `${pngBase}/head.png`),
      loadPng('cloak', `${pngBase}/cloak.png`),
    ]).then((results) => {
      const newSprites: Record<string, HTMLImageElement> = {};
      results.forEach(([key, img]) => (newSprites[key] = img));

      const body = newSprites.body;
      if (body && body.naturalWidth > 0 && body.naturalHeight > 0) {
        spritesRef.current = newSprites;
        setSpritesLoaded(true);
        return;
      }

      // --- SVG fallback (original behavior) ---
      const colors = getArmorColors(armorName);
      const defs = getHeroDefs(colors);
      const parts = getHeroParts(armorName);

      const loadSvgSprite = (key: string, svgContent: string): Promise<[string, HTMLImageElement]> => {
        return new Promise((resolve) => {
          const img = new Image();
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">${defs}${svgContent}</svg>`;
          img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
          img.onload = () => resolve([key, img]);
          img.onerror = () => resolve([key, img]);
        });
      };

      Promise.all([
        loadSvgSprite('legL', parts.legL),
        loadSvgSprite('legR', parts.legR),
        loadSvgSprite('armL', parts.armL),
        loadSvgSprite('armR', parts.armR),
        loadSvgSprite('body', parts.body),
      ]).then((svgResults) => {
        const svgSprites: Record<string, HTMLImageElement> = {};
        svgResults.forEach(([key, img]) => (svgSprites[key] = img));
        spritesRef.current = svgSprites;
        setSpritesLoaded(true);
      });
    });
  }, [armorSet, armorName, ARMOR_SETS]);

useEffect(() => {
     const newEnemies: Enemy[] = [];
     const minionCount = 3 + Math.floor(wave * 1.5);
     const map = mapDataRef.current;
     
     for (let i = 0; i < minionCount; i++) {
        const rand = Math.random();
        let type = EnemyType.ZOMBIE;
        if (wave === 1) type = rand > 0.5 ? EnemyType.GOBLIN : EnemyType.ZOMBIE;
        else {
            if (rand > 0.7) type = EnemyType.SKELETON;
            else if (rand > 0.4) type = EnemyType.GHOST;
            else if (rand > 0.2) type = EnemyType.GOBLIN;
            else type = EnemyType.ZOMBIE;
        }

        let hp = 80 + wave * 10;
        let speed = 0.8;
        let damage = 15 + wave * 2;

        if (type === EnemyType.GOBLIN) { hp = 40 + wave * 5; speed = 1.6; damage = 10 + wave; }
        if (type === EnemyType.SKELETON) { hp = 60 + wave * 8; speed = 1.0; damage = 20 + wave * 2; }
        if (type === EnemyType.GHOST) { hp = 50 + wave * 5; speed = 1.2; damage = 25 + wave * 3; }

        let ex, ey;
        let attempts = 0;
        
        do {
            ex = Math.random() * (MAP_W - 4) + 2; 
            ey = Math.random() * (MAP_H - 15); 
            attempts++;
            const tx = Math.floor(ex);
            const ty = Math.floor(ey);
            if (tx >= 0 && tx < MAP_W && ty >= 0 && ty < MAP_H) {
               if (map[tx][ty] === TileType.WATER) attempts = 0; 
            }
        } while (attempts < 10 && ey > 50); 

        newEnemies.push({
          id: `e-${wave}-${i}`,
          type: type,
          x: ex, y: ey, hp, maxHp: hp, speed, damage, lastHitTime: 0
        });
     }

     // Improved Boss HP Scaling (Linear + significant base boost)
     const bossHp = 2000 + (wave * 800);
     newEnemies.push({
         id: `boss-${wave}`,
         type: EnemyType.BOSS,
         x: MAP_W / 2, y: 5,
         hp: bossHp, maxHp: bossHp,
         speed: 0.8 + (wave * 0.05),
         damage: 40 + wave * 10,
         lastHitTime: 0, deathAnim: 0
     });

     enemiesRef.current = newEnemies;
  }, [wave]);

  // Main Loop
  useEffect(() => {
    if (!spritesLoaded) return;
    
    let animationFrameId: number;
    let lastTime = performance.now();

    const spawnExplosion = (x: number, y: number) => {
        particlesRef.current.push({
            type: 'shockwave', x, y, z: 2, vx: 0, vy: 0, vz: 0, life: 0.5, maxLife: 0.5, color: '#ffedd5', size: 0.5
        });
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 8;
            particlesRef.current.push({
                type: 'flame', x, y, z: 10,
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, vz: 5 + Math.random() * 10,
                life: 0.4 + Math.random() * 0.6, maxLife: 1.0,
                color: Math.random() > 0.5 ? '#ef4444' : '#fbbf24', size: 3 + Math.random() * 4
            });
        }
    };

    const spawnHitParticles = (x: number, y: number, damage: number, isKill: boolean) => {
        const currentEquipped = equippedItemsRef.current;
        const weapon = currentEquipped.find(i => i.type === ItemType.WEAPON);
        const isObsidian = weapon?.name.includes("Obsidian");
        const sparkColor = isObsidian ? '#d8b4fe' : (isKill ? '#fcd34d' : '#f97316');

        for(let i=0; i<4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            particlesRef.current.push({
                x, y, z: 10,
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, vz: 2 + Math.random() * 5,
                life: 1.0, maxLife: 1.0, type: 'spark', color: sparkColor, size: 2 + Math.random() * 2
            });
        }
        particlesRef.current.push({
            x, y, z: 20, vx: 0, vy: -1, vz: 2, life: 1.0, maxLife: 1.0,
            type: 'text', color: isKill ? '#ef4444' : '#fff', size: 16, text: `-${Math.round(damage)}`
        });
        shakeRef.current = isKill ? 12 : 5;
    };

    const spawnDropParticles = (x: number, y: number, runes: number) => {
        if (runes <= 0) return;
        particlesRef.current.push({
            x, y, z: 30, vx: 0, vy: -0.5, vz: 2, life: 2.0, maxLife: 2.0,
            type: 'text', color: '#c084fc', size: 14, text: `+${runes} RUNES`
        });
    };

    const processKill = (enemy: Enemy) => {
        const currentWave = waveRef.current;
        enemy.isDead = true;
        enemy.deathAnim = 1.0;
        const isBoss = enemy.type === EnemyType.BOSS;
        const xpMult = isBoss ? 10 : 1;
        const goldMult = isBoss ? 10 : 1;
        let runeDrop = isBoss ? Math.floor(currentWave * 20 + Math.random() * 10) : (Math.random() > 0.6 ? Math.floor(currentWave + Math.random() * 2) : 0);
        onEnemyKilled(20 * currentWave * xpMult, 15 * currentWave * goldMult, runeDrop);
        spawnDropParticles(enemy.x, enemy.y, runeDrop);
        playSFX('kill');
    };

    const checkCollision = (targetX: number, targetY: number, map: TileType[][]) => {
        const checkRadius = 1;
        const baseTx = Math.floor(targetX);
        const baseTy = Math.floor(targetY);

        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
            for (let dy = -checkRadius; dy <= checkRadius; dy++) {
                const tx = baseTx + dx;
                const ty = baseTy + dy;
                
                if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) {
                    if (targetX < 0 || targetX > MAP_W || targetY < 0 || targetY > MAP_H) return true;
                    continue; 
                }

                if (map[tx][ty] === TileType.WATER) {
                    const tileCenterX = tx + 0.5;
                    const tileCenterY = ty + 0.5;
                    
                    const distSq = (targetX - tileCenterX) ** 2 + (targetY - tileCenterY) ** 2;
                    if (distSq < 0.45 * 0.45) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const render = (time: number) => {
      if (isPausedRef.current) {
         lastTime = time;
         animationFrameId = requestAnimationFrame(render);
         return;
      }

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const wave = waveRef.current;
      const isAutoplay = isAutoplayRef.current;
      const equippedItems = equippedItemsRef.current;
      const bossTheme = getBossTheme(wave);
      let { vector, isAttacking } = inputState.current;
      const enemies = enemiesRef.current;
      const activeEnemies: Enemy[] = [];
      
      if (time > nextBlinkRef.current) {
          blinkTimerRef.current = 0.15;
          nextBlinkRef.current = time + Math.random() * 3000 + 2000;
      }
      if (blinkTimerRef.current > 0) blinkTimerRef.current -= dt;
      const isBlinking = blinkTimerRef.current > 0;

      for (const enemy of enemies) {
          if (enemy.isDead) {
              enemy.deathAnim = (enemy.deathAnim || 1.0) - dt * 1.5; 
              if (enemy.deathAnim > 0) activeEnemies.push(enemy);
              continue; 
          }
      }

      const livingEnemies = enemies.filter(e => !e.isDead);
      let nearestEnemy: Enemy | null = null;
      let minDst = Infinity;
      for (const e of livingEnemies) {
          const dist = Math.sqrt(Math.pow(e.x - posRef.current.x, 2) + Math.pow(e.y - posRef.current.y, 2));
          if (dist < minDst) { minDst = dist; nearestEnemy = e; }
      }

      if (isAutoplay && vector.x === 0 && vector.y === 0 && livingEnemies.length > 0) {
          if (nearestEnemy && minDst < 20) {
              const dx = nearestEnemy.x - posRef.current.x;
              const dy = nearestEnemy.y - posRef.current.y;
              if (minDst > 2.0) {
                  const vx = dx - dy;
                  const vy = (dx + dy) * 0.5;
                  const mag = Math.sqrt(vx*vx + vy*vy);
                  if (mag > 0) vector = { x: vx/mag, y: vy/mag };
                  isAttacking = false;
              } else {
                  vector = { x: 0, y: 0 };
                  isAttacking = true;
                  facingRef.current = Math.atan2((dx + dy) * 0.5, dx - dy);
              }
              if (time > autoSkillTimerRef.current) {
                  let skillUsed = false;
                  const currentStats = playerStatsRef.current;
                  if (currentStats.hp < currentStats.maxHp * 0.4) {
                      if (requestSkillRef.current(2)) skillUsed = true;
                  }
                  if (!skillUsed) {
                      const nearbyCount = livingEnemies.filter(e => Math.sqrt(Math.pow(e.x - posRef.current.x, 2) + Math.pow(e.y - posRef.current.y, 2)) < 5.0).length;
                      if (nearbyCount >= 3 || (nearestEnemy?.type === EnemyType.BOSS && minDst < 5.0)) {
                          if (requestSkillRef.current(1)) skillUsed = true;
                      }
                  }
                  if (!skillUsed && nearestEnemy && minDst > 6.0 && minDst < 15.0) {
                       const dx = nearestEnemy.x - posRef.current.x;
                       const dy = nearestEnemy.y - posRef.current.y;
                       facingRef.current = Math.atan2((dx + dy) * 0.5, dx - dy);
                       if (requestSkillRef.current(3)) skillUsed = true;
                  }
                  if (skillUsed) autoSkillTimerRef.current = time + 800;
              }
          }
      }

      if (skillTriggerRef.current === 'spin') {
          spinAnimRef.current = 1.0; 
          skillTriggerRef.current = null;
          playSFX('skill');
          particlesRef.current.push({
              x: posRef.current.x, y: posRef.current.y, z: 5, vx: 0, vy: 0, vz: 0, life: 0.5, maxLife: 0.5, type: 'shockwave', color: '#0ea5e9', size: 1
          });
      } else if (skillTriggerRef.current === 'fireball') {
          projectileIdCounter.current++;
          const angle = facingRef.current;
          const dirX = Math.cos(angle);
          const dirY = Math.sin(angle);
          const mapVx = dirX + 2 * dirY;
          const mapVy = 2 * dirY - dirX;
          const currentStats = playerStatsRef.current;
          playSFX('skill');
          projectilesRef.current.push({
              id: projectileIdCounter.current, x: posRef.current.x, y: posRef.current.y,
              vx: mapVx * 8, vy: mapVy * 8, life: 1.5, damage: currentStats.attack * 1.5
          });
          skillTriggerRef.current = null;
      }

      if (spinAnimRef.current > 0) {
          spinAnimRef.current -= dt * 2;
          if (spinAnimRef.current > 0.4 && spinAnimRef.current < 0.5) {
               shakeRef.current = 8;
               const currentStats = playerStatsRef.current;
               for (const enemy of enemies) {
                   if (enemy.isDead) continue;
                   const dist = Math.sqrt(Math.pow(enemy.x - posRef.current.x, 2) + Math.pow(enemy.y - posRef.current.y, 2));
                   if (dist < 4.0) {
                       const dmg = currentStats.attack * 1.5;
                       enemy.hp -= dmg;
                       const angle = Math.atan2(enemy.y - posRef.current.y, enemy.x - posRef.current.x);
                       const push = enemy.type === EnemyType.BOSS ? 0.5 : 2.5;
                       enemy.x += Math.cos(angle) * push;
                       enemy.y += Math.sin(angle) * push;
                       enemy.lastHitTime = time;
                       const isKill = enemy.hp <= 0;
                       spawnHitParticles(enemy.x, enemy.y, dmg, isKill);
                       playSFX('hit');
                       if (isKill && !enemy.isDead) processKill(enemy);
                   }
               }
          }
      }

      const speed = 2.5 * dt;
      const isMoving = vector.x !== 0 || vector.y !== 0;
      
      if (isMoving) {
          const isoX = vector.x + 2 * vector.y; 
          const isoY = 2 * vector.y - vector.x;
          const targetX = posRef.current.x + isoX * speed;
          const targetY = posRef.current.y + isoY * speed;
          const map = mapDataRef.current;

          let canMoveX = !checkCollision(targetX, posRef.current.y, map);
          let canMoveY = !checkCollision(posRef.current.x, targetY, map);
          
          if (canMoveX && canMoveY) {
              if (checkCollision(targetX, targetY, map)) {
                  if (Math.abs(isoX) > Math.abs(isoY)) canMoveY = false; 
                  else canMoveX = false;
              }
          }

          if (canMoveX) posRef.current.x = targetX;
          if (canMoveY) posRef.current.y = targetY;
          
          if (!isAutoplay || vector.x !== 0) facingRef.current = Math.atan2(vector.y, vector.x);
          if (Math.random() > 0.9) particlesRef.current.push({ x: posRef.current.x, y: posRef.current.y, z:0, vx:0, vy:0, vz:0, life: 0.5, maxLife:0.5, type: 'walk', color: '#94a3b8', size: 2 });
      }

      let performAttackCheck = false;
      const attackSpeed = 4.0; 
      
      if (isAttacking) {
          if (attackAnimRef.current === 0) playSFX('attack');
          attackAnimRef.current += dt * attackSpeed;
          if (attackAnimRef.current >= 1.2) {
              attackAnimRef.current = 0;
              hasDealtDamageRef.current = false;
          }
          if (attackAnimRef.current > 0.3 && attackAnimRef.current < 0.8 && !hasDealtDamageRef.current) {
              performAttackCheck = true;
              hasDealtDamageRef.current = true;
          }
      } else {
          if (attackAnimRef.current > 0) {
              attackAnimRef.current -= dt * attackSpeed * 2;
              if (attackAnimRef.current < 0) {
                  attackAnimRef.current = 0;
                  hasDealtDamageRef.current = false;
              }
          }
      }

      if (playerIFrameRef.current > 0) playerIFrameRef.current -= dt;

      for (const enemy of enemies) {
          if (enemy.isDead) continue; 
          const dx = posRef.current.x - enemy.x;
          const dy = posRef.current.y - enemy.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const safeDist = dist < 0.001 ? 0.001 : dist;
          
          if (dist > 0.6) {
             const nextEx = enemy.x + (dx / safeDist) * enemy.speed * dt;
             const nextEy = enemy.y + (dy / safeDist) * enemy.speed * dt;
             enemy.x = nextEx; enemy.y = nextEy;
          }
          if (dist < 0.9) { 
             const repulsionStrength = 4.0 * dt;
             const pX = posRef.current.x + (dx / safeDist) * repulsionStrength;
             const pY = posRef.current.y + (dy / safeDist) * repulsionStrength;
             if(!checkCollision(pX, pY, mapDataRef.current)) {
                 posRef.current.x = pX; posRef.current.y = pY;
             }
          }

          if (enemy.type === EnemyType.BOSS) {
             if (dist < 5.0 && enemy.deathAnim === 0) enemy.deathAnim = 0.1;
             if (enemy.deathAnim > 0 && enemy.deathAnim < 3.0) {
                 enemy.deathAnim += dt * 1.5;
                 if (enemy.deathAnim >= 2.0 && enemy.deathAnim < 2.1) {
                     shakeRef.current = 15;
                     if (dist < 6.0 && playerIFrameRef.current <= 0) {
                        onPlayerHit(enemy.damage * 1.5);
                        playSFX('hit');
                        playerIFrameRef.current = 1.0;
                     }
                 }
                 if (enemy.deathAnim >= 3.0) enemy.deathAnim = -2.0;
             } else if (enemy.deathAnim < 0) {
                 enemy.deathAnim += dt;
                 if (enemy.deathAnim >= 0) enemy.deathAnim = 0;
             }
             if (Math.random() > 0.7) {
                particlesRef.current.push({
                    type: 'boss_aura', x: enemy.x + (Math.random() - 0.5) * 4, y: enemy.y + (Math.random() - 0.5) * 4,
                    z: 0, vx: 0, vy: 1.0, vz: 0, life: 1.0, maxLife: 1.0, color: bossTheme.colors.aura, size: 2 + Math.random() * 3
                });
             }
          } 
          else if (dist < 1.0 && playerIFrameRef.current <= 0) {
             onPlayerHit(enemy.damage);
             shakeRef.current = 8;
             playSFX('hit');
             playerIFrameRef.current = 1.0; 
          }
          
          if (performAttackCheck && dist < 3.5 && (time - enemy.lastHitTime > 200)) {
             const dmg = playerStatsRef.current.attack;
             enemy.hp -= dmg;
             enemy.lastHitTime = time;
             const pushPower = enemy.type === EnemyType.BOSS ? 0.3 : 2.0; 
             enemy.x -= (dx / safeDist) * pushPower;
             enemy.y -= (dy / safeDist) * pushPower;
             const isKill = enemy.hp <= 0;
             spawnHitParticles(enemy.x, enemy.y, dmg, isKill);
             playSFX('hit');
             if (isKill) processKill(enemy);
          }
          activeEnemies.push(enemy);
      }

      projectilesRef.current = projectilesRef.current.filter(p => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
          if (Math.random() > 0.3) {
            particlesRef.current.push({ 
                type: 'flame', x: p.x + (Math.random() - 0.5) * 1.5, y: p.y + (Math.random() - 0.5) * 1.5, 
                z: 15, vx: -p.vx * 0.2, vy: -p.vy * 0.2, vz: 1 + Math.random(), life: 0.4, maxLife: 0.4, 
                color: Math.random() > 0.5 ? '#fcd34d' : '#ef4444', size: 2 + Math.random() * 3 
            });
          }
          let hit = false;
          const hitEnemy = activeEnemies.find(e => !e.isDead && (Math.pow(p.x - e.x, 2) + Math.pow(p.y - e.y, 2) < 4)); 
          if (hitEnemy || p.life <= 0) {
               hit = true;
               shakeRef.current = 20;
               spawnExplosion(p.x, p.y);
               const AOE_RADIUS_SQ = 144;
               for (const e of activeEnemies) {
                   if (e.isDead) continue;
                   const distSq = Math.pow(p.x - e.x, 2) + Math.pow(p.y - e.y, 2);
                   if (distSq < AOE_RADIUS_SQ) {
                       e.hp -= p.damage;
                       e.lastHitTime = time;
                       const angle = Math.atan2(e.y - p.y, e.x - p.x);
                       const force = 5.0; 
                       e.x += Math.cos(angle) * force;
                       e.y += Math.sin(angle) * force;
                       const isKill = e.hp <= 0;
                       spawnHitParticles(e.x, e.y, p.damage, isKill);
                       playSFX('hit');
                       if (isKill && !e.isDead) processKill(e);
                   }
               }
          }
          return p.life > 0 && !hit;
      });

      posRef.current.x = Math.max(0, Math.min(MAP_W, posRef.current.x));
      posRef.current.y = Math.max(0, Math.min(MAP_H, posRef.current.y));

      if (enemiesRef.current.length > 0 && activeEnemies.filter(e => !e.isDead).length === 0) onWaveComplete();
      enemiesRef.current = activeEnemies;

      particlesRef.current = particlesRef.current.filter(p => {
          p.life -= dt;
          if (p.type === 'spark' || p.type === 'blood' || p.type === 'flame' || p.type === 'rune' || p.type === 'boss_aura') {
              p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
              if (p.type !== 'boss_aura') p.vz -= 9.8 * dt; 
              if (p.z <= 0 && p.type !== 'boss_aura') {
                  p.z = 0; p.vz *= -0.5; p.vx *= 0.5; p.vy *= 0.5;
              }
          } else if (p.type === 'text') p.z += dt * 10;
          else if (p.type === 'shockwave') p.size += dt * 10;
          return p.life > 0;
      });

      if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - dt * 20);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const isoPlayer = toIso(posRef.current.x, posRef.current.y);
      const shakeX = (Math.random() - 0.5) * shakeRef.current;
      const shakeY = (Math.random() - 0.5) * shakeRef.current;
      const camX = centerX - isoPlayer.x + shakeX;
      const camY = centerY - isoPlayer.y + shakeY;

      ctx.fillStyle = '#064e3b'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // --- RENDER MAP ---
      const viewRange = 16;
      const startX = Math.max(0, Math.floor(posRef.current.x - viewRange));
      const endX = Math.min(MAP_W, Math.floor(posRef.current.x + viewRange));
      const startY = Math.max(0, Math.floor(posRef.current.y - viewRange));
      const endY = Math.min(MAP_H, Math.floor(posRef.current.y + viewRange));
      
      const map = mapDataRef.current;
      const textures = tileTexturesRef.current;

      if (textures) {
          for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
              if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) continue;
              const tileType = map[x][y];
              const iso = toIso(x, y);
              const screenX = iso.x + camX;
              const screenY = iso.y + camY;
              
              if(screenX < -TILE_SIZE || screenX > canvas.width + TILE_SIZE || screenY < -TILE_SIZE || screenY > canvas.height + TILE_SIZE) continue;
              const img = textures[tileType];
              if (img) ctx.drawImage(img, screenX - TILE_SIZE, screenY - TILE_SIZE/2, TILE_SIZE * 2, TILE_SIZE * 2);
            }
          }
      }

      // --- RENDER ENTITIES ---
      const renderList = [];
      renderList.push({ type: 'player', x: posRef.current.x, y: posRef.current.y, iso: toIso(posRef.current.x, posRef.current.y) });
      for (const e of activeEnemies) {
          renderList.push({ type: 'enemy', enemy: e, x: e.x, y: e.y, iso: toIso(e.x, e.y) });
      }
      renderList.sort((a, b) => a.iso.y - b.iso.y);

      const t = time / 150; 
      let legL_Rot = 0, legR_Rot = 0, armL_Rot = 10 * Math.PI / 180, armR_Rot = -10 * Math.PI / 180, body_Y = 0;

      if (isMoving) {
         legL_Rot = Math.sin(t) * 0.5;
         legR_Rot = Math.sin(t + Math.PI) * 0.5;
         armL_Rot = Math.sin(t + Math.PI) * 0.5;
         armR_Rot = Math.sin(t) * 0.5;
         body_Y = Math.abs(Math.sin(t * 2)) * 10;
      } else {
         body_Y = Math.sin(t * 0.5) * 5;
         armL_Rot = Math.sin(t * 0.5) * 0.05 + 0.1;
         armR_Rot = Math.sin(t * 0.5 + 1) * 0.05 - 0.1;
      }

      if (attackAnimRef.current > 0) {
          const animT = Math.min(attackAnimRef.current, 1.0);
          const ease = 1 - Math.pow(1 - animT, 3);
          armR_Rot = -2.5 + (3.5 * ease); 
      } else if (spinAnimRef.current > 0) {
          armR_Rot = t * 10;
      }

      for (const entity of renderList) {
          const charX = entity.iso.x + camX;
          const charY = entity.iso.y + camY;

          if (!entity.enemy?.isDead) {
              ctx.beginPath();
              const shadowSize = entity.enemy?.type === EnemyType.BOSS ? 60 : 25; // Bigger shadow for bigger normal enemies
              const shadowY = entity.enemy?.type === EnemyType.BOSS ? 30 : 12;
              ctx.ellipse(charX, charY + shadowY, shadowSize, shadowSize / 2.5, 0, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(0,0,0,0.3)';
              ctx.fill();
          }

          if (entity.type === 'player') {
              const sprites = spritesRef.current;
              if (!sprites['body']) continue; 

              let facingLeft = lastFacingLeftRef.current;
              if (nearestEnemy && minDst < 20) { 
                   const dx = nearestEnemy.x - posRef.current.x;
                   const dy = nearestEnemy.y - posRef.current.y;
                   facingLeft = (dx - dy) < 0; 
              } else if (isMoving) {
                   facingLeft = vector.x < 0;
              }
              lastFacingLeftRef.current = facingLeft; 

              // --- PNG layered hero (paper-doll) preview mode ---
              const isPngHero = !!sprites['head'] || !!sprites['cloak'];
              if (isPngHero) {
                  const heroW = sprites.body?.width || 1600;
                  const heroH = sprites.body?.height || 2000;

                  // Keep on-screen size similar to old SVG (400 * 0.2 = 80px wide).
                  const scale = 80 / heroW;

                  ctx.save();
                  ctx.translate(charX, charY);
                  if (playerIFrameRef.current > 0 && Math.floor(time / 100) % 2 === 0) ctx.globalAlpha = 0.5;
                  if (facingLeft) ctx.scale(-scale, scale); else ctx.scale(scale, scale);

                  // Anchor: center-x and ~feet (80% down), same concept as old (-200, -400) on 400x500.
                  ctx.translate(-heroW / 2, -(heroH * 0.8));

                  // Simple bob (scaled up for large sprites so it remains visible).
                  const bob = body_Y * (heroH / 500);

                  // Layer order (back to front)
                  if (sprites.cloak) ctx.drawImage(sprites.cloak, 0, bob);
                  if (sprites.legL) ctx.drawImage(sprites.legL, 0, 0);
                  if (sprites.legR) ctx.drawImage(sprites.legR, 0, 0);
                  ctx.drawImage(sprites.body, 0, bob);
                  if (sprites.head) ctx.drawImage(sprites.head, 0, bob);
                  if (sprites.armL) ctx.drawImage(sprites.armL, 0, bob);

                  // --- WEAPON (PNG) ---
                  // Photoshop hand-handle anchor (template 1600x2000): X=470, Y=830
                  if (sprites.weapon) {
                    const weaponImg = sprites.weapon as HTMLImageElement;

                    // Hand position in template coordinates
                    const handX = heroW * (470 / 1600);
                    const handY = heroH * (830 / 2000) + bob;

                    // Attack swing animation (re-uses attackAnimRef)
                    const tAtk = isAttacking ? Math.min(1, attackAnimRef.current) : 0;
                    let swing = 0;
                    if (isAttacking) {
                      if (tAtk < 0.25) swing = -1.1 * (tAtk / 0.25);
                      else if (tAtk < 0.8) swing = -1.1 + ((tAtk - 0.25) / 0.55) * 2.3;
                      else swing = 1.2 * (1 - (tAtk - 0.8) / 0.2);
                    } else {
                      swing = Math.sin(time / 300) * 0.05; // idle sway
                    }

                    // Weapon pivot (where the hand grips the handle) in weapon-image coords
                    const w = weaponImg.width, h = weaponImg.height;
                    const pivotX = w * 0.50;
                    const pivotY = h * 0.90;

                    ctx.save();
                    ctx.translate(handX, handY);
                    ctx.rotate(swing);
                    ctx.drawImage(weaponImg, -pivotX, -pivotY);
                    ctx.restore();
                  }

                  // Draw the right arm last so the hand sits "on top" of the weapon handle.
                  if (sprites.armR) ctx.drawImage(sprites.armR, 0, bob);

                  ctx.restore();
                  continue;
              }

const scale = 0.2; 
              ctx.save();
              ctx.translate(charX, charY);
              if (playerIFrameRef.current > 0 && Math.floor(time / 100) % 2 === 0) ctx.globalAlpha = 0.5;
              if (facingLeft) ctx.scale(-scale, scale); else ctx.scale(scale, scale);
              
              ctx.translate(-200, -400);
              ctx.save(); ctx.translate(125, 250 + body_Y); ctx.rotate(armL_Rot); ctx.translate(-75, -250); ctx.drawImage(sprites.armL, 0, 0); ctx.restore();
              ctx.save(); ctx.translate(140, 360); ctx.rotate(legL_Rot); ctx.translate(-140, -360); ctx.drawImage(sprites.legL, 0, 0); ctx.restore();
              ctx.drawImage(sprites.body, 0, body_Y);

              if (avatarPhotoRef.current) {
                  ctx.save();
                  ctx.translate(0, body_Y);
                  const cx = 200; const cy = 175; const rx = 80; const ry = 70;
                  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI*2); ctx.clip();
                  ctx.drawImage(avatarPhotoRef.current, cx - rx, cy - ry, rx * 2, ry * 2);
                  ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = 'rgba(255, 200, 200, 0.1)'; ctx.fill(); 
                  ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 4; ctx.stroke();
                  ctx.restore();
              }

              if (isBlinking && !avatarPhotoRef.current) {
                  ctx.fillStyle = '#fecdd3';
                  ctx.beginPath(); ctx.ellipse(170, 170 + body_Y, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
                  ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(160, 172 + body_Y); ctx.quadraticCurveTo(170, 176 + body_Y, 180, 172 + body_Y); ctx.stroke();
                  ctx.fillStyle = '#fecdd3';
                  ctx.beginPath(); ctx.ellipse(230, 170 + body_Y, 12, 9, 0, 0, Math.PI * 2); ctx.fill();
                  ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(220, 172 + body_Y); ctx.quadraticCurveTo(230, 176 + body_Y, 240, 172 + body_Y); ctx.stroke();
              }

              ctx.save(); ctx.translate(220, 360); ctx.rotate(legR_Rot); ctx.translate(-220, -360); ctx.drawImage(sprites.legR, 0, 0); ctx.restore();
              
              // --- DRAW WEAPON ---
              ctx.save();
              ctx.translate(275, 250 + body_Y); ctx.rotate(armR_Rot); ctx.drawImage(sprites.armR, -325, -250);
              ctx.translate(0, 70); 
              
              const weapon = equippedItems.find(i => i.type === ItemType.WEAPON);
              const isObsidian = weapon?.name.includes("Obsidian");
              const isInferno = weapon?.name.includes("Inferno");
              const isSamurai = weapon?.name.includes("Samurai");
              const isDamascus = weapon?.name.includes("Damascus");
              const isDragon = weapon?.name.includes("Dragon");
              const upgradeLevel = weapon?.upgradeLevel || 0;
              
              // --- WEAPON RENDER ---
              if (sprites.weapon) {
                const weaponImg = sprites.weapon as HTMLImageElement;
                const tAtk = isAttacking ? Math.min(1, attackAnimRef.current) : 0;
                // Swing profile: wind-up -> fast slash -> settle
                let swing = 0;
                if (isAttacking) {
                  if (tAtk < 0.25) swing = -1.1 * (tAtk / 0.25);
                  else if (tAtk < 0.8) swing = -1.1 + (tAtk - 0.25) / 0.55 * 2.3;
                  else swing = 1.2 * (1 - (tAtk - 0.8) / 0.2);
                } else {
                  swing = Math.sin(time / 300) * 0.05; // tiny idle sway
                }

                ctx.save();
                // Tune this if the weapon looks too big/small
                const WEAPON_SCALE = 2.4;
                ctx.scale(WEAPON_SCALE, WEAPON_SCALE);
                ctx.rotate(swing);

                // Anchor the weapon around the hand (origin is already at the hand area)
                const w = weaponImg.width, h = weaponImg.height;
                ctx.drawImage(weaponImg, -w * 0.25, -h * 0.85);

                ctx.restore();
              } else {
ctx.rotate(Math.PI / 2); ctx.scale(5, 5); 

              // --- ENHANCED WEAPON FX ---
              if (upgradeLevel > 0) {
                 let glowColor = '#22d3ee'; // Default Cyan
                 let coreColor = '#cffafe';

                 if (isObsidian) { glowColor = '#c084fc'; coreColor = '#f3e8ff'; }
                 else if (isInferno) { glowColor = '#fb923c'; coreColor = '#ffedd5'; }
                 else if (isDragon) { glowColor = '#4ade80'; coreColor = '#dcfce7'; }
                 else if (isSamurai) { glowColor = '#facc15'; coreColor = '#fef9c3'; }
                 else if (isDamascus) { glowColor = '#94a3b8'; coreColor = '#f8fafc'; }

                 // Intensity & Pulse (Tier 1)
                 const baseIntensity = 15 + (upgradeLevel * 2); 
                 const pulseFreq = 0.005 + (upgradeLevel * 0.0005);
                 const pulse = 0.8 + Math.sin(time * pulseFreq) * 0.2; 
                 
                 ctx.shadowBlur = Math.min(50, baseIntensity * pulse);
                 ctx.shadowColor = glowColor;

                 // Tier 2: Aura Sheath & Particles (Level 10+)
                 if (upgradeLevel >= 10) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'screen';
                    ctx.globalAlpha = 0.2 + ((upgradeLevel - 10) * 0.03); 
                    ctx.fillStyle = glowColor;
                    
                    // Aura shape matching blade roughly
                    ctx.beginPath();
                    ctx.ellipse(0, -45, 12 * pulse, 55, 0, 0, Math.PI*2);
                    ctx.fill();

                    // Energy Particles
                    const particleCount = Math.floor((upgradeLevel - 5) / 2);
                    ctx.fillStyle = coreColor;
                    for(let i=0; i<particleCount; i++) {
                        const pTime = (time * 0.003 + (i * 1.5)) % 1; 
                        const pY = -10 - (pTime * 85); 
                        const pX = Math.sin(pTime * 15 + i) * 6 * (1-pTime); 
                        const pSize = (1 - pTime) * 2;
                        
                        ctx.globalAlpha = (1 - pTime);
                        ctx.beginPath();
                        ctx.arc(pX, pY, pSize, 0, Math.PI*2);
                        ctx.fill();
                    }
                    ctx.restore();
                 }

                 // Tier 3: God Mode Ring (Level 20)
                 if (upgradeLevel >= 20) {
                    ctx.save();
                    ctx.translate(0, -45); 
                    const spin = time * 0.004;
                    
                    // Rotating Energy Ring
                    ctx.rotate(spin);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = glowColor;
                    ctx.globalAlpha = 0.9;
                    ctx.beginPath();
                    ctx.arc(0, 0, 30 + Math.sin(time*0.01)*2, 0, Math.PI*1.6);
                    ctx.stroke();

                    // Counter-rotating Rune Geometry
                    ctx.rotate(-spin * 2.5);
                    ctx.lineWidth = 0.5;
                    ctx.strokeStyle = coreColor;
                    ctx.beginPath();
                    const sides = 3;
                    for(let k=0; k<=sides; k++) {
                        const angle = k * (Math.PI*2/sides);
                        const r = 20;
                        const rx = Math.cos(angle) * r;
                        const ry = Math.sin(angle) * r;
                        if(k===0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
                    }
                    ctx.closePath();
                    ctx.stroke();

                    ctx.restore();
                 }
              }

              if (isObsidian) {
                  ctx.fillStyle = '#1e1b4b'; ctx.fillRect(-2, -5, 4, 15);
                  ctx.beginPath(); ctx.arc(0, 12, 3, 0, Math.PI*2); ctx.fillStyle = '#4c1d95'; ctx.fill();
                  ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(-8, -25); ctx.lineTo(-4, -45); ctx.lineTo(-10, -65); ctx.lineTo(0, -90); ctx.lineTo(6, -75); ctx.lineTo(3, -55); ctx.lineTo(9, -30); ctx.lineTo(5, -5); ctx.closePath();
                  const grad = ctx.createLinearGradient(0, -5, 0, -90); grad.addColorStop(0, '#0f172a'); grad.addColorStop(0.5, '#581c87'); grad.addColorStop(1, '#d8b4fe'); ctx.fillStyle = grad; ctx.fill();
                  ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(2, -40); ctx.lineTo(-1, -60); ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1; ctx.stroke();
              } else if (isInferno) {
                  ctx.fillStyle = '#1c1917'; ctx.fillRect(-2, -5, 4, 15);
                  ctx.beginPath(); ctx.arc(0, 12, 4, 0, Math.PI * 2); ctx.fillStyle = '#7f1d1d'; ctx.fill(); 
                  ctx.beginPath(); ctx.moveTo(0, -5); ctx.quadraticCurveTo(-15, -2, -20, -10); ctx.quadraticCurveTo(-10, -12, -3, -15); ctx.lineTo(3, -15); ctx.quadraticCurveTo(10, -12, 20, -10); ctx.quadraticCurveTo(15, -2, 0, -5); ctx.fillStyle = '#44403c'; ctx.fill();
                  ctx.beginPath(); ctx.moveTo(-4, -15); ctx.lineTo(-6, -30); ctx.lineTo(-4, -35); ctx.lineTo(-7, -50); ctx.lineTo(-5, -60); ctx.lineTo(-8, -75); ctx.lineTo(0, -95); ctx.lineTo(8, -75); ctx.lineTo(5, -60); ctx.lineTo(7, -50); ctx.lineTo(4, -35); ctx.lineTo(6, -30); ctx.lineTo(4, -15); ctx.closePath();
                  const bladeGrad = ctx.createLinearGradient(0, -15, 0, -95); bladeGrad.addColorStop(0, '#292524'); bladeGrad.addColorStop(0.5, '#44403c'); bladeGrad.addColorStop(1, '#a8a29e'); ctx.fillStyle = bladeGrad; ctx.fill();
                  ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(-1, -80); ctx.lineTo(0, -90); ctx.lineTo(1, -80); ctx.closePath(); ctx.fillStyle = '#f97316'; ctx.fill(); 
              } else if (isSamurai) {
                  ctx.fillStyle = '#0f172a'; ctx.fillRect(-1.5, 0, 3, 25);
                  ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI*2); ctx.fillStyle = '#ca8a04'; ctx.fill();
                  ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-5, -50, 0, -90); ctx.lineTo(2, -85); ctx.quadraticCurveTo(0, -40, 2, 0); ctx.closePath();
                  const katGrad = ctx.createLinearGradient(0, 0, 0, -90); katGrad.addColorStop(0, '#94a3b8'); katGrad.addColorStop(1, '#f1f5f9'); ctx.fillStyle = katGrad; ctx.fill(); 
              } else if (isDamascus) {
                  ctx.fillStyle = '#475569'; ctx.fillRect(-3, 0, 6, 15); ctx.fillStyle = '#1e293b'; ctx.fillRect(-6, -2, 12, 4);
                  ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-3, -70); ctx.lineTo(0, -80); ctx.lineTo(3, -70); ctx.lineTo(4, 0); ctx.closePath();
                  const damGrad = ctx.createLinearGradient(0, 0, 0, -80); damGrad.addColorStop(0, '#334155'); damGrad.addColorStop(1, '#94a3b8'); ctx.fillStyle = damGrad; ctx.fill(); 
                  ctx.beginPath(); ctx.moveTo(-3, -10); ctx.quadraticCurveTo(0, -20, 3, -10); ctx.moveTo(-3, -30); ctx.quadraticCurveTo(0, -40, 3, -30);
                  ctx.moveTo(-3, -50); ctx.quadraticCurveTo(0, -60, 3, -50); ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.5; ctx.stroke();
              } else if (isDragon) {
                  ctx.fillStyle = '#fcd34d'; ctx.beginPath(); ctx.moveTo(-3, 15); ctx.quadraticCurveTo(0, 20, 3, 15); ctx.lineTo(2, 0); ctx.lineTo(-2, 0); ctx.fill();
                  ctx.fillStyle = '#15803d'; ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-10, -5, -12, -15); ctx.lineTo(-2, -5); ctx.fill();
                  ctx.beginPath(); ctx.moveTo(2, 0); ctx.quadraticCurveTo(10, -5, 12, -15); ctx.lineTo(2, -5); ctx.fill();
                  ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(-5, -20); ctx.lineTo(-3, -30); ctx.lineTo(-6, -50); ctx.lineTo(-2, -70); ctx.lineTo(0, -90);
                  ctx.lineTo(2, -70); ctx.lineTo(6, -50); ctx.lineTo(3, -30); ctx.lineTo(5, -20); ctx.lineTo(4, 0); ctx.closePath();
                  const dragGrad = ctx.createLinearGradient(0, 0, 0, -90); dragGrad.addColorStop(0, '#14532d'); dragGrad.addColorStop(0.5, '#22c55e'); dragGrad.addColorStop(1, '#14532d'); ctx.fillStyle = dragGrad; ctx.fill();
              } else {
                  const path = new Path2D(BUSTER_SWORD_PATH); ctx.fillStyle = '#cbd5e1'; ctx.fill(path); 
                  const hilt = new Path2D(BUSTER_HILT_PATH); ctx.fillStyle = '#78350f'; ctx.fill(hilt);
                  ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 5; ctx.fillStyle = '#06b6d4'; ctx.beginPath(); ctx.arc(0, -45, 2, 0, Math.PI*2); ctx.fill(); ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(0, -30, 2, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
              }
              
              ctx.shadowBlur = 0;
              
              }

              ctx.restore(); ctx.restore();

              if (isAttacking && attackAnimRef.current > 0.2 && attackAnimRef.current < 0.8) {
                const slashProgress = (attackAnimRef.current - 0.2) / 0.6; 
                ctx.save(); 
                ctx.translate(charX, charY - 30);
                if (facingLeft) ctx.scale(-1, 1);
                
                ctx.globalAlpha = 1.0 - Math.pow(slashProgress, 3);
                let coreColor = '#ffffff';
                let outerColor = '#06b6d4';
                if (isObsidian) { outerColor = '#a855f7'; }
                else if (isInferno) { outerColor = '#f97316'; }
                else if (isSamurai) { outerColor = '#94a3b8'; }
                else if (isDamascus) { outerColor = '#cbd5e1'; }
                else if (isDragon) { outerColor = '#22c55e'; }

                const startAngle = -Math.PI / 1.5;
                const endAngle = Math.PI / 3;
                const currentAngle = startAngle + (endAngle - startAngle) * Math.pow(slashProgress, 0.5);

                ctx.rotate(currentAngle);
                const slashRadius = 90;
                ctx.beginPath();
                ctx.moveTo(0, 0); 
                ctx.bezierCurveTo(slashRadius * 0.5, -slashRadius * 0.8, slashRadius * 1.2, -slashRadius * 0.2, slashRadius, 0);
                ctx.bezierCurveTo(slashRadius * 0.8, -slashRadius * 0.1, slashRadius * 0.4, -slashRadius * 0.1, 0, 0);
                ctx.closePath();

                const grad = ctx.createRadialGradient(0, 0, 20, 0, 0, slashRadius);
                grad.addColorStop(0, coreColor);
                grad.addColorStop(0.4, outerColor);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.fill();

                if (slashProgress < 0.2) {
                   ctx.globalAlpha = 0.8; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 40 * (1 - slashProgress*5), 0, Math.PI*2); ctx.fill();
                }
                ctx.restore();
              }
          } else if (entity.enemy) {
              const e = entity.enemy;
              const isDead = e.isDead;
              const alpha = isDead ? (e.deathAnim || 0) : 1;
              const theme = getEnemyTheme(e.type, wave) as any;

              ctx.save(); ctx.translate(charX, charY); ctx.globalAlpha = alpha;
              if (isDead) { const sink = (1 - (e.deathAnim || 1)) * 20; ctx.translate(0, sink); ctx.fillStyle = '#000'; }
              if (!isDead && time - e.lastHitTime < 150) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'white'; }

              if (e.type === EnemyType.BOSS) {
                  const breathPhase = (e.deathAnim || 0); // 0-2 = charge, 2-3 = blast
                  const isCharging = breathPhase > 0 && breathPhase < 2.0;
                  const isBlasting = breathPhase >= 2.0 && breathPhase < 3.0;
                  
                  ctx.scale(3.2, 3.2); // Massive Scale
                  ctx.translate(0, -20); // Center adjustment

                  if (bossTheme.type === 'TREX') {
                      // --- T-REX RENDERER ---
                      const step = Math.sin(time * 0.005);
                      const bodyBob = Math.abs(step) * 2;
                      const tailWag = Math.sin(time * 0.003) * 0.2;

                      // Tail
                      ctx.save(); ctx.translate(-15, -15 + bodyBob); ctx.rotate(tailWag);
                      ctx.fillStyle = bossTheme.colors.skin;
                      ctx.beginPath(); ctx.moveTo(0, 0); 
                      ctx.quadraticCurveTo(-20, 5, -40, -5); 
                      ctx.quadraticCurveTo(-20, -15, 0, 0); ctx.fill(); 
                      ctx.restore();

                      // Body
                      ctx.save(); ctx.translate(0, bodyBob);
                      ctx.fillStyle = bossTheme.colors.skin;
                      ctx.beginPath(); ctx.ellipse(0, 0, 25, 18, 0, 0, Math.PI*2); ctx.fill();
                      ctx.fillStyle = bossTheme.colors.detail; // Stripes
                      ctx.beginPath(); ctx.moveTo(-5, -15); ctx.lineTo(-2, 10); ctx.lineTo(2, -15); ctx.fill();
                      
                      // Legs
                      ctx.translate(-5, 15);
                      ctx.fillStyle = bossTheme.colors.dark;
                      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-5, 15); ctx.lineTo(5, 15); ctx.fill(); // L Leg
                      ctx.translate(15, 0);
                      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-5, 15); ctx.lineTo(5, 15); ctx.fill(); // R Leg
                      ctx.restore();

                      // Head
                      ctx.save(); ctx.translate(15, -15 + bodyBob); 
                      ctx.rotate(Math.sin(time * 0.005) * 0.1);
                      ctx.fillStyle = bossTheme.colors.skin;
                      ctx.beginPath(); ctx.moveTo(-5, 5); ctx.lineTo(25, 5); ctx.lineTo(20, -15); ctx.lineTo(-5, -10); ctx.fill();
                      // Jaw
                      ctx.fillStyle = bossTheme.colors.dark;
                      ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(20, 5); ctx.lineTo(15, 10); ctx.lineTo(0, 8); ctx.fill();
                      // Eye
                      ctx.fillStyle = bossTheme.colors.glow;
                      ctx.beginPath(); ctx.arc(10, -5, 2, 0, Math.PI*2); ctx.fill();
                      ctx.restore();
                      
                      // Tiny Arms
                      ctx.save(); ctx.translate(10, -5 + bodyBob);
                      ctx.rotate(Math.sin(time * 0.02) * 0.5);
                      ctx.fillStyle = bossTheme.colors.skin;
                      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(5, 5); ctx.lineWidth=2; ctx.stroke();
                      ctx.restore();

                  } else if (bossTheme.type === 'LICH') {
                       // Lich
                       const bob = Math.sin(time * 0.005) * 5;
                       ctx.translate(0, bob);
                       ctx.fillStyle = bossTheme.colors.dark;
                       ctx.beginPath(); ctx.moveTo(-15, 20); ctx.lineTo(15, 20); ctx.lineTo(10, -20); ctx.lineTo(-10, -20); ctx.fill(); // Robe
                       ctx.fillStyle = bossTheme.colors.skin;
                       ctx.beginPath(); ctx.arc(0, -25, 8, 0, Math.PI*2); ctx.fill(); // Skull
                       ctx.fillStyle = bossTheme.colors.glow;
                       ctx.beginPath(); ctx.arc(-3, -25, 2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(3, -25, 2, 0, Math.PI*2); ctx.fill();
                       // Crown
                       ctx.fillStyle = bossTheme.colors.detail;
                       ctx.beginPath(); ctx.moveTo(-8, -30); ctx.lineTo(8, -30); ctx.lineTo(0, -40); ctx.fill();

                  } else if (bossTheme.type === 'DRAGON') {
                      // Dragon
                      ctx.fillStyle = bossTheme.colors.skin;
                      ctx.beginPath(); ctx.ellipse(0, 0, 30, 15, 0, 0, Math.PI*2); ctx.fill(); // Body
                      // Wings
                      ctx.fillStyle = bossTheme.colors.dark;
                      ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(-40, -30); ctx.lineTo(-20, 0); ctx.fill();
                      ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(40, -30); ctx.lineTo(20, 0); ctx.fill();
                      // Neck & Head
                      ctx.beginPath(); ctx.moveTo(15, -5); ctx.quadraticCurveTo(25, -20, 35, -25); ctx.lineTo(45, -20); ctx.lineTo(35, -5); ctx.fill();
                      
                  } else {
                      // Wraith
                      const bob = Math.sin(time * 0.01) * 5;
                      ctx.translate(0, bob);
                      const grad = ctx.createLinearGradient(0, -30, 0, 30);
                      grad.addColorStop(0, bossTheme.colors.dark);
                      grad.addColorStop(1, 'transparent');
                      ctx.fillStyle = grad;
                      ctx.beginPath(); ctx.moveTo(-20, -30); ctx.quadraticCurveTo(0, -50, 20, -30); ctx.lineTo(10, 30); ctx.lineTo(0, 10); ctx.lineTo(-10, 30); ctx.fill();
                      ctx.fillStyle = bossTheme.colors.glow;
                      ctx.shadowColor = bossTheme.colors.glow; ctx.shadowBlur = 10;
                      ctx.beginPath(); ctx.arc(-5, -20, 3, 0, Math.PI*2); ctx.fill();
                      ctx.beginPath(); ctx.arc(5, -20, 3, 0, Math.PI*2); ctx.fill();
                      ctx.shadowBlur = 0;
                  }
              } else {
                  // Normal Enemy Scale Up
                  ctx.scale(1.4, 1.4); 
                  
                  // Normal Enemy
                  const colors = theme; 
                  const bob = Math.sin(time * 0.01 + e.x) * 2;
                  
                  if (e.type === EnemyType.GHOST) {
                      // Ghost
                      const grad = ctx.createLinearGradient(0, -20, 0, 10);
                      grad.addColorStop(0, colors.start || '#fff');
                      grad.addColorStop(1, colors.end || 'rgba(255,255,255,0)');
                      ctx.fillStyle = grad;
                      ctx.beginPath();
                      ctx.moveTo(-10, -20);
                      ctx.quadraticCurveTo(0, -35, 10, -20);
                      ctx.lineTo(10, 10);
                      ctx.lineTo(5, 0); ctx.lineTo(0, 10); ctx.lineTo(-5, 0); ctx.lineTo(-10, 10);
                      ctx.fill();
                      
                      // Eyes
                      ctx.fillStyle = colors.eye || '#000';
                      ctx.beginPath(); ctx.arc(-3, -15, 1.5, 0, Math.PI*2); ctx.fill();
                      ctx.beginPath(); ctx.arc(3, -15, 1.5, 0, Math.PI*2); ctx.fill();

                  } else if (e.type === EnemyType.SKELETON) {
                      // Skeleton
                      ctx.fillStyle = colors.bone || '#e2e8f0';
                      ctx.fillRect(-6, -25 + bob, 12, 10); // Skull
                      ctx.fillRect(-2, -15 + bob, 4, 10); // Spine
                      ctx.fillRect(-8, -15 + bob, 16, 4); // Ribs
                      // Legs
                      ctx.beginPath(); ctx.moveTo(-3, -5+bob); ctx.lineTo(-5, 10); ctx.stroke();
                      ctx.beginPath(); ctx.moveTo(3, -5+bob); ctx.lineTo(5, 10); ctx.stroke();
                      // Arms
                      ctx.strokeStyle = colors.bone || '#e2e8f0';
                      ctx.lineWidth = 2;
                      ctx.beginPath(); ctx.moveTo(-8, -13+bob); ctx.lineTo(-12, 0); ctx.stroke();
                      ctx.beginPath(); ctx.moveTo(8, -13+bob); ctx.lineTo(12, 0); ctx.stroke();
                      // Eyes
                      ctx.fillStyle = '#000';
                      ctx.fillRect(-4, -22+bob, 2, 2); ctx.fillRect(2, -22+bob, 2, 2);

                  } else {
                      // Zombie / Goblin
                      // Body
                      ctx.fillStyle = colors.clothes || '#444';
                      ctx.fillRect(-8, -15 + bob, 16, 15);
                      // Head
                      ctx.fillStyle = colors.skin || '#777';
                      ctx.fillRect(-6, -25 + bob, 12, 10);
                      // Legs
                      ctx.fillStyle = '#111';
                      ctx.fillRect(-7, 0 + bob, 5, 10);
                      ctx.fillRect(2, 0 + bob, 5, 10);
                      // Arms
                      ctx.fillStyle = colors.skin || '#777';
                      if (isAttacking) {
                           ctx.beginPath(); ctx.moveTo(-8, -13+bob); ctx.lineTo(-15, -5+bob); ctx.lineWidth=3; ctx.strokeStyle=colors.skin; ctx.stroke();
                           ctx.beginPath(); ctx.moveTo(8, -13+bob); ctx.lineTo(15, -5+bob); ctx.stroke();
                      } else {
                           ctx.fillRect(-11, -13+bob, 3, 10);
                           ctx.fillRect(8, -13+bob, 3, 10);
                      }
                      // Eyes
                      ctx.fillStyle = e.type === EnemyType.ZOMBIE ? '#ef4444' : '#facc15';
                      ctx.fillRect(-3, -22+bob, 2, 2); ctx.fillRect(2, -22+bob, 2, 2);
                  }
              }

              ctx.restore();
          }
      }

      // --- RENDER PARTICLES ---
      for (const p of particlesRef.current) {
          const iso = toIso(p.x, p.y);
          const screenX = iso.x + camX;
          const screenY = iso.y + camY - p.z;
          
          ctx.globalAlpha = p.life / p.maxLife;
          
          if (p.type === 'text') {
              ctx.fillStyle = p.color;
              ctx.font = `bold ${p.size}px monospace`;
              ctx.fillText(p.text || '', screenX, screenY);
          } else if (p.type === 'shockwave') {
               ctx.strokeStyle = p.color;
               ctx.lineWidth = 2;
               ctx.beginPath();
               ctx.ellipse(screenX, screenY, p.size * 20, p.size * 10, 0, 0, Math.PI*2);
               ctx.stroke();
          } else {
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
              ctx.fill();
          }
          ctx.globalAlpha = 1.0;
      }

      // --- HUD: BOSS BAR ---
      const activeBoss = activeEnemies.find(e => e.type === EnemyType.BOSS && !e.isDead);
      if (activeBoss) {
          const barWidth = Math.min(600, canvas.width * 0.6);
          const barHeight = 24;
          const barX = (canvas.width - barWidth) / 2;
          const barY = 80; // Below top stats

          // Boss Name
          ctx.save();
          ctx.textAlign = 'center';
          ctx.font = '700 16px "Orbitron", sans-serif';
          ctx.fillStyle = bossTheme.colors.glow;
          ctx.shadowColor = bossTheme.colors.aura;
          ctx.shadowBlur = 10;
          ctx.fillText(bossTheme.name, canvas.width / 2, barY - 8);
          ctx.restore();

          // Bar Background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(barX, barY, barWidth, barHeight);
          ctx.strokeStyle = bossTheme.colors.dark;
          ctx.lineWidth = 2;
          ctx.strokeRect(barX, barY, barWidth, barHeight);

          // Bar Fill
          const hpPct = Math.max(0, activeBoss.hp / activeBoss.maxHp);
          ctx.fillStyle = bossTheme.colors.glow; // Use theme glow color for bar
          ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * hpPct, barHeight - 4);
          
          // Glint effect on bar
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * hpPct, (barHeight - 4) / 2);
          
          // HP Text
          ctx.fillStyle = '#fff';
          ctx.font = '10px "Rajdhani", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.ceil(activeBoss.hp)} / ${activeBoss.maxHp}`, canvas.width/2, barY + 16);
      }

      // --- HUD: MINIMAP ---
      // Draw top-right, below system buttons
      const mmScale = 2; // 2px per tile
      const mmSize = MAP_W * mmScale; // 120px
      const mmX = canvas.width - mmSize - 20;
      const mmY = 70; // Offset below UI buttons

      ctx.save();
      ctx.translate(mmX, mmY);
      
      // Frame
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 1;
      ctx.fillRect(0, 0, mmSize, mmSize);
      ctx.strokeRect(0, 0, mmSize, mmSize);

      // Terrain (Simplified)
      for (let x = 0; x < MAP_W; x++) {
          for (let y = 0; y < MAP_H; y++) {
              const tile = map[x][y];
              if (tile === TileType.WATER) {
                  ctx.fillStyle = '#1e3a8a';
                  ctx.fillRect(x * mmScale, y * mmScale, mmScale, mmScale);
              } else if (tile === TileType.STONE) {
                  ctx.fillStyle = '#475569';
                  ctx.fillRect(x * mmScale, y * mmScale, mmScale, mmScale);
              }
          }
      }

      // Entities
      // Player
      const pMx = posRef.current.x * mmScale;
      const pMy = posRef.current.y * mmScale;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath(); ctx.arc(pMx, pMy, 2.5, 0, Math.PI*2); ctx.fill();
      
      // Pulse ring for player
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(pMx, pMy, 4 + Math.sin(time * 0.005) * 2, 0, Math.PI*2); ctx.stroke();

      // Enemies
      for (const e of activeEnemies) {
          if(e.isDead) continue;
          const eMx = e.x * mmScale;
          const eMy = e.y * mmScale;
          
          if (e.type === EnemyType.BOSS) {
              ctx.fillStyle = bossTheme.colors.glow;
              ctx.beginPath(); ctx.arc(eMx, eMy, 4, 0, Math.PI*2); ctx.fill();
              // Skull mark
              ctx.fillStyle = '#000';
              ctx.textAlign = 'center'; ctx.font = '8px sans-serif';
              ctx.fillText('💀', eMx, eMy + 3);
          } else {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath(); ctx.rect(eMx - 1, eMy - 1, 2, 2); ctx.fill();
          }
      }

      ctx.restore();

      if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - dt * 20);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [spritesLoaded]);

  return (
    <div className="relative">
      <div className="absolute left-[24px] top-[200px] z-50 bg-black/60 text-white p-2 rounded">
        <div className="text-[11px] text-white/80 mb-1">Armor Set</div>
        <select
          className="text-[12px] bg-black/60 text-white rounded-lg px-2 py-1 border border-white/10"
          value={armorSet}
          onChange={(e) => setArmorSet(e.target.value)}
        >
          {ARMOR_SETS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <canvas ref={canvasRef} className="block touch-none" />
    </div>
  );
};

export default GameCanvas;