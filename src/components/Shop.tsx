import { useState } from 'react';
import { ShoppingBag, Coins, ShieldAlert, Check } from 'lucide-react';
import { PlayerState, Item } from '../types';
import { playSound } from '../utils/audio';

interface ShopProps {
  playerState: PlayerState;
  setPlayerState: (state: PlayerState | ((prev: PlayerState) => PlayerState)) => void;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  type: 'POTION' | 'MATERIAL';
  quantityToBuy: number;
}

export default function Shop({ playerState, setPlayerState }: ShopProps) {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const SHOP_INVENTORY: ShopItem[] = [
    {
      id: 'shop_hp_potion',
      name: 'HP Potion',
      description: 'Restores +150 Health points instantly. Essential for surviving boss stages.',
      icon: '🧪',
      cost: 150,
      type: 'POTION',
      quantityToBuy: 1,
    },
    {
      id: 'shop_mp_potion',
      name: 'MP Potion',
      description: 'Restores +50 Mana points instantly. Cast active skills more frequently.',
      icon: '💧',
      cost: 100,
      type: 'POTION',
      quantityToBuy: 1,
    },
    {
      id: 'shop_iron_ore',
      name: 'Iron Ores',
      description: 'Sturdy metalloid bricks used for upgrading armor and weapons at the Blacksmith.',
      icon: '🪨',
      cost: 250,
      type: 'MATERIAL',
      quantityToBuy: 1,
    },
  ];

  const handleBuy = (shopItem: ShopItem) => {
    if (playerState.gold < shopItem.cost) {
      setErrorMessage('Insufficient Gold to buy this item!');
      playSound('hurt');
      return;
    }

    setPlayerState(prev => {
      const gold = prev.gold - shopItem.cost;

      // Check if item is already in inventory
      let inventory = [...prev.inventory];
      const existing = inventory.find(i => i.name === shopItem.name);

      if (existing) {
        inventory = inventory.map(i =>
          i.name === shopItem.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        const newItem: Item = {
          id: `shop_buy_${shopItem.id}_${Date.now()}`,
          name: shopItem.name,
          type: shopItem.type,
          description: shopItem.description,
          quantity: 1,
          icon: shopItem.icon,
          rarity: 'COMMON',
        };
        inventory.push(newItem);
      }

      return {
        ...prev,
        gold,
        inventory,
      };
    });

    playSound('upgrade');
    setSuccessMessage(`Purchased 1x ${shopItem.name}!`);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const handleSell = (item: Item) => {
    if (item.type === 'EQUIPMENT' && Object.values(playerState.equipped).some(eq => eq?.id === item.id)) {
      setErrorMessage('Cannot sell currently equipped gear!');
      playSound('hurt');
      return;
    }

    // Sell value is 50% of buying or base tier price
    let sellValue = 100;
    if (item.name === 'HP Potion') sellValue = 50;
    else if (item.name === 'MP Potion') sellValue = 30;
    else if (item.name === 'Iron Ores') sellValue = 80;
    else if (item.name === 'Fire Core') sellValue = 500;
    else if (item.name === 'Magic Dust') sellValue = 700;
    else if (item.type === 'EQUIPMENT') {
      sellValue = 400 + (item.upgradeLevel || 0) * 150;
      if (item.rarity === 'RARE') sellValue *= 2;
      if (item.rarity === 'EPIC') sellValue *= 4;
    } else if (item.rarity === 'ADMIN') {
      sellValue = 10000;
    }

    setPlayerState(prev => {
      const gold = prev.gold + sellValue;
      let inventory = prev.inventory.map(i => {
        if (i.id === item.id) {
          return { ...i, quantity: i.quantity - 1 };
        }
        return i;
      }).filter(i => i.quantity > 0 || (i.type === 'EQUIPMENT' && i.id !== item.id));

      return {
        ...prev,
        gold,
        inventory,
      };
    });

    playSound('levelup');
    setSuccessMessage(`Sold 1x ${item.name} for 🪙 ${sellValue} Gold!`);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-5 text-slate-100 shadow-xl w-full flex flex-col gap-4">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
            <ShoppingBag size={24} id="shop-bag-icon" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-mono tracking-tight text-sky-400">ALAVIA GENERAL STORE</h2>
            <p className="text-xs text-slate-400">Stock up on combat health potions and precious iron forge ore materials.</p>
          </div>
        </div>

        {/* Currency summary */}
        <div className="flex items-center gap-2 text-sm font-mono bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30 text-amber-400 font-bold">
          <Coins size={16} /> {playerState.gold.toLocaleString()} Gold
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-lg p-2 text-center text-emerald-400 text-xs font-bold font-mono animate-bounce">
          ✓ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-rose-950/80 border border-rose-500/50 rounded-lg p-2 text-center text-rose-400 text-xs font-bold font-mono">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Main shop grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[300px]">
        {/* BUY SECTION */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold font-mono text-sky-400 border-b border-slate-800 pb-1.5 uppercase tracking-wider">
            🛒 BUY MERCHANDISE
          </h3>

          <div className="flex flex-col gap-3">
            {SHOP_INVENTORY.map(item => (
              <div
                key={item.id}
                className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-3 transition-all hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-1 bg-slate-950 border border-slate-800 rounded">{item.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold font-mono text-white">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 italic leading-snug mt-0.5">{item.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-slate-950 hover:text-white font-bold font-mono text-xs rounded transition-all cursor-pointer flex flex-col items-center justify-center min-w-[85px] leading-tight"
                >
                  <span className="font-extrabold uppercase">BUY</span>
                  <span className="text-[9px] mt-0.5">🪙 {item.cost}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SELL SECTION */}
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col gap-3 max-h-[352px]">
          <h3 className="text-xs font-bold font-mono text-rose-400 border-b border-slate-800 pb-1.5 uppercase tracking-wider">
            💰 SELL SURPLUS ITEMS
          </h3>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {playerState.inventory.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-20 font-mono">No inventory items to sell.</p>
            ) : (
              playerState.inventory.map(item => {
                let sellValue = 100;
                if (item.name === 'HP Potion') sellValue = 50;
                else if (item.name === 'MP Potion') sellValue = 30;
                else if (item.name === 'Iron Ores') sellValue = 80;
                else if (item.name === 'Fire Core') sellValue = 500;
                else if (item.name === 'Magic Dust') sellValue = 700;
                else if (item.type === 'EQUIPMENT') {
                  sellValue = 400 + (item.upgradeLevel || 0) * 150;
                  if (item.rarity === 'RARE') sellValue *= 2;
                  if (item.rarity === 'EPIC') sellValue *= 4;
                } else if (item.rarity === 'ADMIN') {
                  sellValue = 10000;
                }

                const isEquipped = Object.values(playerState.equipped).some(eq => eq?.id === item.id);

                return (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                          {item.name}
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-sky-400">x{item.quantity}</span>
                          )}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono uppercase">
                          {item.type} {item.upgradeLevel !== undefined && `(+${item.upgradeLevel})`}
                        </p>
                      </div>
                    </div>

                    {isEquipped ? (
                      <span className="bg-blue-900/60 border border-blue-500/40 text-blue-300 text-[8px] font-mono font-bold uppercase px-2 py-1 rounded">
                        EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSell(item)}
                        className="px-3 py-1 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-500/20 rounded font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        SELL <span className="text-amber-400 font-semibold">🪙{sellValue}</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
