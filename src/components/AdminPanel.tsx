import { useState } from 'react';
import { ShieldAlert, ShieldCheck, Key, RefreshCw, Sparkles, Coins, Gem, Plus, Trash2, ArrowUpCircle } from 'lucide-react';
import { PlayerState, Item, Skill } from '../types';
import { playSound } from '../utils/audio';

interface AdminPanelProps {
  playerState: PlayerState;
  setPlayerState: (state: PlayerState | ((prev: PlayerState) => PlayerState)) => void;
  onClose: () => void;
}

export default function AdminPanel({ playerState, setPlayerState, onClose }: AdminPanelProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(playerState.isAdmin);

  // Stats controls
  const [goldVal, setGoldVal] = useState('1000000');
  const [gemsVal, setGemsVal] = useState('50000');
  const [levelVal, setLevelVal] = useState('50');

  const handleUnlock = () => {
    if (password === '123456') {
      setUnlocked(true);
      setError('');
      playSound('admin');
      setPlayerState(prev => ({ ...prev, isAdmin: true }));
    } else {
      setError('Wrong password. Unauthorized access!');
      playSound('hurt');
    }
  };

  const setGold = () => {
    const amt = parseInt(goldVal) || 0;
    setPlayerState(prev => ({ ...prev, gold: amt }));
    playSound('admin');
  };

  const setGems = () => {
    const amt = parseInt(gemsVal) || 0;
    setPlayerState(prev => ({ ...prev, gems: amt }));
    playSound('admin');
  };

  const setLevel = () => {
    const lvl = Math.min(100, Math.max(1, parseInt(levelVal) || 1));
    setPlayerState(prev => {
      // Scale player HP/MP stats to match level
      const hpBoost = lvl * 150;
      const mpBoost = lvl * 50;
      return {
        ...prev,
        level: lvl,
        statPoints: prev.statPoints + (lvl - prev.level) * 5,
        skillPoints: prev.skillPoints + (lvl - prev.level) * 2,
        maxHp: 200 + hpBoost,
        maxMp: 100 + mpBoost,
        hp: 200 + hpBoost,
        mp: 100 + mpBoost,
      };
    });
    playSound('levelup');
  };

  const handleMaxSkills = () => {
    setPlayerState(prev => {
      const updatedSkills = prev.skills.map(s => ({
        ...s,
        level: s.maxLevel,
      }));
      return { ...prev, skills: updatedSkills, skillPoints: 100 };
    });
    playSound('admin');
  };

  const handleSpawnItem = (itemPreset: Partial<Item>) => {
    const newItem: Item = {
      id: `admin_item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: itemPreset.name || 'Admin Trinket',
      type: itemPreset.type || 'EQUIPMENT',
      description: itemPreset.description || 'Power level over 9000!',
      quantity: itemPreset.quantity || 1,
      icon: itemPreset.icon || '⚔️',
      rarity: 'ADMIN',
      slot: itemPreset.slot,
      upgradeLevel: itemPreset.upgradeLevel ?? 0,
      baseStatType: itemPreset.baseStatType,
      baseStatValue: itemPreset.baseStatValue,
      isAppraised: true,
    };

    setPlayerState(prev => {
      // If it is a consumable potion or material, accumulate quantity if exists
      if (newItem.type === 'POTION' || newItem.type === 'MATERIAL') {
        const existing = prev.inventory.find(i => i.name === newItem.name);
        if (existing) {
          return {
            ...prev,
            inventory: prev.inventory.map(i =>
              i.name === newItem.name ? { ...i, quantity: i.quantity + newItem.quantity } : i
            ),
          };
        }
      }
      return {
        ...prev,
        inventory: [newItem, ...prev.inventory],
      };
    });
    playSound('upgrade');
  };

  const adminPresets: Array<{ label: string; item: Partial<Item>; color: string }> = [
    {
      label: '🗡️ Infinity Blade (Weapon)',
      color: 'from-amber-600 to-red-600',
      item: {
        name: 'Infinity Blade',
        type: 'EQUIPMENT',
        slot: 'WEAPON',
        description: 'Forged by the game admins. One-shots everything in its path (+9999 Physical Damage).',
        icon: '🗡️',
        baseStatType: 'PHYS_ATK',
        baseStatValue: 9999,
        upgradeLevel: 10,
      },
    },
    {
      label: '🔮 Calamity Wand (Weapon)',
      color: 'from-violet-600 to-fuchsia-600',
      item: {
        name: 'Calamity Wand',
        type: 'EQUIPMENT',
        slot: 'WEAPON',
        description: 'Harness the cosmic code. Shoots infinite energy fields (+9999 Magic Damage).',
        icon: '🔮',
        baseStatType: 'MAG_ATK',
        baseStatValue: 9999,
        upgradeLevel: 10,
      },
    },
    {
      label: '🛡️ Aegis Plate (Armor)',
      color: 'from-cyan-600 to-blue-600',
      item: {
        name: 'Aegis Plate',
        type: 'EQUIPMENT',
        slot: 'ARMOR',
        description: 'Impenetrable shield plate (+9999 Defense). Stand completely still in boss fights!',
        icon: '🛡️',
        baseStatType: 'DEF',
        baseStatValue: 9999,
        upgradeLevel: 10,
      },
    },
    {
      label: '💍 Creator’s Ring (Ring)',
      color: 'from-emerald-600 to-teal-600',
      item: {
        name: 'Creator’s Ring',
        type: 'EQUIPMENT',
        slot: 'RING',
        description: 'The admin’s wedding ring. Grants massive life energy (+5000 Max HP, +5000 Max MP).',
        icon: '💍',
        baseStatType: 'ALL',
        baseStatValue: 5000,
        upgradeLevel: 10,
      },
    },
    {
      label: '📿 Infinity Amulet (Amulet)',
      color: 'from-rose-600 to-orange-600',
      item: {
        name: 'Infinity Amulet',
        type: 'EQUIPMENT',
        slot: 'AMULET',
        description: 'Overclocks critical rate to 100% and yields massive speed (+9999 Attack Speed/Crit).',
        icon: '📿',
        baseStatType: 'CRIT',
        baseStatValue: 100,
        upgradeLevel: 10,
      },
    },
    {
      label: '🧪 God’s Elixir (x99)',
      color: 'from-lime-600 to-yellow-600',
      item: {
        name: 'God’s Elixir',
        type: 'POTION',
        description: 'Restores 100% Health & Mana and grants invincible status (Admin Code special).',
        icon: '🧪',
        quantity: 99,
      },
    },
    {
      label: '🧱 Dragon Cores (x50)',
      color: 'from-indigo-600 to-slate-700',
      item: {
        name: 'Fire Core',
        type: 'MATERIAL',
        description: 'Extremely rare forge core of fire dragons, used to craft supreme equipment.',
        icon: '🔥',
        quantity: 50,
      },
    },
    {
      label: '✨ Magic Dust (x50)',
      color: 'from-purple-600 to-slate-700',
      item: {
        name: 'Magic Dust',
        type: 'MATERIAL',
        description: 'Glowing stardust from high-level demons, essential for enchanting accessories.',
        icon: '✨',
        quantity: 50,
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
      {!unlocked ? (
        <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/50 rounded-xl p-6 shadow-2xl text-slate-100 flex flex-col items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 animate-pulse">
            <ShieldAlert size={48} id="admin-lock-icon" />
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-amber-500 text-center font-mono uppercase">
            ADMIN CONSOLE LOCK
          </h2>
          <p className="text-xs text-slate-400 text-center">
            Enter administrative passcode to unlock Cheat Codes, God Mode, and Supreme Gear.
          </p>

          <div className="w-full mt-2 relative">
            <input
              type="password"
              placeholder="ENTER PASSCODE..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              className="w-full bg-slate-950 text-amber-400 font-mono text-center tracking-widest text-lg font-bold py-3 px-4 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
            />
            <Key className="absolute right-3 top-3.5 text-slate-500" size={18} />
          </div>

          {error && <p className="text-red-500 font-mono text-xs font-semibold">{error}</p>}

          <button
            onClick={handleUnlock}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold tracking-widest rounded-lg font-mono text-sm transition-colors cursor-pointer"
          >
            CONFIRM AUTHORIZATION
          </button>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-mono text-xs underline mt-2"
          >
            Cancel and Return
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border-2 border-emerald-500 rounded-xl p-6 shadow-2xl text-slate-100 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500 rounded-full text-emerald-400">
                <ShieldCheck size={28} id="admin-unlocked-icon" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-mono tracking-wider text-emerald-400 uppercase">
                  ADMIN COMMAND CENTER
                </h2>
                <p className="text-xs text-emerald-400/60 font-mono">CODE EXECUTING IN SANDBOX STATE</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold font-mono text-xs rounded border border-rose-500 transition-colors cursor-pointer"
            >
              CLOSE TERMINAL
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Numeric Alterations */}
            <div className="space-y-4">
              <h3 className="text-md font-bold font-mono text-emerald-400 border-b border-slate-700 pb-1 flex items-center gap-2">
                <Coins size={16} /> VARIABLE MANIPULATION
              </h3>

              {/* Gold Modifier */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-400">MODIFY GOLD RESERVES</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={goldVal}
                    onChange={e => setGoldVal(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-sm font-mono text-amber-400"
                  />
                  <button
                    onClick={setGold}
                    className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> SET GOLD
                  </button>
                </div>
              </div>

              {/* Gems Modifier */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-400">MODIFY GEM RESERVES</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={gemsVal}
                    onChange={e => setGemsVal(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-sm font-mono text-fuchsia-400"
                  />
                  <button
                    onClick={setGems}
                    className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> SET GEMS
                  </button>
                </div>
              </div>

              {/* Level Modifier */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                <label className="text-xs font-mono text-slate-400">FORCE CHARACTER LEVEL (1-100)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={levelVal}
                    onChange={e => setLevelVal(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-sm font-mono text-cyan-400"
                  />
                  <button
                    onClick={setLevel}
                    className="px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUpCircle size={14} /> SET LEVEL
                  </button>
                </div>
              </div>

              {/* General Hacks */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-3">
                <label className="text-xs font-mono text-slate-400 block border-b border-slate-800 pb-1">COMMAND SHORTCUTS</label>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleMaxSkills}
                    className="w-full py-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 border border-blue-500 text-white text-xs font-mono font-bold rounded cursor-pointer"
                  >
                    🔥 INSTANTLY UNLOCK & MAX ALL SKILLS
                  </button>
                  
                  <button
                    onClick={() => {
                      setPlayerState(prev => ({
                        ...prev,
                        statPoints: prev.statPoints + 100,
                        skillPoints: prev.skillPoints + 50,
                      }));
                      playSound('admin');
                    }}
                    className="w-full py-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-600 hover:to-emerald-600 border border-teal-500 text-white text-xs font-mono font-bold rounded cursor-pointer"
                  >
                    ✨ ADD +100 STAT POINTS & +50 SKILL POINTS
                  </button>

                  <button
                    onClick={() => {
                      setPlayerState(prev => ({
                        ...prev,
                        inventory: [],
                        equipped: { WEAPON: null, ARMOR: null, RING: null, AMULET: null }
                      }));
                      playSound('hurt');
                    }}
                    className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-mono rounded flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={14} /> PURGE INVENTORY & GEAR (RESET)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Supreme Items & Gear Crafting */}
            <div className="space-y-4">
              <h3 className="text-md font-bold font-mono text-emerald-400 border-b border-slate-700 pb-1 flex items-center gap-2">
                <Sparkles size={16} /> ADMIN SPECIAL REPUTE & ITEM GENERATION
              </h3>
              
              <p className="text-xs text-slate-400 italic">
                Generate unreleased and supreme admin gear directly. Items spawn inside your backpack immediately.
              </p>

              <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {adminPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSpawnItem(preset.item)}
                    className={`w-full py-2.5 px-3 bg-gradient-to-r ${preset.color} hover:brightness-110 border border-white/10 text-slate-900 text-left rounded-lg font-mono text-xs font-bold flex items-center justify-between transition-all group shadow-md hover:translate-x-1 cursor-pointer`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base group-hover:scale-125 transition-transform">{preset.item.icon}</span>
                      <span className="text-white drop-shadow-md">{preset.label}</span>
                    </div>
                    <span className="bg-slate-950/80 text-emerald-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                      SPAWN
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
            SANDBOX COMPILATION STATE: SECURE // ADMIN PANEL MODES ACTIVATED
          </div>
        </div>
      )}
    </div>
  );
}
