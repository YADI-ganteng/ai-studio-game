import { useState } from 'react';
import { Sparkles, Coins, Check, Zap, Lock, Shield, UserCheck } from 'lucide-react';
import { PlayerState } from '../types';
import { playSound } from '../utils/audio';

interface SummonSanctuaryProps {
  playerState: PlayerState;
  setPlayerState: (state: PlayerState | ((prev: PlayerState) => PlayerState)) => void;
}

export const PETS_DATABASE = [
  {
    id: 'pakun',
    name: 'Pakkon Pug',
    icon: '🐕',
    bonusType: 'DEX (Dexterity)',
    bonusKey: 'dex' as const,
    bonusValue: 20,
    color: 'from-amber-500 to-yellow-600',
    description: 'Cute ninja pug of Kakashi. Grants +20 Dexterity and periodically barks to stun/shock surrounding enemies.',
    cost: 1500,
    gemsCost: 10,
  },
  {
    id: 'kurama',
    name: 'Kurama Mini',
    icon: '🦊',
    bonusType: 'STR (Strength)',
    bonusKey: 'str' as const,
    bonusValue: 25,
    color: 'from-orange-500 to-red-600',
    description: 'Chibi Nine-Tails Fox. Grants +25 Strength and periodically shoots red homing fireballs at nearest enemies.',
    cost: 4000,
    gemsCost: 30,
  },
  {
    id: 'katsuyu',
    name: 'Katsuyu Slug',
    icon: '🐌',
    bonusType: 'VIT (Vitality)',
    bonusKey: 'vit' as const,
    bonusValue: 30,
    color: 'from-emerald-400 to-teal-600',
    description: 'Miniature Lady Katsuyu. Grants +30 Vitality and periodically sprays medical dew to heal you by +15 HP.',
    cost: 2800,
    gemsCost: 20,
  },
  {
    id: 'aoda',
    name: 'Aoda Snake',
    icon: '🐍',
    bonusType: 'INT (Intelligence)',
    bonusKey: 'int' as const,
    bonusValue: 25,
    color: 'from-blue-500 to-indigo-600',
    description: 'Aoda ninja summon serpent. Grants +25 Intelligence and periodically shoots blue plasma chakra bullets.',
    cost: 2200,
    gemsCost: 15,
  },
  {
    id: 'tiger',
    name: 'Tora Tiger',
    icon: '🐯',
    bonusType: 'STR (Strength)',
    bonusKey: 'str' as const,
    bonusValue: 35,
    color: 'from-amber-600 to-red-600 border-amber-500/30',
    description: 'Tora Tiger / Macan Purba. Grants +35 Strength and periodically slashes nearest enemies with claw shockwaves.',
    cost: 3500,
    gemsCost: 25,
  },
  {
    id: 'eagle',
    name: 'Garuda Eagle',
    icon: '🦅',
    bonusType: 'DEX (Dexterity)',
    bonusKey: 'dex' as const,
    bonusValue: 30,
    color: 'from-sky-400 to-blue-500 border-sky-400/30',
    description: 'Garuda Eagle / Elang Perkasa. Grants +30 Dexterity and periodically summons a gale feather storm that damages enemies.',
    cost: 3200,
    gemsCost: 20,
  },
  {
    id: 'monkey',
    name: 'Enma Monkey',
    icon: '🐒',
    bonusType: 'VIT (Vitality)',
    bonusKey: 'vit' as const,
    bonusValue: 35,
    color: 'from-yellow-700 to-amber-900 border-yellow-600/30',
    description: 'Enma Monkey / Kera Sakti. Grants +35 Vitality and periodically strikes surrounding enemies with an expanding staff wave.',
    cost: 4500,
    gemsCost: 35,
  }
];

