import { Item, ItemType, Rarity } from './types';

export const INITIAL_PLAYER_STATS = {
  hp: 450,
  maxHp: 450,
  mp: 120,
  maxMp: 120,
  level: 7,
  xp: 4500,
  maxXp: 10000,
  gold: 2500,
  runes: 0,
  attack: 45,
  defense: 20,
  avatarConfig: {
    usePhoto: false,
    photoUrl: null
  }
};

// Dragon Themed Shop Items
export const SHOP_ITEMS: Item[] = [
  {
    id: 'w1',
    name: "Obsidian Maw",
    type: ItemType.WEAPON,
    rarity: Rarity.LEGENDARY,
    price: 350,
    stats: { attack: 140, speed: -10 },
    description: "A jagged slab of volcanic glass that cleaves through bone like paper.",
    image: "https://picsum.photos/seed/obsidian/100/100"
  },
  {
    id: 'a1',
    name: "Scale Mail of the Wyrm",
    type: ItemType.ARMOR,
    rarity: Rarity.RARE,
    price: 180,
    stats: { defense: 55, speed: 5 },
    description: "Lightweight scales harvested from a juvenile firedrake.",
    image: "https://picsum.photos/seed/scales/100/100"
  },
  {
    id: 'w2',
    name: "Inferno Greatsword",
    type: ItemType.WEAPON,
    rarity: Rarity.EPIC,
    price: 250,
    stats: { attack: 95, magic: 30 },
    description: "The steel blade is permanently red-hot, cauterizing wounds instantly.",
    image: "https://picsum.photos/seed/inferno/100/100"
  },
  {
    id: 'a3',
    name: "Void Warlord Plate",
    type: ItemType.ARMOR,
    rarity: Rarity.LEGENDARY,
    price: 550,
    stats: { defense: 140, attack: 20 },
    description: "Spiked armor forged in the abyss. It radiates a terrifying aura.",
    image: "https://picsum.photos/seed/void/100/100"
  },
  {
    id: 'w3',
    name: "Samurai Sword",
    type: ItemType.WEAPON,
    rarity: Rarity.RARE,
    price: 220,
    stats: { attack: 85, speed: 20 },
    description: "A masterwork katana folded a thousand times for unparalleled sharpness.",
    image: "https://picsum.photos/seed/katana/100/100"
  },
  {
    id: 'a4',
    name: "Shadow Stalker Garb",
    type: ItemType.ARMOR,
    rarity: Rarity.EPIC,
    price: 380,
    stats: { defense: 70, speed: 25 },
    description: "Lightweight assassin gear designed for silence and lethality.",
    image: "https://picsum.photos/seed/shadow/100/100"
  },
  {
    id: 'w4',
    name: "Damascus Blade",
    type: ItemType.WEAPON,
    rarity: Rarity.EPIC,
    price: 320,
    stats: { attack: 115, defense: 15 },
    description: "Ancient steel with water-like patterns, known for its ability to cut through lesser swords.",
    image: "https://picsum.photos/seed/damascus/100/100"
  },
  {
    id: 'w5',
    name: "Dragon's Blade",
    type: ItemType.WEAPON,
    rarity: Rarity.LEGENDARY,
    price: 600,
    stats: { attack: 180, magic: 40 },
    description: "Carved from the fang of an Elder Dragon, it hums with draconic energy.",
    image: "https://picsum.photos/seed/dragonblade/100/100"
  },
  {
    id: 'a2',
    name: "Drakeguard Plate",
    type: ItemType.ARMOR,
    rarity: Rarity.LEGENDARY,
    price: 400,
    stats: { defense: 120, hp: 150 },
    description: "Forged in dragonfire, this armor is impervious to standard steel.",
    image: "https://picsum.photos/seed/plate/100/100"
  },
  {
    id: 'a5',
    name: "Celestial Guardian",
    type: ItemType.ARMOR,
    rarity: Rarity.LEGENDARY,
    price: 650,
    stats: { defense: 160, hp: 200, magic: 20 },
    description: "Holy armor blessed by the stars. Its horns channel cosmic energy.",
    image: "https://picsum.photos/seed/celestial/100/100"
  }
];

