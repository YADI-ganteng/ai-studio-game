import { useState } from 'react';
import { Hammer, Sparkles, AlertTriangle, ArrowUp, Coins, Check, Zap } from 'lucide-react';
import { PlayerState, Item, EquipmentSlot } from '../types';
import { playSound } from '../utils/audio';

interface BlacksmithProps {
  playerState: PlayerState;
  setPlayerState: (state: PlayerState | ((prev: PlayerState) => PlayerState)) => void;
}

interface CraftRecipe {
  id: string;
  name: string;
  type: 'EQUIPMENT';
  slot: EquipmentSlot;
  description: string;
  icon: string;
  classLocked?: 'Naruto' | 'Sasuke' | 'Sakura' | 'Kakashi';
  baseStatType: 'PHYS_ATK' | 'MAG_ATK' | 'DEF' | 'HP' | 'MP' | 'CRIT' | 'ALL';
  baseStatValue: number;
  materials: Array<{ name: string; qty: number; icon: string }>;
  goldCost: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC';
}

const CRAFT_RECIPES: CraftRecipe[] = [
  // Tier 1 Weapons
  {
    id: 'craft_rasengan_glove',
    name: 'Rasengan Bands',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'Woven chakra bands that help concentrate swirling Rasengan energy.',
    icon: '🌀',
    classLocked: 'Naruto',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 38,
    goldCost: 800,
    materials: [{ name: 'Iron Ores', qty: 5, icon: '🪨' }],
    rarity: 'COMMON'
  },
  {
    id: 'craft_kusanagi_sword',
    name: 'Kusanagi Sword',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'A straight-edged Chokuto steel sword that channels electric surges.',
    icon: '⚔️',
    classLocked: 'Sasuke',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 40,
    goldCost: 800,
    materials: [{ name: 'Iron Ores', qty: 5, icon: '🪨' }],
    rarity: 'COMMON'
  },
  {
    id: 'craft_healer_wraps',
    name: 'Chakra Wraps',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'Heavy leather fist wraps that cushion punches and concentrate kinetic strikes.',
    icon: '🥊',
    classLocked: 'Sakura',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 36,
    goldCost: 800,
    materials: [{ name: 'Iron Ores', qty: 5, icon: '🪨' }],
    rarity: 'COMMON'
  },
  {
    id: 'craft_anbu_dagger',
    name: 'Anbu Sabre',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'Standard sabre wielded by elite leaf village special ops divisions.',
    icon: '🗡️',
    classLocked: 'Kakashi',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 42,
    goldCost: 800,
    materials: [{ name: 'Iron Ores', qty: 5, icon: '🪨' }],
    rarity: 'COMMON'
  },
  // Tier 2 Weapons
  {
    id: 'craft_sage_scroll',
    name: 'Sage Toad Scroll',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'Imbued with natural senjutsu. Releases massive golden physical pressure.',
    icon: '📜',
    classLocked: 'Naruto',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 95,
    goldCost: 3000,
    materials: [
      { name: 'Iron Ores', qty: 15, icon: '🪨' },
      { name: 'Fire Core', qty: 4, icon: '🔥' }
    ],
    rarity: 'RARE'
  },
  {
    id: 'craft_amaterasu_blade',
    name: 'Amaterasu Katana',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'Bathed in black inextinguishable flames. Scorches targets on hit.',
    icon: '🔥',
    classLocked: 'Sasuke',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 105,
    goldCost: 3000,
    materials: [
      { name: 'Iron Ores', qty: 12, icon: '🪨' },
      { name: 'Fire Core', qty: 4, icon: '🔥' }
    ],
    rarity: 'RARE'
  },
  {
    id: 'craft_slug_gauntlets',
    name: 'Katsuyu Gauntlets',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'Padded gauntlets blessed by the Slug Queen Katsuyu, granting heavy force.',
    icon: '🐚',
    classLocked: 'Sakura',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 90,
    goldCost: 3000,
    materials: [
      { name: 'Iron Ores', qty: 15, icon: '🪨' },
      { name: 'Fire Core', qty: 4, icon: '🔥' }
    ],
    rarity: 'RARE'
  },
  {
    id: 'craft_sharingan_glove',
    name: 'Sharingan Crest Glove',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'Crackling with lightning element. Drastically optimizes blade swipes.',
    icon: '⚡',
    classLocked: 'Kakashi',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 102,
    goldCost: 3000,
    materials: [
      { name: 'Iron Ores', qty: 12, icon: '🪨' },
      { name: 'Fire Core', qty: 4, icon: '🔥' }
    ],
    rarity: 'RARE'
  },
  // Tier 3 Weapons
  {
    id: 'craft_six_paths_rod',
    name: 'Six Paths Staff',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'Formed of black Truth-Seeking Balls. Unlocks divine ultimate combat power.',
    icon: '🖤',
    classLocked: 'Naruto',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 290,
    goldCost: 12000,
    materials: [
      { name: 'Iron Ores', qty: 30, icon: '🪨' },
      { name: 'Fire Core', qty: 12, icon: '🔥' },
      { name: 'Magic Dust', qty: 6, icon: '✨' }
    ],
    rarity: 'EPIC'
  },
  {
    id: 'craft_susanoo_blade',
    name: 'Susanoo Spirit Blade',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'A colossal sword of concentrated purple Susanoo spirit. Hits like a comet.',
    icon: '💜',
    classLocked: 'Sasuke',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 310,
    goldCost: 12000,
    materials: [
      { name: 'Iron Ores', qty: 20, icon: '🪨' },
      { name: 'Fire Core', qty: 8, icon: '🔥' },
      { name: 'Magic Dust', qty: 10, icon: '✨' }
    ],
    rarity: 'EPIC'
  },
  {
    id: 'craft_byakugou_fist',
    name: 'Byakugou Power Ring',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'Harnesses stored medical cells, granting immense striking density.',
    icon: '💠',
    classLocked: 'Sakura',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 280,
    goldCost: 12000,
    materials: [
      { name: 'Iron Ores', qty: 30, icon: '🪨' },
      { name: 'Fire Core', qty: 10, icon: '🔥' },
      { name: 'Magic Dust', qty: 8, icon: '✨' }
    ],
    rarity: 'EPIC'
  },
  {
    id: 'craft_kamui_blade',
    name: 'Kamui Dimensional Edge',
    type: 'EQUIPMENT',
    slot: 'WEAPON',
    description: 'A space-warping Anbu sword that cuts through physical boundaries easily.',
    icon: '👁️',
    classLocked: 'Kakashi',
    baseStatType: 'PHYS_ATK',
    baseStatValue: 305,
    goldCost: 12000,
    materials: [
      { name: 'Iron Ores', qty: 20, icon: '🪨' },
      { name: 'Fire Core', qty: 8, icon: '🔥' },
      { name: 'Magic Dust', qty: 10, icon: '✨' }
    ],
    rarity: 'EPIC'
  },
  // Armors
  {
    id: 'craft_leather_vest',
    name: 'Hardened Vest',
    type: 'EQUIPMENT',
    slot: 'ARMOR',
    description: 'A reinforced leather chestplate providing decent initial defenses.',
    icon: '🥼',
    baseStatType: 'DEF',
    baseStatValue: 20,
    goldCost: 600,
    materials: [{ name: 'Iron Ores', qty: 4, icon: '🪨' }],
    rarity: 'COMMON'
  },
  {
    id: 'craft_steel_plate',
    name: 'Steel Bastion Armor',
    type: 'EQUIPMENT',
    slot: 'ARMOR',
    description: 'Heavier steel plates welded to cushion boss punches and critical slashes.',
    icon: '🛡️',
    baseStatType: 'DEF',
    baseStatValue: 65,
    goldCost: 2500,
    materials: [{ name: 'Iron Ores', qty: 15, icon: '🪨' }],
    rarity: 'UNCOMMON'
  },
  {
    id: 'craft_demon_mail',
    name: 'Demon Sovereign Mail',
    type: 'EQUIPMENT',
    slot: 'ARMOR',
    description: 'Cursed alloy plates. Nullifies physical impacts and provides dark aura protection.',
    icon: '👾',
    baseStatType: 'DEF',
    baseStatValue: 180,
    goldCost: 9000,
    materials: [
      { name: 'Iron Ores', qty: 25, icon: '🪨' },
      { name: 'Magic Dust', qty: 12, icon: '✨' }
    ],
    rarity: 'EPIC'
  },
  // Rings
  {
    id: 'craft_sorcerer_ring',
    name: 'Sage Sorcerer Ring',
    type: 'EQUIPMENT',
    slot: 'RING',
    description: 'A magical ring that boosts mana reserves and accelerates recovery (+100 MP).',
    icon: '💍',
    baseStatType: 'MP',
    baseStatValue: 120,
    goldCost: 4000,
    materials: [
      { name: 'Iron Ores', qty: 10, icon: '🪨' },
      { name: 'Magic Dust', qty: 6, icon: '✨' }
    ],
    rarity: 'RARE'
  },
  // Amulets
  {
    id: 'craft_angel_amulet',
    name: 'Sacred Angel Crest',
    type: 'EQUIPMENT',
    slot: 'AMULET',
    description: 'Appears blessed by ancient angels. Yields massive critical boost (+15% Critical).',
    icon: '📿',
    baseStatType: 'CRIT',
    baseStatValue: 15,
    goldCost: 4500,
    materials: [
      { name: 'Iron Ores', qty: 10, icon: '🪨' },
      { name: 'Fire Core', qty: 5, icon: '🔥' },
      { name: 'Magic Dust', qty: 5, icon: '✨' }
    ],
    rarity: 'RARE'
  }
];