export const COMPANIONS_DATABASE = [
  {
    id: 'friend_sasuke',
    name: 'Uchiha Sasuke',
    icon: '⚡',
    role: 'DPS / Piercing Attacker',
    levelRequired: 4,
    description: 'Channels high-frequency Chidori bolts. Slashes through enemies and attacks rapidly.',
    cost: 3000,
    gemsCost: 25,
    color: 'from-purple-500 to-indigo-700',
  },
  {
    id: 'friend_sakura',
    name: 'Haruno Sakura',
    icon: '🌸',
    role: 'Healer / Melee Tank',
    levelRequired: 2,
    description: 'Slam craters into ground, stunning enemies. Periodically triggers green healing auras to restore your HP!',
    cost: 2000,
    gemsCost: 15,
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 'friend_kakashi',
    name: 'Hatake Kakashi',
    icon: '👁️',
    role: 'Elite Crowd Controller',
    levelRequired: 6,
    description: 'Summons shockwaves and multiple lighting zaps. Diverts enemy attention, taking bullets for you.',
    cost: 5000,
    gemsCost: 40,
    color: 'from-teal-500 to-cyan-600',
  }
];

export default function SummonSanctuary({ playerState, setPlayerState }: SummonSanctuaryProps) {
  const [activeSubTab, setActiveSubTab] = useState<'PETS' | 'COMPANIONS'>('PETS');

  const unlockedPets = playerState.unlockedPetIds || ['none'];
  const unlockedCompanions = playerState.unlockedCompanionIds || [];
  const selectedPetId = playerState.selectedPetId || 'none';

  const handleBuyPet = (petId: string, goldCost: number, gemsCost: number) => {
    if (playerState.gold < goldCost || playerState.gems < gemsCost) {
      playSound('hurt');
      return;
    }

    playSound('levelup');
    setPlayerState(prev => {
      const currentUnlocked = prev.unlockedPetIds || ['none'];
      return {
        ...prev,
        gold: prev.gold - goldCost,
        gems: prev.gems - gemsCost,
        unlockedPetIds: [...currentUnlocked, petId],
        selectedPetId: petId, // auto-equip on purchase
      };
    });
  };

  const handleEquipPet = (petId: string) => {
    playSound('slash');
    setPlayerState(prev => ({
      ...prev,
      selectedPetId: petId,
    }));
  };

  const handleBuyCompanion = (compId: string, goldCost: number, gemsCost: number) => {
    if (playerState.gold < goldCost || playerState.gems < gemsCost) {
      playSound('hurt');
      return;
    }

    playSound('levelup');
    setPlayerState(prev => {
      const currentUnlocked = prev.unlockedCompanionIds || [];
      return {
        ...prev,
        gold: prev.gold - goldCost,
        gems: prev.gems - gemsCost,
        unlockedCompanionIds: [...currentUnlocked, compId],
      };
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div className="space-y-1">
          <h2 className="text-xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-wider">
            📜 SUMMON SANCTUARY (KUIL KONTRAK)
          </h2>
          <p className="text-xs text-slate-400">
            Contract spiritual pets to gain static attributes and active support in battle. Unlock companion friends to spawn during expeditions!
          </p>
        </div>
        
        {/* Currencies Pill */}
        <div className="flex gap-2.5 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono">
          <span className="text-amber-400 font-bold flex items-center gap-1">
            🪙 {playerState.gold.toLocaleString()}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-fuchsia-400 font-bold flex items-center gap-1">
            💎 {playerState.gems}
          </span>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => { playSound('slash'); setActiveSubTab('PETS'); }}
          className={`px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider rounded-t-xl transition-all ${
            activeSubTab === 'PETS'
              ? 'bg-slate-800/80 border-t-2 border-amber-500 text-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🐾 HEWAN KONTRAK (PETS)
        </button>
        <button
          onClick={() => { playSound('slash'); setActiveSubTab('COMPANIONS'); }}
          className={`px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider rounded-t-xl transition-all ${
            activeSubTab === 'COMPANIONS'
              ? 'bg-slate-800/80 border-t-2 border-amber-500 text-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          👥 TEMAN COMBAT (ALLIES)
        </button>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'PETS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PETS_DATABASE.map(pet => {
            const isUnlocked = unlockedPets.includes(pet.id);
            const isActive = selectedPetId === pet.id;
            const canAfford = playerState.gold >= pet.cost && playerState.gems >= pet.gemsCost;

            return (
              <div
                key={pet.id}
                className={`bg-slate-950 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:border-slate-700 relative overflow-hidden ${
                  isActive ? 'ring-2 ring-amber-500 border-amber-500/50' : 'border-slate-800/60'
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[8px] font-black font-mono px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    ACTIVE ✓
                  </div>
                )}

                <div className="flex gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${pet.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/10`}>
                    {pet.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-md font-bold font-mono text-white flex items-center gap-2">
                      {pet.name}
                    </h3>
                    <p className="text-[10px] text-amber-400 font-semibold font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 inline-block">
                      PASIF: +{pet.bonusValue} {pet.bonusType}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                  {pet.description}
                </p>

                <div className="border-t border-slate-900 pt-3 flex justify-between items-center mt-2">
                  {!isUnlocked ? (
                    <div className="flex items-center gap-3 w-full justify-between">
                      <div className="flex flex-col text-[10px] font-mono text-slate-400">
                        <span>Harga Kontrak:</span>
                        <span className="text-sm font-bold text-amber-400 mt-0.5 flex items-center gap-1">
                          🪙 {pet.cost.toLocaleString()} <span className="text-xs text-slate-500">+</span> 💎 {pet.gemsCost}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBuyPet(pet.id, pet.cost, pet.gemsCost)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black hover:scale-105 active:scale-95'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        Mulai Kontrak
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex justify-end">
                      {isActive ? (
                        <button
                          disabled
                          className="w-full py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 font-mono font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <Check size={14} /> HEWAN KONTRAK AKTIF
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEquipPet(pet.id)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl text-amber-400 font-mono font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                        >
                          ✨ PANGGIL HEWAN KONTRAK
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Base Shadow Clone Info card */}
          <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-slate-800 text-slate-400">
                👥
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-md font-extrabold font-mono text-slate-300">
                  Shadow Clone Jutsu
                </h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">
                  Default Battle Summon • Unlocked
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed text-left">
              Summon a basic shadow clone in battle anytime for <span className="text-sky-400 font-bold">40 MP</span>. Shadow clones run towards mobs and execute melee strikes. Always ready!
            </p>

            <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs text-slate-400 font-mono mt-2">
              <span>Biaya Summon: 40 Chakra MP</span>
              <span className="text-emerald-400 font-bold uppercase text-[10px]">ALWAYS READY ✓</span>
            </div>
          </div>

          {COMPANIONS_DATABASE.map(comp => {
            const isUnlocked = unlockedCompanions.includes(comp.id);
            const isLevelLocked = playerState.level < comp.levelRequired;
            const canAfford = playerState.gold >= comp.cost && playerState.gems >= comp.gemsCost;

            return (
              <div
                key={comp.id}
                className={`bg-slate-950 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:border-slate-700 relative overflow-hidden ${
                  isUnlocked ? 'border-indigo-500/30' : 'border-slate-800/60'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${comp.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/10`}>
                    {comp.icon}
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="text-md font-bold font-mono text-white flex items-center gap-1.5">
                      {comp.name}
                    </h3>
                    <p className="text-[9px] text-indigo-400 font-semibold font-mono tracking-wider uppercase">
                      {comp.role}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[48px] text-left">
                  {comp.description}
                </p>

                <div className="border-t border-slate-900 pt-3 flex justify-between items-center mt-2">
                  {isLevelLocked ? (
                    <div className="w-full py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 font-mono font-bold text-[10px] flex items-center justify-center gap-1.5">
                      <Lock size={12} /> TERKUNCI (BUTUH LEVEL {comp.levelRequired})
                    </div>
                  ) : !isUnlocked ? (
                    <div className="flex items-center gap-3 w-full justify-between">
                      <div className="flex flex-col text-[10px] font-mono text-slate-400 text-left">
                        <span>Biaya Rekrut:</span>
                        <span className="text-sm font-bold text-amber-400 mt-0.5 flex items-center gap-1">
                          🪙 {comp.cost.toLocaleString()} <span className="text-xs text-slate-500">+</span> 💎 {comp.gemsCost}
                        </span>
                      </div>
                      <button
                        onClick={() => handleBuyCompanion(comp.id, comp.cost, comp.gemsCost)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:scale-105 active:scale-95'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        Rekrut Teman
                      </button>
                    </div>
                  ) : (
                    <div className="w-full py-2 bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs font-mono font-extrabold flex items-center justify-center gap-1.5 uppercase">
                      <UserCheck size={14} /> SIAP DIPANGGIL DI COMBAT (40 MP)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
