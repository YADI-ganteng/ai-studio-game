import { useState, useEffect } from 'react';
import { Sword, RotateCcw, Award, Play, AlertTriangle, ShieldCheck, Heart, Zap, Coffee, ArrowLeft } from 'lucide-react';
import { PlayerState, Item, Skill } from '../types';
import { playSound } from '../utils/audio';

interface GameUIProps {
  playerState: PlayerState;
  setPlayerState: (state: PlayerState | ((prev: PlayerState) => PlayerState)) => void;
  stageName: string;
  onUseSkill: (skillId: string) => void;
  onDodge: () => void;
  onPotionUse: (type: 'HP' | 'MP') => void;
  onAttack: () => void;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  isGameOver: boolean;
  isVictory: boolean;
  onExit: () => void;
  onRetry: () => void;
  victoryGold: number;
  victoryGems: number;
  victoryXP: number;
  victoryDrops: Array<{ name: string; qty: number; icon: string }>;
  isRolling: boolean;
  currentWave: number;
  maxWaves: number;
  onNextLevel?: () => void;
  hasNextLevel: boolean;
  onSpawnCompanion?: (companionId: string) => void;
  companionCooldown: number;
  activeAlliesCount: number;
}

export default function GameUI({
  playerState,
  setPlayerState,
  stageName,
  onUseSkill,
  onDodge,
  onPotionUse,
  onAttack,
  isPaused,
  setIsPaused,
  isGameOver,
  isVictory,
  onExit,
  onRetry,
  victoryGold,
  victoryGems,
  victoryXP,
  victoryDrops,
  isRolling,
  currentWave,
  maxWaves,
  onNextLevel,
  hasNextLevel,
  onSpawnCompanion,
  companionCooldown,
  activeAlliesCount,
}: GameUIProps) {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Character theme color preset maps for skill visual hotbar
  const classColors: Record<string, { border: string; text: string; bg: string; shadow: string; glow: string; badge: string }> = {
    Naruto: {
      border: 'border-orange-500/60 hover:border-orange-400',
      text: 'text-orange-400',
      bg: 'bg-orange-950/20',
      shadow: 'shadow-orange-500/20',
      glow: 'shadow-[0_0_10px_rgba(249,115,22,0.55)] animate-pulse',
      badge: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    },
    Sasuke: {
      border: 'border-purple-500/60 hover:border-purple-400',
      text: 'text-purple-400',
      bg: 'bg-purple-950/20',
      shadow: 'shadow-purple-500/20',
      glow: 'shadow-[0_0_10px_rgba(168,85,247,0.55)] animate-pulse',
      badge: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    },
    Sakura: {
      border: 'border-pink-500/60 hover:border-pink-400',
      text: 'text-pink-400',
      bg: 'bg-pink-950/20',
      shadow: 'shadow-pink-500/20',
      glow: 'shadow-[0_0_10px_rgba(236,72,153,0.55)] animate-pulse',
      badge: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
    },
    Kakashi: {
      border: 'border-cyan-500/60 hover:border-cyan-400',
      text: 'text-cyan-400',
      bg: 'bg-cyan-950/20',
      shadow: 'shadow-cyan-500/20',
      glow: 'shadow-[0_0_10px_rgba(6,182,212,0.55)] animate-pulse',
      badge: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    }
  };

  const theme = classColors[playerState.classType] || classColors.Naruto;

  // HP and MP stats calculation based on current equipment
  const getCalculatedMaxes = () => {
    const attr = playerState.attributes;
    let hpMax = 200 + playerState.level * 40 + attr.vit * 10;
    let mpMax = 100 + playerState.level * 15 + attr.int * 4;

    Object.values(playerState.equipped).forEach(item => {
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

  const { hpMax, mpMax } = getCalculatedMaxes();

  const hpCount = playerState.inventory.find(i => i.name === 'HP Potion')?.quantity || 0;
  const mpCount = playerState.inventory.find(i => i.name === 'MP Potion')?.quantity || 0;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-2.5 font-sans select-none animate-fade-in">
      {/* Top Bar: HUD, Wave Tracker, Pause, Stage status */}
      <div className="flex justify-between items-start w-full pointer-events-auto gap-2">
        {/* HP / MP Player HUD - COMPACT & MINI */}
        <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 p-1.5 rounded-lg backdrop-blur-sm shadow-md max-w-[210px]">
          <div className="w-7 h-7 bg-indigo-950 border border-indigo-500/40 rounded flex items-center justify-center text-xs font-black font-mono text-indigo-400" title="Level">
            {playerState.level}
          </div>
          <div className="flex-1 space-y-1 font-mono text-[9px] min-w-[125px]">
            {/* HP */}
            <div>
              <div className="flex justify-between text-white leading-none mb-0.5 font-bold">
                <span className="text-rose-400 text-[8px] font-extrabold uppercase tracking-wide">❤️ HP</span>
                <span>{Math.max(0, Math.floor(playerState.hp))} / {hpMax}</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden border border-slate-950">
                <div
                  className="bg-gradient-to-r from-red-600 to-rose-500 h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, (playerState.hp / hpMax) * 100)}%` }}
                />
              </div>
            </div>

            {/* MP */}
            <div>
              <div className="flex justify-between text-white leading-none mb-0.5 font-bold">
                <span className="text-sky-400 text-[8px] font-extrabold uppercase tracking-wide">💧 MP</span>
                <span>{Math.max(0, Math.floor(playerState.mp))} / {mpMax}</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden border border-slate-950">
                <div
                  className="bg-gradient-to-r from-sky-600 to-blue-500 h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, (playerState.mp / mpMax) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wave Status HUD badge in top center - MINI DESKTOP/MOBILE PILLED */}
        <div className="bg-slate-950/95 border-2 border-slate-800/80 px-4 py-1.5 rounded-full text-center backdrop-blur-md shadow-lg flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse border border-red-400" />
          <p className="text-[10px] font-black font-mono tracking-widest text-slate-100 uppercase">
            WAVE <span className="text-amber-400 text-xs font-black">{currentWave}</span> / <span className="text-slate-400 font-bold">{maxWaves}</span>
          </p>
        </div>

        {/* Right side: Stage status & pause */}
        <div className="flex gap-1.5 items-center">
          {/* Stage Status Box - MINI */}
          <div className="bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded-lg text-center backdrop-blur-sm shadow-sm">
            <p className="text-[7px] font-mono text-slate-400 uppercase tracking-widest leading-none">STAGE</p>
            <p className="text-[10px] font-bold text-amber-400 font-mono mt-0.5 uppercase tracking-wide">{stageName}</p>
          </div>

          {/* Pause controller button - MINI */}
          <button
            onClick={() => {
              playSound('slash');
              setIsPaused(!isPaused);
            }}
            className="px-2.5 py-1.5 bg-slate-950/90 border border-slate-800 hover:border-slate-600 text-white hover:text-yellow-400 rounded-lg cursor-pointer pointer-events-auto backdrop-blur-sm text-[10px] font-mono font-bold transition-all"
          >
            {isPaused ? '▶️ PLAY' : '⏸️ PAUSE'}
          </button>
        </div>
      </div>

      {/* Middle Alerts overlays (Hurt state, Invulnerability status) */}
      <div className="flex flex-col items-center justify-center gap-1.5 max-w-sm mx-auto text-center">
        {playerState.isAdmin && (
          <span className="bg-emerald-950/90 border border-emerald-500 text-emerald-400 text-[8px] font-mono font-extrabold px-3 py-0.5 rounded-full animate-pulse shadow-md">
            🛡️ ADMIN CONSOLE: IMMORTALITY ACTIVATED
          </span>
        )}
        {isRolling && (
          <span className="bg-amber-950/90 border border-amber-500 text-amber-300 text-[8px] font-mono font-extrabold px-2.5 py-0.5 rounded-full animate-ping">
            💨 DODGING (INVULNERABLE)
          </span>
        )}
      </div>

      {/* Bottom Bar: Potions, Actions buttons, Mobile Controller */}
      <div className="flex justify-between items-end w-full">
        {/* Quick potions block - COMPACT HORIZONTAL LAYOUT */}
        <div className="flex gap-1.5 pointer-events-auto">
          {/* Quick slot HP Potion */}
          <button
            onClick={() => onPotionUse('HP')}
            disabled={hpCount <= 0 || playerState.hp >= hpMax}
            className={`flex items-center gap-1 px-2 py-1 border rounded-lg backdrop-blur-sm transition-all text-[9px] font-mono font-extrabold cursor-pointer h-7 ${
              hpCount > 0 && playerState.hp < hpMax
                ? 'bg-rose-950/90 border-rose-500/60 text-rose-300 hover:scale-105'
                : 'bg-slate-950/80 border-slate-800/60 text-slate-500'
            }`}
          >
            <span className="text-xs">🧪</span>
            <span>HP ({hpCount})</span>
          </button>

          {/* Quick slot MP Potion */}
          <button
            onClick={() => onPotionUse('MP')}
            disabled={mpCount <= 0 || playerState.mp >= mpMax}
            className={`flex items-center gap-1 px-2 py-1 border rounded-lg backdrop-blur-sm transition-all text-[9px] font-mono font-extrabold cursor-pointer h-7 ${
              mpCount > 0 && playerState.mp < mpMax
                ? 'bg-sky-950/90 border-sky-500/60 text-sky-300 hover:scale-105'
                : 'bg-slate-950/80 border-slate-800/60 text-slate-500'
            }`}
          >
            <span className="text-xs">💧</span>
            <span>MP ({mpCount})</span>
          </button>
        </div>

        {/* Action Controls Panel - COMPACT & TIDY */}
        <div className="flex flex-col gap-2 pointer-events-auto items-end bg-slate-950/40 p-2 rounded-xl border border-white/5 backdrop-blur-[1px]">
          {/* Top Row: Skills slots */}
          <div className="flex gap-1.5">
            {playerState.skills.map(skill => {
              const isUnlocked = playerState.level >= skill.unlockedAt;
              const hasMana = playerState.mp >= skill.manaCost;
              const isOnCd = skill.currentCooldown > 0;
              const activeUse = isUnlocked && !isOnCd && hasMana;

              let btnStyle = 'bg-slate-950/90 border-slate-800 text-slate-600';
              if (activeUse) {
                btnStyle = `${theme.bg} ${theme.border} ${theme.text} ${theme.glow} hover:scale-105 border-2 hover:border-white cursor-pointer`;
              } else if (isUnlocked && isOnCd) {
                btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-500';
              } else if (isUnlocked && !hasMana) {
                btnStyle = 'bg-slate-950 border-sky-950/40 text-sky-700/60';
              }

              return (
                <button
                  key={skill.id}
                  disabled={!activeUse}
                  onClick={() => onUseSkill(skill.id)}
                  title={`${skill.name} - ${skill.description}`}
                  className={`w-10 h-10 rounded-lg border font-mono font-bold flex flex-col items-center justify-center relative transition-all shadow-md duration-200 ${btnStyle}`}
                >
                  <span className="text-lg">{skill.icon}</span>
                  {isOnCd ? (
                    <span className="absolute inset-0 bg-slate-950/90 rounded-lg flex items-center justify-center text-[10px] font-black text-amber-400 font-mono">
                      {Math.ceil(skill.currentCooldown)}s
                    </span>
                  ) : (
                    !hasMana && isUnlocked && (
                      <span className="absolute bottom-0 text-[6px] text-sky-400 bg-sky-950 px-1 rounded-t border-t border-sky-500 font-black">
                        MP
                      </span>
                    )
                  )}
                  {!isUnlocked && (
                    <span className="absolute inset-0 bg-slate-950/85 rounded-lg flex items-center justify-center text-[7px] text-slate-500 font-bold leading-tight text-center p-0.5">
                      LV.{skill.unlockedAt}
                    </span>
                  )}
                  
                  {/* Subtle active border glow indicator */}
                  {activeUse && (
                    <span className="absolute -inset-0.5 rounded-lg border border-white/20 animate-ping opacity-25 pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Row: Attack + Roll + Companion Summon Quickbar */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Companion Summon Quickbar */}
            <div className="flex gap-1 items-center bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800/80">
              <span className="text-[8px] font-black font-mono text-amber-400 uppercase tracking-wider select-none">
                {companionCooldown > 0 
                  ? `CD: ${Math.ceil(companionCooldown)}s` 
                  : activeAlliesCount >= 1 
                    ? "LIMIT 1 ACTIVE" 
                    : "SUMMON (40 MP):"}
              </span>
              
              {/* Shadow Clone - always available */}
              <button
                onClick={() => onSpawnCompanion?.('shadow_clone')}
                disabled={(playerState.mp < 40 && !playerState.isAdmin) || companionCooldown > 0 || activeAlliesCount >= 1}
                className={`px-2 py-0.5 rounded text-[8px] font-extrabold font-mono transition-all flex items-center gap-0.5 cursor-pointer hover:scale-105 active:scale-95 ${
                  (playerState.mp >= 40 || playerState.isAdmin) && companionCooldown <= 0 && activeAlliesCount < 1
                    ? 'bg-orange-600 hover:bg-orange-500 text-white'
                    : 'bg-slate-900/60 text-slate-500 border border-slate-800/40 opacity-70'
                }`}
                title="Summon Shadow Clone (Costs 40 MP)"
              >
                👥 CLONE
              </button>

              {/* Unlocked companions */}
              {playerState.unlockedCompanionIds?.includes('friend_sasuke') && (
                <button
                  onClick={() => onSpawnCompanion?.('friend_sasuke')}
                  disabled={(playerState.mp < 40 && !playerState.isAdmin) || companionCooldown > 0 || activeAlliesCount >= 1}
                  className={`px-2 py-0.5 rounded text-[8px] font-extrabold font-mono transition-all flex items-center gap-0.5 cursor-pointer hover:scale-105 active:scale-95 ${
                    (playerState.mp >= 40 || playerState.isAdmin) && companionCooldown <= 0 && activeAlliesCount < 1
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800/40 opacity-70'
                  }`}
                  title="Summon Sasuke (Costs 40 MP)"
                >
                  ⚡ SASUKE
                </button>
              )}

              {playerState.unlockedCompanionIds?.includes('friend_sakura') && (
                <button
                  onClick={() => onSpawnCompanion?.('friend_sakura')}
                  disabled={(playerState.mp < 40 && !playerState.isAdmin) || companionCooldown > 0 || activeAlliesCount >= 1}
                  className={`px-2 py-0.5 rounded text-[8px] font-extrabold font-mono transition-all flex items-center gap-0.5 cursor-pointer hover:scale-105 active:scale-95 ${
                    (playerState.mp >= 40 || playerState.isAdmin) && companionCooldown <= 0 && activeAlliesCount < 1
                      ? 'bg-pink-600 hover:bg-pink-500 text-white'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800/40 opacity-70'
                  }`}
                  title="Summon Sakura (Costs 40 MP)"
                >
                  🌸 SAKURA
                </button>
              )}

              {playerState.unlockedCompanionIds?.includes('friend_kakashi') && (
                <button
                  onClick={() => onSpawnCompanion?.('friend_kakashi')}
                  disabled={(playerState.mp < 40 && !playerState.isAdmin) || companionCooldown > 0 || activeAlliesCount >= 1}
                  className={`px-2 py-0.5 rounded text-[8px] font-extrabold font-mono transition-all flex items-center gap-0.5 cursor-pointer hover:scale-105 active:scale-95 ${
                    (playerState.mp >= 40 || playerState.isAdmin) && companionCooldown <= 0 && activeAlliesCount < 1
                      ? 'bg-teal-600 hover:bg-teal-500 text-white'
                      : 'bg-slate-900/60 text-slate-500 border border-slate-800/40 opacity-70'
                  }`}
                  title="Summon Kakashi (Costs 40 MP)"
                >
                  👁️ KAKASHI
                </button>
              )}
            </div>

            {/* Dodge button */}
            <button
              onClick={onDodge}
              disabled={isRolling}
              className="px-3 py-1.5 bg-slate-900 border border-amber-500/60 hover:border-white text-amber-400 hover:text-white rounded-lg text-[10px] font-bold font-mono tracking-wide cursor-pointer flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              🏃 ROLL
            </button>

            {/* Sword slash normal attack trigger */}
            <button
              onClick={onAttack}
              className="px-4.5 py-1.5 bg-gradient-to-r from-red-500 to-yellow-600 text-slate-950 font-black font-mono text-xs tracking-wider rounded-lg hover:brightness-110 shadow-md active:scale-95 transition-transform cursor-pointer flex items-center gap-1 border border-red-400"
            >
              ⚔️ ATTACK
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY 1: GAME OVER PAUSE SCREEN */}
      {isPaused && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto animate-fade-in">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 text-slate-100 max-w-sm w-full text-center flex flex-col gap-4 shadow-2xl">
            <h3 className="text-2xl font-extrabold font-mono text-amber-400 uppercase tracking-widest">GAME PAUSED</h3>
            <p className="text-xs text-slate-400 font-mono">BATTLE EXPEDITION TEMPORARILY SUSPENDED</p>

            <button
              onClick={() => {
                playSound('slash');
                setIsPaused(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold font-mono tracking-wider rounded-lg text-xs uppercase cursor-pointer transition-all"
            >
              RESUME EXPEDITION
            </button>

            <button
              onClick={onRetry}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold font-mono tracking-wider rounded-lg text-xs uppercase cursor-pointer transition-all"
            >
              RESTART LEVEL
            </button>

            <button
              onClick={onExit}
              className="w-full py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 font-mono border border-rose-900 rounded-lg text-xs font-bold cursor-pointer uppercase transition-all"
            >
              ABANDON AND RETREAT
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY 2: GAME OVER SCREEN */}
      {isGameOver && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto animate-fade-in">
          <div className="bg-slate-900 border-2 border-red-500 rounded-2xl p-6 text-slate-100 max-w-sm w-full text-center flex flex-col gap-4 shadow-2xl">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 w-16 h-16 flex items-center justify-center mx-auto animate-pulse text-4xl">
              💀
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-red-500 uppercase tracking-widest">HERO FELL</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">YOUR HEALTH REACHED ZERO POINTS</p>
            </div>

            <p className="text-xs text-slate-400 italic">
              "Gather stat attributes, upgrade skills, and forge sturdier plate armor at the blacksmith to withstand boss strikes."
            </p>

            <button
              onClick={onRetry}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold font-mono tracking-wider rounded-lg text-xs uppercase cursor-pointer transition-all"
            >
              ⚔️ DEPLOY EXPEDITION AGAIN
            </button>

            <button
              onClick={onExit}
              className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 font-mono rounded-lg text-xs font-bold cursor-pointer uppercase transition-all"
            >
              RETREAT TO TOWN
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY 3: VICTORY SCREEN */}
      {isVictory && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 pointer-events-auto animate-fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-6 text-slate-100 max-w-md w-full text-center flex flex-col gap-4 shadow-2xl">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 w-16 h-16 flex items-center justify-center mx-auto text-4xl">
              🏆
            </div>
            <div>
              <h3 className="text-2xl font-extrabold font-mono text-emerald-400 uppercase tracking-widest leading-none">EXPEDITION CLEAR</h3>
              <p className="text-[10px] text-amber-400 font-mono tracking-wide uppercase mt-1.5 font-bold">
                BERHASIL SELESAIKAN SEMUA {maxWaves} WAVE MUSUH! ✓
              </p>
            </div>

            {/* EXPEDITION LOOT SECTION */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3 font-mono text-xs text-left">
              <p className="font-bold border-b border-slate-900 pb-1 text-slate-400 text-[10px] uppercase tracking-wider">Rewards Received</p>
              
              <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded">
                <span className="text-slate-400">🪙 Gold Loot:</span>
                <span className="text-amber-400 font-extrabold">+{victoryGold}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded">
                <span className="text-slate-400">💎 Gem Crystals:</span>
                <span className="text-fuchsia-400 font-extrabold">+{victoryGems}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded">
                <span className="text-slate-400">✨ Experience XP:</span>
                <span className="text-emerald-400 font-extrabold">+{victoryXP}</span>
              </div>

              {victoryDrops.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[9px] text-slate-500 uppercase">Material Items Discovered:</p>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    {victoryDrops.map((drop, idx) => (
                      <span key={idx} className="bg-indigo-950/40 text-indigo-300 border border-indigo-500/10 px-2 py-1 rounded flex items-center gap-1.5">
                        {drop.icon} {drop.name} ({drop.qty}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons Row */}
            <div className="flex flex-col gap-2 w-full">
              {hasNextLevel && onNextLevel && (
                <button
                  onClick={() => {
                    playSound('victory');
                    onNextLevel();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black font-mono tracking-wider rounded-lg text-xs uppercase cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 scale-105 hover:scale-108 active:scale-95 duration-150 animate-pulse border-2 border-yellow-300"
                >
                  🔥 NEXT STAGE (LANJUT LEVEL) ➔
                </button>
              )}

              <button
                onClick={onExit}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-mono rounded-lg text-xs font-bold cursor-pointer uppercase transition-all flex items-center justify-center gap-2 duration-150"
              >
                ✓ RETURN TO TOWN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