export default function Blacksmith({ playerState, setPlayerState }: BlacksmithProps) {
  const [activeTab, setActiveTab] = useState<'UPGRADE' | 'CRAFT' | 'APPRAISE'>('UPGRADE');
  const [selectedUpgradeItem, setSelectedUpgradeItem] = useState<Item | null>(null);
  const [selectedAppraiseItem, setSelectedAppraiseItem] = useState<Item | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Helper: check item count in inventory
  const getMaterialCount = (matName: string) => {
    const itemName = matName === 'Iron Ores' ? 'Iron Ores' : matName === 'Fire Core' ? 'Fire Core' : 'Magic Dust';
    const found = playerState.inventory.find(i => i.name === itemName);
    return found ? found.quantity : 0;
  };

  // Upgradable items (either in inventory or currently equipped)
  const getUpgradableItems = () => {
    const list: Item[] = [];
    // Add equipped gear
    Object.values(playerState.equipped).forEach(item => {
      if (item) list.push(item);
    });
    // Add inventory equipment
    playerState.inventory.forEach(item => {
      if (item.type === 'EQUIPMENT' || item.type === 'ADMIN_SPECIAL') {
        // Avoid adding duplicated equipped reference
        if (!list.find(li => li.id === item.id)) {
          list.push(item);
        }
      }
    });
    return list;
  };

  const getUpgradeRequirements = (item: Item) => {
    const level = item.upgradeLevel || 0;
    if (level >= 10) return null; // Max upgrade limit

    // Upgrade costs scale based on current upgrade level and item rarity
    const multiplier = level + 1;
    let goldCost = 200 * multiplier;
    let ironCost = 1 + Math.floor(level / 2);
    let fireCoreCost = 0;
    let magicDustCost = 0;

    if (item.rarity === 'RARE') {
      goldCost *= 2;
      ironCost += 1;
      fireCoreCost = level >= 4 ? 1 : 0;
    } else if (item.rarity === 'EPIC') {
      goldCost *= 3.5;
      ironCost += 2;
      fireCoreCost = level >= 3 ? 1 : 0;
      magicDustCost = level >= 5 ? 1 : 0;
    } else if (item.rarity === 'ADMIN') {
      goldCost = 0; // Admins get free updates
      ironCost = 0;
    }

    return {
      goldCost,
      ironCost,
      fireCoreCost,
      magicDustCost,
    };
  };

  const handleUpgrade = () => {
    if (!selectedUpgradeItem) return;
    const reqs = getUpgradeRequirements(selectedUpgradeItem);
    if (!reqs) return;

    // Verify Gold
    if (playerState.gold < reqs.goldCost) {
      setErrorMessage('Insufficient Gold to upgrade equipment!');
      playSound('hurt');
      return;
    }

    // Verify materials
    const currentIron = getMaterialCount('Iron Ores');
    const currentFireCore = getMaterialCount('Fire Core');
    const currentMagicDust = getMaterialCount('Magic Dust');

    if (currentIron < reqs.ironCost) {
      setErrorMessage('Insufficient Iron Ores!');
      playSound('hurt');
      return;
    }
    if (currentFireCore < reqs.fireCoreCost) {
      setErrorMessage('Insufficient Fire Cores!');
      playSound('hurt');
      return;
    }
    if (currentMagicDust < reqs.magicDustCost) {
      setErrorMessage('Insufficient Magic Dust!');
      playSound('hurt');
      return;
    }

    // Process upgrade
    setPlayerState(prev => {
      // Deduct gold
      let gold = prev.gold - reqs.goldCost;

      // Deduct inventory materials
      let inventory = prev.inventory.map(i => {
        if (i.name === 'Iron Ores') return { ...i, quantity: i.quantity - reqs.ironCost };
        if (i.name === 'Fire Core') return { ...i, quantity: i.quantity - reqs.fireCoreCost };
        if (i.name === 'Magic Dust') return { ...i, quantity: i.quantity - reqs.magicDustCost };
        return i;
      }).filter(i => i.quantity > 0 || i.type === 'EQUIPMENT'); // Keep equipment even if qty 0 (though should not happen)

      // Modify the item (it can be in inventory or equipped)
      const currentLvl = selectedUpgradeItem.upgradeLevel || 0;
      const nextLvl = currentLvl + 1;

      // Stats scale up
      const oldStat = selectedUpgradeItem.baseStatValue || 0;
      const statBonus = Math.max(5, Math.floor(oldStat * 0.15));
      const nextStat = oldStat + statBonus;

      const updatedItem: Item = {
        ...selectedUpgradeItem,
        upgradeLevel: nextLvl,
        baseStatValue: nextStat,
      };

      // Check if equipped
      const equipped = { ...prev.equipped };
      let equippedUpdated = false;
      (Object.keys(equipped) as EquipmentSlot[]).forEach(slot => {
        if (equipped[slot]?.id === selectedUpgradeItem.id) {
          equipped[slot] = updatedItem;
          equippedUpdated = true;
        }
      });

      if (!equippedUpdated) {
        inventory = inventory.map(i => i.id === selectedUpgradeItem.id ? updatedItem : i);
      }

      // Re-trigger select item view
      setTimeout(() => setSelectedUpgradeItem(updatedItem), 10);

      return {
        ...prev,
        gold,
        inventory,
        equipped,
      };
    });

    playSound('upgrade');
    setSuccessMessage(`Success! Upgrade completed to +${(selectedUpgradeItem.upgradeLevel || 0) + 1}!`);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Accessories (Rings/Amulets) that are appraisal-capable and not yet appraised
  const getAppraisableItems = () => {
    const list: Item[] = [];
    Object.values(playerState.equipped).forEach(item => {
      if (item && (item.slot === 'RING' || item.slot === 'AMULET') && !item.isAppraised) list.push(item);
    });
    playerState.inventory.forEach(item => {
      if ((item.slot === 'RING' || item.slot === 'AMULET') && !item.isAppraised) {
        if (!list.find(li => li.id === item.id)) list.push(item);
      }
    });
    return list;
  };

  const handleAppraise = () => {
    if (!selectedAppraiseItem) return;
    const cost = 1000;

    if (playerState.gold < cost) {
      setErrorMessage('Insufficient gold for appraisal!');
      playSound('hurt');
      return;
    }

    // Appraise random stat bonuses
    const bonuses = [
      { name: '🔥 Fire DMG Bonus', val: 12 },
      { name: '❤️ Max HP Bonus', val: 150 },
      { name: '🛡️ Defense Bonus', val: 15 },
      { name: '⚡ Speed Multiplier', val: 5 },
      { name: '💀 Critical Bonus', val: 8 },
      { name: '🍷 Lifesteal Rate', val: 4 },
    ];
    const picked = bonuses[Math.floor(Math.random() * bonuses.length)];

    setPlayerState(prev => {
      let gold = prev.gold - cost;
      let inventory = [...prev.inventory];

      const updatedItem: Item = {
        ...selectedAppraiseItem,
        isAppraised: true,
        bonusStatType: picked.name,
        bonusStatValue: picked.val,
      };

      // check if equipped
      const equipped = { ...prev.equipped };
      let equippedUpdated = false;
      (Object.keys(equipped) as EquipmentSlot[]).forEach(slot => {
        if (equipped[slot]?.id === selectedAppraiseItem.id) {
          equipped[slot] = updatedItem;
          equippedUpdated = true;
        }
      });

      if (!equippedUpdated) {
        inventory = inventory.map(i => i.id === selectedAppraiseItem.id ? updatedItem : i);
      }

      setTimeout(() => setSelectedAppraiseItem(updatedItem), 10);

      return {
        ...prev,
        gold,
        inventory,
        equipped,
      };
    });

    playSound('upgrade');
    setSuccessMessage(`Appraised! Unlocked bonus stat: ${picked.name} (+${picked.val})!`);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCraft = (recipe: CraftRecipe) => {
    // Check Gold
    if (playerState.gold < recipe.goldCost) {
      setErrorMessage('Not enough Gold to craft this equipment!');
      playSound('hurt');
      return;
    }

    // Check Materials
    for (const mat of recipe.materials) {
      if (getMaterialCount(mat.name) < mat.qty) {
        setErrorMessage(`Missing required materials: ${mat.name}!`);
        playSound('hurt');
        return;
      }
    }

    // Process crafting
    setPlayerState(prev => {
      let gold = prev.gold - recipe.goldCost;
      let inventory = prev.inventory.map(item => {
        const matReq = recipe.materials.find(m => m.name === item.name);
        if (matReq) {
          return { ...item, quantity: item.quantity - matReq.qty };
        }
        return item;
      }).filter(item => item.quantity > 0 || item.type === 'EQUIPMENT');

      const craftedItem: Item = {
        id: `craft_${recipe.id}_${Date.now()}`,
        name: recipe.name,
        type: 'EQUIPMENT',
        description: recipe.description,
        quantity: 1,
        icon: recipe.icon,
        rarity: recipe.rarity,
        slot: recipe.slot,
        upgradeLevel: 0,
        baseStatType: recipe.baseStatType,
        baseStatValue: recipe.baseStatValue,
        isAppraised: recipe.slot === 'WEAPON' || recipe.slot === 'ARMOR' ? true : false,
      };

      return {
        ...prev,
        gold,
        inventory: [craftedItem, ...inventory],
      };
    });

    playSound('upgrade');
    setSuccessMessage(`Superb forge! Crafted "${recipe.name}" successfully!`);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-5 text-slate-100 shadow-xl w-full flex flex-col gap-4">
      {/* Blacksmith Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500">
            <Hammer size={24} id="blacksmith-hammer-icon" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono tracking-tight text-amber-400">GRAND BLACKSMITH</h2>
            <p className="text-xs text-slate-400">Forge mythic armor and hone your weapon blade levels.</p>
          </div>
        </div>

        {/* Currency summary */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 text-amber-400">
            <Coins size={14} /> {playerState.gold.toLocaleString()} Gold
          </span>
          <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded text-slate-300">
            🪨 {getMaterialCount('Iron Ores')} Iron
          </span>
          <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded text-orange-400">
            🔥 {getMaterialCount('Fire Core')} Cores
          </span>
          <span className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded text-violet-400">
            ✨ {getMaterialCount('Magic Dust')} Dust
          </span>
        </div>
      </div>

      {/* Tabs selectors */}
      <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
        {(['UPGRADE', 'CRAFT', 'APPRAISE'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSuccessMessage('');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 font-mono text-xs font-bold rounded-md transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab === 'UPGRADE' ? '🔨 LEVEL UP EQUIPMENT' : tab === 'CRAFT' ? '✨ CRAFT MYTHIC GEAR' : '🔍 APPRAISE ACCESSORIES'}
          </button>
        ))}
      </div>

      {/* Error and Success overlays */}
      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-lg p-2.5 text-center text-emerald-400 text-xs font-bold font-mono animate-bounce">
          ✓ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-950/80 border border-rose-500/50 rounded-lg p-2.5 text-center text-rose-400 text-xs font-bold font-mono">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Main interaction panels */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 min-h-[380px]">
        {activeTab === 'UPGRADE' && (
          <>
            {/* List Upgradable Items */}
            <div className="md:col-span-5 bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2 max-h-[380px] overflow-y-auto">
              <h3 className="text-xs font-mono text-slate-400 border-b border-slate-800 pb-1 mb-1">SELECT EQUIPMENT</h3>
              {getUpgradableItems().length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-10 font-mono">No equipment available to upgrade.</p>
              ) : (
                getUpgradableItems().map(item => {
                  const isEquipped = Object.values(playerState.equipped).some(eq => eq?.id === item.id);
                  const isSelected = selectedUpgradeItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedUpgradeItem(item);
                        setSuccessMessage('');
                        setErrorMessage('');
                      }}
                      className={`w-full p-2.5 text-left rounded border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500'
                          : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                            {item.name} <span className="text-amber-400">+{item.upgradeLevel || 0}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono uppercase">
                            {item.slot} • {item.rarity}
                          </p>
                        </div>
                      </div>
                      {isEquipped && (
                        <span className="bg-blue-900/60 border border-blue-500 text-blue-300 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded font-mono">
                          EQUIPPED
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Upgrade Status View */}
            <div className="md:col-span-7 bg-slate-950/40 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              {selectedUpgradeItem ? (
                <div className="flex flex-col gap-4 h-full justify-between">
                  {/* Item Description block */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl p-2 bg-slate-900 border border-slate-800 rounded-lg shadow-md">
                        {selectedUpgradeItem.icon}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold font-mono text-amber-400 flex items-center gap-2">
                          {selectedUpgradeItem.name} <span className="bg-amber-500/20 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-xs font-bold">+{selectedUpgradeItem.upgradeLevel || 0}</span>
                        </h4>
                        <p className="text-xs text-slate-400 italic mt-0.5">"{selectedUpgradeItem.description}"</p>
                      </div>
                    </div>

                    {/* Stats progression graph */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs">
                      <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider">STATS INCREASE OVERVIEW</p>
                      <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                        <span className="text-slate-400">{selectedUpgradeItem.baseStatType}</span>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <span className="text-slate-300">{selectedUpgradeItem.baseStatValue}</span>
                          <ArrowUp size={14} className="text-emerald-500" />
                          <span className="text-emerald-400">
                            {selectedUpgradeItem.upgradeLevel && selectedUpgradeItem.upgradeLevel >= 10
                              ? 'MAX'
                              : (selectedUpgradeItem.baseStatValue || 0) + Math.max(5, Math.floor((selectedUpgradeItem.baseStatValue || 0) * 0.15))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cost section */}
                    {getUpgradeRequirements(selectedUpgradeItem) ? (
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase">REQUIRED FORGE MATERIALS</p>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          {/* Gold */}
                          <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                            <span className="text-slate-400">🪙 Gold:</span>
                            <span className={playerState.gold >= (getUpgradeRequirements(selectedUpgradeItem)?.goldCost || 0) ? 'text-amber-400 font-bold' : 'text-rose-500 font-bold'}>
                              {getUpgradeRequirements(selectedUpgradeItem)?.goldCost}
                            </span>
                          </div>

                          {/* Iron */}
                          <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                            <span className="text-slate-400">🪨 Iron:</span>
                            <span className={getMaterialCount('Iron Ores') >= (getUpgradeRequirements(selectedUpgradeItem)?.ironCost || 0) ? 'text-white' : 'text-rose-500 font-bold'}>
                              {getMaterialCount('Iron Ores')} / {getUpgradeRequirements(selectedUpgradeItem)?.ironCost}
                            </span>
                          </div>

                          {/* Fire Cores */}
                          {(getUpgradeRequirements(selectedUpgradeItem)?.fireCoreCost || 0) > 0 && (
                            <div className="flex justify-between items-center bg-slate-900 p-2 rounded col-span-2">
                              <span className="text-orange-400 font-bold flex items-center gap-1">🔥 Fire Core:</span>
                              <span className={getMaterialCount('Fire Core') >= (getUpgradeRequirements(selectedUpgradeItem)?.fireCoreCost || 0) ? 'text-orange-300 font-bold' : 'text-rose-500 font-bold'}>
                                {getMaterialCount('Fire Core')} / {getUpgradeRequirements(selectedUpgradeItem)?.fireCoreCost}
                              </span>
                            </div>
                          )}

                          {/* Magic Dust */}
                          {(getUpgradeRequirements(selectedUpgradeItem)?.magicDustCost || 0) > 0 && (
                            <div className="flex justify-between items-center bg-slate-900 p-2 rounded col-span-2">
                              <span className="text-violet-400 font-bold flex items-center gap-1">✨ Magic Dust:</span>
                              <span className={getMaterialCount('Magic Dust') >= (getUpgradeRequirements(selectedUpgradeItem)?.magicDustCost || 0) ? 'text-violet-300 font-bold' : 'text-rose-500 font-bold'}>
                                {getMaterialCount('Magic Dust')} / {getUpgradeRequirements(selectedUpgradeItem)?.magicDustCost}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-4 text-center text-amber-400 font-mono text-xs font-bold">
                        ⭐ EQUIPMENT HAS ACHIEVED PRESTIGE MAX LIMIT (+10)
                      </div>
                    )}
                  </div>

                  {getUpgradeRequirements(selectedUpgradeItem) && (
                    <button
                      onClick={handleUpgrade}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold font-mono tracking-wider rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap size={16} /> STRIKE ANVIL (FORGE UPGRADE)
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-mono gap-2 text-center">
                  <Hammer size={32} className="animate-bounce" />
                  <p className="text-xs">Select equipment from the inventory sidebar to begin upgrading base status levels.</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'CRAFT' && (
          <div className="md:col-span-12 bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-3 max-h-[380px] overflow-y-auto">
            <h3 className="text-xs font-mono text-slate-400 border-b border-slate-800 pb-1 flex items-center gap-1">
              🛠️ BLACKSMITH RECIPES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CRAFT_RECIPES.map(recipe => {
                // If character level lock or class lock exists
                const wrongClass = recipe.classLocked && recipe.classLocked !== playerState.classType;
                
                // Check materials available
                const matsSatisfied = recipe.materials.every(m => getMaterialCount(m.name) >= m.qty) && playerState.gold >= recipe.goldCost;

                return (
                  <div
                    key={recipe.id}
                    className={`p-3 bg-slate-900 border rounded-lg flex flex-col justify-between gap-3 transition-all ${
                      wrongClass ? 'opacity-40 select-none pointer-events-none border-slate-950' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex gap-2.5">
                      <span className="text-3xl p-1 bg-slate-950 border border-slate-800 rounded">{recipe.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold font-mono text-white flex items-center gap-1">
                            {recipe.name}
                            {recipe.classLocked && (
                              <span className="text-[8px] bg-indigo-900 text-indigo-300 font-bold uppercase px-1 rounded">
                                {recipe.classLocked} Only
                              </span>
                            )}
                          </h4>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            recipe.rarity === 'EPIC' ? 'bg-purple-900/60 text-purple-300' : 'bg-blue-900/60 text-blue-300'
                          }`}>
                            {recipe.rarity}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 italic">"{recipe.description}"</p>
                        <p className="text-[10px] text-emerald-400 font-mono mt-1 font-bold">
                          Base Stat: +{recipe.baseStatValue} {recipe.baseStatType}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-2 flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Requirements:</span>
                        <span className={`text-xs font-bold font-mono ${playerState.gold >= recipe.goldCost ? 'text-amber-400' : 'text-rose-500'}`}>
                          🪙 {recipe.goldCost.toLocaleString()} Gold
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                        {recipe.materials.map((mat, idx) => {
                          const current = getMaterialCount(mat.name);
                          const satisfied = current >= mat.qty;
                          return (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                                satisfied ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/10' : 'bg-slate-950 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {mat.icon} {mat.name}: {current} / {mat.qty}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCraft(recipe)}
                      disabled={!matsSatisfied}
                      className={`w-full py-1.5 rounded text-[10px] font-mono font-bold uppercase cursor-pointer ${
                        matsSatisfied
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors'
                          : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed'
                      }`}
                    >
                      {matsSatisfied ? 'Forge Equipment' : 'Missing Resources'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'APPRAISE' && (
          <>
            {/* Accessories list */}
            <div className="md:col-span-5 bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2 max-h-[380px] overflow-y-auto">
              <h3 className="text-xs font-mono text-slate-400 border-b border-slate-800 pb-1 mb-1">SELECT ACCESSORY</h3>
              {getAppraisableItems().length === 0 ? (
                <div className="text-xs text-slate-500 italic text-center py-10 font-mono">
                  No accessories needing appraisal. Accessories must be unappraised Rings or Amulets.
                </div>
              ) : (
                getAppraisableItems().map(item => {
                  const isEquipped = Object.values(playerState.equipped).some(eq => eq?.id === item.id);
                  const isSelected = selectedAppraiseItem?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedAppraiseItem(item);
                        setSuccessMessage('');
                        setErrorMessage('');
                      }}
                      className={`w-full p-2.5 text-left rounded border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500'
                          : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="text-xs font-bold font-mono text-white">{item.name}</p>
                          <p className="text-[10px] text-amber-500 font-mono uppercase">Requires Appraisal</p>
                        </div>
                      </div>
                      {isEquipped && (
                        <span className="bg-blue-900/60 border border-blue-500 text-blue-300 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded font-mono">
                          EQUIPPED
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Appraisal console */}
            <div className="md:col-span-7 bg-slate-950/40 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
              {selectedAppraiseItem ? (
                <div className="flex flex-col gap-4 h-full justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl p-2 bg-slate-900 border border-slate-800 rounded-lg shadow-md animate-pulse">
                        {selectedAppraiseItem.icon}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold font-mono text-violet-400">{selectedAppraiseItem.name}</h4>
                        <p className="text-xs text-slate-400 italic">"Mystery properties concealed in the crystal core."</p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
                      <div className="flex justify-between border-b border-slate-800 pb-1.5 text-[10px] text-slate-500">
                        <span>UNLOCKED APPRAISAL PROPERTY</span>
                        <span>PROBABILITY</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-300">
                        <span>🔥 Fire Damage Boost</span>
                        <span className="text-emerald-400 font-bold">16%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-300">
                        <span>❤️ Maximum HP Boost</span>
                        <span className="text-emerald-400 font-bold">16%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-300">
                        <span>💀 Critical DMG Amplifier</span>
                        <span className="text-emerald-400 font-bold">16%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-300">
                        <span>🍷 Combat Lifesteal Rate</span>
                        <span className="text-emerald-400 font-bold">16%</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Appraisal Gold Fee:</span>
                      <span className={playerState.gold >= 1000 ? 'text-amber-400 font-bold' : 'text-rose-500 font-bold'}>
                        🪙 1,000 Gold
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleAppraise}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold font-mono tracking-wider rounded-lg text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    🔍 EXECUTE ANCIENT APPRAISAL
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-mono gap-2 text-center">
                  <Sparkles size={32} className="animate-pulse text-violet-500" />
                  <p className="text-xs">Select a locked accessory ring or amulet to reveal sleeping secondary attributes.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
