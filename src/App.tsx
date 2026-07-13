import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sparkles, Coins, HelpCircle, Hammer, Heart, Zap, Play, Settings, ShoppingBag, User } from 'lucide-react';
import { CharacterClass, PlayerState, Stage, Enemy, Projectile, Particle, DamageNumber, Skill, CompanionAlly } from './types';
import { playSound } from './utils/audio';

// Subcomponents
import MainMenu from './components/MainMenu';
import GameUI from './components/GameUI';
import CharacterSheet from './components/CharacterSheet';
import Shop from './components/Shop';
import Blacksmith from './components/Blacksmith';
import AdminPanel from './components/AdminPanel';
import SummonSanctuary, { PETS_DATABASE, COMPANIONS_DATABASE } from './components/SummonSanctuary';

const INITIAL_STATE: PlayerState = {
  classType: 'Naruto',
  level: 1,
  exp: 0,
  maxExp: 100,
  hp: 240,
  maxHp: 240,
  mp: 140,
  maxMp: 140,
  gold: 1500,
  gems: 10,
  statPoints: 5,
  skillPoints: 1,
  attributes: {
    str: 10,
    int: 10,
    dex: 10,
    vit: 10
  },
  skills: [
    { id: 'naruto_s1', name: 'Rasengan', level: 1, maxLevel: 5, damageMultiplier: 1.6, manaCost: 20, cooldown: 4, currentCooldown: 0, description: 'Dashes forward with a swirling sphere of blue chakra, crushing enemies in its path.', unlockedAt: 1, icon: '🌀' },
    { id: 'naruto_s2', name: 'Shadow Clone Strike', level: 1, maxLevel: 5, damageMultiplier: 1.9, manaCost: 30, cooldown: 7, currentCooldown: 0, description: 'Summons shadow clones that charge forward to execute a barrage of punches.', unlockedAt: 2, icon: '👥' },
    { id: 'naruto_s3', name: 'Nine-Tails Roar', level: 1, maxLevel: 5, damageMultiplier: 2.3, manaCost: 40, cooldown: 10, currentCooldown: 0, description: 'Releases crimson Kurama chakra, knocking back and stunning surrounding enemies.', unlockedAt: 4, icon: '🦊' },
    { id: 'naruto_s4', name: 'Rasenshuriken', level: 1, maxLevel: 5, damageMultiplier: 3.8, manaCost: 75, cooldown: 20, currentCooldown: 0, description: 'Throws a massive spinning wind-chakra shuriken that triggers a colossal vortex explosion.', unlockedAt: 6, icon: '🌪️' },
  ],
  inventory: [
    { id: 'init_potion_hp', name: 'HP Potion', type: 'POTION', description: 'Restores 150 Health points instantly.', quantity: 5, icon: '🧪', rarity: 'COMMON' },
    { id: 'init_potion_mp', name: 'MP Potion', type: 'POTION', description: 'Restores 50 Mana/Chakra points instantly.', quantity: 5, icon: '💧', rarity: 'COMMON' },
    { id: 'init_iron_ore', name: 'Iron Ores', type: 'MATERIAL', description: 'A raw metallic ore used by the blacksmith to forge sturdy equipment.', quantity: 5, icon: '🪨', rarity: 'COMMON' }
  ],
  equipped: {
    WEAPON: {
      id: 'init_weapon_naruto',
      name: 'Shinobi Kunai',
      type: 'EQUIPMENT',
      slot: 'WEAPON',
      description: 'A balanced steel kunai ideal for physical quick strikes.',
      icon: '🗡️',
      rarity: 'COMMON',
      upgradeLevel: 0,
      baseStatType: 'PHYS_ATK',
      baseStatValue: 16,
      quantity: 1,
    },
    ARMOR: {
      id: 'init_armor',
      name: 'Trainee Robe',
      type: 'EQUIPMENT',
      slot: 'ARMOR',
      description: 'A simple padded cloth robe of academy cadets.',
      icon: '🥼',
      rarity: 'COMMON',
      upgradeLevel: 0,
      baseStatType: 'DEF',
      baseStatValue: 10,
      quantity: 1,
    },
    RING: null,
    AMULET: null,
  },
  stagesUnlocked: 1,
  isAdmin: false,
  selectedPetId: 'none',
  unlockedPetIds: ['none'],
  unlockedCompanionIds: []
};

const STAGES: Stage[] = [
  {
    id: 1,
    name: 'Forest of Death',
    description: 'A dark, dense forest filled with wild slimes and bandit goblin scouts.',
    difficulty: 'Normal',
    recommendLevel: 1,
    enemyTypes: ['slime', 'goblin', 'bat'],
    bossType: null,
    bgGradient: 'from-emerald-950 to-teal-900',
    timeLimit: 120,
  },
  {
    id: 2,
    name: 'Valley of the End',
    description: 'A grand historic canyon battleground. Heavy orcs have set up camp here.',
    difficulty: 'Hard',
    recommendLevel: 8,
    enemyTypes: ['slime', 'goblin', 'orc', 'bird'],
    bossType: null,
    bgGradient: 'from-blue-950 to-indigo-950',
    timeLimit: 150,
  },
  {
    id: 3,
    name: 'Akatsuki Hideout',
    description: 'A desolate subterranean cave. Giant rock golems patrol the dark cavern floors.',
    difficulty: 'Expert',
    recommendLevel: 18,
    enemyTypes: ['orc', 'golem', 'ghost'],
    bossType: null,
    bgGradient: 'from-purple-950 to-slate-950',
    timeLimit: 180,
  },
  {
    id: 4,
    name: 'Chunin Arena',
    description: 'The leaf coliseum. Survive waves of elite shadow demons and the Great Golem Boss!',
    difficulty: 'Master',
    recommendLevel: 30,
    enemyTypes: ['golem', 'demon', 'bird', 'ghost'],
    bossType: 'golem',
    bgGradient: 'from-amber-950 to-orange-950',
    timeLimit: 210,
  },
  {
    id: 5,
    name: 'War Battlefield',
    description: 'The legendary war plains. Confront the catastrophic Divine Red Dragon Boss!',
    difficulty: 'Mythic',
    recommendLevel: 45,
    enemyTypes: ['demon', 'golem', 'bird', 'bat', 'ghost'],
    bossType: 'dragon',
    bgGradient: 'from-red-950 to-zinc-950',
    timeLimit: 240,
  }
];