// Visual constants
export const TILE_SIZE = 64; // Size of grid tiles
export const ISO_ANGLE = 0.5; // Isometric angle factor

// --- HERO ASSETS (Shared) ---
export const getArmorColors = (armorName?: string) => {
  if (armorName?.includes("Scale Mail")) {
    return {
      light: '#fb923c', // orange-400
      mid: '#c2410c',   // orange-700
      dark: '#7c2d12',  // orange-900
      trimLight: '#fca5a5', // red-300
      trimDark: '#991b1b'   // red-800
    };
  }
  if (armorName?.includes("Drakeguard")) {
    return {
      light: '#64748b', // slate-500
      mid: '#1e293b',   // slate-800
      dark: '#020617',  // slate-950
      trimLight: '#fcd34d', // amber-300
      trimDark: '#b45309'   // amber-700
    };
  }
  if (armorName?.includes("Void Warlord")) {
    return {
      light: '#475569', // slate-600
      mid: '#1e293b',   // slate-800
      dark: '#0f172a',  // slate-900
      trimLight: '#38bdf8', // sky-400 (Glow)
      trimDark: '#0c4a6e'   // sky-900
    };
  }
  if (armorName?.includes("Shadow Stalker")) {
    return {
      light: '#525252', // neutral-600
      mid: '#262626',   // neutral-800
      dark: '#0a0a0a',  // neutral-950
      trimLight: '#ef4444', // red-500
      trimDark: '#7f1d1d'   // red-900
    };
  }
  if (armorName?.includes("Celestial")) {
    return {
      light: '#bae6fd', // sky-200
      mid: '#60a5fa',   // blue-400
      dark: '#1e3a8a',  // blue-900
      trimLight: '#fef08a', // yellow-200
      trimDark: '#ca8a04'   // yellow-600
    };
  }
  // Default Teal
  return {
    light: '#2dd4bf',
    mid: '#0f766e',
    dark: '#134e4a',
    trimLight: '#fef08a',
    trimDark: '#a16207'
  };
};

export const getHeroDefs = (colors: { light: string, mid: string, dark: string, trimLight: string, trimDark: string }) => `
  <defs>
    <linearGradient id="armorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.light};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.mid};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.dark};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="trimGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.trimLight};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.trimDark};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#fff1f2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fecdd3;stop-opacity:1" />
    </linearGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="2" dy="4" result="offsetblur"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
`;

