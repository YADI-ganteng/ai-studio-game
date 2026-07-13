export type CharacterClass = 'Naruto' | 'Sasuke' | 'Sakura' | 'Kakashi';

export interface AttributeStats {
  str: number; // Strength (increases physical attack for Alaster)
  int: number; // Intelligence (increases magic attack for Edna, max MP)
  dex: number; // Dexterity (increases critical rate and attack speed)
  vit: number; // Vitality (increases max HP and physical defense)
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  damageMultiplier: number;
  manaCost: number;
  cooldown: number; // in seconds
  currentCooldown: number; // active remaining cooldown in seconds
  description: string;
  unlockedAt: number; // Level required to unlock
  icon: string; // Lucide icon name or emoji
}

export type ItemType = 'MATERIAL' | 'POTION' | 'EQUIPMENT' | 'ADMIN_SPECIAL';

export type EquipmentSlot = 'WEAPON' | 'ARMOR' | 'RING' | 'AMULET';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  quantity: number;
  icon: string; // emoji or code
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'ADMIN';
  
  // Equipment specific
  slot?: EquipmentSlot;
  upgradeLevel?: number; // e.g. +1, +2
  baseStatType?: 'PHYS_ATK' | 'MAG_ATK' | 'DEF' | 'HP' | 'MP' | 'CRIT' | 'ALL';
  baseStatValue?: number;
  bonusStatType?: string;
  bonusStatValue?: number;
  isAppraised?: boolean;
}

export interface PlayerState {
  classType: CharacterClass;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  gems: number;
  statPoints: number;
  skillPoints: number;
  attributes: AttributeStats;
  skills: Skill[];
  inventory: Item[];
  equipped: {
    WEAPON: Item | null;
    ARMOR: Item | null;
    RING: Item | null;
    AMULET: Item | null;
  };
  stagesUnlocked: number; // Highest unlocked stage (e.g., 1-5)
  isAdmin: boolean;
  selectedPetId?: string;
  unlockedPetIds?: string[];
  unlockedCompanionIds?: string[];
}

export interface Enemy {
  id: string;
  name: string;
  type: 'goblin' | 'slime' | 'orc' | 'demon' | 'dragon' | 'golem' | 'bird' | 'bat' | 'ghost';
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  xpValue: number;
  goldValue: number;
  gemsChance: number;
  isBoss: boolean;
  state: 'CHASE' | 'ATTACK' | 'HURT' | 'DEAD';
  stateTimer: number;
  hurtCooldown: number;
  attackCooldown: number;
  dirX: number;
  dirY: number;
  animFrame: number;
  animTimer: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  damage: number;
  isCrit: boolean;
  fromPlayer: boolean;
  color: string;
  life: number; // duration in frames or ms
  hitEnemies: string[]; // list of enemy IDs hit
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'blood' | 'fire' | 'heal' | 'mana' | 'admin';
}

export interface DamageNumber {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isCrit: boolean;
  life: number; // frames/ms left
}

export interface Stage {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  recommendLevel: number;
  enemyTypes: Array<'goblin' | 'slime' | 'orc' | 'demon' | 'golem' | 'bird' | 'bat' | 'ghost'>;
  bossType: 'dragon' | 'golem' | 'demon' | null;
  bgGradient: string;
  timeLimit: number; // seconds
}

export interface CompanionAlly {
  id: string;
  name: string;
  role: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  attackCooldown: number;
  facingDir: 'left' | 'right';
  targetEnemyId: string | null;
  state: 'CHASE' | 'ATTACK' | 'HURT' | 'DEAD';
  animTimer: number;
}
