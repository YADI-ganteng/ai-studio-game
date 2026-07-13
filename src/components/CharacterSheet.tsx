import { useState } from 'react';
import { User, Shield, Zap, Sparkles, Sword, Heart, Compass, AlertTriangle, ArrowUp } from 'lucide-react';
import { PlayerState, Item, EquipmentSlot, Skill } from '../types';
import { playSound } from '../utils/audio';

interface CharacterSheetProps {
  playerState: PlayerState;
  setPlayerState: (state: PlayerState | ((prev: PlayerState) => PlayerState)) => void;
}

export default function CharacterSheet({ playerState, setPlayerState }: CharacterSheetProps) {
  const [activeTab, setActiveTab] = useState<'GEAR' | 'STATS' | 'SKILLS'>('GEAR');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Stats calculation
  const getCalculatedStats = () => {
    const attr = playerState.attributes;
    
    // Base stats
    let hpMax = 200 + playerState.level * 40 + attr.vit * 10;
    let mpMax = 100 + playerState.level * 15 + attr.int * 4;
    
    let physAtk = 15 + playerState.level * 3 + attr.str * 1.5;
    let magAtk = 15 + playerState.level * 3 + attr.int * 1.5;
    let defense = 5 + playerState.level * 1.5 + attr.vit * 0.5;
    let critChance = 5 + attr.dex * 0.15; // 5% base

    // Gear stats
    Object.values(playerState.equipped).forEach(item => {
      if (item) {
        const val = item.baseStatValue || 0;
        const type = item.baseStatType;

        if (type === 'PHYS_ATK') physAtk += val;
        else if (type === 'MAG_ATK') magAtk += val;
        else if (type === 'DEF') defense += val;
        else if (type === 'HP') hpMax += val;
        else if (type === 'MP') mpMax += val;
        else if (type === 'CRIT') critChance += val;
        else if (type === 'ALL') {
          physAtk += val;
          magAtk += val;
          defense += val;
          hpMax += val;
          mpMax += val;
        }

        // Add appraisal bonus
        if (item.isAppraised && item.bonusStatType && item.bonusStatValue) {
          const bonusVal = item.bonusStatValue;
          if (item.bonusStatType.includes('HP')) hpMax += bonusVal;
          if (item.bonusStatType.includes('Defense')) defense += bonusVal;
          if (item.bonusStatType.includes('Critical')) critChance += bonusVal;
        }
      }
    });

    return {
      hpMax,
      mpMax,
      physAtk,
      magAtk,
      defense,
      critChance: Math.min(100, critChance),
    };
  };

  const calculated = getCalculatedStats();

  const handleEquip = (item: Item) => {
    if (!item.slot) return;
    const slot = item.slot;

    setPlayerState(prev => {
      const currentlyEquipped = prev.equipped[slot];
      const inventory = [...prev.inventory];

      // Remove item to equip from inventory
      let updatedInv = inventory.filter(i => i.id !== item.id);

      // Put currently equipped back in inventory
      if (currentlyEquipped) {
        updatedInv.push(currentlyEquipped);
      }

      const equipped = {
        ...prev.equipped,
        [slot]: item,
      };

      // Recalculate max HP/MP
      const attr = prev.attributes;
      let hpMax = 200 + prev.level * 40 + attr.vit * 10;
      let mpMax = 100 + prev.level * 15 + attr.int * 4;

      // Add new gear stats to HP/MP
      Object.values(equipped).forEach(eqItem => {
        if (eqItem) {
          if (eqItem.baseStatType === 'HP' || eqItem.baseStatType === 'ALL') hpMax += eqItem.baseStatValue || 0;
          if (eqItem.baseStatType === 'MP') mpMax += eqItem.baseStatValue || 0;
          if (eqItem.isAppraised && eqItem.bonusStatType && eqItem.bonusStatValue) {
            if (eqItem.bonusStatType.includes('HP')) hpMax += eqItem.bonusStatValue;
          }
        }
      });

      return {
        ...prev,
        inventory: updatedInv,
        equipped,
        maxHp: hpMax,
        maxMp: mpMax,
        hp: Math.min(prev.hp, hpMax),
        mp: Math.min(prev.mp, mpMax),
      };
    });

    playSound('upgrade');
    setSelectedItem(null);
  };

  const handleUnequip = (slot: EquipmentSlot) => {
    const item = playerState.equipped[slot];
    if (!item) return;

    setPlayerState(prev => {
      const inventory = [item, ...prev.inventory];
      const equipped = {
        ...prev.equipped,
        [slot]: null,
      };

      // Recalculate max stats
      const attr = prev.attributes;
      let hpMax = 200 + prev.level * 40 + attr.vit * 10;
      let mpMax = 100 + prev.level * 15 + attr.int * 4;

      Object.values(equipped).forEach(eqItem => {
        if (eqItem) {
          if (eqItem.baseStatType === 'HP' || eqItem.baseStatType === 'ALL') hpMax += eqItem.baseStatValue || 0;
          if (eqItem.baseStatType === 'MP') mpMax += eqItem.baseStatValue || 0;
          if (eqItem.isAppraised && eqItem.bonusStatType && eqItem.bonusStatValue) {
            if (eqItem.bonusStatType.includes('HP')) hpMax += eqItem.bonusStatValue;
          }
        }
      });

      return {
        ...prev,
        inventory,
        equipped,
        maxHp: hpMax,
        maxMp: mpMax,
        hp: Math.min(prev.hp, hpMax),
        mp: Math.min(prev.mp, mpMax),
      };
    });

    playSound('levelup');
  };

  const handleUpgradeAttribute = (attrName: keyof typeof playerState.attributes) => {
    if (playerState.statPoints <= 0) return;

    setPlayerState(prev => {
      const attributes = {
        ...prev.attributes,
        [attrName]: prev.attributes[attrName] + 1,
      };

      // Recalculate max stats immediately
      const hpMax = 200 + prev.level * 40 + attributes.vit * 10;
      const mpMax = 100 + prev.level * 15 + attributes.int * 4;

      return {
        ...prev,
        attributes,
        statPoints: prev.statPoints - 1,
        maxHp: hpMax,
        maxMp: mpMax,
        hp: prev.hp + (attrName === 'vit' ? 10 : 0),
        mp: prev.mp + (attrName === 'int' ? 4 : 0),
      };
    });

    playSound('levelup');
  };

  const handleUpgradeSkill = (skillId: string) => {
    if (playerState.skillPoints <= 0) return;

    setPlayerState(prev => {
      const skills = prev.skills.map(s => {
        if (s.id === skillId && s.level < s.maxLevel) {
          return {
            ...s,
            level: s.level + 1,
            damageMultiplier: s.damageMultiplier + 0.25, // increase dmg by +25% per level
            manaCost: s.manaCost + 5, // slightly increase mana
          };
        }
        return s;
      });

      return {
        ...prev,
        skills,
        skillPoints: prev.skillPoints - 1,
      };
    });

    playSound('upgrade');
  };

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-5 text-slate-100 shadow-xl w-full flex flex-col gap-4">
      {/* Tab selectors */}
      <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
        {(['GEAR', 'STATS', 'SKILLS'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedItem(null);
            }}
            className={`flex-1 py-2 font-mono text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab === 'GEAR' ? '🎒 BAG & EQUIPMENT' : tab === 'STATS' ? '📈 ATTRIBUTES & STATS' : '🔥 ACTIVE SKILLS'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[380px]">
        {/* CHARACTER SIDEBAR STATS SUMMARY */}
        <div className="md:col-span-4 bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-12 h-12 bg-indigo-900/40 border border-indigo-500 rounded-lg flex items-center justify-center text-3xl">
              {playerState.classType === 'Naruto' ? '🌀' : playerState.classType === 'Sasuke' ? '⚡' : playerState.classType === 'Sakura' ? '🌸' : '👁️'}
            </div>
            <div>
              <h3 className="font-bold font-mono text-sm tracking-wide text-indigo-400">
                {playerState.classType.toUpperCase()}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Level {playerState.level} • {playerState.classType === 'Naruto' ? 'Jinjuriki' : playerState.classType === 'Sasuke' ? 'Avenger' : playerState.classType === 'Sakura' ? 'Medic-Nin' : 'Sharingan'}
              </p>
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">❤️ Health Points</span>
              <span className="font-bold text-white">
                {Math.floor(playerState.hp)} / {calculated.hpMax}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-rose-500 h-full" style={{ width: `${Math.min(100, (playerState.hp / calculated.hpMax) * 100)}%` }} />
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">💧 Mana Points</span>
              <span className="font-bold text-white">
                {Math.floor(playerState.mp)} / {calculated.mpMax}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-sky-500 h-full" style={{ width: `${Math.min(100, (playerState.mp / calculated.mpMax) * 100)}%` }} />
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">✨ Experience</span>
              <span className="font-bold text-slate-300">
                {playerState.exp} / {playerState.maxExp} XP
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (playerState.exp / playerState.maxExp) * 100)}%` }} />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-2 font-mono text-xs text-slate-300">
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
              <span className="flex items-center gap-1.5"><Sword size={14} className="text-red-400" /> Physical Atk:</span>
              <span className="font-bold text-white">{Math.round(calculated.physAtk)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
              <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-purple-400" /> Magic Atk:</span>
              <span className="font-bold text-white">{Math.round(calculated.magAtk)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
              <span className="flex items-center gap-1.5"><Shield size={14} className="text-blue-400" /> Defense:</span>
              <span className="font-bold text-white">{Math.round(calculated.defense)}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
              <span className="flex items-center gap-1.5">💀 Critical Chance:</span>
              <span className="font-bold text-white">{calculated.critChance.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* TAB 1: BAG & GEAR */}
        {activeTab === 'GEAR' && (
          <>
            <div className="md:col-span-8 flex flex-col gap-4">
              {/* Equipped layout */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <h3 className="text-xs font-mono text-slate-400 border-b border-slate-800 pb-1.5 mb-3 uppercase tracking-wider">
                  🛡️ EQUIPMENTS SLOTS
                </h3>

                <div className="grid grid-cols-4 gap-3">
                  {(['WEAPON', 'ARMOR', 'RING', 'AMULET'] as EquipmentSlot[]).map(slot => {
                    const item = playerState.equipped[slot];
                    return (
                      <div
                        key={slot}
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-col items-center justify-between text-center min-h-[110px] relative hover:border-slate-700 transition-all"
                      >
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">{slot}</span>
                        {item ? (
                          <>
                            <span className="text-3xl my-1.5 animate-pulse">{item.icon}</span>
                            <p className="text-[10px] font-bold font-mono text-slate-200 leading-tight truncate w-full">
                              {item.name} <span className="text-amber-400">+{item.upgradeLevel || 0}</span>
                            </p>
                            <button
                              onClick={() => handleUnequip(slot)}
                              className="text-[8px] bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-mono font-bold uppercase px-1.5 py-0.5 rounded mt-1.5 cursor-pointer"
                            >
                              Unequip
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-slate-600 text-xl my-2">➕</span>
                            <span className="text-[8px] font-mono text-slate-600 uppercase">EMPTY</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Backpack layout */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex-1 flex flex-col gap-2">
                <h3 className="text-xs font-mono text-slate-400 border-b border-slate-800 pb-1.5 uppercase tracking-wider">
                  🎒 BACKPACK INVENTORY
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[190px] pr-1">
                  {playerState.inventory.length === 0 ? (
                    <p className="col-span-full text-xs text-slate-600 italic font-mono text-center py-10">Backpack is empty.</p>
                  ) : (
                    playerState.inventory.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`p-2 bg-slate-900 hover:bg-slate-850 border rounded text-left transition-all flex items-center gap-2 cursor-pointer ${
                          selectedItem?.id === item.id ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800'
                        }`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold font-mono text-white truncate">
                            {item.name}
                            {item.quantity > 1 && <span className="text-sky-400 ml-1">x{item.quantity}</span>}
                          </p>
                          <p className="text-[9px] text-slate-500 uppercase truncate">
                            {item.type} {item.upgradeLevel !== undefined && `+${item.upgradeLevel}`}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Selected item details block */}
                {selectedItem && (
                  <div className="bg-slate-900 border border-indigo-500/40 p-3 rounded mt-2 text-xs font-mono flex items-center justify-between gap-3 animate-fade-in">
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-1.5">
                        {selectedItem.icon} {selectedItem.name}
                        {selectedItem.upgradeLevel !== undefined && (
                          <span className="text-amber-400">+{selectedItem.upgradeLevel}</span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{selectedItem.description}</p>
                      {selectedItem.baseStatType && (
                        <p className="text-[10px] text-emerald-400 font-bold mt-1 uppercase">
                          Bonus: +{selectedItem.baseStatValue} {selectedItem.baseStatType}
                        </p>
                      )}
                      {selectedItem.isAppraised && selectedItem.bonusStatType && (
                        <p className="text-[10px] text-violet-400 font-bold mt-0.5 uppercase">
                          🔍 Appraisal: +{selectedItem.bonusStatValue} {selectedItem.bonusStatType}
                        </p>
                      )}
                    </div>
                    {selectedItem.slot ? (
                      <button
                        onClick={() => handleEquip(selectedItem)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded uppercase cursor-pointer"
                      >
                        Equip
                      </button>
                    ) : (
                      selectedItem.name.includes('Potion') && (
                        <button
                          onClick={() => {
                            setPlayerState(prev => {
                              const isHP = selectedItem.name === 'HP Potion';
                              const restoreVal = isHP ? 150 : 50;

                              const inventory = prev.inventory.map(i => {
                                if (i.id === selectedItem.id) {
                                  return { ...i, quantity: i.quantity - 1 };
                                }
                                return i;
                              }).filter(i => i.quantity > 0);

                              setSelectedItem(null);

                              if (isHP) {
                                return {
                                  ...prev,
                                  inventory,
                                  hp: Math.min(prev.maxHp, prev.hp + restoreVal),
                                };
                              } else {
                                return {
                                  ...prev,
                                  inventory,
                                  mp: Math.min(prev.maxMp, prev.mp + restoreVal),
                                };
                              }
                            });
                            playSound('heal');
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded uppercase cursor-pointer"
                        >
                          Consume
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: STAT POINTS */}
        {activeTab === 'STATS' && (
          <div className="md:col-span-8 bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                📈 ASSIGN ATTRIBUTE POINTS
              </h3>
              <span className="bg-indigo-950 border border-indigo-500 text-indigo-400 px-2.5 py-1 rounded text-xs font-bold font-mono">
                {playerState.statPoints} Stat Points Available
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3 justify-center">
              {/* STR */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <div>
                  <h4 className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                    💪 STR (STRENGTH): {playerState.attributes.str}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Increases Physical Damage by +1.5. Essential for melee basic attacks.</p>
                </div>
                <button
                  disabled={playerState.statPoints <= 0}
                  onClick={() => handleUpgradeAttribute('str')}
                  className={`p-2 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all ${
                    playerState.statPoints > 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                      : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp size={16} />
                </button>
              </div>

              {/* INT */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <div>
                  <h4 className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                    🔮 INT (INTELLIGENCE): {playerState.attributes.int}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Increases Ninjutsu Damage by +1.5, Max MP by +4. Essential for elemental skills.</p>
                </div>
                <button
                  disabled={playerState.statPoints <= 0}
                  onClick={() => handleUpgradeAttribute('int')}
                  className={`p-2 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all ${
                    playerState.statPoints > 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                      : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp size={16} />
                </button>
              </div>

              {/* DEX */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <div>
                  <h4 className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                    ⚡ DEX (DEXTERITY): {playerState.attributes.dex}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Increases Critical strike rate by +0.15% and increases physical swing velocities.</p>
                </div>
                <button
                  disabled={playerState.statPoints <= 0}
                  onClick={() => handleUpgradeAttribute('dex')}
                  className={`p-2 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all ${
                    playerState.statPoints > 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                      : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp size={16} />
                </button>
              </div>

              {/* VIT */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <div>
                  <h4 className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                    ❤️ VIT (VITALITY): {playerState.attributes.vit}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Increases maximum health pool by +10 HP and basic physical defense by +0.5.</p>
                </div>
                <button
                  disabled={playerState.statPoints <= 0}
                  onClick={() => handleUpgradeAttribute('vit')}
                  className={`p-2 rounded-lg font-mono font-bold text-xs flex items-center justify-center transition-all ${
                    playerState.statPoints > 0
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer'
                      : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                  }`}
                >
                  <ArrowUp size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SKILLS */}
        {activeTab === 'SKILLS' && (
          <div className="md:col-span-8 bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                🔥 LEVEL UP BATTLE ACTIVE SKILLS
              </h3>
              <span className="bg-indigo-950 border border-indigo-500 text-indigo-400 px-2.5 py-1 rounded text-xs font-bold font-mono">
                {playerState.skillPoints} Skill Points Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {playerState.skills.map(skill => {
                const isUnlocked = playerState.level >= skill.unlockedAt;
                const canUpgrade = isUnlocked && playerState.skillPoints > 0 && skill.level < skill.maxLevel;

                return (
                  <div
                    key={skill.id}
                    className={`p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between gap-3 ${
                      !isUnlocked ? 'opacity-40 select-none' : ''
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold font-mono text-white flex items-center gap-2">
                          <span className="text-xl">{skill.icon}</span> {skill.name}
                        </h4>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold">
                          {isUnlocked ? `Lv. ${skill.level}/${skill.maxLevel}` : `Unlock Lv. ${skill.unlockedAt}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 italic">"{skill.description}"</p>
                      
                      {isUnlocked && (
                        <div className="text-[9px] font-mono mt-2 space-y-0.5 text-slate-400 border-t border-slate-800/40 pt-1.5">
                          <p>Damage Multiplier: <span className="text-emerald-400 font-bold">{(skill.damageMultiplier * 100).toFixed(0)}%</span></p>
                          <p>Mana Cost: <span className="text-sky-400 font-bold">{skill.manaCost} MP</span></p>
                          <p>Cooldown: <span className="text-amber-400 font-bold">{skill.cooldown}s</span></p>
                        </div>
                      )}
                    </div>

                    {isUnlocked && skill.level < skill.maxLevel && (
                      <button
                        onClick={() => handleUpgradeSkill(skill.id)}
                        disabled={!canUpgrade}
                        className={`w-full py-1.5 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                          canUpgrade
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 cursor-pointer'
                            : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                        }`}
                      >
                        {canUpgrade ? 'Upgrade Skill' : 'No Points'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
