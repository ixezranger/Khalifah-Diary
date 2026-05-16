export enum ItemType {
  WEAPON = 'Weapon',
  ARMOR = 'Armor',
  ACCESSORY = 'Accessory',
  CONSUMABLE = 'Consumable',
  MODULE = 'Module'
}

export enum Rarity {
  COMMON = 'Common',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary'
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  price: number;
  stats: {
    attack?: number;
    defense?: number;
    speed?: number;
    magic?: number;
    hp?: number;
    mp?: number;
  };
  description: string; // Static description
  lore?: string; // AI Generated Lore
  image: string; // Placeholder URL
  isEquipped?: boolean;
  upgradeLevel?: number; // Enhancement Level (e.g. +1, +2)
  modules?: Item[]; // Deprecated but kept for type safety if needed temporarily
}

export interface AvatarConfig {
  usePhoto: boolean;
  photoUrl: string | null;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  xp: number;
  maxXp: number;
  gold: number;
  runes: number; // New Currency for Upgrades
  attack: number;
  defense: number;
  avatarConfig: AvatarConfig;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  playerPos: Position;
  targetPos: Position | null;
  isMoving: boolean;
}

export enum EnemyType {
  ZOMBIE = 'Zombie',
  GHOST = 'Ghost',
  SKELETON = 'Skeleton',
  GOBLIN = 'Goblin',
  BOSS = 'Boss'
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  lastHitTime: number; // For i-frames
  isDead?: boolean;
  deathAnim?: number; // 0 to 1
}