export const getWeaponSvg = (weaponName?: string) => {
  if (!weaponName) return '';
  const transform = 'translate(325, 300) rotate(-15) scale(2.5)'; 
  
  if (weaponName.includes("Obsidian")) {
    return `
      <g transform="${transform}">
        <defs>
           <linearGradient id="obsidianGrad" x1="0%" y1="0%" x2="0%" y2="100%">
             <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
             <stop offset="50%" style="stop-color:#581c87;stop-opacity:1" />
             <stop offset="100%" style="stop-color:#d8b4fe;stop-opacity:1" />
           </linearGradient>
        </defs>
        <rect x="-2" y="-5" width="4" height="20" fill="#1e1b4b" />
        <circle cx="0" cy="15" r="3" fill="#4c1d95" />
        <path d="M-5 -5 L-8 -25 L-4 -45 L-10 -65 L0 -90 L6 -75 L3 -55 L9 -30 L5 -5 Z" fill="url(#obsidianGrad)" />
        <path d="M0 -20 L2 -40 L-1 -60" fill="none" stroke="#a855f7" stroke-width="1" />
      </g>
    `;
  }
  // ... (Other weapons kept same logic, abbreviated for clarity if not changed)
  if (weaponName.includes("Inferno")) { return `<g transform="${transform}"><defs><linearGradient id="infernoGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#292524;stop-opacity:1" /><stop offset="50%" style="stop-color:#44403c;stop-opacity:1" /><stop offset="100%" style="stop-color:#a8a29e;stop-opacity:1" /></linearGradient></defs><rect x="-2" y="-5" width="4" height="20" fill="#1c1917" /><circle cx="0" cy="15" r="4" fill="#7f1d1d" stroke="#b45309" stroke-width="1" /><path d="M0 -5 Q-15 -2 -20 -10 Q-10 -12 -3 -15 L3 -15 Q10 -12 20 -10 Q15 -2 0 -5" fill="#44403c" stroke="#b45309" /><path d="M-4 -15 L-6 -30 L-4 -35 L-7 -50 L-5 -60 L-8 -75 L0 -95 L8 -75 L5 -60 L7 -50 L4 -35 L6 -30 L4 -15 Z" fill="url(#infernoGrad)" /><path d="M0 -20 L-1 -80 L0 -90 L1 -80 Z" fill="#f97316" /></g>`; }
  if (weaponName.includes("Samurai")) { return `<g transform="${transform}"><defs><linearGradient id="katanaGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#94a3b8;stop-opacity:1" /><stop offset="50%" style="stop-color:#f1f5f9;stop-opacity:1" /><stop offset="100%" style="stop-color:#cbd5e1;stop-opacity:1" /></linearGradient></defs><path d="M -1.5 0 L 1.5 0 L 1.5 25 L -1.5 25 Z" fill="#0f172a" /><path d="M -1.5 5 L 1.5 8 M -1.5 12 L 1.5 15 M -1.5 19 L 1.5 22" stroke="#d4d4d4" stroke-width="0.5"/><circle cx="0" cy="0" r="4" fill="#ca8a04" stroke="#000" stroke-width="0.5"/><path d="M -2 0 Q -5 -50 0 -90 L 2 -85 Q 0 -40 2 0 Z" fill="url(#katanaGrad)" stroke="#64748b" stroke-width="0.5" /></g>`; }
  if (weaponName.includes("Damascus")) { return `<g transform="${transform}"><defs><linearGradient id="damascusGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#334155;stop-opacity:1" /><stop offset="100%" style="stop-color:#94a3b8;stop-opacity:1" /></linearGradient></defs><rect x="-3" y="0" width="6" height="15" fill="#475569" /><rect x="-6" y="-2" width="12" height="4" fill="#1e293b" /><path d="M -4 0 L -3 -70 L 0 -80 L 3 -70 L 4 0 Z" fill="url(#damascusGrad)" stroke="#1e293b" stroke-width="0.5"/><path d="M -3 -10 Q 0 -20 3 -10 M -3 -30 Q 0 -40 3 -30 M -3 -50 Q 0 -60 3 -50" fill="none" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/><path d="M 0 0 L 0 -60" stroke="#1e293b" stroke-width="0.5" /></g>`; }
  if (weaponName.includes("Dragon")) { return `<g transform="${transform}"><defs><linearGradient id="dragonGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#14532d;stop-opacity:1" /><stop offset="50%" style="stop-color:#22c55e;stop-opacity:1" /><stop offset="100%" style="stop-color:#14532d;stop-opacity:1" /></linearGradient></defs><path d="M -3 15 Q 0 20 3 15 L 2 0 L -2 0 Z" fill="#fcd34d" /><path d="M -2 0 Q -10 -5 -12 -15 L -2 -5 Z" fill="#15803d" /><path d="M 2 0 Q 10 -5 12 -15 L 2 -5 Z" fill="#15803d" /><path d="M -4 0 L -5 -20 L -3 -30 L -6 -50 L -2 -70 L 0 -90 L 2 -70 L 6 -50 L 3 -30 L 5 -20 L 4 0 Z" fill="url(#dragonGrad)" stroke="#064e3b" stroke-width="0.5"/><path d="M 0 -10 L 0 -80" stroke="#86efac" stroke-width="1" stroke-linecap="round" /></g>`; }

  return `<g transform="${transform}"><path d="M -6 -80 L 6 -80 L 6 0 L -6 0 Z" fill="#cbd5e1" stroke="#475569" stroke-width="1"/><path d="M -3 0 L 3 0 L 3 15 L -3 15 Z" fill="#78350f" /><circle cx="0" cy="-60" r="3" fill="#06b6d4" /><circle cx="0" cy="-40" r="3" fill="#22c55e" /></g>`;
};

