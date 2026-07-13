import { useState } from 'react';
import { Sword, Flame, Compass, Lock, ShieldAlert, BookOpen, Star, HelpCircle } from 'lucide-react';
import { CharacterClass, PlayerState, Stage, Skill } from '../types';
import { playSound } from '../utils/audio';

interface MainMenuProps {
  playerState: PlayerState;
  setPlayerState: (state: PlayerState | ((prev: PlayerState) => PlayerState)) => void;
  stages: Stage[];
  onStartStage: (stageId: number) => void;
  onOpenAdmin: () => void;
}

export default function MainMenu({ playerState, setPlayerState, stages, onStartStage, onOpenAdmin }: MainMenuProps) {
  const [selectedChar, setSelectedChar] = useState<CharacterClass>(playerState.classType);
  const [activeTab, setActiveTab] = useState<'CHAR_SELECT' | 'STAGE_SELECT' | 'TUTORIAL'>('CHAR_SELECT');

  const NARUTO_SKILLS: Skill[] = [
    { id: 'naruto_s1', name: 'Rasengan', level: 1, maxLevel: 5, damageMultiplier: 1.6, manaCost: 20, cooldown: 4, currentCooldown: 0, description: 'Dashes forward with a swirling sphere of blue chakra, crushing enemies in its path.', unlockedAt: 1, icon: '🌀' },
    { id: 'naruto_s2', name: 'Shadow Clone Strike', level: 1, maxLevel: 5, damageMultiplier: 1.9, manaCost: 30, cooldown: 7, currentCooldown: 0, description: 'Summons shadow clones that charge forward to execute a barrage of punches.', unlockedAt: 2, icon: '👥' },
    { id: 'naruto_s3', name: 'Nine-Tails Roar', level: 1, maxLevel: 5, damageMultiplier: 2.3, manaCost: 40, cooldown: 10, currentCooldown: 0, description: 'Releases crimson Kurama chakra, knocking back and stunning surrounding enemies.', unlockedAt: 4, icon: '🦊' },
    { id: 'naruto_s4', name: 'Rasenshuriken', level: 1, maxLevel: 5, damageMultiplier: 3.8, manaCost: 75, cooldown: 20, currentCooldown: 0, description: 'Throws a massive spinning wind-chakra shuriken that triggers a colossal vortex explosion.', unlockedAt: 6, icon: '🌪️' },
  ];

  const SASUKE_SKILLS: Skill[] = [
    { id: 'sasuke_s1', name: 'Chidori Strike', level: 1, maxLevel: 5, damageMultiplier: 1.7, manaCost: 22, cooldown: 4, currentCooldown: 0, description: 'Charges a bolt of high-voltage lightning into his hand and thrusts forward at extreme speed.', unlockedAt: 1, icon: '⚡' },
    { id: 'sasuke_s2', name: 'Dragon Fireball', level: 1, maxLevel: 5, damageMultiplier: 2.0, manaCost: 35, cooldown: 8, currentCooldown: 0, description: 'Spews a giant rolling fireball that incinerates and burns enemies in a straight line.', unlockedAt: 2, icon: '☄️' },
    { id: 'sasuke_s3', name: 'Susanoo Protection', level: 1, maxLevel: 5, damageMultiplier: 1.2, manaCost: 45, cooldown: 12, currentCooldown: 0, description: 'Summons purple Susanoo ribguards, gaining absolute invincibility and damaging touching enemies.', unlockedAt: 4, icon: '🛡️' },
    { id: 'sasuke_s4', name: 'Kirin Call', level: 1, maxLevel: 5, damageMultiplier: 4.2, manaCost: 80, cooldown: 22, currentCooldown: 0, description: 'Harnesses natural thunderclouds to call down a colossal lightning dragon onto the entire field.', unlockedAt: 6, icon: '🐉' },
  ];

  const SAKURA_SKILLS: Skill[] = [
    { id: 'sakura_s1', name: 'Cherry Impact', level: 1, maxLevel: 5, damageMultiplier: 1.8, manaCost: 25, cooldown: 5, currentCooldown: 0, description: 'Smashes her fist into the earth, creating tectonic shockwaves that stun nearby enemies.', unlockedAt: 1, icon: '🌸' },
    { id: 'sakura_s2', name: 'Mitotic Recovery', level: 1, maxLevel: 5, damageMultiplier: 1.0, manaCost: 40, cooldown: 14, currentCooldown: 0, description: 'Triggers the Hundred Seals, instantly healing 45% HP and boosting damage by +30% for 5s.', unlockedAt: 2, icon: '🍷' },
    { id: 'sakura_s3', name: 'Chakra Scalpels', level: 1, maxLevel: 5, damageMultiplier: 2.1, manaCost: 35, cooldown: 8, currentCooldown: 0, description: 'Dashes forward with blazing blue medical chakra scalpels that slice through defense lines.', unlockedAt: 4, icon: '🗡️' },
    { id: 'sakura_s4', name: 'Sovereign Punch', level: 1, maxLevel: 5, damageMultiplier: 4.0, manaCost: 70, cooldown: 18, currentCooldown: 0, description: 'Unleashes her ultimate stored chakra in a single catastrophic punch, vaporizing the area.', unlockedAt: 6, icon: '💢' },
  ];

  const KAKASHI_SKILLS: Skill[] = [
    { id: 'kakashi_s1', name: 'Lightning Blade', level: 1, maxLevel: 5, damageMultiplier: 1.7, manaCost: 20, cooldown: 4.5, currentCooldown: 0, description: 'Pierces through enemies in a blink of an eye with a lightning-infused blade.', unlockedAt: 1, icon: '🌩️' },
    { id: 'kakashi_s2', name: 'Mud Wall Defense', level: 1, maxLevel: 5, damageMultiplier: 1.5, manaCost: 30, cooldown: 7.5, currentCooldown: 0, description: 'Summons an earth wall that shields Kakashi and pushes back enemies with falling boulders.', unlockedAt: 2, icon: '🧱' },
    { id: 'kakashi_s3', name: 'Water Dragon', level: 1, maxLevel: 5, damageMultiplier: 2.4, manaCost: 45, cooldown: 10, currentCooldown: 0, description: 'Summons a swirling water serpent that surges forward, piercing and dragging enemies.', unlockedAt: 4, icon: '🌊' },
    { id: 'kakashi_s4', name: 'Kamui Dimensional Warp', level: 1, maxLevel: 5, damageMultiplier: 4.5, manaCost: 85, cooldown: 24, currentCooldown: 0, description: 'Creates a localized gravity warp that pulls in and crushes all surrounding enemies.', unlockedAt: 6, icon: '👁️' },
  ];

  const handleSelectChar = (charClass: CharacterClass) => {
    setSelectedChar(charClass);
    playSound('levelup');

    setPlayerState(prev => {
      // If same class selected, do nothing
      if (prev.classType === charClass) return prev;

      // Assign the corresponding skills
      let correspondingSkills = NARUTO_SKILLS;
      if (charClass === 'Sasuke') correspondingSkills = SASUKE_SKILLS;
      else if (charClass === 'Sakura') correspondingSkills = SAKURA_SKILLS;
      else if (charClass === 'Kakashi') correspondingSkills = KAKASHI_SKILLS;

      // Adjust weapon/items matching class
      const equipped = { ...prev.equipped };
      if (equipped.WEAPON) {
        // Change weapon to match class
        if (charClass === 'Naruto') {
          equipped.WEAPON = {
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
          };
        } else if (charClass === 'Sasuke') {
          equipped.WEAPON = {
            id: 'init_weapon_sasuke',
            name: 'Kusanagi Sword',
            type: 'EQUIPMENT',
            slot: 'WEAPON',
            description: 'A sleek, straight Chokuto sword carrying electrical properties.',
            icon: '⚔️',
            rarity: 'COMMON',
            upgradeLevel: 0,
            baseStatType: 'PHYS_ATK',
            baseStatValue: 18,
            quantity: 1,
          };
        } else if (charClass === 'Sakura') {
          equipped.WEAPON = {
            id: 'init_weapon_sakura',
            name: 'Chakra Infused Gloves',
            type: 'EQUIPMENT',
            slot: 'WEAPON',
            description: 'Leather fist protectors that amplify raw chakra impact.',
            icon: '🥊',
            rarity: 'COMMON',
            upgradeLevel: 0,
            baseStatType: 'PHYS_ATK',
            baseStatValue: 17,
            quantity: 1,
          };
        } else if (charClass === 'Kakashi') {
          equipped.WEAPON = {
            id: 'init_weapon_kakashi',
            name: 'Anbu Sabre',
            type: 'EQUIPMENT',
            slot: 'WEAPON',
            description: 'The standard straight sword wielded by elite Anbu special ops.',
            icon: '⚔️',
            rarity: 'COMMON',
            upgradeLevel: 0,
            baseStatType: 'PHYS_ATK',
            baseStatValue: 19,
            quantity: 1,
          };
        }
      }

      return {
        ...prev,
        classType: charClass,
        skills: correspondingSkills,
        equipped,
      };
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Epic Conquest Style Fantasy Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 p-8 text-center shadow-[0_0_30px_rgba(245,158,11,0.15)] flex flex-col items-center justify-center min-h-[190px] select-none">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent)]" />
        
        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/60" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/60" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/60" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/60" />

        {/* Admin floating gear */}
        <button
          onClick={onOpenAdmin}
          className="absolute top-4 right-4 bg-slate-950/90 hover:bg-amber-500 hover:text-slate-950 text-amber-400 border-2 border-amber-500/40 px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-black flex items-center gap-1.5 cursor-pointer z-10 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] uppercase tracking-wider"
        >
          <ShieldAlert size={12} className="animate-bounce" /> ADMIN PANEL
        </button>

        <h1 className="text-4xl sm:text-6xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-600 drop-shadow-[0_2px_15px_rgba(245,158,11,0.5)] font-mono uppercase">
          EPIC CONQUEST
        </h1>
        <div className="w-40 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mt-3 mb-2" />
        <p className="text-[10px] sm:text-xs text-amber-200/80 font-mono tracking-[0.25em] uppercase">
          SHINOBI CHRONICLES • MULTI-HERO ACTION RPG
        </p>

        {/* Small admin label if active */}
        {playerState.isAdmin && (
          <span className="mt-3 bg-emerald-950/80 border border-emerald-500 text-emerald-400 font-mono text-[9px] font-extrabold tracking-widest py-1 px-3.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse uppercase">
            🛡️ Administrative Access Granted
          </span>
        )}
      </div>

      {/* Tabs Row (Gothic/Fantasy double frame) */}
      <div className="flex gap-2 bg-gradient-to-b from-slate-950 to-slate-900 p-1.5 rounded-xl border-2 border-amber-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <button
          onClick={() => {
            setActiveTab('CHAR_SELECT');
            playSound('levelup');
          }}
          className={`flex-1 py-3 rounded-lg font-mono text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider border ${
            activeTab === 'CHAR_SELECT'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-amber-500/70 border-transparent hover:text-white hover:bg-slate-900/80 hover:border-slate-800'
          }`}
        >
          <Sword size={14} /> SELECT YOUR HERO
        </button>

        <button
          onClick={() => {
            setActiveTab('STAGE_SELECT');
            playSound('levelup');
          }}
          className={`flex-1 py-3 rounded-lg font-mono text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider border ${
            activeTab === 'STAGE_SELECT'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-amber-500/70 border-transparent hover:text-white hover:bg-slate-900/80 hover:border-slate-800'
          }`}
        >
          <Compass size={14} /> CHOOSE STAGE
        </button>

        <button
          onClick={() => {
            setActiveTab('TUTORIAL');
            playSound('levelup');
          }}
          className={`flex-1 py-3 rounded-lg font-mono text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider border ${
            activeTab === 'TUTORIAL'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'text-amber-500/70 border-transparent hover:text-white hover:bg-slate-900/80 hover:border-slate-800'
          }`}
        >
          <BookOpen size={14} /> GAME TUTORIAL
        </button>
      </div>

      {/* TAB 1: CHARACTER SELECTION */}
      {activeTab === 'CHAR_SELECT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
          {/* Character Card: Naruto */}
          <button
            onClick={() => handleSelectChar('Naruto')}
            className={`text-left p-6 rounded-2xl border-2 transition-all flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group ${
              selectedChar === 'Naruto'
                ? 'bg-gradient-to-br from-orange-950/40 via-slate-900 to-slate-900 border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.25)]'
                : 'bg-gradient-to-br from-slate-900/60 to-slate-950/80 border-slate-850 hover:border-orange-500/40 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]'
            }`}
          >
            <div className="absolute -right-8 -bottom-8 text-9xl opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500 ease-out">🦊</div>
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-4">
                <span className="text-4xl bg-orange-950/50 p-3 border border-orange-500/30 rounded-xl shadow-inner">🌀</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black font-mono text-white tracking-wide">NARUTO UZUMAKI</h3>
                    <span className="bg-orange-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                      Jinjuriki
                    </span>
                  </div>
                  <p className="text-xs text-orange-400 font-mono mt-0.5 font-bold uppercase tracking-tight">Physical Close-Combat Brawler</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Naruto utilizes swirling Rasengan bursts and Shadow Clones to swarm battlefield forces. Armed with high base HP and fast chakra reserves, he excels in dynamic, close-quarters combat.
              </p>
              <div className="bg-slate-950/90 p-4 rounded-xl border border-orange-500/15 space-y-1.5 text-xs font-mono text-slate-300 shadow-inner">
                <p className="font-black border-b border-orange-500/20 pb-1 text-orange-400 uppercase tracking-wider mb-2">ABILITIES & SPECIALTIES</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-orange-500">🌀</span> Rasengan Dash & Clone Strike</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-orange-500">🦊</span> Nine-Tails Crimson shockwave blast</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-orange-500">💪</span> High HP, physical damage, and speedy recovery</p>
              </div>
            </div>
            {selectedChar === 'Naruto' ? (
              <span className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black font-mono text-xs rounded-lg text-center uppercase tracking-widest mt-2 border border-orange-300 shadow-md">
                ✓ HERO SELECTED
              </span>
            ) : (
              <span className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-orange-400 border border-orange-500/30 font-bold font-mono text-xs rounded-lg text-center uppercase tracking-wider mt-2 transition-colors">
                TAP TO CHOOSE HERO
              </span>
            )}
          </button>

          {/* Character Card: Sasuke */}
          <button
            onClick={() => handleSelectChar('Sasuke')}
            className={`text-left p-6 rounded-2xl border-2 transition-all flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group ${
              selectedChar === 'Sasuke'
                ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.25)]'
                : 'bg-gradient-to-br from-slate-900/60 to-slate-950/80 border-slate-850 hover:border-indigo-500/40 hover:shadow-[0_0_15px_rgba(99,102,241,0.1)]'
            }`}
          >
            <div className="absolute -right-8 -bottom-8 text-9xl opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500 ease-out">⚡</div>
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-4">
                <span className="text-4xl bg-indigo-950/50 p-3 border border-indigo-500/30 rounded-xl shadow-inner">⚔️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black font-mono text-white tracking-wide">SASUKE UCHIHA</h3>
                    <span className="bg-indigo-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                      Avenger
                    </span>
                  </div>
                  <p className="text-xs text-indigo-400 font-mono mt-0.5 font-bold uppercase tracking-tight">Lightning Swordsman & Fire Mage</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Sasuke channels high-voltage Chidori lightning and spews devastating Fireball Jutsu. He guards himself using the legendary Susanoo ribs and summons Kirin for supreme area clears.
              </p>
              <div className="bg-slate-950/90 p-4 rounded-xl border border-indigo-500/15 space-y-1.5 text-xs font-mono text-slate-300 shadow-inner">
                <p className="font-black border-b border-indigo-500/20 pb-1 text-indigo-400 uppercase tracking-wider mb-2">ABILITIES & SPECIALTIES</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-indigo-400">⚡</span> Chidori Pierce & Fireball spread</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-indigo-400">🛡️</span> Susanoo Ultimate Shield Barrier</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-indigo-400">💀</span> High Critical rate & magic spell multipliers</p>
              </div>
            </div>
            {selectedChar === 'Sasuke' ? (
              <span className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-slate-950 font-black font-mono text-xs rounded-lg text-center uppercase tracking-widest mt-2 border border-indigo-300 shadow-md">
                ✓ HERO SELECTED
              </span>
            ) : (
              <span className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-indigo-400 border border-indigo-500/30 font-bold font-mono text-xs rounded-lg text-center uppercase tracking-wider mt-2 transition-colors">
                TAP TO CHOOSE HERO
              </span>
            )}
          </button>

          {/* Character Card: Sakura */}
          <button
            onClick={() => handleSelectChar('Sakura')}
            className={`text-left p-6 rounded-2xl border-2 transition-all flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group ${
              selectedChar === 'Sakura'
                ? 'bg-gradient-to-br from-pink-950/40 via-slate-900 to-slate-900 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.25)]'
                : 'bg-gradient-to-br from-slate-900/60 to-slate-950/80 border-slate-850 hover:border-pink-500/40 hover:shadow-[0_0_15px_rgba(236,72,153,0.1)]'
            }`}
          >
            <div className="absolute -right-8 -bottom-8 text-9xl opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500 ease-out">🌸</div>
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-4">
                <span className="text-4xl bg-pink-950/50 p-3 border border-pink-500/30 rounded-xl shadow-inner">🥊</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black font-mono text-white tracking-wide">SAKURA HARUNO</h3>
                    <span className="bg-pink-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                      Medic-Nin
                    </span>
                  </div>
                  <p className="text-xs text-pink-400 font-mono mt-0.5 font-bold uppercase tracking-tight">Powerhouse & Healer</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Sakura unleashes monstrous ground-shaking punches that shatter defenses and stun waves of monsters. She is the only ninja with instantaneous, high-percentage healing.
              </p>
              <div className="bg-slate-950/90 p-4 rounded-xl border border-pink-500/15 space-y-1.5 text-xs font-mono text-slate-300 shadow-inner">
                <p className="font-black border-b border-pink-500/20 pb-1 text-pink-400 uppercase tracking-wider mb-2">ABILITIES & SPECIALTIES</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-pink-400">🌸</span> Cherry Blossom Impact earthquake smash</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-pink-400">🍷</span> Mitotic Regeneration self-heal & damage buff</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-pink-400">❤️</span> High base vitality, defense, and health restoration</p>
              </div>
            </div>
            {selectedChar === 'Sakura' ? (
              <span className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-slate-950 font-black font-mono text-xs rounded-lg text-center uppercase tracking-widest mt-2 border border-pink-300 shadow-md">
                ✓ HERO SELECTED
              </span>
            ) : (
              <span className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-pink-400 border border-pink-500/30 font-bold font-mono text-xs rounded-lg text-center uppercase tracking-wider mt-2 transition-colors">
                TAP TO CHOOSE HERO
              </span>
            )}
          </button>

          {/* Character Card: Kakashi */}
          <button
            onClick={() => handleSelectChar('Kakashi')}
            className={`text-left p-6 rounded-2xl border-2 transition-all flex flex-col justify-between gap-5 cursor-pointer relative overflow-hidden group ${
              selectedChar === 'Kakashi'
                ? 'bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-900 border-teal-500 shadow-[0_0_25px_rgba(20,184,166,0.25)]'
                : 'bg-gradient-to-br from-slate-900/60 to-slate-950/80 border-slate-850 hover:border-teal-500/40 hover:shadow-[0_0_15px_rgba(20,184,166,0.1)]'
            }`}
          >
            <div className="absolute -right-8 -bottom-8 text-9xl opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500 ease-out">👁️</div>
            <div className="space-y-4 w-full">
              <div className="flex items-center gap-4">
                <span className="text-4xl bg-teal-950/50 p-3 border border-teal-500/30 rounded-xl shadow-inner">🌩️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black font-mono text-white tracking-wide">KAKASHI HATAKE</h3>
                    <span className="bg-teal-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                      Sharingan
                    </span>
                  </div>
                  <p className="text-xs text-teal-400 font-mono mt-0.5 font-bold uppercase tracking-tight">Tactical Elite Ninja</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Kakashi combines lightning speeds, Mud Walls, and high-velocity Water Dragons. His Sharingan unleashes Kamui, which pulls in and crushes all enemies in a dimensional vortex.
              </p>
              <div className="bg-slate-950/90 p-4 rounded-xl border border-teal-500/15 space-y-1.5 text-xs font-mono text-slate-300 shadow-inner">
                <p className="font-black border-b border-teal-500/20 pb-1 text-teal-400 uppercase tracking-wider mb-2">ABILITIES & SPECIALTIES</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-teal-400">🌩️</span> Lightning Blade instant dash & pierce</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-teal-400">👁️</span> Kamui localized gravity black hole pull</p>
                <p className="flex items-center gap-2 text-[11px]"><span className="text-teal-400">⚡</span> Balanced speed, heavy skill scaling, and control</p>
              </div>
            </div>
            {selectedChar === 'Kakashi' ? (
              <span className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black font-mono text-xs rounded-lg text-center uppercase tracking-widest mt-2 border border-teal-300 shadow-md">
                ✓ HERO SELECTED
              </span>
            ) : (
              <span className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-teal-400 border border-teal-500/30 font-bold font-mono text-xs rounded-lg text-center uppercase tracking-wider mt-2 transition-colors">
                TAP TO CHOOSE HERO
              </span>
            )}
          </button>
        </div>
      )}

      {/* TAB 2: STAGES SELECTION (Immersive Mission Board) */}
      {activeTab === 'STAGE_SELECT' && (
        <div className="bg-slate-950/90 border-2 border-amber-500/30 rounded-2xl p-6 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent)]" />
          <div className="border-b-2 border-amber-500/20 pb-3 mb-1">
            <h3 className="text-lg font-black font-mono text-amber-400 uppercase tracking-widest">CHOOSE AN EXPEDITION REGION</h3>
            <p className="text-xs text-slate-400 mt-1">Each region yields Gold, XP, and critical blacksmith materials like Iron and Dragon Fire Cores.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stages.map(stage => {
              const isLocked = stage.id > playerState.stagesUnlocked;

              return (
                <div
                  key={stage.id}
                  className={`border-2 rounded-xl p-5 flex flex-col justify-between gap-4 relative transition-all ${
                    isLocked
                      ? 'bg-slate-950/40 border-slate-900 select-none opacity-30'
                      : 'bg-gradient-to-b from-slate-900 to-slate-950 border-amber-600/10 hover:border-amber-500/60 hover:shadow-[0_4px_20px_rgba(245,158,11,0.1)]'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2.5 z-10 font-mono">
                      <Lock size={24} className="text-rose-500 animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-300">LOCKED EXPEDITION</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Clear previous stage to unlock</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black font-mono text-white tracking-wider uppercase">
                          STAGE {stage.id}: {stage.name}
                        </h4>
                        <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-black font-mono mt-1.5 px-2 py-0.5 rounded uppercase tracking-wide">
                          DIFFICULTY: {stage.difficulty}
                        </span>
                      </div>
                      <span className="bg-slate-950 text-[10px] text-amber-300 border-2 border-amber-500/20 px-2.5 py-1 rounded font-mono font-black shadow-inner">
                        REC. LV {stage.recommendLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic font-serif leading-relaxed">"{stage.description}"</p>
                    
                    {stage.bossType && (
                      <div className="flex items-center gap-2 bg-rose-950/30 border-2 border-rose-500/20 px-3 py-1.5 rounded-lg w-fit animate-pulse">
                        <span className="text-rose-500 text-xs">💀</span>
                        <span className="text-rose-400 text-[9px] font-black font-mono uppercase tracking-widest">
                          BOSS ASSAULT: {stage.bossType}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isLocked && (
                    <button
                      onClick={() => {
                        playSound('slash');
                        onStartStage(stage.id);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black font-mono text-xs rounded-xl uppercase tracking-widest transition-all mt-2 cursor-pointer flex items-center justify-center gap-2 border border-amber-300 shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
                    >
                      ⚔️ DEPLOY EXPEDITION
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TUTORIAL / HOW TO PLAY */}
      {activeTab === 'TUTORIAL' && (
        <div className="bg-slate-950/90 border-2 border-amber-500/30 rounded-2xl p-6 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent)]" />
          <div className="border-b-2 border-amber-500/20 pb-3 flex items-center gap-2.5">
            <HelpCircle className="text-amber-400 animate-pulse" size={22} />
            <h3 className="text-lg font-black font-mono text-white uppercase tracking-widest">BATTLE SYSTEM GUIDE</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div className="space-y-4">
              <h4 className="font-black font-mono text-amber-400 uppercase tracking-wider border-b border-slate-900 pb-1.5 flex items-center gap-1.5 text-xs">
                🎮 GAMEPLAY & TOUCH CONTROLS
              </h4>
              <p className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 font-mono">
                <span>Move Character:</span>
                <span className="text-amber-400 font-bold">TAP/TOUCH SCREEN</span>
              </p>
              <p className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 font-mono">
                <span>Normal Attack:</span>
                <span className="text-white font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">J Key or Tap Sword HUD</span>
              </p>
              <p className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 font-mono">
                <span>Active Skill 1:</span>
                <span className="text-white font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">K Key or Tap Skill HUD</span>
              </p>
              <p className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 font-mono">
                <span>Active Skill 2:</span>
                <span className="text-white font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">L Key or Tap Skill HUD</span>
              </p>
              <p className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 font-mono">
                <span>Active Skill 3:</span>
                <span className="text-white font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">I Key or Tap Skill HUD</span>
              </p>
              <p className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 font-mono">
                <span>Ultimate Spell:</span>
                <span className="text-white font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">O Key or Tap Skill HUD</span>
              </p>
              <p className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 font-mono">
                <span>Dodge/Roll (Invulnerable):</span>
                <span className="text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-amber-500/20">Spacebar or Tap Wing HUD</span>
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-black font-mono text-amber-400 uppercase tracking-wider border-b border-slate-900 pb-1.5 flex items-center gap-1.5 text-xs">
                📜 SHINOBI EXPEDITIONS RULES
              </h4>
              <p className="leading-relaxed">
                1. **Attributes Allocation**: Each level gives you +5 Attribute points. Allocate STR to physical, INT to elemental magic, VIT to survive elite boss fights, and DEX for critical hits.
              </p>
              <p className="leading-relaxed">
                2. **Skills Upgrading**: Level up your skills using Skill Points gained from leveling. Cooldowns are reset automatically when embarking on expeditions.
              </p>
              <p className="leading-relaxed">
                3. **Blacksmith and Shop**: Gather Iron ores and rare dragon core crystals from vanquishing bosses. Forge elite legendary gear and load up on HP potions!
              </p>
              <p className="leading-relaxed">
                4. **Boss Indicators**: Red warning areas indicate high-damage attacks! Use **Dodge/Roll (Space)** immediately to pass through damage cleanly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