export default function App() {
  const [playerState, setPlayerState] = useState<PlayerState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ninja_arena_rpg_save');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...INITIAL_STATE,
            ...parsed,
            unlockedPetIds: parsed.unlockedPetIds || ['none'],
            unlockedCompanionIds: parsed.unlockedCompanionIds || [],
            selectedPetId: parsed.selectedPetId || 'none',
          };
        } catch (e) {
          console.error('Failed to parse save game:', e);
        }
      }
    }
    return INITIAL_STATE;
  });

  const [activeTab, setActiveTab] = useState<'VILLAGE_HUB' | 'TOWN_GATE' | 'SHINOBI_SCROLL' | 'POTION_SHOP' | 'GRAND_FORGE' | 'ADMIN_GATE' | 'SUMMON_SANCTUARY'>('VILLAGE_HUB');
  const [gameState, setGameState] = useState<'TOWN' | 'BATTLE'>('TOWN');
  const [activeStage, setActiveStage] = useState<Stage | null>(null);
  const [companionCooldown, setCompanionCooldown] = useState(0);

  // Battle loop triggers
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  // Victory rewards calculated
  const [victoryGold, setVictoryGold] = useState(0);
  const [victoryGems, setVictoryGems] = useState(0);
  const [victoryXP, setVictoryXP] = useState(0);
  const [victoryDrops, setVictoryDrops] = useState<Array<{ name: string; qty: number; icon: string }>>([]);

  // Admin passcode lock
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1000, 
    height: typeof window !== 'undefined' ? window.innerHeight : 500 
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const activeSkillAnims = useRef<Array<{ id: string; type: string; x: number; y: number; timer: number; maxTimer: number; angle?: number }>>([]);

  // Combat Simulation references
  const playerPos = useRef({
    x: 150,
    y: 250,
    vx: 0,
    vy: 0,
    width: 44,
    height: 44,
    facingDir: 'right' as 'left' | 'right',
    jumping: false,
    jumpY: 0,
    jumpTimer: 0,
    isRolling: false,
    rollTimer: 0,
    invincibleTimer: 0,
    attackTimer: 0,
    attackPower: 40,
    defense: 10,
    critChance: 5,
    runningAnimTimer: 0,
    ghostTrail: [] as Array<{ x: number; y: number; opacity: number }>,
    shieldTimer: 0, // Susanoo ribs shield
    healAuraTimer: 0, // Sakura heal aura
    targetX: 150,
    targetY: 250,
    hasTarget: false,
  });

  const enemies = useRef<Enemy[]>([]);
  const projectiles = useRef<Projectile[]>([]);
  const particles = useRef<Particle[]>([]);
  const damageNumbers = useRef<DamageNumber[]>([]);
  const activeAllies = useRef<CompanionAlly[]>([]);
  const petPos = useRef({ x: 100, y: 250, angle: 0 });
  const petCooldowns = useRef(0);

  // Waves stats
  const currentWave = useRef(1);
  const maxWaves = useRef(3);
  const waveCountdown = useRef(0);
  const screenShake = useRef(0);
  const stageTimer = useRef(120);
  const lastTimeRef = useRef<number>(0);

  // Save changes automatically
  useEffect(() => {
    localStorage.setItem('ninja_arena_rpg_save', JSON.stringify(playerState));
  }, [playerState]);

  // Load visual assets once available
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  useEffect(() => {
    const assets = {
      naruto: '/sprites/ninjas/naruto.png',
      sasuke: '/sprites/ninjas/sasuke.png',
      sakura: '/sprites/ninjas/sakura.png',
      kakashi: '/sprites/ninjas/kakashi.png',
      explosion: '/sprites/effects/explosion.png',
      fireball: '/sprites/effects/fireball.png',
      shield: '/sprites/effects/shield.png',
      slash: '/sprites/effects/slash.png',
      battle_bg: '/sprites/maps/battle_bg.png'
    };
    Object.entries(assets).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      imagesRef.current[key] = img;
    });
  }, []);

  // Sync player base stats with calculated gear
  const getCalculatedMaxes = (state: PlayerState) => {
    const attr = { ...state.attributes };
    
    if (state.selectedPetId === 'pakun') attr.dex += 20;
    else if (state.selectedPetId === 'kurama') attr.str += 25;
    else if (state.selectedPetId === 'katsuyu') attr.vit += 30;
    else if (state.selectedPetId === 'aoda') attr.int += 25;
    else if (state.selectedPetId === 'tiger') attr.str += 35;
    else if (state.selectedPetId === 'eagle') attr.dex += 30;
    else if (state.selectedPetId === 'monkey') attr.vit += 35;

    let hpMax = 200 + state.level * 40 + attr.vit * 10;
    let mpMax = 100 + state.level * 15 + attr.int * 4;

    Object.values(state.equipped).forEach(item => {
      if (item) {
        if (item.baseStatType === 'HP' || item.baseStatType === 'ALL') hpMax += item.baseStatValue || 0;
        if (item.baseStatType === 'MP') mpMax += item.baseStatValue || 0;
        if (item.isAppraised && item.bonusStatType && item.bonusStatValue) {
          if (item.bonusStatType.includes('HP')) hpMax += item.bonusStatValue;
        }
      }
    });

    return { hpMax, mpMax };
  };

  const getCalculatedAttackStats = (state: PlayerState) => {
    const attr = { ...state.attributes };
    
    if (state.selectedPetId === 'pakun') attr.dex += 20;
    else if (state.selectedPetId === 'kurama') attr.str += 25;
    else if (state.selectedPetId === 'katsuyu') attr.vit += 30;
    else if (state.selectedPetId === 'aoda') attr.int += 25;
    else if (state.selectedPetId === 'tiger') attr.str += 35;
    else if (state.selectedPetId === 'eagle') attr.dex += 30;
    else if (state.selectedPetId === 'monkey') attr.vit += 35;

    let physAtk = 15 + state.level * 3 + attr.str * 1.5;
    let magAtk = 15 + state.level * 3 + attr.int * 1.5;
    let defense = 5 + state.level * 1.5 + attr.vit * 0.5;
    let critChance = 5 + attr.dex * 0.15;

    Object.values(state.equipped).forEach(item => {
      if (item) {
        const val = item.baseStatValue || 0;
        if (item.baseStatType === 'PHYS_ATK') physAtk += val;
        else if (item.baseStatType === 'MAG_ATK') magAtk += val;
        else if (item.baseStatType === 'DEF') defense += val;
        else if (item.baseStatType === 'CRIT') critChance += val;
        else if (item.baseStatType === 'ALL') {
          physAtk += val;
          magAtk += val;
          defense += val;
        }

        if (item.isAppraised && item.bonusStatType && item.bonusStatValue) {
          const bonusVal = item.bonusStatValue;
          if (item.bonusStatType.includes('Defense')) defense += bonusVal;
          if (item.bonusStatType.includes('Critical')) critChance += bonusVal;
        }
      }
    });

    return { physAtk, magAtk, defense, critChance: Math.min(100, critChance) };
  };

  const handleStartStage = (stageId: number) => {
    const selected = STAGES.find(s => s.id === stageId);
    if (!selected) return;

    setActiveStage(selected);
    setIsPaused(false);
    setIsGameOver(false);
    setIsVictory(false);
    setGameState('BATTLE');

    // Reset loop params
    currentWave.current = 1;
    waveCountdown.current = 0;
    enemies.current = [];
    projectiles.current = [];
    particles.current = [];
    damageNumbers.current = [];
    activeAllies.current = [];
    petCooldowns.current = 0;
    stageTimer.current = selected.timeLimit;
    screenShake.current = 0;

    // Load simulation combat params
    const { hpMax, mpMax } = getCalculatedMaxes(playerState);
    const combat = getCalculatedAttackStats(playerState);

    // Fully heal resources when departing
    setPlayerState(prev => ({
      ...prev,
      hp: hpMax,
      mp: mpMax,
      skills: prev.skills.map(s => ({ ...s, currentCooldown: 0 }))
    }));

    playerPos.current = {
      x: 250,
      y: 700,
      vx: 0,
      vy: 0,
      width: 44,
      height: 44,
      facingDir: 'right',
      jumping: false,
      jumpY: 0,
      jumpTimer: 0,
      isRolling: false,
      rollTimer: 0,
      invincibleTimer: 0,
      attackTimer: 0,
      attackPower: playerState.classType === 'Sakura' ? combat.physAtk : (playerState.classType === 'Sasuke' || playerState.classType === 'Kakashi' ? combat.physAtk * 0.9 + combat.magAtk * 0.1 : combat.physAtk),
      defense: combat.defense,
      critChance: combat.critChance,
      runningAnimTimer: 0,
      ghostTrail: [],
      shieldTimer: 0,
      healAuraTimer: 0,
      targetX: 250,
      targetY: 700,
      hasTarget: false,
    };

    spawnWave(1, selected);
    lastTimeRef.current = performance.now();
  };

  const spawnWave = (wave: number, stage: Stage) => {
    currentWave.current = wave;
    enemies.current = [];

    const totalToSpawn = 3 + wave * 2;
    const isFinalWave = wave === 3;

    if (isFinalWave && stage.bossType) {
      // Spawn Boss
      const bType = stage.bossType;
      const bWidth = bType === 'dragon' ? 110 : bType === 'golem' ? 90 : 80;
      const bHeight = bType === 'dragon' ? 110 : bType === 'golem' ? 90 : 80;
      enemies.current.push({
        id: `boss_${Date.now()}`,
        name: bType === 'dragon' ? 'Flame Dragon God' : bType === 'golem' ? 'Subterranean Titan Golem' : 'Sovereign Shadow Demon',
        type: bType,
        x: 250 - bWidth / 2,
        y: 160,
        width: bWidth,
        height: bHeight,
        hp: stage.id * 1800,
        maxHp: stage.id * 1800,
        damage: stage.id * 18 + 20,
        speed: bType === 'dragon' ? 2.4 : bType === 'golem' ? 1.4 : 2.0,
        xpValue: stage.id * 80 + 100,
        goldValue: stage.id * 120 + 200,
        gemsChance: 90,
        isBoss: true,
        state: 'CHASE',
        stateTimer: 0,
        hurtCooldown: 0,
        attackCooldown: 0,
        dirX: -1,
        dirY: 0,
        animFrame: 0,
        animTimer: 0,
      });

      // Add 2 supporting mob minions
      spawnRegularEnemy(stage, 120, 240);
      spawnRegularEnemy(stage, 380, 240);
    } else {
      // Spawn regular wave minions in upper section
      for (let i = 0; i < totalToSpawn; i++) {
        const randX = 40 + Math.random() * 420;
        const randY = 130 + Math.random() * 260;
        spawnRegularEnemy(stage, randX, randY);
      }
    }

    playSound('victory');
  };

  const spawnRegularEnemy = (stage: Stage, x: number, y: number) => {
    const pickedType = stage.enemyTypes[Math.floor(Math.random() * stage.enemyTypes.length)];
    let width = 36;
    let height = 36;
    let hp = stage.id * 90 + 50;
    let damage = stage.id * 4 + 8;
    let speed = 1.3 + Math.random() * 0.7;
    let xpValue = stage.id * 12 + 10;
    let goldValue = stage.id * 15 + 15;
    let gemsChance = 10 + stage.id * 4;

    if (pickedType === 'golem') {
      width = 54;
      height = 54;
      hp *= 2.0;
      damage *= 1.4;
      speed *= 0.7;
    } else if (pickedType === 'demon') {
      width = 40;
      height = 40;
      hp *= 1.4;
      damage *= 1.3;
      speed *= 1.2;
    } else if (pickedType === 'slime') {
      width = 30;
      height = 30;
      hp *= 0.7;
      speed *= 1.3;
    } else if (pickedType === 'bird') {
      width = 32;
      height = 32;
      hp *= 0.8;
      damage *= 0.9;
      speed *= 1.6;
    } else if (pickedType === 'bat') {
      width = 28;
      height = 28;
      hp *= 0.65;
      damage *= 0.85;
      speed *= 1.9;
    } else if (pickedType === 'ghost') {
      width = 34;
      height = 34;
      hp *= 1.15;
      damage *= 1.25;
      speed *= 0.85;
    }

    enemies.current.push({
      id: `mob_${Math.random().toString(36).substr(2, 9)}`,
      name: pickedType.toUpperCase(),
      type: pickedType,
      x,
      y,
      width,
      height,
      hp,
      maxHp: hp,
      damage,
      speed,
      xpValue,
      goldValue,
      gemsChance,
      isBoss: false,
      state: 'CHASE',
      stateTimer: 0,
      hurtCooldown: 0,
      attackCooldown: 0,
      dirX: -1,
      dirY: 0,
      animFrame: 0,
      animTimer: 0,
    });
  };

  const handleSpawnCompanion = (companionId: string) => {
    if (gameState !== 'BATTLE' || isPaused || isGameOver || isVictory) return;
    
    // Limit to 1 active companion
    if (activeAllies.current.length >= 1 && !playerState.isAdmin) {
      playSound('hurt');
      return;
    }

    // Cooldown check
    if (companionCooldown > 0 && !playerState.isAdmin) {
      playSound('hurt');
      return;
    }

    // MP cost: 40
    if (playerState.mp < 40 && !playerState.isAdmin) {
      playSound('hurt');
      return;
    }
    
    // Deduct MP
    setPlayerState(prev => ({ ...prev, mp: prev.isAdmin ? prev.mp : Math.max(0, prev.mp - 40) }));

    playSound('levelup');
    playSound('fireball');
    
    const ply = playerPos.current;
    const spawnX = ply.x + (Math.random() * 80 - 40);
    const spawnY = ply.y + (Math.random() * 80 - 40);
    
    // Spawn smoke puff particles
    for (let i = 0; i < 8; i++) {
      spawnParticle(spawnX, spawnY, Math.random() * 60 - 30, Math.random() * 40 - 25, '#ffffff99', 4, 18, 'smoke');
    }
    
    // Create ally object
    let name = 'Shadow Clone';
    let role = 'Attacker';
    let icon = '👥';
    let hp = playerState.level * 100 + 150;
    let damage = playerState.level * 10 + 20;
    let speed = 2.0;
    
    if (companionId === 'friend_sasuke') {
      name = 'Sasuke (Ally)';
      role = 'DPS Archer';
      icon = '⚡';
      hp = playerState.level * 150 + 220;
      damage = playerState.level * 13 + 28;
      speed = 2.3;
    } else if (companionId === 'friend_sakura') {
      name = 'Sakura (Ally)';
      role = 'Healer / Tank';
      icon = '🌸';
      hp = playerState.level * 180 + 320;
      damage = playerState.level * 9 + 20;
      speed = 1.8;
    } else if (companionId === 'friend_kakashi') {
      name = 'Kakashi (Ally)';
      role = 'Elite Tactician';
      icon = '👁️';
      hp = playerState.level * 160 + 270;
      damage = playerState.level * 15 + 32;
      speed = 2.0;
    }
    
    activeAllies.current.push({
      id: `ally_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name,
      role,
      icon,
      x: spawnX,
      y: spawnY,
      width: 40,
      height: 40,
      hp,
      maxHp: hp,
      damage,
      speed,
      attackCooldown: 0,
      facingDir: 'right',
      targetEnemyId: null,
      state: 'CHASE',
      animTimer: 0,
    });

    // Start 25 seconds cooldown
    if (!playerState.isAdmin) {
      setCompanionCooldown(25.0);
    }
  };

  const handleCanvasClickOrTouch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'BATTLE' || isPaused || isGameOver || isVictory) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const xOnCanvas = clientX - rect.left;
    const yOnCanvas = clientY - rect.top;
    
    // Convert to logical coordinates (1000 x 500)
    const logicalX = (xOnCanvas / rect.width) * 1000;
    const logicalY = (yOnCanvas / rect.height) * 500;
    
    playerPos.current.targetX = logicalX;
    playerPos.current.targetY = logicalY;
    playerPos.current.hasTarget = true;

    // Trigger visual touch ripples / sparks at target
    for (let i = 0; i < 6; i++) {
      spawnParticle(logicalX, logicalY, Math.random() * 60 - 30, Math.random() * 60 - 30, '#eab308', 2.5, 12, 'spark');
    }
  };

  // Keyboard action event binds
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;

      if (gameState !== 'BATTLE' || isPaused || isGameOver || isVictory) return;

      // Single triggers
      if (k === 'j') {
        handlePlayerAttack();
      } else if (k === ' ' || e.code === 'Space') {
        e.preventDefault();
        handlePlayerDodge();
      } else if (k === 'k') {
        handleUseSkillByIndex(0);
      } else if (k === 'l') {
        handleUseSkillByIndex(1);
      } else if (k === 'i') {
        handleUseSkillByIndex(2);
      } else if (k === 'o') {
        handleUseSkillByIndex(3);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, isPaused, isGameOver, isVictory, playerState]);

  // Main high-performance Battle Simulation engine
  useEffect(() => {
    if (gameState !== 'BATTLE') return;

    let animId: number;

    const mainLoop = (timestamp: number) => {
      if (isPaused || isGameOver || isVictory) {
        animId = requestAnimationFrame(mainLoop);
        return;
      }

      // Calculate delta
      const delta = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      updateBattleState(delta);
      renderBattleCanvas();

      animId = requestAnimationFrame(mainLoop);
    };

    animId = requestAnimationFrame(mainLoop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, isPaused, isGameOver, isVictory]);

  const updateBattleState = (delta: number) => {
    // Stage timer clock
    stageTimer.current -= delta;
    if (stageTimer.current <= 0) {
      triggerGameOver();
      return;
    }

    // Reduce companion cooldown
    setCompanionCooldown(c => Math.max(0, c - delta));

    // Cooldown reductions on skills
    setPlayerState(prev => {
      let changed = false;
      const skills = prev.skills.map(s => {
        if (s.currentCooldown > 0) {
          changed = true;
          return { ...s, currentCooldown: Math.max(0, s.currentCooldown - delta) };
        }
        return s;
      });
      return changed ? { ...prev, skills } : prev;
    });

    // 1. Process Player Movement & Input forces
    const ply = playerPos.current;
    let dx = 0;
    let dy = 0;

    const hasKeyboardInput = keysPressed.current['w'] || keysPressed.current['arrowup'] ||
                             keysPressed.current['s'] || keysPressed.current['arrowdown'] ||
                             keysPressed.current['a'] || keysPressed.current['arrowleft'] ||
                             keysPressed.current['d'] || keysPressed.current['arrowright'];

    if (hasKeyboardInput) {
      ply.hasTarget = false; // Override touch target if physical keyboard is pressed
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += 1;
    } else if (ply.hasTarget) {
      const diffX = ply.targetX - (ply.x + ply.width / 2);
      const diffY = ply.targetY - (ply.y + ply.height / 2);
      const dist = Math.hypot(diffX, diffY);
      if (dist > 8) {
        dx = diffX / dist;
        dy = diffY / dist;
      } else {
        ply.hasTarget = false; // Target reached
      }
    }

    // Apply run animations or trailing speed
    const isMoving = dx !== 0 || dy !== 0;
    const speedMult = 200 + (playerState.attributes.dex * 1.5);

    if (isMoving && !ply.isRolling) {
      ply.facingDir = dx < 0 ? 'left' : (dx > 0 ? 'right' : ply.facingDir);
      // Normalized movement vector
      const len = Math.sqrt(dx * dx + dy * dy);
      ply.vx = (dx / len) * speedMult;
      ply.vy = (dy / len) * speedMult;
      ply.runningAnimTimer += delta * 12;

      // Spawn slight running smoke particles
      if (Math.random() < 0.15) {
        spawnParticle(ply.x + (ply.facingDir === 'right' ? -10 : ply.width + 10), ply.y + ply.height - 5, -ply.vx * 0.1, -10, '#ffffff33', 3, 15, 'smoke');
      }
    } else if (!ply.isRolling) {
      ply.vx *= 0.75;
      ply.vy *= 0.75;
      ply.runningAnimTimer = 0;
    }

    // Roll duration decay
    if (ply.isRolling) {
      ply.rollTimer -= delta;
      ply.invincibleTimer = 0.1;
      if (ply.rollTimer <= 0) {
        ply.isRolling = false;
        setIsRolling(false);
      }
      // Record trailing ghost values
      if (Math.random() < 0.4) {
        ply.ghostTrail.push({ x: ply.x, y: ply.y, opacity: 0.6 });
      }
    }

    // Passive timers decay
    if (ply.invincibleTimer > 0) ply.invincibleTimer -= delta;
    if (ply.attackTimer > 0) ply.attackTimer -= delta;
    if (ply.shieldTimer > 0) ply.shieldTimer -= delta;
    if (ply.healAuraTimer > 0) {
      ply.healAuraTimer -= delta;
      // Heals slight HP ticks under Sakura medical aura
      if (Math.random() < 0.08) {
        const healAmt = 1.5;
        setPlayerState(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmt) }));
        spawnParticle(ply.x + Math.random() * ply.width, ply.y + ply.height - 10, 0, -40, '#10b981', 4, 30, 'heal');
      }
    }

    // Update trail opacities
    ply.ghostTrail = ply.ghostTrail.map(trail => ({ ...trail, opacity: trail.opacity - delta * 2 })).filter(t => t.opacity > 0);

    // Apply gravity sine wave on Jump
    if (ply.jumping) {
      ply.jumpTimer += delta * 3.5;
      ply.jumpY = -Math.sin(ply.jumpTimer) * 70;
      if (ply.jumpTimer >= Math.PI) {
        ply.jumping = false;
        ply.jumpY = 0;
        ply.jumpTimer = 0;
      }
    }

    // Update real coordinates
    ply.x += ply.vx * delta;
    ply.y += ply.vy * delta;

    // Boundary locks (field dimensions: X: 0 - 1000, Y: 80 - 450)
    ply.x = Math.max(0, Math.min(956, ply.x));
    ply.y = Math.max(80, Math.min(410, ply.y));

    // 1b. Process Summoned Allies Behavior
    activeAllies.current.forEach(ally => {
      if (ally.attackCooldown > 0) ally.attackCooldown -= delta;

      // Find closest living enemy
      let closestEnemy: Enemy | null = null;
      let closestDist = 999999;
      
      enemies.current.forEach(enemy => {
        if (enemy.hp <= 0) return;
        const dist = Math.hypot(enemy.x + enemy.width / 2 - (ally.x + ally.width / 2), enemy.y + enemy.height / 2 - (ally.y + ally.height / 2));
        if (dist < closestDist) {
          closestDist = dist;
          closestEnemy = enemy;
        }
      });

      if (closestEnemy) {
        ally.targetEnemyId = (closestEnemy as Enemy).id;
        const dx = (closestEnemy as Enemy).x - ally.x;
        const dy = (closestEnemy as Enemy).y - ally.y;
        ally.facingDir = dx < 0 ? 'left' : 'right';

        if (closestDist > 55) {
          // Move towards enemy
          ally.x += (dx / closestDist) * ally.speed;
          ally.y += (dy / closestDist) * ally.speed;
          ally.state = 'CHASE';
        } else {
          // Melee attack range
          ally.state = 'ATTACK';
          if (ally.attackCooldown <= 0) {
            ally.attackCooldown = 1.0; // Attack speed
            
            // Deal damage to enemy
            damageEnemy(closestEnemy, ally.damage, Math.random() < 0.15);
            playSound('hit');

            // Spawn slice particles on enemy
            for (let i = 0; i < 4; i++) {
              spawnParticle(
                (closestEnemy as Enemy).x + (closestEnemy as Enemy).width / 2,
                (closestEnemy as Enemy).y + (closestEnemy as Enemy).height / 2,
                Math.random() * 60 - 30,
                Math.random() * 60 - 30,
                ally.icon === '⚡' ? '#38bdf8' : ally.icon === '🌸' ? '#ec4899' : '#f97316',
                3,
                15,
                'spark'
              );
            }

            // Sakura special ability: Heal summoner/player!
            if (ally.name && ally.name.includes('Sakura') && Math.random() < 0.3) {
              const healAmt = Math.round(playerState.level * 3 + 12);
              setPlayerState(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmt) }));
              // Floating text for player
              damageNumbers.current.push({
                id: `ally_heal_${Date.now()}`,
                text: `+${healAmt} HP`,
                x: ply.x + ply.width / 2,
                y: ply.y - 15,
                color: '#10b981',
                isCrit: false,
                life: 0.8,
              });
              // Medical aura particles
              for (let i = 0; i < 6; i++) {
                spawnParticle(ply.x + Math.random() * ply.width, ply.y + ply.height, 0, -35, '#10b981', 3, 20, 'heal');
              }
            }

            // Kakashi special: Lightning Zap chain
            if (ally.name && ally.name.includes('Kakashi') && Math.random() < 0.3) {
              enemies.current.forEach(otherEnemy => {
                if (otherEnemy.hp <= 0 || otherEnemy.id === (closestEnemy as Enemy).id) return;
                const otherDist = Math.hypot(otherEnemy.x - ally.x, otherEnemy.y - ally.y);
                if (otherDist < 160) {
                  damageEnemy(otherEnemy, ally.damage * 0.5, true);
                  spawnParticle(otherEnemy.x + otherEnemy.width / 2, otherEnemy.y + otherEnemy.height / 2, 0, -20, '#38bdf8', 3.5, 12, 'spark');
                }
              });
            }
          }
        }
      } else {
        // No enemies: follow player slightly behind
        const dx = ply.x - ally.x;
        const dy = ply.y - ally.y;
        const dist = Math.hypot(dx, dy);
        ally.facingDir = dx < 0 ? 'left' : 'right';
        if (dist > 75) {
          ally.x += (dx / dist) * ally.speed;
          ally.y += (dy / dist) * ally.speed;
          ally.state = 'CHASE';
        }
      }
      
      // Boundaries
      ally.x = Math.max(0, Math.min(960, ally.x));
      ally.y = Math.max(80, Math.min(410, ally.y));
    });
    activeAllies.current = activeAllies.current.filter(a => a.hp > 0);

    // 1c. Process Pet follow and periodic actions
    if (playerState.selectedPetId && playerState.selectedPetId !== 'none') {
      const selectedPet = PETS_DATABASE.find(p => p.id === playerState.selectedPetId);
      if (selectedPet) {
        // Smooth follow player offset
        const px = ply.x + (ply.facingDir === 'right' ? -25 : ply.width + 10);
        const py = ply.y - 15 + Math.sin(Date.now() / 250) * 5; // float bobbing
        
        petPos.current.x += (px - petPos.current.x) * 0.12;
        petPos.current.y += (py - petPos.current.y) * 0.12;
        petPos.current.angle = Math.sin(Date.now() / 350) * 0.08;

        petCooldowns.current -= delta;
        if (petCooldowns.current <= 0) {
          petCooldowns.current = selectedPet.id === 'pakun' ? 6.5 : selectedPet.id === 'katsuyu' ? 4.5 : 3.5;

          // Find nearest enemy
          let closestEnemy: Enemy | null = null;
          let closestDist = 999999;
          enemies.current.forEach(enemy => {
            if (enemy.hp <= 0) return;
            const dist = Math.hypot(enemy.x - petPos.current.x, enemy.y - petPos.current.y);
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = enemy;
            }
          });

          if (selectedPet.id === 'kurama' && closestEnemy) {
            playSound('fireball');
            const angle = Math.atan2(closestEnemy.y - petPos.current.y, closestEnemy.x - petPos.current.x);
            projectiles.current.push({
              id: `pet_fireball_${Date.now()}`,
              x: petPos.current.x + 10,
              y: petPos.current.y + 10,
              radius: 8,
              dx: Math.cos(angle) * 350,
              dy: Math.sin(angle) * 350,
              damage: Math.round(playerState.level * 4 + 15),
              isCrit: false,
              fromPlayer: true,
              color: '#ef4444',
              life: 1.5,
              hitEnemies: [],
            });
          } else if (selectedPet.id === 'katsuyu') {
            playSound('heal');
            const healAmt = Math.round(playerState.level * 2 + 8);
            setPlayerState(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmt) }));
            damageNumbers.current.push({
              id: `pet_heal_${Date.now()}`,
              text: `+${healAmt} HP`,
              x: ply.x + ply.width / 2,
              y: ply.y - 15,
              color: '#10b981',
              isCrit: false,
              life: 0.8,
            });
            for (let i = 0; i < 4; i++) {
              spawnParticle(ply.x + Math.random() * ply.width, ply.y + ply.height, 0, -30, '#10b981', 2.5, 18, 'heal');
            }
          } else if (selectedPet.id === 'pakun' && closestEnemy && closestDist < 250) {
            playSound('hurt');
            spawnExplosion(petPos.current.x + 10, petPos.current.y + 10, 110, '#facc1533');
            enemies.current.forEach(enemy => {
              if (enemy.hp <= 0) return;
              const dist = Math.hypot(enemy.x - petPos.current.x, enemy.y - petPos.current.y);
              if (dist < 130) {
                enemy.hurtCooldown = 1.0;
                enemy.state = 'HURT';
                damageEnemy(enemy, Math.round(playerState.level * 3 + 8), false);
              }
            });
          } else if (selectedPet.id === 'aoda' && closestEnemy) {
            playSound('fireball');
            const angle = Math.atan2(closestEnemy.y - petPos.current.y, closestEnemy.x - petPos.current.x);
            projectiles.current.push({
              id: `pet_plasma_${Date.now()}`,
              x: petPos.current.x + 10,
              y: petPos.current.y + 10,
              radius: 7,
              dx: Math.cos(angle) * 380,
              dy: Math.sin(angle) * 380,
              damage: Math.round(playerState.level * 4 + 10),
              isCrit: false,
              fromPlayer: true,
              color: '#3b82f6',
              life: 1.5,
              hitEnemies: [],
            });
          }
        }
      }
    }

    // 2. Process Projectiles
    projectiles.current.forEach(proj => {
      proj.x += proj.dx * delta;
      proj.y += proj.dy * delta;
      proj.life -= delta;

      // Hit scan collision triggers
      if (proj.fromPlayer) {
        enemies.current.forEach(enemy => {
          if (enemy.hp > 0 && !proj.hitEnemies.includes(enemy.id)) {
            const dist = Math.hypot(proj.x - (enemy.x + enemy.width / 2), proj.y - (enemy.y + enemy.height / 2));
            if (dist < proj.radius + enemy.width / 2) {
              // Register Hit
              proj.hitEnemies.push(enemy.id);
              damageEnemy(enemy, proj.damage, proj.isCrit);
              playSound('hit');

              // Create explosion on hit if it is a fireball or wind shuriken
              spawnExplosion(proj.x, proj.y, 45, proj.color);
            }
          }
        });
      } else {
        // Attack hitting player
        const dist = Math.hypot(proj.x - (ply.x + ply.width / 2), proj.y - (ply.y + ply.height / 2 - ply.jumpY));
        if (dist < proj.radius + ply.width / 2 && ply.invincibleTimer <= 0 && !playerState.isAdmin && ply.shieldTimer <= 0) {
          damagePlayer(proj.damage);
          proj.life = 0; // kill projectile
        }
      }
    });
    projectiles.current = projectiles.current.filter(p => p.life > 0);

    // 3. Process Enemies Behaviors
    enemies.current.forEach(enemy => {
      if (enemy.hp <= 0) return;

      enemy.stateTimer += delta;
      if (enemy.hurtCooldown > 0) enemy.hurtCooldown -= delta;
      if (enemy.attackCooldown > 0) enemy.attackCooldown -= delta;

      // Simple AI chasing state machine (can target player or companion allies)
      let targetX = ply.x + ply.width / 2;
      let targetY = ply.y + ply.height / 2;
      let finalTarget: 'player' | CompanionAlly = 'player';
      let closestTargetDist = Math.hypot(targetX - (enemy.x + enemy.width / 2), targetY - (enemy.y + enemy.height / 2));

      // Check if any active companion is closer and draw aggro
      activeAllies.current.forEach(ally => {
        const allyDist = Math.hypot(ally.x + ally.width / 2 - (enemy.x + enemy.width / 2), ally.y + ally.height / 2 - (enemy.y + enemy.height / 2));
        if (allyDist < closestTargetDist) {
          closestTargetDist = allyDist;
          targetX = ally.x + ally.width / 2;
          targetY = ally.y + ally.height / 2;
          finalTarget = ally;
        }
      });

      const dx = targetX - (enemy.x + enemy.width / 2);
      const dy = targetY - (enemy.y + enemy.height / 2);
      enemy.dirX = dx > 0 ? 1 : -1;

      if (enemy.hurtCooldown > 0) {
        // Knocks back slightly when hurt
        enemy.x -= enemy.dirX * 45 * delta;
      } else {
        // Chase closest target
        if (closestTargetDist > 50) {
          const vx = (dx / closestTargetDist) * enemy.speed;
          const vy = (dy / closestTargetDist) * enemy.speed;
          enemy.x += vx;
          enemy.y += vy;
        } else {
          // Attack range reached
          if (enemy.attackCooldown <= 0) {
            if (finalTarget === 'player') {
              triggerEnemyAttack(enemy);
            } else {
              // Attack companion ally instead!
              const allyTarget = finalTarget as CompanionAlly;
              enemy.attackCooldown = 1.4 + Math.random() * 0.8;
              allyTarget.hp -= enemy.damage;
              playSound('hit');
              
              // Floating text for ally damage
              damageNumbers.current.push({
                id: `ally_dmg_${Date.now()}_${Math.random()}`,
                text: `-${Math.round(enemy.damage)}`,
                x: allyTarget.x + 10,
                y: allyTarget.y - 10,
                color: '#f87171',
                isCrit: false,
                life: 0.8,
              });

              // Blood splash particles on ally
              for (let i = 0; i < 3; i++) {
                spawnParticle(allyTarget.x + 20, allyTarget.y + 20, Math.random() * 40 - 20, Math.random() * 40 - 20, '#dc2626', 3, 12, 'blood');
              }

              if (allyTarget.hp <= 0) {
                // Summon puff smoke on companion death
                playSound('gameover');
                for (let i = 0; i < 8; i++) {
                  spawnParticle(allyTarget.x + 20, allyTarget.y + 20, Math.random() * 60 - 30, Math.random() * 40 - 20, '#ffffffaa', 4, 18, 'smoke');
                }
              }
            }
          }
        }
      }

      // Boss special spells
      if (enemy.isBoss) {
        if (enemy.type === 'dragon' && Math.random() < 0.005 && enemy.attackCooldown <= 0) {
          triggerDragonFireBreath(enemy);
        } else if (enemy.type === 'golem' && Math.random() < 0.007 && enemy.attackCooldown <= 0) {
          triggerGolemGroundSlam(enemy);
        }
      }
    });

    // Check if wave is completed
    const livingEnemies = enemies.current.filter(e => e.hp > 0);
    if (livingEnemies.length === 0 && waveCountdown.current === 0) {
      if (currentWave.current < maxWaves.current) {
        waveCountdown.current = 3.0; // 3 seconds countdown to next wave
      } else {
        triggerVictory();
      }
    }

    // Wave countdown timer ticker
    if (waveCountdown.current > 0) {
      waveCountdown.current -= delta;
      if (waveCountdown.current <= 0) {
        spawnWave(currentWave.current + 1, activeStage!);
      }
    }

    // 4. Update Particles
    particles.current.forEach(part => {
      part.x += part.vx * delta;
      part.y += part.vy * delta;
      part.life -= delta;
    });
    particles.current = particles.current.filter(p => p.life > 0);

    // 5. Update Damage Numbers
    damageNumbers.current.forEach(dmg => {
      dmg.y -= 35 * delta; // rise up
      dmg.life -= delta;
    });
    damageNumbers.current = damageNumbers.current.filter(d => d.life > 0);

    // 6. Update Active Skill Animations
    activeSkillAnims.current.forEach(anim => {
      anim.timer -= delta;
    });
    activeSkillAnims.current = activeSkillAnims.current.filter(anim => anim.timer > 0);
  };

  const handlePlayerAttack = () => {
    const ply = playerPos.current;
    if (ply.attackTimer > 0 || isPaused) return;

    ply.attackTimer = 0.28; // attack speed cooldown
    playSound('slash');

    // Create visual swing slash
    const slashX = ply.x + (ply.facingDir === 'right' ? ply.width + 15 : -40);
    const slashY = ply.y + ply.height / 2;

    // Draw melee slice graphics particles
    for (let i = 0; i < 5; i++) {
      spawnParticle(slashX, slashY + (Math.random() * 20 - 10), (ply.facingDir === 'right' ? 80 : -80) + Math.random() * 40, Math.random() * 60 - 30, '#38bdf8', 4, 25, 'spark');
    }

    // Scan enemy hit boxes
    enemies.current.forEach(enemy => {
      if (enemy.hp <= 0) return;
      const selfCenterX = ply.x + ply.width / 2;
      const enemyCenterX = enemy.x + enemy.width / 2;

      const horizontalDist = Math.abs(selfCenterX - enemyCenterX);
      const verticalDist = Math.abs((ply.y + ply.height / 2) - (enemy.y + enemy.height / 2));

      // Melee sector range: horizontal 110px, vertical 60px
      const isFacing = (ply.facingDir === 'right' && enemyCenterX > selfCenterX) || (ply.facingDir === 'left' && enemyCenterX < selfCenterX);

      if (horizontalDist < 115 && verticalDist < 60 && isFacing) {
        // Calculate raw damage
        let dmg = ply.attackPower;
        const isCrit = Math.random() * 100 < ply.critChance;
        if (isCrit) dmg *= 1.8;

        damageEnemy(enemy, dmg, isCrit);
        playSound('hit');

        // Add blood splatter particles
        for (let j = 0; j < 8; j++) {
          spawnParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, (Math.random() * 160 - 80) + (ply.facingDir === 'right' ? 60 : -60), Math.random() * 140 - 70, '#ef4444', 3, 30, 'blood');
        }
      }
    });
  };

  const handlePlayerDodge = () => {
    const ply = playerPos.current;
    if (ply.isRolling || isPaused) return;

    // Spend chakra/mana to dodge roll
    if (playerState.mp < 15 && !playerState.isAdmin) {
      playSound('hurt');
      return;
    }

    if (!playerState.isAdmin) {
      setPlayerState(prev => ({ ...prev, mp: Math.max(0, prev.mp - 15) }));
    }

    ply.isRolling = true;
    setIsRolling(true);
    ply.rollTimer = 0.38; // dodge frame duration

    // Boost velocity
    const rollSpeed = 480;
    const forceDir = ply.facingDir === 'right' ? 1 : -1;
    ply.vx = forceDir * rollSpeed;
    ply.vy = 0; // lock vertical when tumbling

    playSound('slash');

    // Create shadow trailing particles
    for (let i = 0; i < 8; i++) {
      spawnParticle(ply.x + ply.width / 2, ply.y + ply.height / 2, -ply.vx * 0.4 + (Math.random() * 40 - 20), Math.random() * 40 - 20, '#f59e0b55', 4, 20, 'smoke');
    }
  };

  const handleUseSkillByIndex = (index: number) => {
    const skill = playerState.skills[index];
    if (!skill || playerState.level < skill.unlockedAt || skill.currentCooldown > 0 || isPaused) return;

    if (playerState.mp < skill.manaCost && !playerState.isAdmin) {
      playSound('hurt');
      return;
    }

    // Pay mana
    if (!playerState.isAdmin) {
      setPlayerState(prev => ({ ...prev, mp: Math.max(0, prev.mp - skill.manaCost) }));
    }

    // Trigger cooldown
    setPlayerState(prev => {
      const skills = prev.skills.map((s, idx) => {
        if (idx === index) return { ...s, currentCooldown: s.cooldown };
        return s;
      });
      return { ...prev, skills };
    });

    executeSkillLogic(skill);
  };

  const handleUseSkillById = (skillId: string) => {
    const idx = playerState.skills.findIndex(s => s.id === skillId);
    if (idx !== -1) {
      handleUseSkillByIndex(idx);
    }
  };

  const executeSkillLogic = (skill: Skill) => {
    const ply = playerPos.current;
    const dmgBase = ply.attackPower * skill.damageMultiplier;

    if (playerState.classType === 'Naruto') {
      if (skill.name === 'Rasengan') {
        // High speed forward dash carrying enemies, exploding at end
        ply.isRolling = true;
        ply.rollTimer = 0.35;
        ply.vx = (ply.facingDir === 'right' ? 1 : -1) * 600;
        playSound('fireball');

        // Push visual animation
        activeSkillAnims.current.push({
          id: `rasengan_${Date.now()}`,
          type: 'rasengan_charge',
          x: ply.x + ply.width / 2,
          y: ply.y + ply.height / 2,
          timer: 0.5,
          maxTimer: 0.5
        });

        // Render Rasengan glowing ball in loop
        let ticks = 0;
        const rasInterval = setInterval(() => {
          if (gameState !== 'BATTLE' || isPaused) return;
          ticks++;
          spawnParticle(ply.x + (ply.facingDir === 'right' ? ply.width : -10), ply.y + ply.height / 2, Math.random() * 40 - 20, Math.random() * 40 - 20, '#3b82f6', 5, 12, 'spark');

          // Pull enemies touched
          enemies.current.forEach(enemy => {
            if (enemy.hp <= 0) return;
            const dist = Math.hypot(enemy.x - ply.x, enemy.y - ply.y);
            if (dist < 120) {
              enemy.x = ply.x + (ply.facingDir === 'right' ? ply.width : -enemy.width);
              damageEnemy(enemy, dmgBase * 0.25, false); // slight tick dmg
            }
          });

          if (ticks >= 10) {
            clearInterval(rasInterval);
            // Final blow explosion
            playSound('hit');
            screenShake.current = 10;
            spawnExplosion(ply.x + (ply.facingDir === 'right' ? ply.width + 30 : -30), ply.y + ply.height / 2, 70, '#60a5fa');
            enemies.current.forEach(enemy => {
              if (enemy.hp <= 0) return;
              const dist = Math.hypot(enemy.x - ply.x, enemy.y - ply.y);
              if (dist < 150) {
                damageEnemy(enemy, dmgBase * 0.8, true);
              }
            });
          }
        }, 35);
      } else if (skill.name === 'Shadow Clone Strike') {
        // Spawn 2 clones charging forward
        playSound('fireball');
        for (let i = 0; i < 2; i++) {
          const cloneOffset = i === 0 ? -40 : 40;
          projectiles.current.push({
            id: `clone_${Date.now()}_${i}`,
            x: ply.x,
            y: ply.y + cloneOffset,
            radius: 20,
            dx: (ply.facingDir === 'right' ? 1 : -1) * 450,
            dy: 0,
            damage: dmgBase,
            isCrit: false,
            fromPlayer: true,
            color: '#f97316',
            life: 1.2,
            hitEnemies: [],
          });
        }
      } else if (skill.name === 'Nine-Tails Roar') {
        // Crimson pushback wave
        playSound('hurt');
        screenShake.current = 15;

        // Push visual animation
        activeSkillAnims.current.push({
          id: `roar_${Date.now()}`,
          type: 'nine_tails_roar',
          x: ply.x + ply.width / 2,
          y: ply.y + ply.height / 2,
          timer: 0.8,
          maxTimer: 0.8
        });

        spawnExplosion(ply.x + ply.width / 2, ply.y + ply.height / 2, 180, '#ef4444');
        enemies.current.forEach(enemy => {
          if (enemy.hp <= 0) return;
          const dist = Math.hypot((enemy.x + enemy.width / 2) - (ply.x + ply.width / 2), (enemy.y + enemy.height / 2) - (ply.y + ply.height / 2));
          if (dist < 185) {
            damageEnemy(enemy, dmgBase, true);
            enemy.hurtCooldown = 0.8;
            enemy.state = 'HURT';
            // push back heavily
            enemy.x += (enemy.x > ply.x ? 1 : -1) * 120;
          }
        });
      } else if (skill.name === 'Rasenshuriken') {
        // Throw massive spinning shuriken that explodes
        playSound('fireball');

        // Push visual animation
        activeSkillAnims.current.push({
          id: `rasenshuriken_${Date.now()}`,
          type: 'rasenshuriken',
          x: ply.x + ply.width / 2,
          y: ply.y + ply.height / 2,
          timer: 1.0,
          maxTimer: 1.0
        });

        projectiles.current.push({
          id: `shuriken_${Date.now()}`,
          x: ply.x + ply.width / 2,
          y: ply.y + ply.height / 2,
          radius: 35,
          dx: (ply.facingDir === 'right' ? 1 : -1) * 350,
          dy: 0,
          damage: dmgBase,
          isCrit: true,
          fromPlayer: true,
          color: '#06b6d4',
          life: 1.8,
          hitEnemies: [],
        });
      }
    } else if (playerState.classType === 'Sasuke') {
      if (skill.name === 'Chidori Strike') {
        // Lightning piercing thrust
        ply.isRolling = true;
        ply.rollTimer = 0.3;
        ply.vx = (ply.facingDir === 'right' ? 1 : -1) * 750;
        playSound('fireball');

        let ticks = 0;
        const chidInterval = setInterval(() => {
          if (gameState !== 'BATTLE' || isPaused) return;
          ticks++;
          spawnParticle(ply.x + ply.width / 2, ply.y + ply.height / 2, Math.random() * 80 - 40, Math.random() * 80 - 40, '#facc15', 3, 10, 'spark');

          enemies.current.forEach(enemy => {
            if (enemy.hp <= 0) return;
            const dist = Math.hypot(enemy.x - ply.x, enemy.y - ply.y);
            if (dist < 90) {
              damageEnemy(enemy, dmgBase * 0.35, true);
            }
          });

          if (ticks >= 8) clearInterval(chidInterval);
        }, 35);
      } else if (skill.name === 'Dragon Fireball') {
        // Shoots 3 explosive fireballs
        playSound('fireball');
        for (let i = 0; i < 3; i++) {
          const angle = (i - 1) * 0.25; // spread directions
          projectiles.current.push({
            id: `fball_${Date.now()}_${i}`,
            x: ply.x + (ply.facingDir === 'right' ? ply.width : 0),
            y: ply.y + ply.height / 2,
            radius: 14,
            dx: Math.cos(angle) * (ply.facingDir === 'right' ? 1 : -1) * 400,
            dy: Math.sin(angle) * 400,
            damage: dmgBase,
            isCrit: false,
            fromPlayer: true,
            color: '#f97316',
            life: 1.5,
            hitEnemies: [],
          });
        }
      } else if (skill.name === 'Susanoo Protection') {
        // Invulnerable barrier
        ply.shieldTimer = 3.0; // 3 seconds immunity
        playSound('levelup');
        spawnExplosion(ply.x + ply.width / 2, ply.y + ply.height / 2, 80, '#a855f7');
      } else if (skill.name === 'Kirin Call') {
        // Screen-wide electric strike
        playSound('admin');
        screenShake.current = 25;

        // Push visual animation at center of screen (250, 425)
        activeSkillAnims.current.push({
          id: `kirin_${Date.now()}`,
          type: 'kirin',
          x: 250,
          y: 425,
          timer: 1.2,
          maxTimer: 1.2
        });

        spawnExplosion(250, 425, 500, '#a855f733'); // sky flash
        enemies.current.forEach(enemy => {
          if (enemy.hp <= 0) return;
          damageEnemy(enemy, dmgBase, true);
          spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 60, '#facc15');
        });
      }
    } else if (playerState.classType === 'Sakura') {
      if (skill.name === 'Cherry Impact') {
        // Ground earthquake slam
        playSound('hit');
        screenShake.current = 15;

        // Push visual animation
        activeSkillAnims.current.push({
          id: `cherry_${Date.now()}`,
          type: 'cherry_impact',
          x: ply.x + ply.width / 2,
          y: ply.y + ply.height / 2,
          timer: 0.8,
          maxTimer: 0.8
        });

        spawnExplosion(ply.x + ply.width / 2, ply.y + ply.height / 2, 150, '#ec4899');
        enemies.current.forEach(enemy => {
          if (enemy.hp <= 0) return;
          const dist = Math.hypot(enemy.x - ply.x, enemy.y - ply.y);
          if (dist < 155) {
            damageEnemy(enemy, dmgBase, true);
            enemy.hurtCooldown = 1.0;
            enemy.state = 'HURT';
          }
        });
      } else if (skill.name === 'Mitotic Recovery') {
        // Instant massive self heal and green aura
        playSound('heal');
        ply.healAuraTimer = 5.0; // 5 seconds of healing trail
        const { hpMax } = getCalculatedMaxes(playerState);
        setPlayerState(prev => ({
          ...prev,
          hp: Math.min(hpMax, prev.hp + hpMax * 0.45)
        }));
        // spawn medical particles
        for (let i = 0; i < 15; i++) {
          spawnParticle(ply.x + Math.random() * ply.width, ply.y + ply.height, Math.random() * 40 - 20, -50 - Math.random() * 50, '#10b981', 4, 30, 'heal');
        }
      } else if (skill.name === 'Chakra Scalpels') {
        // Rapid slices
        playSound('slash');
        enemies.current.forEach(enemy => {
          if (enemy.hp <= 0) return;
          const dist = Math.hypot(enemy.x - ply.x, enemy.y - ply.y);
          if (dist < 130) {
            damageEnemy(enemy, dmgBase, false);
            spawnParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, Math.random() * 80 - 40, Math.random() * 80 - 40, '#06b6d4', 3, 15, 'spark');
          }
        });
      } else if (skill.name === 'Sovereign Punch') {
        // Catastrophic forward shockwave
        playSound('hit');
        screenShake.current = 20;
        const waveX = ply.x + (ply.facingDir === 'right' ? ply.width + 100 : -100);

        // Push visual animation
        activeSkillAnims.current.push({
          id: `punch_${Date.now()}`,
          type: 'sovereign_punch',
          x: waveX,
          y: ply.y + ply.height / 2,
          timer: 0.6,
          maxTimer: 0.6,
          angle: ply.facingDir === 'right' ? 0 : Math.PI
        });

        spawnExplosion(waveX, ply.y + ply.height / 2, 140, '#f43f5e');

        enemies.current.forEach(enemy => {
          if (enemy.hp <= 0) return;
          const distX = Math.abs((enemy.x + enemy.width / 2) - (ply.x + ply.width / 2));
          const distY = Math.abs((enemy.y + enemy.height / 2) - (ply.y + ply.height / 2));
          const isFacing = (ply.facingDir === 'right' && enemy.x > ply.x) || (ply.facingDir === 'left' && enemy.x < ply.x);

          if (distX < 260 && distY < 100 && isFacing) {
            damageEnemy(enemy, dmgBase, true);
          }
        });
      }
    } else if (playerState.classType === 'Kakashi') {
      if (skill.name === 'Lightning Blade') {
        // Instant teleport/charge dash
        ply.x += (ply.facingDir === 'right' ? 1 : -1) * 300;
        // Keep in boundary (500 is width of layout now)
        ply.x = Math.max(10, Math.min(450, ply.x));
        playSound('admin');

        spawnExplosion(ply.x + ply.width / 2, ply.y + ply.height / 2, 70, '#60a5fa');

        enemies.current.forEach(enemy => {
          if (enemy.hp <= 0) return;
          const dist = Math.hypot(enemy.x - ply.x, enemy.y - ply.y);
          if (dist < 280) {
            damageEnemy(enemy, dmgBase, true);
            // Spawn electric sparkles
            for (let i = 0; i < 5; i++) {
              spawnParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, Math.random() * 60 - 30, Math.random() * 60 - 30, '#38bdf8', 3, 15, 'spark');
            }
          }
        });
      } else if (skill.name === 'Mud Wall Defense') {
        // Spawn mud wall shield barrier and boulders
        playSound('hit');
        ply.shieldTimer = 2.0; // mud block absorbs hits

        // Push visual animation
        activeSkillAnims.current.push({
          id: `mud_wall_${Date.now()}`,
          type: 'mud_wall',
          x: ply.x + ply.width / 2,
          y: ply.y + ply.height / 2,
          timer: 2.0,
          maxTimer: 2.0
        });

        spawnExplosion(ply.x + ply.width / 2, ply.y + ply.height / 2, 90, '#d97706');
        enemies.current.forEach(enemy => {
          if (enemy.hp <= 0) return;
          const dist = Math.hypot(enemy.x - ply.x, enemy.y - ply.y);
          if (dist < 140) {
            damageEnemy(enemy, dmgBase, false);
          }
        });
      } else if (skill.name === 'Water Dragon') {
        // High velocity piercing water wave
        playSound('fireball');
        projectiles.current.push({
          id: `wdragon_${Date.now()}`,
          x: ply.x,
          y: ply.y + ply.height / 2,
          radius: 30,
          dx: (ply.facingDir === 'right' ? 1 : -1) * 380,
          dy: 0,
          damage: dmgBase,
          isCrit: false,
          fromPlayer: true,
          color: '#2563eb',
          life: 1.6,
          hitEnemies: [],
        });
      } else if (skill.name === 'Kamui Dimensional Warp') {
        // Pull black hole gravitational singularity
        playSound('admin');
        const warpX = ply.x + (ply.facingDir === 'right' ? 180 : -180);
        const warpY = ply.y + ply.height / 2;

        // Push visual animation
        activeSkillAnims.current.push({
          id: `kamui_${Date.now()}`,
          type: 'kamui',
          x: warpX,
          y: warpY,
          timer: 1.5,
          maxTimer: 1.5
        });

        let pulls = 0;
        const warpInterval = setInterval(() => {
          if (gameState !== 'BATTLE' || isPaused) {
            clearInterval(warpInterval);
            return;
          }
          pulls++;
          screenShake.current = 6;
          spawnParticle(warpX, warpY, Math.random() * 60 - 30, Math.random() * 60 - 30, '#8b5cf6', 6, 12, 'admin');

          enemies.current.forEach(enemy => {
            if (enemy.hp <= 0) return;
            const dist = Math.hypot(enemy.x - warpX, enemy.y - warpY);
            if (dist < 260) {
              // drag to singularity
              enemy.x += (warpX - enemy.x) * 0.25;
              enemy.y += (warpY - enemy.y) * 0.25;
              damageEnemy(enemy, dmgBase * 0.15, false);
            }
          });

          if (pulls >= 15) {
            clearInterval(warpInterval);
            // final implode
            spawnExplosion(warpX, warpY, 110, '#4c1d95');
            enemies.current.forEach(enemy => {
              if (enemy.hp <= 0) return;
              const dist = Math.hypot(enemy.x - warpX, enemy.y - warpY);
              if (dist < 130) {
                damageEnemy(enemy, dmgBase * 0.7, true);
              }
            });
          }
        }, 120);
      }
    }
  };

  const triggerEnemyAttack = (enemy: Enemy) => {
    const ply = playerPos.current;
    enemy.attackCooldown = 1.5 + Math.random() * 1.0;

    // Boss special attack indicators
    if (enemy.isBoss) {
      if (enemy.type === 'golem') {
        triggerGolemGroundSlam(enemy);
        return;
      } else if (enemy.type === 'dragon') {
        triggerDragonFireBreath(enemy);
        return;
      }
    }

    // Regular attack melee bump
    const dist = Math.hypot((ply.x + ply.width / 2) - (enemy.x + enemy.width / 2), (ply.y + ply.height / 2) - (enemy.y + enemy.height / 2));
    if (dist < 75 && ply.invincibleTimer <= 0 && !playerState.isAdmin && ply.shieldTimer <= 0) {
      damagePlayer(enemy.damage);
    }
  };

  // Boss attack definitions
  const triggerGolemGroundSlam = (boss: Enemy) => {
    playSound('hurt');
    screenShake.current = 15;
    // Spawn seismic particles
    spawnExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, 160, '#78350f33');

    const ply = playerPos.current;
    const dist = Math.hypot((ply.x + ply.width / 2) - (boss.x + boss.width / 2), (ply.y + ply.height / 2) - (boss.y + boss.height / 2));
    if (dist < 170 && ply.invincibleTimer <= 0 && !playerState.isAdmin && ply.shieldTimer <= 0) {
      damagePlayer(boss.damage * 1.5);
    }
  };

  const triggerDragonFireBreath = (boss: Enemy) => {
    playSound('fireball');
    // Shoots homing dragon fireballs
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI + (i - 1.5) * 0.4;
      projectiles.current.push({
        id: `dragon_f_${Date.now()}_${i}`,
        x: boss.x + 20,
        y: boss.y + boss.height / 2,
        radius: 16,
        dx: Math.cos(angle) * 320,
        dy: Math.sin(angle) * 150,
        damage: boss.damage * 1.2,
        isCrit: false,
        fromPlayer: false,
        color: '#ef4444',
        life: 2.2,
        hitEnemies: [],
      });
    }
  };

  const damageEnemy = (enemy: Enemy, damage: number, isCrit: boolean) => {
    const rawDamage = Math.max(2, damage - enemy.speed * 2);
    const rounded = Math.round(rawDamage);
    enemy.hp = Math.max(0, enemy.hp - rounded);
    enemy.state = 'HURT';
    enemy.hurtCooldown = 0.25;

    // Create Damage Floating Number
    damageNumbers.current.push({
      id: `dmg_${Math.random()}`,
      text: isCrit ? `🔥 ${rounded}!` : `${rounded}`,
      x: enemy.x + Math.random() * enemy.width,
      y: enemy.y - 10,
      color: isCrit ? '#facc15' : '#ffffff',
      isCrit,
      life: 0.8,
    });

    if (enemy.hp <= 0) {
      enemy.state = 'DEAD';
      handleEnemyDeath(enemy);
    }
  };

  const handleEnemyDeath = (enemy: Enemy) => {
    // Drop XP & Gold Loot instantly
    playSound('levelup');

    const randomDropGems = Math.random() * 100 < enemy.gemsChance;
    const gemsReward = randomDropGems ? 1 + Math.floor(Math.random() * 2) : 0;

    setPlayerState(prev => {
      let gold = prev.gold + enemy.goldValue;
      let gems = prev.gems + gemsReward;
      let exp = prev.exp + enemy.xpValue;
      let level = prev.level;
      let maxExp = prev.maxExp;
      let statPoints = prev.statPoints;
      let skillPoints = prev.skillPoints;

      // Handle Level Up
      let leveledUp = false;
      while (exp >= maxExp) {
        exp -= maxExp;
        level += 1;
        maxExp = Math.round(maxExp * 1.35 + 50);
        statPoints += 5;
        skillPoints += 1;
        leveledUp = true;
      }

      if (leveledUp) {
        playSound('levelup');
        // Spawn glorious level up burst particles on top of player
        for (let i = 0; i < 20; i++) {
          spawnParticle(playerPos.current.x + 20, playerPos.current.y + 40, Math.random() * 80 - 40, -100 - Math.random() * 100, '#eab308', 5, 45, 'heal');
        }
      }

      return {
        ...prev,
        level,
        exp,
        maxExp,
        gold,
        gems,
        statPoints,
        skillPoints,
      };
    });

    // Spawn massive explosion of gold coins/crystals particles
    for (let i = 0; i < 6; i++) {
      spawnParticle(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, Math.random() * 120 - 60, -80 - Math.random() * 80, '#fbbf24', 3.5, 35, 'spark');
    }
  };

  const damagePlayer = (damage: number) => {
    const defense = playerPos.current.defense;
    const actualDamage = Math.max(1, Math.round(damage - defense * 0.4));

    playSound('hurt');
    screenShake.current = 10;

    // Create Blood Splatter Particles on Player
    const ply = playerPos.current;
    for (let i = 0; i < 10; i++) {
      spawnParticle(ply.x + ply.width / 2, ply.y + ply.height / 2, Math.random() * 100 - 50, Math.random() * 100 - 50, '#dc2626', 3.5, 25, 'blood');
    }

    setPlayerState(prev => {
      const nextHp = Math.max(0, prev.hp - actualDamage);
      if (nextHp <= 0) {
        setTimeout(() => triggerGameOver(), 10);
      }
      return { ...prev, hp: nextHp };
    });

    // Create player float damage text
    damageNumbers.current.push({
      id: `dmg_player_${Date.now()}`,
      text: `-${actualDamage}`,
      x: ply.x + ply.width / 2,
      y: ply.y - 20,
      color: '#ef4444',
      isCrit: false,
      life: 0.9,
    });
  };

  const handlePotionUse = (type: 'HP' | 'MP') => {
    const isHP = type === 'HP';
    const potionName = isHP ? 'HP Potion' : 'MP Potion';
    const found = playerState.inventory.find(i => i.name === potionName);

    if (!found || found.quantity <= 0) return;

    const { hpMax, mpMax } = getCalculatedMaxes(playerState);
    if (isHP && playerState.hp >= hpMax) return;
    if (!isHP && playerState.mp >= mpMax) return;

    playSound('heal');

    setPlayerState(prev => {
      const inventory = prev.inventory.map(i => {
        if (i.name === potionName) return { ...i, quantity: i.quantity - 1 };
        return i;
      }).filter(i => i.quantity > 0);

      const restoreVal = isHP ? 150 : 50;

      // Spawn healing/mana particles
      const ply = playerPos.current;
      const color = isHP ? '#10b981' : '#0ea5e9';
      for (let i = 0; i < 12; i++) {
        spawnParticle(ply.x + Math.random() * ply.width, ply.y + ply.height, Math.random() * 40 - 20, -40 - Math.random() * 30, color, 4, 25, isHP ? 'heal' : 'mana');
      }

      return {
        ...prev,
        inventory,
        hp: isHP ? Math.min(hpMax, prev.hp + restoreVal) : prev.hp,
        mp: !isHP ? Math.min(mpMax, prev.mp + restoreVal) : prev.mp,
      };
    });
  };

  // Spawners Helpers
  const spawnParticle = (x: number, y: number, vx: number, vy: number, color: string, size: number, life: number, type: Particle['type']) => {
    particles.current.push({
      x,
      y,
      vx,
      vy,
      color,
      size,
      life,
      maxLife: life,
      type,
    });
  };

  const spawnExplosion = (x: number, y: number, radius: number, color: string) => {
    // Generate circular shockwaves particles
    const step = 16;
    for (let i = 0; i < step; i++) {
      const angle = (i / step) * Math.PI * 2;
      const speed = radius * 1.5;
      spawnParticle(
        x,
        y,
        Math.cos(angle) * speed + (Math.random() * 30 - 15),
        Math.sin(angle) * speed + (Math.random() * 30 - 15),
        color,
        3.5,
        35,
        'fire'
      );
    }
  };

  const triggerGameOver = () => {
    setIsGameOver(true);
    playSound('gameover');
  };

  const triggerVictory = () => {
    setIsVictory(true);
    playSound('victory');

    // Calculate stage completion drops and gold
    const stage = activeStage!;
    const levelMult = stage.id;
    const baseGold = levelMult * 200 + Math.floor(Math.random() * 100);
    const baseGems = 2 + Math.floor(Math.random() * 2);
    const baseXP = levelMult * 120 + 100;

    // Drop materials based on stage
    const dropsList: Array<{ name: string; qty: number; icon: string }> = [];
    const ironQty = 2 + Math.floor(Math.random() * 3);
    dropsList.push({ name: 'Iron Ores', qty: ironQty, icon: '🪨' });

    if (stage.id >= 2 && Math.random() < 0.6) {
      dropsList.push({ name: 'Fire Core', qty: 1, icon: '🔥' });
    }
    if (stage.id >= 3 && Math.random() < 0.4) {
      dropsList.push({ name: 'Magic Dust', qty: 1, icon: '✨' });
    }

    setVictoryGold(baseGold);
    setVictoryGems(baseGems);
    setVictoryXP(baseXP);
    setVictoryDrops(dropsList);

    setPlayerState(prev => {
      let gold = prev.gold + baseGold;
      let gems = prev.gems + baseGems;
      let exp = prev.exp + baseXP;
      let level = prev.level;
      let maxExp = prev.maxExp;
      let statPoints = prev.statPoints;
      let skillPoints = prev.skillPoints;

      // Handle XP level upgrades
      let leveledUp = false;
      while (exp >= maxExp) {
        exp -= maxExp;
        level += 1;
        maxExp = Math.round(maxExp * 1.35 + 50);
        statPoints += 5;
        skillPoints += 1;
        leveledUp = true;
      }

      // Add dropped items to inventory
      const updatedInv = [...prev.inventory];
      dropsList.forEach(drop => {
        const idx = updatedInv.findIndex(i => i.name === drop.name);
        if (idx !== -1) {
          updatedInv[idx].quantity += drop.qty;
        } else {
          updatedInv.push({
            id: `drop_${drop.name.toLowerCase()}_${Date.now()}`,
            name: drop.name,
            type: 'MATERIAL',
            description: drop.name === 'Iron Ores' ? 'A raw metallic ore for weapon honing.' : 'An elemental mineral for forging epic artifacts.',
            quantity: drop.qty,
            icon: drop.icon,
            rarity: drop.name === 'Iron Ores' ? 'COMMON' : 'RARE',
          });
        }
      });

      // Unlock next stage
      const nextStageUnlocked = Math.max(prev.stagesUnlocked, Math.min(5, stage.id + 1));

      return {
        ...prev,
        level,
        exp,
        maxExp,
        gold,
        gems,
        statPoints,
        skillPoints,
        inventory: updatedInv,
        stagesUnlocked: nextStageUnlocked,
      };
    });
  };

  const handleExitStage = () => {
    setGameState('TOWN');
    setActiveStage(null);
  };

  // Helper vector character drawing function
  const drawShinobiCharacter = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    facingDir: 'left' | 'right',
    isMoving: boolean,
    animTimer: number,
    classType: string,
    attackTimer: number,
    isAlly: boolean,
    name: string = ''
  ) => {
    ctx.save();
    
    // Translate to center of feet on floor, then offset up
    const cx = x + width / 2;
    const cy = y + height / 2;

    // Draw shadow on ground
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, y + height - 2, width * 0.45, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(cx, cy);
    if (facingDir === 'left') {
      ctx.scale(-1, 1);
    }

    // Class Colors
    let hairColor = '#facc15'; // Naruto Spiky yellow
    let suitColor = '#f97316'; // Naruto orange
    let accentColor = '#000000'; // Naruto black sash
    let eyeColor = '#3b82f6'; // Naruto blue eyes
    let headbandColor = '#1e293b'; // dark blue headband

    if (classType === 'Sasuke') {
      hairColor = '#1e1b4b'; // deep purple/navy spiky hair
      suitColor = '#64748b'; // grey shirt
      accentColor = '#818cf8'; // purple rope sash
      eyeColor = '#ef4444'; // red sharingan
      headbandColor = '#020617';
    } else if (classType === 'Sakura') {
      hairColor = '#f472b6'; // pink hair
      suitColor = '#db2777'; // pink/red dress
      accentColor = '#ffffff'; // white gloves/accent
      eyeColor = '#10b981'; // green eyes
      headbandColor = '#db2777';
    } else if (classType === 'Kakashi') {
      hairColor = '#94a3b8'; // grey/silver hair
      suitColor = '#0f172a'; // dark blue undersuit
      accentColor = '#15803d'; // green flak vest
      eyeColor = '#38bdf8'; // sharingan covered / blue eye
      headbandColor = '#334155';
    } else if (isAlly && name && name.includes('Clone')) {
      // Orange glow clone
      hairColor = '#facc15';
      suitColor = '#ea580c';
      accentColor = '#020617';
    }

    // 1. ANIMATED LEGS (Feet)
    // Left leg
    const leftLegSwing = isMoving ? Math.sin(animTimer) * 10 : 0;
    ctx.fillStyle = '#1e293b'; // dark pants
    ctx.fillRect(-8, 8, 4, 10 + leftLegSwing);
    ctx.fillStyle = '#ffffff'; // sandals
    ctx.fillRect(-10, 16 + leftLegSwing, 6, 3);

    // Right leg
    const rightLegSwing = isMoving ? Math.sin(animTimer + Math.PI) * 10 : 0;
    ctx.fillRect(4, 8, 4, 10 + rightLegSwing);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 16 + rightLegSwing, 6, 3);

    // 2. TORSO / BODY SUIT
    ctx.fillStyle = suitColor;
    ctx.fillRect(-10, -10, 20, 20);

    // Flak Vest or Black sash overlay
    if (classType === 'Kakashi') {
      ctx.fillStyle = accentColor; // green vest
      ctx.fillRect(-11, -8, 22, 14);
      // Pockets
      ctx.fillStyle = '#166534';
      ctx.fillRect(-8, -2, 6, 6);
      ctx.fillRect(2, -2, 6, 6);
    } else if (classType === 'Naruto' || (name && name.includes('Clone'))) {
      // Orange suit with black sleeves/shoulders
      ctx.fillStyle = accentColor;
      ctx.fillRect(-10, -10, 20, 5);
      ctx.fillStyle = suitColor;
      ctx.fillRect(-6, -10, 12, 5); // neck area
    } else if (classType === 'Sasuke') {
      // Sasuke purple rope sash at waist
      ctx.fillStyle = accentColor;
      ctx.fillRect(-12, 4, 24, 4);
    } else if (classType === 'Sakura') {
      // White sash overlay
      ctx.fillStyle = accentColor;
      ctx.fillRect(-10, 2, 20, 4);
    }

    // 3. HEAD
    ctx.fillStyle = '#fed7aa'; // skin tone peach
    ctx.beginPath();
    ctx.arc(0, -18, 10, 0, Math.PI * 2);
    ctx.fill();

    // Mask for Kakashi
    if (classType === 'Kakashi') {
      ctx.fillStyle = '#1e293b'; // navy mask
      ctx.beginPath();
      ctx.arc(0, -16, 10.2, 0, Math.PI);
      ctx.fill();
    }

    // Headband
    ctx.fillStyle = headbandColor;
    ctx.fillRect(-9, -22, 18, 4);
    ctx.fillStyle = '#cbd5e1'; // metal protector plate
    ctx.fillRect(-4, -22, 8, 3.5);
    // Leaf insignia dot
    ctx.fillStyle = '#334155';
    ctx.fillRect(-1, -21, 2, 1.5);

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(3, -18, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(3, -18, 1, 0, Math.PI * 2);
    ctx.fill();

    // 4. HAIR
    ctx.fillStyle = hairColor;
    // Spiky vector hair clumps
    ctx.beginPath();
    ctx.moveTo(-11, -21);
    ctx.lineTo(-8, -32);
    ctx.lineTo(-4, -24);
    ctx.lineTo(0, -34);
    ctx.lineTo(4, -24);
    ctx.lineTo(8, -32);
    ctx.lineTo(11, -21);
    ctx.closePath();
    ctx.fill();

    // 5. ANIMATED ARMS & WEAPONS (Actually holding a weapon!)
    const armSwing = isMoving ? Math.sin(animTimer) * 5 : 0;
    const isAttacking = attackTimer > 0;
    const strikeAngle = isAttacking ? -Math.PI / 4 + (Math.sin((1 - attackTimer / 0.18) * Math.PI) * Math.PI / 2) : 0;

    // Back arm (left arm)
    ctx.fillStyle = suitColor;
    ctx.save();
    ctx.translate(-10, -4);
    ctx.rotate(armSwing * 0.1);
    ctx.fillRect(-4, 0, 4, 12);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-4, 10, 4, 3);
    ctx.restore();

    // Front arm (right arm holding weapon!)
    ctx.save();
    ctx.translate(10, -4);
    if (isAttacking) {
      ctx.rotate(-1.2 + strikeAngle);
    } else {
      ctx.rotate(armSwing * -0.1 + 0.3);
    }

    // Sleeve
    ctx.fillStyle = suitColor;
    ctx.fillRect(0, 0, 12, 5);
    // Hand
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(10, 0, 4, 5);

    // WEAPON HOLDING
    if (classType === 'Sasuke') {
      // Kusanagi Sword (Chokutō)
      ctx.strokeStyle = '#94a3b8'; // steel blade
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(12, 2.5);
      ctx.lineTo(34, 2.5);
      ctx.stroke();

      // Black hilt
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, 2.5);
      ctx.lineTo(12, 2.5);
      ctx.stroke();

      // Chidori aura glow on sword if Sasuke is attacking!
      if (isAttacking) {
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 4.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(14, 2.5);
        ctx.lineTo(36, 2.5);
        ctx.stroke();
      }
    } else if (classType === 'Kakashi') {
      // Lightning Blade Kunai
      ctx.strokeStyle = '#475569'; // dark iron kunai
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(12, 2.5);
      ctx.lineTo(24, 2.5);
      ctx.stroke();
      // Ring hilt
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(10, 2.5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(10, 2.5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      if (isAttacking) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#0ea5e9';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(12, 2.5);
        ctx.lineTo(26, 2.5);
        ctx.stroke();
      }
    } else if (classType === 'Sakura') {
      // Iron spiked punch knuckles
      ctx.fillStyle = '#64748b';
      ctx.fillRect(12, -1, 4, 7);
      ctx.fillStyle = '#ef4444'; // spiked tip
      ctx.beginPath();
      ctx.moveTo(16, -1);
      ctx.lineTo(19, 2.5);
      ctx.lineTo(16, 6);
      ctx.fill();
    } else {
      // Naruto / Clone: Shadow Kunai or Blue Rasengan
      if (isAttacking) {
        // Glowing blue rasengan sphere in hand
        const radGrad = ctx.createRadialGradient(14, 2.5, 1, 14, 2.5, 10);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.4, '#38bdf8');
        radGrad.addColorStop(1, '#0284c700');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(14, 2.5, 10, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Iron kunai
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, 2.5);
        ctx.lineTo(22, 2.5);
        ctx.stroke();
      }
    }

    ctx.restore(); // restore front arm

    // Shield Aura
    if (classType === 'Kakashi' && isAlly) {
      // slight tactics glow
      ctx.strokeStyle = '#2dd4bf55';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  };

  // HTML5 2D Canvas Renderer - PORTRAIT 500x850 FULL SCREEN SCALING ENGINE
  const renderBattleCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scaling strictly for the portrait aspect ratio
    const scaleX = canvas.width / 500;
    const scaleY = canvas.height / 850;
    ctx.scale(scaleX, scaleY);

    // 1. Screen shaking offsets
    if (screenShake.current > 0) {
      const shakeX = (Math.random() * 2 - 1) * screenShake.current;
      const shakeY = (Math.random() * 2 - 1) * screenShake.current;
      ctx.translate(shakeX, shakeY);
      screenShake.current *= 0.9; // decay shake force
      if (screenShake.current < 0.5) screenShake.current = 0;
    }

    // 2. Render background gradient map
    const stage = activeStage!;
    const bgImg = imagesRef.current['battle_bg'];
    if (bgImg && bgImg.complete && bgImg.naturalWidth !== 0) {
      ctx.drawImage(bgImg, 0, 0, 500, 850);
    } else {
      // Fallback stylized dark field with floor lines
      const grad = ctx.createLinearGradient(0, 0, 0, 850);
      if (stage.id === 1) {
        grad.addColorStop(0, '#022c22'); // dark emerald forest
        grad.addColorStop(1, '#064e3b');
      } else if (stage.id === 2) {
        grad.addColorStop(0, '#172554'); // blue valley
        grad.addColorStop(1, '#1e1b4b');
      } else if (stage.id === 3) {
        grad.addColorStop(0, '#121020'); // purple hideout
        grad.addColorStop(1, '#020617');
      } else if (stage.id === 4) {
        grad.addColorStop(0, '#451a03'); // gold arena
        grad.addColorStop(1, '#78350f');
      } else {
        grad.addColorStop(0, '#4c0519'); // dark battlefield
        grad.addColorStop(1, '#090514');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 500, 850);

      // Draw distant hills / silhouette for realistic depth
      ctx.fillStyle = stage.id === 1 ? '#042f1a88' : stage.id === 2 ? '#1e1b4b88' : stage.id === 3 ? '#0f172a88' : stage.id === 4 ? '#5c2d1288' : '#31041388';
      ctx.beginPath();
      ctx.moveTo(0, 150);
      ctx.quadraticCurveTo(150, 110, 300, 145);
      ctx.quadraticCurveTo(400, 100, 500, 155);
      ctx.lineTo(500, 180);
      ctx.lineTo(0, 180);
      ctx.closePath();
      ctx.fill();

      // Draw secondary closer hills
      ctx.fillStyle = stage.id === 1 ? '#064e3b77' : stage.id === 2 ? '#100e2b77' : stage.id === 3 ? '#02061777' : stage.id === 4 ? '#451a0377' : '#18020a77';
      ctx.beginPath();
      ctx.moveTo(0, 165);
      ctx.quadraticCurveTo(150, 140, 300, 165);
      ctx.quadraticCurveTo(400, 150, 500, 170);
      ctx.lineTo(500, 190);
      ctx.lineTo(0, 190);
      ctx.closePath();
      ctx.fill();

      // Drifting clouds in the background sky
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < 4; i++) {
        const cloudX = (i * 150 + Date.now() * 0.01) % 650 - 100;
        const cloudY = 120 + Math.sin(Date.now() / 2400 + i) * 6;
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, 20, 0, Math.PI * 2);
        ctx.arc(cloudX + 15, cloudY - 8, 16, 0, Math.PI * 2);
        ctx.arc(cloudX - 15, cloudY - 8, 16, 0, Math.PI * 2);
        ctx.arc(cloudX + 30, cloudY, 12, 0, Math.PI * 2);
        ctx.arc(cloudX - 30, cloudY, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      // floor grids adjusted for 500x850 portrait
      ctx.strokeStyle = '#ffffff04';
      ctx.lineWidth = 1;
      for (let i = 0; i < 500; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 110);
        ctx.lineTo(i, 800);
        ctx.stroke();
      }
      for (let j = 110; j < 800; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(500, j);
        ctx.stroke();
      }

      // Swaying grass blades scattered deterministically across the portrait field
      ctx.strokeStyle = stage.id === 1 ? '#10b9812a' : stage.id === 4 ? '#b453091a' : '#64748b15';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) {
        const grassX = (i * 47) % 400 + 50;
        const grassY = (i * 59) % 650 + 120;
        const sway = Math.sin(Date.now() / 1200 + i) * 3.5;
        ctx.beginPath();
        ctx.moveTo(grassX, grassY);
        ctx.quadraticCurveTo(grassX + sway - 2, grassY - 12, grassX + sway * 1.5 - 4, grassY - 15);
        ctx.moveTo(grassX, grassY);
        ctx.quadraticCurveTo(grassX + sway + 2, grassY - 9, grassX + sway * 1.2 + 2, grassY - 13);
        ctx.stroke();
      }

      // Environmental weather particles based on stage ID within portrait bounds
      if (stage.id === 1) {
        // Green leaves drifting in Forest
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        for (let i = 0; i < 12; i++) {
          const leafX = (i * 87 + Date.now() * 0.035) % 600 - 50;
          const leafY = (i * 221 + Date.now() * 0.045) % 650 + 110;
          ctx.beginPath();
          ctx.ellipse(leafX, leafY, 6, 3, Math.sin(Date.now() / 800 + i) * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage.id === 2) {
        // Blue mist and swirling mountain wind gusts
        ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
        for (let i = 0; i < 6; i++) {
          const fogX = (i * 140 + Date.now() * 0.015) % 700 - 100;
          ctx.beginPath();
          ctx.arc(fogX, 400 + Math.sin(Date.now() / 1500 + i) * 75, 75, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage.id === 3) {
        // Purple embers rising in Cave
        for (let i = 0; i < 15; i++) {
          const sparkX = (i * 47 + Date.now() * 0.01) % 500;
          const sparkY = 780 - (i * 45 + Date.now() * 0.025) % 650;
          ctx.fillStyle = 'rgba(192, 132, 252, 0.4)';
          ctx.fillRect(sparkX, sparkY, 2.5, 2.5);
        }
      } else if (stage.id === 4) {
        // Golden arena leaves floating down
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        for (let i = 0; i < 12; i++) {
          const leafX = (i * 91 + Date.now() * 0.02) % 500;
          const leafY = (i * 131 + Date.now() * 0.04) % 650 + 110;
          ctx.beginPath();
          ctx.arc(leafX, leafY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (stage.id === 5) {
        // Scorched battlefield red sparks and ash drifting up-right
        for (let i = 0; i < 20; i++) {
          const emberX = (i * 51 + Date.now() * 0.04) % 600 - 50;
          const emberY = 780 - (i * 37 + Date.now() * 0.05) % 650;
          ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
          ctx.beginPath();
          ctx.arc(emberX, emberY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Top and bottom banner locks (Portrait 500x850 style)
    ctx.fillStyle = '#020617ef';
    ctx.fillRect(0, 0, 500, 110);
    ctx.fillRect(0, 800, 500, 50);

    ctx.strokeStyle = '#33415555';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 110);
    ctx.lineTo(500, 110);
    ctx.moveTo(0, 800);
    ctx.lineTo(500, 800);
    ctx.stroke();

    // 3. Render ghost shadow trails of player
    const ply = playerPos.current;
    ply.ghostTrail.forEach(trail => {
      ctx.save();
      ctx.globalAlpha = trail.opacity;
      ctx.fillStyle = '#2563eb44'; // glowing electric trail
      ctx.beginPath();
      ctx.arc(trail.x + ply.width / 2, trail.y + ply.height / 2, ply.width * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 4. Render Player with hands, feet, and physical weapon-holding!
    const isMoving = Math.abs(ply.vx) > 10 || Math.abs(ply.vy) > 10;
    const runningTimer = isMoving ? (Date.now() / 100) : 0;
    drawShinobiCharacter(
      ctx,
      ply.x,
      ply.y - ply.jumpY,
      ply.width,
      ply.height,
      ply.facingDir,
      isMoving,
      runningTimer,
      playerState.classType,
      ply.attackTimer,
      true,
      playerState.name
    );

    // Draw active skill shields
    if (ply.shieldTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(ply.x + ply.width / 2, ply.y + ply.height / 2 - ply.jumpY, ply.width * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4b. Render Summoned Allies with hands, feet, and weapon holding!
    activeAllies.current.forEach(ally => {
      const isAllyMoving = Math.abs(ally.vx) > 10 || Math.abs(ally.vy) > 10;
      const allyRunTimer = isAllyMoving ? (Date.now() / 100) : 0;
      
      let allyClass = 'Naruto';
      if (ally.name && ally.name.includes('Sasuke')) allyClass = 'Sasuke';
      else if (ally.name && ally.name.includes('Sakura')) allyClass = 'Sakura';
      else if (ally.name && ally.name.includes('Kakashi')) allyClass = 'Kakashi';

      drawShinobiCharacter(
        ctx,
        ally.x,
        ally.y,
        ally.width,
        ally.height,
        ally.facingDir,
        isAllyMoving,
        allyRunTimer,
        allyClass,
        ally.attackCooldown > 0 ? 0.15 : 0,
        true,
        ally.name
      );

      // Draw Name tag above ally
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ally.name, ally.x + ally.width / 2, ally.y - 12);

      // Draw Ally mini health bar
      const hbW = ally.width * 0.9;
      const hbX = ally.x + (ally.width - hbW) / 2;
      const hbY = ally.y - 8;
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(hbX, hbY, hbW, 2);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(hbX, hbY, hbW * (ally.hp / ally.maxHp), 2);
    });

    // 4c. Render Selected Pet (High variety details!)
    if (playerState.selectedPetId && playerState.selectedPetId !== 'none') {
      const selectedPet = PETS_DATABASE.find(p => p.id === playerState.selectedPetId);
      if (selectedPet) {
        ctx.save();
        ctx.translate(petPos.current.x, petPos.current.y);
        ctx.rotate(petPos.current.angle);

        // shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(10, 20, 8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pet graphic icon
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(selectedPet.icon, 10, 8);

        // Small name text
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '7px monospace';
        ctx.fillText(selectedPet.name.split(' ')[0], 10, -3);

        ctx.restore();
      }
    }

    // 5. Render Projectiles
    projectiles.current.forEach(proj => {
      ctx.save();
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      // spiral shuriken blade lines for Rasenshuriken
      if (proj.radius > 25) {
        ctx.strokeStyle = '#ffffffcc';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < 4; a++) {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.radius * 0.8, (Date.now() / 80) + a * Math.PI / 2, (Date.now() / 80) + a * Math.PI / 2 + 1);
          ctx.stroke();
        }
      }
      ctx.restore();
    });

    // 6. Render Enemies (Goblin, Orc, Golem, Dragon, Demon, + flying Bat/Bird/Ghost)
    enemies.current.forEach(enemy => {
      if (enemy.hp <= 0) return;

      const nX = enemy.x + enemy.width / 2;
      const nY = enemy.y + enemy.height / 2;

      // floor shadow (smaller/fainter for flying entities)
      const isFlying = enemy.type === 'bird' || enemy.type === 'bat' || enemy.type === 'ghost';
      ctx.fillStyle = isFlying ? 'rgba(0,0,0,0.11)' : 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(nX, enemy.y + enemy.height - 2, enemy.width * (isFlying ? 0.33 : 0.45), isFlying ? 2 : 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Calculate float y offset for flying/floating creatures
      let floatY = 0;
      if (enemy.type === 'bird') {
        floatY = -35 + Math.sin(Date.now() / 150 + enemy.x * 0.05) * 10;
      } else if (enemy.type === 'bat') {
        floatY = -25 + Math.sin(Date.now() / 100 + enemy.x * 0.08) * 8;
      } else if (enemy.type === 'ghost') {
        floatY = -20 + Math.sin(Date.now() / 250) * 8;
        ctx.save();
        ctx.globalAlpha = 0.55 + Math.sin(Date.now() / 220) * 0.15;
      }

      ctx.save();
      ctx.translate(nX, nY + floatY);

      // Hurt tick shake
      if (enemy.hurtCooldown > 0) {
        ctx.translate((Math.random() * 4 - 2), 0);
      }

      // Draw vector styled mob orcs/goblins/golems/bosses
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, enemy.width / 2);
      let c1 = '#4ade80'; // goblin
      let c2 = '#15803d';

      if (enemy.type === 'slime') {
        c1 = '#38bdf8';
        c2 = '#0369a1';
      } else if (enemy.type === 'orc') {
        c1 = '#f59e0b';
        c2 = '#b45309';
      } else if (enemy.type === 'golem') {
        c1 = '#94a3b8';
        c2 = '#475569';
      } else if (enemy.type === 'demon') {
        c1 = '#f43f5e';
        c2 = '#be123c';
      } else if (enemy.type === 'dragon') {
        c1 = '#ef4444';
        c2 = '#7f1d1d';
      } else if (enemy.type === 'bird') {
        c1 = '#5cc8fa';
        c2 = '#0284c7';
      } else if (enemy.type === 'bat') {
        c1 = '#c084fc';
        c2 = '#4c1d95';
      } else if (enemy.type === 'ghost') {
        c1 = '#e9d5ff';
        c2 = '#701a75';
      }

      grad.addColorStop(0, c1);
      grad.addColorStop(0.75, c2);
      grad.addColorStop(1, '#0000001a');

      // Extra custom vectors for special monster types
      if (enemy.type === 'bird') {
        // Wings flapping
        const flap = Math.sin(Date.now() / 90) * enemy.width * 0.45;
        ctx.strokeStyle = '#ffffffaa';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-enemy.width * 0.6, -flap);
        ctx.lineTo(0, -4);
        ctx.lineTo(enemy.width * 0.6, -flap);
        ctx.stroke();
      } else if (enemy.type === 'bat') {
        // Wing flaps
        const flap = Math.sin(Date.now() / 60) * enemy.width * 0.35;
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-enemy.width * 0.75, -flap);
        ctx.lineTo(-enemy.width * 0.2, 4);
        ctx.lineTo(0, 0);
        ctx.lineTo(enemy.width * 0.75, -flap);
        ctx.lineTo(enemy.width * 0.2, 4);
        ctx.fill();
      } else if (enemy.type === 'ghost') {
        // Ghost tail waving
        ctx.fillStyle = '#c084fc33';
        ctx.beginPath();
        ctx.moveTo(-enemy.width * 0.3, 0);
        ctx.quadraticCurveTo(Math.sin(Date.now() / 80) * 8, enemy.height * 0.7, enemy.width * 0.3, 0);
        ctx.fill();
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      if (enemy.type === 'slime') {
        // bounce squash shape
        const sq = 1.1 + Math.sin(Date.now() / 150) * 0.1;
        ctx.ellipse(0, enemy.height / 5, enemy.width * 0.5 * sq, enemy.height * 0.4 / sq, 0, 0, Math.PI * 2);
      } else if (enemy.type === 'dragon') {
        // big scary triangle wings
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-enemy.width * 0.6, 0);
        ctx.lineTo(-enemy.width * 0.9, -50);
        ctx.lineTo(-enemy.width * 0.3, -20);
        ctx.moveTo(enemy.width * 0.6, 0);
        ctx.lineTo(enemy.width * 0.9, -50);
        ctx.lineTo(enemy.width * 0.3, -20);
        ctx.stroke();

        ctx.arc(0, 0, enemy.width / 2.2, 0, Math.PI * 2);
      } else {
        ctx.arc(0, 0, enemy.width / 2.2, 0, Math.PI * 2);
      }
      ctx.fill();

      // evil glowing red/yellow eyes
      ctx.fillStyle = enemy.type === 'ghost' ? '#facc15' : '#dc2626';
      ctx.beginPath();
      ctx.arc(-enemy.width * 0.18, -enemy.height * 0.1, enemy.type === 'dragon' ? 5 : 3.5, 0, Math.PI * 2);
      ctx.arc(enemy.width * 0.18, -enemy.height * 0.1, enemy.type === 'dragon' ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      if (enemy.type === 'ghost') {
        ctx.restore(); // restore alpha
      }

      // HP Bar above mob
      const hbW = enemy.width * 1.1;
      const hbX = enemy.x + (enemy.width - hbW) / 2;
      const hbY = enemy.y - 12;

      ctx.fillStyle = '#02061799';
      ctx.fillRect(hbX, hbY, hbW, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(hbX, hbY, hbW * (enemy.hp / enemy.maxHp), 4);
    });

    // 4e. Render Active Skill Animations (High-fidelity custom visual effects!)
    activeSkillAnims.current.forEach(anim => {
      const progress = 1 - (anim.timer / anim.maxTimer);
      ctx.save();
      
      if (anim.type === 'kirin') {
        // Cyan screen flash
        ctx.fillStyle = `rgba(34, 211, 238, ${Math.max(0, 0.4 - progress)})`;
        ctx.fillRect(0, 110, 500, 690);

        // Huge cyan dragon-shaped zig-zag lightning striking from top (Y=110) to bottom (Y=800)
        ctx.strokeStyle = '#22d3ee';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 4;
        
        // Let's draw 3 main lightning bolts
        for (let b = 0; b < 3; b++) {
          const startX = anim.x + (b - 1) * 80;
          ctx.beginPath();
          ctx.moveTo(startX, 110);
          
          let curX = startX;
          const segments = 12;
          const stepY = (800 - 110) / segments;
          
          for (let s = 1; s <= segments; s++) {
            const nextY = 110 + s * stepY;
            const nextX = startX + (Math.sin(nextY * 0.1 + Date.now() * 0.05 + b) * 35) + (Math.random() * 20 - 10);
            ctx.lineTo(nextX, nextY);
            curX = nextX;
          }
          ctx.stroke();

          // Shockwave rings on floor
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(curX, 800, progress * 100, progress * 30, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (anim.type === 'cherry_impact') {
        // Concentric shockwaves radiating with ground debris
        ctx.strokeStyle = `rgba(219, 39, 119, ${1 - progress})`;
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 15;
        
        // 3 concentric expanding rings on ground
        for (let r = 0; r < 3; r++) {
          const ringRad = (progress * 150 + r * 30) % 150;
          ctx.lineWidth = 3 * (1 - ringRad / 150);
          ctx.beginPath();
          ctx.ellipse(anim.x, anim.y, ringRad, ringRad * 0.35, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw radial ground cracks
        ctx.strokeStyle = '#450a0a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let c = 0; c < 8; c++) {
          const angle = (c * Math.PI) / 4;
          const crackDist = progress * 110;
          ctx.moveTo(anim.x, anim.y);
          ctx.lineTo(anim.x + Math.cos(angle) * crackDist, anim.y + Math.sin(angle) * crackDist * 0.35);
        }
        ctx.stroke();
      } else if (anim.type === 'sovereign_punch') {
        // Red and orange conical forward shockwave shooting with speed
        ctx.fillStyle = `rgba(239, 68, 68, ${0.4 * (1 - progress)})`;
        ctx.strokeStyle = `rgba(251, 146, 60, ${1 - progress})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 20;

        ctx.save();
        ctx.translate(anim.x, anim.y);
        ctx.rotate(anim.angle || 0);
        
        // Draw conical fan
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(progress * 180, -progress * 60);
        ctx.quadraticCurveTo(progress * 220, 0, progress * 180, progress * 60);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
      } else if (anim.type === 'kamui') {
        // Swirling vortex black hole drawing inward
        ctx.save();
        ctx.translate(anim.x, anim.y);
        ctx.rotate(Date.now() * -0.01);
        
        const kamGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, (1 - progress) * 80);
        kamGrad.addColorStop(0, '#000000');
        kamGrad.addColorStop(0.4, '#4c1d95');
        kamGrad.addColorStop(0.8, '#8b5cf6');
        kamGrad.addColorStop(1, '#00000000');
        
        ctx.fillStyle = kamGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
        ctx.lineWidth = 2;
        for (let s = 0; s < 4; s++) {
          ctx.beginPath();
          const startAngle = s * Math.PI / 2;
          for (let r = 5; r < 75; r += 2) {
            const theta = startAngle + r * 0.08;
            const x = Math.cos(theta) * r;
            const y = Math.sin(theta) * r * 0.4;
            if (r === 5) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
      } else if (anim.type === 'mud_wall') {
        // Large defensive stone blocks rising from the ground
        ctx.fillStyle = '#78350f'; // rich dirt brown
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        
        const riseHeight = Math.min(1.0, progress * 4) * 35;
        ctx.fillRect(anim.x - 45, anim.y + 10 - riseHeight, 90, riseHeight);
        ctx.strokeRect(anim.x - 45, anim.y + 10 - riseHeight, 90, riseHeight);

        ctx.strokeStyle = '#27272a';
        ctx.beginPath();
        ctx.moveTo(anim.x - 20, anim.y + 10 - riseHeight * 0.8);
        ctx.lineTo(anim.x - 10, anim.y + 10 - riseHeight * 0.4);
        ctx.moveTo(anim.x + 15, anim.y + 10 - riseHeight * 0.7);
        ctx.lineTo(anim.x + 25, anim.y + 10 - riseHeight * 0.2);
        ctx.stroke();
      } else if (anim.type === 'nine_tails_roar') {
        // Red and orange expanding sonic ripples around the caster
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 * (1 - progress)})`;
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 4 * (1 - progress);
        
        ctx.beginPath();
        ctx.ellipse(anim.x, anim.y, progress * 160, progress * 60, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(249, 115, 22, ${0.5 * (1 - progress)})`;
        ctx.lineWidth = 2 * (1 - progress);
        ctx.beginPath();
        ctx.ellipse(anim.x, anim.y, progress * 120, progress * 45, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (anim.type === 'rasengan_charge') {
        ctx.save();
        ctx.translate(anim.x, anim.y);
        ctx.rotate(Date.now() * 0.02);
        
        const radGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 25);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.5, '#38bdf8');
        radGrad.addColorStop(1, '#0284c700');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(0, 0, 20, i * Math.PI * 2 / 3, i * Math.PI * 2 / 3 + 1.2);
          ctx.stroke();
        }
        ctx.restore();
      } else if (anim.type === 'rasenshuriken') {
        ctx.save();
        ctx.translate(anim.x, anim.y);
        ctx.rotate(Date.now() * 0.04);
        
        const radGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 35);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.4, '#38bdf8');
        radGrad.addColorStop(1, '#0ea5e900');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        
        for (let b = 0; b < 4; b++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(20, -50, 45, -60);
          ctx.quadraticCurveTo(15, -25, 0, 0);
          ctx.stroke();
          ctx.rotate(Math.PI / 2);
        }
        ctx.restore();
      }

      ctx.restore();
    });

    // 7. Render Particles - HIGH FIDELITY STYLIZED VFX
    particles.current.forEach(part => {
      ctx.save();
      const lifeRatio = part.life / part.maxLife;
      ctx.globalAlpha = lifeRatio;
      
      // Shadow glow for visual punch
      ctx.shadowColor = part.color;
      ctx.shadowBlur = part.type === 'spark' || part.type === 'fire' || part.type === 'admin' ? 14 : 6;

      if (part.type === 'fire') {
        const grad = ctx.createRadialGradient(part.x, part.y, 0, part.x, part.y, part.size * 2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, '#fbbf24'); // Yellow
        grad.addColorStop(0.7, '#f97316'); // Orange
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)'); // Red fade
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (part.type === 'spark') {
        ctx.strokeStyle = part.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(part.x - part.size, part.y);
        ctx.lineTo(part.x + part.size, part.y);
        ctx.moveTo(part.x, part.y - part.size);
        ctx.lineTo(part.x, part.y + part.size);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else if (part.type === 'heal') {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const hs = part.size * 1.3;
        ctx.moveTo(part.x - hs, part.y);
        ctx.lineTo(part.x + hs, part.y);
        ctx.moveTo(part.x, part.y - hs);
        ctx.lineTo(part.x, part.y + hs);
        ctx.stroke();
      } else if (part.type === 'mana') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#0ea5e944';
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (part.type === 'smoke') {
        const smokeSize = part.size * (1 + (1 - lifeRatio) * 1.6);
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, smokeSize, 0, Math.PI * 2);
        ctx.fill();
      } else if (part.type === 'blood') {
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.ellipse(part.x, part.y, part.size, part.size * 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 8. Render Floating Damage Numbers
    damageNumbers.current.forEach(dmg => {
      ctx.save();
      ctx.fillStyle = dmg.color;
      ctx.font = dmg.isCrit ? '900 16px monospace' : 'bold 12px monospace';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(dmg.text, dmg.x, dmg.y);
      ctx.restore();
    });

    // 9. Wave Status message overlay - NOTIFY EXACT WAVES CLEARED (Centered in 500x850 screen)
    if (waveCountdown.current > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.72)';
      ctx.fillRect(0, 350, 500, 120);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`WAVE ${currentWave.current} OF ${maxWaves.current} CLEAR!`, 250, 395);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Next wave deploying in ${Math.ceil(waveCountdown.current)}s...`, 250, 435);
    }

    ctx.restore();
  };

  const handleAdminAuth = () => {
    if (passcodeInput === '123456') {
      setAdminUnlocked(true);
      setPasscodeError(false);
      setPlayerState(prev => ({ ...prev, isAdmin: true }));
      playSound('admin');
    } else {
      setPasscodeError(true);
      playSound('hurt');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      {/* 1. TOP HEADER SUMMARY (Only in Town & when not inside a full-screen sub-tab) */}
      {gameState === 'TOWN' && (
        activeTab === 'VILLAGE_HUB' ? (
          <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40 shadow-md">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                  <Shield size={24} />
                </div>
                <div>
                  <h1 className="text-md font-black font-mono tracking-wider text-white">ALAVIA SHINOBI VILLAGE</h1>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Active Hero: <span className="text-indigo-400 font-bold uppercase">{playerState.classType}</span> • Class Level: <span className="text-white font-bold">{playerState.level}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                {/* Currency summaries */}
                <span className="flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/25 text-amber-400">
                  <Coins size={14} /> {playerState.gold.toLocaleString()} Gold
                </span>
                <span className="flex items-center gap-1 bg-fuchsia-500/10 px-3 py-1.5 rounded-lg border border-fuchsia-500/25 text-fuchsia-400">
                  💎 {playerState.gems.toLocaleString()} Gems
                </span>
                {playerState.isAdmin && (
                  <span className="bg-emerald-950 border border-emerald-500 text-emerald-400 px-2 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-widest animate-pulse">
                    🛡️ ADMIN
                  </span>
                )}
              </div>
            </div>
          </header>
        ) : (
          <header className="bg-slate-900 border-b border-slate-800 p-3 sticky top-0 z-40 shadow-md">
            <div className="max-w-[98vw] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                onClick={() => { playSound('slash'); setActiveTab('VILLAGE_HUB'); }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white font-mono text-xs font-black rounded-xl shadow-lg border border-indigo-500/30 transition-all cursor-pointer animate-pulse"
              >
                <span className="text-sm">⬅️</span> KEMBALI KE DESA
              </button>
              <div className="flex items-center gap-4">
                <div className="text-[11px] font-mono text-slate-400 hidden md:block">
                  Hero: <span className="text-indigo-400 font-bold uppercase">{playerState.classType}</span> • Lv. <span className="text-white font-bold">{playerState.level}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25 text-amber-400">
                    <Coins size={12} /> {playerState.gold.toLocaleString()} Gold
                  </span>
                  <span className="flex items-center gap-1 bg-fuchsia-500/10 px-2.5 py-1 rounded-lg border border-fuchsia-500/25 text-fuchsia-400">
                    💎 {playerState.gems.toLocaleString()} Gems
                  </span>
                </div>
              </div>
            </div>
          </header>
        )
      )}

      {/* 2. GAME HUB CONTAINER */}
      <main className="flex-1 p-2 md:p-6 flex flex-col justify-center">
        {gameState === 'TOWN' ? (
          <div className="max-w-[98vw] mx-auto w-full space-y-6">
            {activeTab === 'VILLAGE_HUB' ? (
              /* THE NEW VILLAGE HUB DASHBOARD - SEPARATED IMMERSIVE MENU CARDS */
              <div className="max-w-4xl mx-auto space-y-6 py-4 animate-fade-in">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 font-mono">
                    ALAVIA SHINOBI VILLAGE HUB
                  </h2>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Welcome back, honorable Shinobi! Manage your profile, train attributes, craft heavy gear, and deploy on expeditions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card 1: Expeditions */}
                  <div
                    onClick={() => { playSound('levelup'); setActiveTab('TOWN_GATE'); }}
                    className="group bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-orange-500/20 hover:border-orange-500/70 p-6 rounded-2xl shadow-xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute right-4 bottom-4 text-8xl opacity-10 group-hover:scale-125 transition-transform duration-500 ease-out">🏯</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl bg-orange-500/10 p-3 rounded-xl border border-orange-500/30 text-orange-400 group-hover:bg-orange-500/20 transition-all">🏯</span>
                        <div>
                          <h3 className="text-md font-extrabold font-mono text-orange-400 group-hover:text-orange-300 tracking-wider">VILLAGE EXPEDITIONS</h3>
                          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase text-left">Misi & Pertempuran</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans text-left">
                        Select your shinobi hero and venture into lethal territory! Battle waves of monsters, defeat colossal bosses, and gain raw power, experience, and crafting materials.
                      </p>
                    </div>
                    <div className="w-full py-2 bg-orange-600 group-hover:bg-orange-500 text-slate-950 font-black font-mono text-[10px] rounded-xl text-center uppercase tracking-widest mt-2 transition-colors">
                      MULAI EXPEDISI ✓
                    </div>
                  </div>

                  {/* Card 2: Character Sheet */}
                  <div
                    onClick={() => { playSound('levelup'); setActiveTab('SHINOBI_SCROLL'); }}
                    className="group bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-indigo-500/20 hover:border-indigo-500/70 p-6 rounded-2xl shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute right-4 bottom-4 text-8xl opacity-10 group-hover:scale-125 transition-transform duration-500 ease-out">🎒</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">🎒</span>
                        <div>
                          <h3 className="text-md font-extrabold font-mono text-indigo-400 group-hover:text-indigo-300 tracking-wider">SHINOBI SCROLL</h3>
                          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase text-left">Karakter, Stats & Bag</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans text-left">
                        Review your ninja attributes, equip divine swords and armor, allot stat points to enhance your combat limits, and unlock supreme active shinobi techniques.
                      </p>
                    </div>
                    <div className="w-full py-2 bg-indigo-600 group-hover:bg-indigo-500 text-white font-black font-mono text-[10px] rounded-xl text-center uppercase tracking-widest mt-2 transition-colors">
                      BUKA SCROLL KARAKTER ✓
                    </div>
                  </div>

                  {/* Card 3: Shop */}
                  <div
                    onClick={() => { playSound('levelup'); setActiveTab('POTION_SHOP'); }}
                    className="group bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-sky-500/20 hover:border-sky-500/70 p-6 rounded-2xl shadow-xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute right-4 bottom-4 text-8xl opacity-10 group-hover:scale-125 transition-transform duration-500 ease-out">🏪</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl bg-sky-500/10 p-3 rounded-xl border border-sky-500/30 text-sky-400 group-hover:bg-sky-500/20 transition-all">🏪</span>
                        <div>
                          <h3 className="text-md font-extrabold font-mono text-sky-400 group-hover:text-sky-300 tracking-wider">SHINOBI MERCHANT</h3>
                          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase text-left">Toko & Jual Beli</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans text-left">
                        Stock up on essential Health and Mana potions to sustain your long deployments. Purchase precious raw Iron Ores, or sell junk loot equipment back for heaps of Gold.
                      </p>
                    </div>
                    <div className="w-full py-2 bg-sky-600 group-hover:bg-sky-500 text-slate-950 font-black font-mono text-[10px] rounded-xl text-center uppercase tracking-widest mt-2 transition-colors">
                      MASUK TOKO ✓
                    </div>
                  </div>

                  {/* Card 4: Blacksmith */}
                  <div
                    onClick={() => { playSound('levelup'); setActiveTab('GRAND_FORGE'); }}
                    className="group bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-emerald-500/20 hover:border-emerald-500/70 p-6 rounded-2xl shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute right-4 bottom-4 text-8xl opacity-10 group-hover:scale-125 transition-transform duration-500 ease-out">⚒️</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">⚒️</span>
                        <div>
                          <h3 className="text-md font-extrabold font-mono text-emerald-400 group-hover:text-indigo-300 tracking-wider">GRAND FORGE</h3>
                          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase text-left">Tempa & Upgrade Senjata</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans text-left">
                        Forge heavy masterclass weapons and shields matching your specific class lock, upgrade existing equipment to enhance base stats, and appraise hidden combat bonuses.
                      </p>
                    </div>
                    <div className="w-full py-2 bg-emerald-600 group-hover:bg-emerald-500 text-slate-950 font-black font-mono text-[10px] rounded-xl text-center uppercase tracking-widest mt-2 transition-colors">
                      PANGGIL TUKANG TEMPA ✓
                    </div>
                  </div>

                  {/* Card 5: Summon Sanctuary */}
                  <div
                    onClick={() => { playSound('levelup'); setActiveTab('SUMMON_SANCTUARY'); }}
                    className="group bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-fuchsia-500/20 hover:border-fuchsia-500/70 p-6 rounded-2xl shadow-xl hover:shadow-fuchsia-500/10 transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden md:col-span-2 lg:col-span-1"
                  >
                    <div className="absolute right-4 bottom-4 text-8xl opacity-10 group-hover:scale-125 transition-transform duration-500 ease-out">🦊</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl bg-fuchsia-500/10 p-3 rounded-xl border border-fuchsia-500/30 text-fuchsia-400 group-hover:bg-fuchsia-500/20 transition-all">🦊</span>
                        <div>
                          <h3 className="text-md font-extrabold font-mono text-fuchsia-400 group-hover:text-fuchsia-300 tracking-wider">SUMMON SANCTUARY</h3>
                          <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase text-left">Peti Pet & Teman Bertempur</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans text-left">
                        Acquire legendary ninja companions (Sasuke, Sakura, Kakashi) and equip loyal pets (Kurama, Katsuyu, Aoda) to gain heavy attribute bonuses and activate automatic battlefield help.
                      </p>
                    </div>
                    <div className="w-full py-2 bg-fuchsia-600 group-hover:bg-fuchsia-500 text-white font-black font-mono text-[10px] rounded-xl text-center uppercase tracking-widest mt-2 transition-colors">
                      MASUK KUIL PEMANGGILAN ✓
                    </div>
                  </div>
                </div>

                {/* Smaller Admin card at the bottom */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => { playSound('slash'); setActiveTab('ADMIN_GATE'); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl shadow-lg font-mono text-xs font-bold transition-all cursor-pointer"
                  >
                    ⚙️ ADMIN PORTAL CONSOLE
                  </button>
                </div>
              </div>
            ) : (
              /* DETAILED INTERFACES ROUTER (Taking full width and spacious size) */
              <div className="animate-fade-in w-full">
                {activeTab === 'TOWN_GATE' && (
                  <MainMenu
                    playerState={playerState}
                    setPlayerState={setPlayerState}
                    stages={STAGES}
                    onStartStage={handleStartStage}
                    onOpenAdmin={() => setActiveTab('ADMIN_GATE')}
                  />
                )}

                {activeTab === 'SHINOBI_SCROLL' && (
                  <CharacterSheet
                    playerState={playerState}
                    setPlayerState={setPlayerState}
                  />
                )}

                {activeTab === 'POTION_SHOP' && (
                  <Shop
                    playerState={playerState}
                    setPlayerState={setPlayerState}
                  />
                )}

                {activeTab === 'GRAND_FORGE' && (
                  <Blacksmith
                    playerState={playerState}
                    setPlayerState={setPlayerState}
                  />
                )}

                {activeTab === 'SUMMON_SANCTUARY' && (
                  <SummonSanctuary
                    playerState={playerState}
                    setPlayerState={setPlayerState}
                  />
                )}

                {activeTab === 'ADMIN_GATE' && (
                  adminUnlocked || playerState.isAdmin ? (
                    <AdminPanel
                      playerState={playerState}
                      setPlayerState={setPlayerState}
                      onClose={() => setActiveTab('VILLAGE_HUB')}
                    />
                  ) : (
                    <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 text-center">
                      <div className="w-12 h-12 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-xl flex items-center justify-center mx-auto text-xl">
                        🔒
                      </div>
                      <div>
                        <h3 className="text-md font-bold font-mono text-white">ADMIN VERIFICATION</h3>
                        <p className="text-xs text-slate-400 mt-1 font-sans">Enter the administrative passcode (123456) to access game edits and infinite resource pools.</p>
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Passcode Input</label>
                        <input
                          type="password"
                          placeholder="••••••"
                          value={passcodeInput}
                          onChange={e => setPasscodeInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAdminAuth(); }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-center font-mono text-white tracking-widest focus:border-indigo-500 focus:outline-none"
                        />
                        {passcodeError && (
                          <p className="text-xs text-rose-500 text-center font-mono">⚠️ Invalid passcode. Access denied.</p>
                        )}
                      </div>

                      <button
                        onClick={handleAdminAuth}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-lg uppercase tracking-wider cursor-pointer"
                      >
                        Authenticate Admin Mode
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          /* BATTLE SCREEN: Interactive Canvas and HUD overlay inside a full screen overlay div */
          <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col select-none">
            <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center p-1 sm:p-4">
              {/* HTML5 Canvas Element with perfect aspect ratio preservation (No horizontal or vertical stretching) */}
              <canvas
                ref={canvasRef}
                width={500}
                height={850}
                onMouseDown={handleCanvasClickOrTouch}
                onTouchStart={handleCanvasClickOrTouch}
                className="max-w-full max-h-full aspect-[500/850] object-contain block bg-slate-950 shadow-2xl rounded-lg border border-slate-900"
              />

              {/* Game UI HUD Overlays */}
              <GameUI
                playerState={playerState}
                setPlayerState={setPlayerState}
                stageName={activeStage!.name}
                onUseSkill={handleUseSkillById} // FIXED! Allows hotbar button skill execution
                onDodge={handlePlayerDodge}
                onPotionUse={handlePotionUse}
                onAttack={handlePlayerAttack}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
                isGameOver={isGameOver}
                isVictory={isVictory}
                onExit={handleExitStage}
                onRetry={() => handleStartStage(activeStage!.id)}
                victoryGold={victoryGold}
                victoryGems={victoryGems}
                victoryXP={victoryXP}
                victoryDrops={victoryDrops}
                isRolling={isRolling}
                currentWave={currentWave.current}
                maxWaves={maxWaves.current}
                hasNextLevel={activeStage!.id < 5}
                onNextLevel={() => handleStartStage(activeStage!.id + 1)}
                onSpawnCompanion={handleSpawnCompanion}
                companionCooldown={companionCooldown}
                activeAlliesCount={activeAllies.current.length}
              />
            </div>
          </div>
        )}
      </main>

      {/* 3. FOOTER SIGNATURE (Only shown when not in battle) */}
      {gameState === 'TOWN' && (
        <footer className="bg-slate-950 text-slate-500 p-4 border-t border-slate-900 text-center text-[10px] font-mono flex flex-col gap-1">
          <p>© 2026 ALAVIA SOFTWORKS • ACTION ROLE-PLAYING NINJA BATTLE ARENA</p>
          <p className="text-slate-600">Built completely client-side in React with HTML5 Canvas. Dynamic persistence enabled.</p>
        </footer>
      )}
    </div>
  );
}