// DYNAMIC ARMOR PARTS GENERATOR
export const getHeroParts = (armorName?: string) => {
  const isVoid = armorName?.includes("Void Warlord");
  const isShadow = armorName?.includes("Shadow Stalker");
  const isCelestial = armorName?.includes("Celestial");

  let bodyPath = `<path d="M20 100 L160 100 L150 180 L30 180 Z" fill="#000"/><path d="M40 0 L140 0 L130 140 L50 140 Z" fill="url(#armorGradient)" filter="url(#dropShadow)"/>`;
  let headPath = `<rect x="40" y="80" width="120" height="100" rx="40" fill="url(#skin)"/>`;
  let shoulderPathL = `<path d="M-10 -20 Q25 -50 60 -20 L50 40 L0 40 Z" fill="url(#armorGradient)" stroke="url(#trimGradient)" stroke-width="4"/>`;
  let shoulderPathR = `<path d="M-10 -20 Q25 -50 60 -20 L50 40 L0 40 Z" fill="url(#armorGradient)" stroke="url(#trimGradient)" stroke-width="4"/>`;
  
  // Custom Geometries
  if (isVoid) {
      // Spiky, jagged armor
      bodyPath = `
        <path d="M20 100 L160 100 L150 180 L30 180 Z" fill="#0f172a"/>
        <path d="M40 0 L140 0 L130 140 L90 160 L50 140 Z" fill="url(#armorGradient)" filter="url(#dropShadow)"/>
        <path d="M50 20 L90 80 L130 20" fill="none" stroke="url(#trimGradient)" stroke-width="4"/>
        <path d="M90 80 L90 160" stroke="url(#trimGradient)" stroke-width="2"/>
      `;
      headPath = `
        <rect x="40" y="80" width="120" height="100" rx="40" fill="url(#skin)"/>
        <!-- Void Helmet -->
        <path d="M30 60 L150 60 L140 130 L90 150 L40 130 Z" fill="url(#armorGradient)"/>
        <path d="M90 60 L90 150" stroke="url(#trimGradient)" stroke-width="2"/>
        <path d="M40 60 L30 20 L50 60" fill="url(#armorGradient)"/> <!-- Horn L -->
        <path d="M140 60 L150 20 L130 60" fill="url(#armorGradient)"/> <!-- Horn R -->
        <path d="M50 90 L130 90 L120 100 L60 100 Z" fill="#000"/> <!-- Visor -->
      `;
      shoulderPathL = `<path d="M-20 -40 L20 -60 L60 -40 L50 40 L0 40 Z" fill="url(#armorGradient)" stroke="url(#trimGradient)" stroke-width="4"/><path d="M20 -60 L20 -80 L30 -60" fill="url(#trimGradient)"/>`;
      shoulderPathR = `<path d="M-20 -40 L20 -60 L60 -40 L50 40 L0 40 Z" fill="url(#armorGradient)" stroke="url(#trimGradient)" stroke-width="4"/><path d="M20 -60 L20 -80 L30 -60" fill="url(#trimGradient)"/>`;
  } else if (isShadow) {
      // Sleek, Hooded
      bodyPath = `
         <path d="M30 100 L150 100 L140 170 L40 170 Z" fill="#171717"/>
         <path d="M50 0 L130 0 L120 130 L60 130 Z" fill="url(#armorGradient)"/>
         <path d="M60 0 L120 0 L90 60 Z" fill="url(#trimGradient)" opacity="0.5"/>
         <rect x="65" y="100" width="50" height="10" fill="#7f1d1d"/> <!-- Belt -->
      `;
      headPath = `
         <!-- Hood Back -->
         <path d="M20 70 Q90 40 160 70 L160 130 L20 130 Z" fill="url(#armorGradient)"/>
         <rect x="50" y="90" width="80" height="70" rx="30" fill="url(#skin)"/>
         <!-- Mask -->
         <path d="M50 130 L130 130 L120 160 L60 160 Z" fill="#171717"/>
         <!-- Hood Front -->
         <path d="M10 70 Q90 30 170 70 L150 120 L90 90 L30 120 Z" fill="url(#armorGradient)"/>
      `;
      shoulderPathL = `<path d="M0 0 Q30 -20 60 0 L50 30 L10 30 Z" fill="url(#armorGradient)"/><circle cx="30" cy="15" r="5" fill="url(#trimGradient)"/>`;
      shoulderPathR = `<path d="M0 0 Q30 -20 60 0 L50 30 L10 30 Z" fill="url(#armorGradient)"/><circle cx="30" cy="15" r="5" fill="url(#trimGradient)"/>`;
  } else if (isCelestial) {
      // Bulky, Holy
      bodyPath = `
        <path d="M10 100 L170 100 L160 180 L20 180 Z" fill="url(#armorGradient)"/>
        <path d="M30 0 L150 0 L140 150 L40 150 Z" fill="url(#armorGradient)" filter="url(#dropShadow)"/>
        <circle cx="90" cy="70" r="20" fill="url(#trimGradient)" stroke="#fff" stroke-width="2"/>
        <path d="M90 50 L90 90 M70 70 L110 70" stroke="#fff" stroke-width="4"/>
      `;
      headPath = `
         <rect x="40" y="80" width="120" height="100" rx="40" fill="url(#skin)"/>
         <!-- Celestial Helm -->
         <path d="M20 70 Q90 40 160 70 L160 120 L20 120 Z" fill="url(#armorGradient)"/>
         <path d="M90 30 L100 70 L80 70 Z" fill="url(#trimGradient)"/> <!-- Crest -->
         <path d="M20 70 L0 20 L30 60" fill="url(#armorGradient)"/> <!-- Wing L -->
         <path d="M160 70 L180 20 L150 60" fill="url(#armorGradient)"/> <!-- Wing R -->
         <path d="M40 80 Q90 120 140 80" fill="none" stroke="url(#trimGradient)" stroke-width="4"/>
      `;
      shoulderPathL = `<rect x="-10" y="-30" width="70" height="60" rx="10" fill="url(#armorGradient)" stroke="url(#trimGradient)" stroke-width="4"/><circle cx="25" cy="0" r="10" fill="url(#trimGradient)"/>`;
      shoulderPathR = `<rect x="-10" y="-30" width="70" height="60" rx="10" fill="url(#armorGradient)" stroke="url(#trimGradient)" stroke-width="4"/><circle cx="25" cy="0" r="10" fill="url(#trimGradient)"/>`;
  }

  // Base fallback logic for default armor...
  if (!isVoid && !isShadow && !isCelestial) {
      // Default body path from original constant
      bodyPath = `<path d="M20 100 L160 100 L150 180 L30 180 Z" fill="#000"/><path d="M40 0 L140 0 L130 140 L50 140 Z" fill="url(#armorGradient)" filter="url(#dropShadow)"/><path d="M50 10 Q90 60 130 10" fill="none" stroke="url(#trimGradient)" stroke-width="6" stroke-linecap="round"/><path d="M60 40 Q90 90 120 40" fill="none" stroke="url(#trimGradient)" stroke-width="4" stroke-linecap="round"/><circle cx="90" cy="80" r="15" fill="url(#trimGradient)" stroke="#713f12" stroke-width="2"/><circle cx="90" cy="80" r="8" fill="url(#armorGradient)"/><path d="M20 130 Q10 180 40 190 L80 180 L70 130 Z" fill="url(#armorGradient)" stroke="url(#trimGradient)" stroke-width="3"/><path d="M160 130 Q170 180 140 190 L100 180 L110 130 Z" fill="url(#armorGradient)" stroke="url(#trimGradient)" stroke-width="3"/><path d="M70 140 L110 140 L100 200 L80 200 Z" fill="#334155"/><path d="M80 140 L100 140 L90 190 Z" fill="url(#armorGradient)"/>`;
      
      headPath = `
      <rect x="40" y="80" width="120" height="100" rx="40" fill="url(#skin)"/>
      <ellipse cx="35" cy="130" rx="10" ry="15" fill="url(#skin)"/>
      <ellipse cx="165" cy="130" rx="10" ry="15" fill="url(#skin)"/>
      <ellipse cx="70" cy="120" rx="8" ry="12" fill="#1e293b"/>
      <ellipse cx="130" cy="120" rx="8" ry="12" fill="#1e293b"/>
      <ellipse cx="60" cy="135" rx="10" ry="6" fill="#fda4af" opacity="0.6"/>
      <ellipse cx="140" cy="135" rx="10" ry="6" fill="#fda4af" opacity="0.6"/>
      <path d="M90 145 Q100 150 110 145" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round"/>
      <path d="M40 100 L30 160 L50 140" fill="#573e29"/>
      <path d="M160 100 L170 160 L150 140" fill="#573e29"/>
      <path d="M20 80 Q100 -20 180 80 L180 110 L20 110 Z" fill="url(#armorGradient)" stroke="#0f172a" stroke-width="2"/>
      <path d="M90 20 L110 20 L100 80 Z" fill="url(#trimGradient)"/> 
      <path d="M20 80 Q100 50 180 80" fill="none" stroke="url(#trimGradient)" stroke-width="4"/>
      <path d="M50 40 Q100 90 150 40" fill="none" stroke="url(#trimGradient)" stroke-width="3"/>
      <path d="M10 60 Q-20 20 0 0 L20 40 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
      <path d="M190 60 Q220 20 200 0 L180 40 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
      `;
  }

  // Common parts or slightly modified based on armor type
  return {
    legL: `<g transform="translate(130, 350)"><path d="M10 0 L10 60 Q10 80 30 80 L60 80 L60 40 L50 0 Z" fill="url(#armorGradient)" stroke="#0f172a" stroke-width="2"/><path d="M10 50 Q35 60 60 40" fill="none" stroke="url(#trimGradient)" stroke-width="4"/><path d="M10 80 L60 80 L60 90 L10 90 Z" fill="#78350f"/><path d="M20 10 L50 10 L45 40 L25 40 Z" fill="url(#trimGradient)"/></g>`,
    legR: `<g transform="translate(210, 350)"><path d="M10 0 L10 60 Q10 80 30 80 L60 80 L60 40 L50 0 Z" fill="url(#armorGradient)" stroke="#0f172a" stroke-width="2"/><path d="M10 50 Q35 60 60 40" fill="none" stroke="url(#trimGradient)" stroke-width="4"/><path d="M10 80 L60 80 L60 90 L10 90 Z" fill="#78350f"/><path d="M20 10 L50 10 L45 40 L25 40 Z" fill="url(#trimGradient)"/></g>`,
    armL: `<g transform="translate(50, 240)">${shoulderPathL}<rect x="0" y="0" width="50" height="90" rx="10" fill="url(#armorGradient)"/><path d="M0 60 L50 60 L50 80 L0 80 Z" fill="url(#trimGradient)"/></g>`,
    armR: `<g transform="translate(300, 240)">${shoulderPathR}<rect x="0" y="0" width="50" height="90" rx="10" fill="url(#armorGradient)"/><path d="M0 60 L50 60 L50 80 L0 80 Z" fill="url(#trimGradient)"/></g>`,
    body: `
      <g transform="translate(110, 240)">${bodyPath}</g>
      <g transform="translate(100, 50)">${headPath}</g>
    `
  };
};

export const HERO_PARTS = getHeroParts(); // Default Fallback