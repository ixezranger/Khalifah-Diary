import React, { useState, useRef } from 'react';
import { Item, ItemType, PlayerStats, Rarity, AvatarConfig } from '../types';
import CharacterPreview from './CharacterPreview';

interface InventoryModalProps {
  onClose: () => void;
  inventory: Item[];
  equippedItems: Item[];
  playerStats: PlayerStats;
  onEquip: (item: Item) => void;
  onUnequip: (item: Item) => void;
  onUpgrade: (item: Item) => void;
  onUpdateAvatar: (config: AvatarConfig) => void;
}

const RarityBorder = {
  [Rarity.COMMON]: 'border-slate-600',
  [Rarity.RARE]: 'border-cyan-500',
  [Rarity.EPIC]: 'border-fuchsia-500',
  [Rarity.LEGENDARY]: 'border-yellow-500'
};

const RarityBg = {
  [Rarity.COMMON]: 'bg-slate-900',
  [Rarity.RARE]: 'bg-cyan-900/20',
  [Rarity.EPIC]: 'bg-fuchsia-900/20',
  [Rarity.LEGENDARY]: 'bg-yellow-900/20'
};

const MAX_LEVEL = 20;

const InventoryModal: React.FC<InventoryModalProps> = ({ 
  onClose, inventory, equippedItems, playerStats, onEquip, onUnequip, onUpgrade, onUpdateAvatar
}) => {
  const [filter, setFilter] = useState<'ALL' | ItemType | 'GEAR'>('ALL');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // REVERSE inventory so newest items (just purchased) are at the top
  const filteredInventory = inventory.slice().reverse().filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'GEAR') return item.type === ItemType.WEAPON || item.type === ItemType.ARMOR;
    return item.type === filter;
  });

  // Find specific equipped items for slots
  const equippedWeapon = equippedItems.find(i => i.type === ItemType.WEAPON);
  const equippedArmor = equippedItems.find(i => i.type === ItemType.ARMOR);

  // Resolve the full item object from ID
  const selectedItem = selectedItemId 
    ? (equippedItems.find(i => i.id === selectedItemId) || inventory.find(i => i.id === selectedItemId)) 
    : null;

  const handleItemClick = (item: Item) => {
      setSelectedItemId(item.id);
  };

  // Upgrade Cost Calculation - Minimized Cost Curve
  const getUpgradeCost = (level: number) => {
      // Base cost 25, scales gently (20% increase per level)
      return Math.floor(25 * Math.pow(1.2, level));
  };
  
  const currentUpgradeLevel = selectedItem?.upgradeLevel || 0;
  const upgradeCost = getUpgradeCost(currentUpgradeLevel);
  const isMaxLevel = currentUpgradeLevel >= MAX_LEVEL;
  const canAffordUpgrade = !isMaxLevel && playerStats.runes >= upgradeCost;

  // Avatar Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdateAvatar({
                  ...playerStats.avatarConfig,
                  photoUrl: reader.result as string,
                  usePhoto: true
              });
          };
          reader.readAsDataURL(file);
      }
  };

  const toggleAvatarMode = () => {
      onUpdateAvatar({
          ...playerStats.avatarConfig,
          usePhoto: !playerStats.avatarConfig.usePhoto
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-7xl h-[90vh] sm:h-[85vh] bg-slate-900 border border-cyan-500/30 flex flex-col relative shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        
        {/* Header */}
        <div className="h-10 border-b border-slate-700 flex justify-between items-center px-3 bg-black/60 shrink-0">
           <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
               <h2 className="text-lg font-cyber text-cyan-50 tracking-wider neon-text">TACTICAL LOADOUT</h2>
               <div className="h-3 w-px bg-slate-700"></div>
               <span className="text-[10px] font-mono text-yellow-400">CREDITS: {playerStats.gold}</span>
               <div className="h-3 w-px bg-slate-700"></div>
               <span className="text-[10px] font-mono text-purple-400">RUNES: {playerStats.runes}</span>
           </div>
           <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-lg font-bold px-2">✕</button>
        </div>

        {/* Content - Responsive Columns */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* Col 1: Character & Loadout Slots (Side-by-Side Layout) */}
            <div className="order-1 w-full lg:w-[280px] shrink-0 border-r border-slate-800 bg-black/30 flex flex-row relative group/char">
                
                {/* Left Side: Visual Feed */}
                <div className="w-[110px] p-2 border-r border-slate-800/50 flex flex-col items-center justify-center bg-gradient-to-b from-black/20 to-transparent shrink-0 relative">
                    <h3 className="w-full font-cyber text-[8px] text-slate-500 uppercase tracking-widest mb-1 text-center">Visual Feed</h3>
                    <div className="w-full relative cursor-pointer" onClick={() => setIsEditingAvatar(!isEditingAvatar)}> 
                        <CharacterPreview stats={playerStats} equippedItems={equippedItems} />
                        {/* Edit Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/char:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[9px] font-cyber text-cyan-400 border border-cyan-500 px-1 py-0.5 bg-black/80">EDIT</span>
                        </div>
                    </div>

                    {/* Avatar Editor Popover */}
                    {isEditingAvatar && (
                        <div className="absolute top-[20px] left-[5px] right-[5px] bg-slate-900 border border-cyan-500/50 p-2 z-20 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                            <h4 className="text-[9px] font-cyber text-cyan-400 mb-1 border-b border-slate-700 pb-0.5">AVATAR MODULE</h4>
                            
                            <div className="flex flex-col gap-1.5">
                                {/* Toggle */}
                                <label className="flex items-center justify-between text-[8px] text-slate-300 cursor-pointer">
                                    <span>USE PHOTO</span>
                                    <div className={`w-6 h-3 rounded-full p-0.5 transition-colors ${playerStats.avatarConfig.usePhoto ? 'bg-cyan-600' : 'bg-slate-700'}`} onClick={toggleAvatarMode}>
                                        <div className={`w-2 h-2 bg-white rounded-full shadow-sm transform transition-transform ${playerStats.avatarConfig.usePhoto ? 'translate-x-3' : 'translate-x-0'}`}></div>
                                    </div>
                                </label>

                                {/* Upload */}
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[8px] text-white font-mono uppercase transition-colors"
                                >
                                    UPLOAD
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handlePhotoUpload} 
                                />
                                
                                <button onClick={() => setIsEditingAvatar(false)} className="text-[8px] text-slate-500 hover:text-white mt-0.5 underline">CLOSE</button>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Right Side: Active System Stack */}
                <div className="flex-1 p-2 flex flex-col gap-2 justify-center overflow-hidden">
                    <h4 className="text-[8px] font-mono text-cyan-600 flex justify-between items-center shrink-0">
                        <span>{">> "}ACTIVE SYSTEM</span>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></span>
                    </h4>
                    
                    {/* Weapon Slot */}
                    <div 
                        onClick={() => equippedWeapon && handleItemClick(equippedWeapon)}
                        className={`relative flex items-center gap-2 p-1.5 border border-slate-700 bg-slate-800/40 cursor-pointer hover:bg-slate-800 transition-all group ${selectedItem?.id === equippedWeapon?.id ? 'border-cyan-400 bg-cyan-900/10' : ''}`}
                    >
                        <div className="w-10 h-10 bg-black border border-slate-600 flex items-center justify-center shrink-0 group-hover:border-cyan-500/50 transition-colors">
                            {equippedWeapon ? (
                                <img src={equippedWeapon.image} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg opacity-20">⚔️</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[7px] text-slate-500 uppercase tracking-wider block">WEAPON</span>
                            <div className={`text-[10px] font-bold truncate ${equippedWeapon ? 'text-white' : 'text-slate-600'}`}>
                                {equippedWeapon ? equippedWeapon.name : 'EMPTY'}
                            </div>
                            {equippedWeapon?.upgradeLevel ? <span className="text-[8px] text-purple-400 font-mono">+{equippedWeapon.upgradeLevel}</span> : null}
                        </div>
                    </div>

                    {/* Armor Slot */}
                    <div 
                        onClick={() => equippedArmor && handleItemClick(equippedArmor)}
                        className={`relative flex items-center gap-2 p-1.5 border border-slate-700 bg-slate-800/40 cursor-pointer hover:bg-slate-800 transition-all group ${selectedItem?.id === equippedArmor?.id ? 'border-cyan-400 bg-cyan-900/10' : ''}`}
                    >
                         <div className="w-10 h-10 bg-black border border-slate-600 flex items-center justify-center shrink-0 group-hover:border-cyan-500/50 transition-colors">
                            {equippedArmor ? (
                                <img src={equippedArmor.image} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg opacity-20">🛡️</span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[7px] text-slate-500 uppercase tracking-wider block">ARMOR</span>
                            <div className={`text-[10px] font-bold truncate ${equippedArmor ? 'text-white' : 'text-slate-600'}`}>
                                {equippedArmor ? equippedArmor.name : 'EMPTY'}
                            </div>
                            {equippedArmor?.upgradeLevel ? <span className="text-[8px] text-purple-400 font-mono">+{equippedArmor.upgradeLevel}</span> : null}
                        </div>
                    </div>
                </div>
            </div>

            {/* Col 2: Storage Grid */}
            <div className="order-3 lg:order-2 flex-1 flex flex-col border-r border-slate-800 bg-slate-900/60 min-h-[150px]">
                <div className="flex border-b border-slate-800 bg-black/40 h-8 shrink-0">
                   {[
                       { label: 'ALL', value: 'ALL' },
                       { label: 'WEAPONS', value: ItemType.WEAPON },
                       { label: 'ARMOR', value: ItemType.ARMOR }
                   ].map(tab => (
                       <button
                         key={tab.value}
                         onClick={() => setFilter(tab.value as any)}
                         className={`flex-1 flex items-center justify-center text-[9px] font-cyber tracking-widest hover:bg-slate-800/50 transition-colors ${filter === tab.value ? 'bg-cyan-900/20 text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500'}`}
                       >
                           {tab.label}
                       </button>
                   ))}
                </div>

                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.05)_0%,transparent_50%)]">
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-9 lg:grid-cols-10 xl:grid-cols-12 gap-1.5">
                        {filteredInventory.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className={`aspect-square relative group cursor-pointer border transition-all overflow-hidden ${selectedItem?.id === item.id ? 'border-white ring-1 ring-white z-10' : `${RarityBorder[item.rarity]} ${RarityBg[item.rarity]} opacity-80 hover:opacity-100 hover:scale-105 hover:z-10`}`}
                            >
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                
                                {/* 'NEW' Tag */}
                                {inventory.indexOf(item) === inventory.length - 1 && (
                                     <div className="absolute top-0 left-0 bg-cyan-500 text-black text-[6px] font-bold px-0.5 leading-none shadow-md">NEW</div>
                                )}
                                {/* Upgrade Indicator */}
                                {item.upgradeLevel && item.upgradeLevel > 0 && (
                                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-[7px] font-bold px-0.5 shadow-sm">+{item.upgradeLevel}</div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-0.5">
                                    <span className="text-[7px] text-center text-white truncate font-mono w-full leading-none">{item.name}</span>
                                </div>
                            </div>
                        ))}
                        {Array.from({ length: Math.max(0, 40 - filteredInventory.length) }).map((_, i) => (
                             <div key={`empty-${i}`} className="aspect-square bg-slate-900/20 border border-slate-800/20 flex items-center justify-center">
                                 <div className="w-0.5 h-0.5 bg-slate-800 rounded-full"></div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Col 3: Workbench */}
            <div className={`order-2 lg:order-3 w-full lg:w-[260px] shrink-0 bg-black/50 flex flex-col border-l border-slate-800 backdrop-blur-sm transition-all duration-300 ${!selectedItem ? 'h-0 lg:h-full overflow-hidden' : 'h-[200px] lg:h-full'}`}>
                <div className="p-2 border-b border-slate-800/50 bg-black/20 shrink-0">
                     <h3 className="font-cyber text-[10px] text-slate-400 uppercase tracking-widest">Workbench</h3>
                </div>
                
                {selectedItem ? (
                    <div className="flex-1 flex flex-col p-2 animate-in slide-in-from-right-2 overflow-y-auto custom-scrollbar">
                        
                        {/* Selected Item Info & Stats Compact */}
                        <div className="flex gap-3 mb-2">
                            <div className={`w-12 h-12 border ${RarityBorder[selectedItem.rarity]} p-px bg-black shrink-0 shadow-lg relative`}>
                                <img src={selectedItem.image} className="w-full h-full object-cover" />
                                {selectedItem.isEquipped && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-black text-[6px] font-bold px-0.5 shadow-sm leading-none">E</div>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col min-w-0">
                                <div className="flex justify-between items-start">
                                    <h2 className={`text-xs font-cyber font-bold leading-tight ${selectedItem.rarity === Rarity.LEGENDARY ? 'text-yellow-400' : 'text-white'} truncate pr-1`}>{selectedItem.name}</h2>
                                    {selectedItem.isEquipped ? (
                                        <button 
                                            onClick={() => { onUnequip(selectedItem); setSelectedItemId(null); }}
                                            className="px-1.5 py-0.5 bg-red-900/30 border border-red-500/50 text-red-400 font-cyber text-[8px] font-bold tracking-widest hover:bg-red-900/50 hover:text-white transition-all shrink-0"
                                        >
                                            UNEQUIP
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => onEquip(selectedItem)}
                                            className="px-1.5 py-0.5 bg-cyan-700/50 border border-cyan-400 text-white font-cyber text-[8px] font-bold tracking-widest hover:bg-cyan-600/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all shrink-0"
                                        >
                                            EQUIP
                                        </button>
                                    )}
                                </div>
                                <div className="mt-0.5 mb-1 flex flex-wrap gap-1">
                                     <span className="text-[8px] font-mono text-black bg-slate-400 px-1 rounded font-bold">{selectedItem.type}</span>
                                     <span className="text-[8px] font-mono text-cyan-300 border border-cyan-500/30 px-1 rounded">{selectedItem.rarity}</span>
                                     {currentUpgradeLevel > 0 && <span className="text-[8px] font-mono text-purple-300 border border-purple-500/30 px-1 rounded bg-purple-900/20">+{currentUpgradeLevel}</span>}
                                </div>
                                
                                {/* Performance Metrics - Compact */}
                                <div className="grid grid-cols-2 gap-x-2 gap-y-0 pt-1 border-t border-slate-800/50">
                                    {Object.entries(selectedItem.stats).map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-[8px] font-mono leading-tight">
                                            <span className="text-slate-500 uppercase">{k}</span>
                                            <span className={`${Number(v) > 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>{Number(v) > 0 ? '+' : ''}{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Upgrade System */}
                        {(selectedItem.type === ItemType.WEAPON || selectedItem.type === ItemType.ARMOR) && (
                            <div className="flex-1 flex flex-col">
                                <div className="bg-black/20 p-2 border border-dashed border-purple-500/30 rounded-sm mb-1">
                                    <h4 className="text-[8px] text-purple-500 font-cyber mb-2 flex justify-between items-center">
                                        <span>ENHANCE</span>
                                        <span className="bg-purple-900/20 px-1 py-px rounded text-purple-300 border border-purple-500/20 text-[8px]">{currentUpgradeLevel}/{MAX_LEVEL}</span>
                                    </h4>
                                    
                                    <div className="flex justify-between items-center text-[9px] font-mono mb-1">
                                        <span className="text-slate-400">COST:</span>
                                        <span className={`${canAffordUpgrade ? 'text-purple-300' : (isMaxLevel ? 'text-slate-500' : 'text-red-400 font-bold')}`}>
                                            {isMaxLevel ? 'MAX' : `${upgradeCost} RN`}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                                        <div 
                                            className="h-full bg-purple-500 transition-all shadow-[0_0_5px_#a855f7]" 
                                            style={{ width: `${(currentUpgradeLevel / MAX_LEVEL) * 100}%` }}
                                        ></div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => onUpgrade(selectedItem)}
                                        disabled={!canAffordUpgrade || isMaxLevel}
                                        className="mt-2 w-full py-1 bg-purple-900/40 border border-purple-500/50 text-purple-300 font-cyber text-[9px] tracking-widest hover:bg-purple-800/50 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed clip-path-corner"
                                    >
                                        {isMaxLevel ? 'MAX POWER' : 'UPGRADE'}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 opacity-50 p-4 text-center">
                        <span className="text-2xl mb-1">⚡</span>
                        <p className="font-cyber text-[9px] tracking-widest">SELECT ITEM</p>
                    </div>
                )}
            </div>
        </div>

      </div>
      <style>{`
        .clip-path-corner {
            clip-path: polygon(
                5px 0, 100% 0, 
                100% calc(100% - 5px), calc(100% - 5px) 100%, 
                0 100%, 0 5px
            );
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 1px; }
      `}</style>
    </div>
  );
};

export default InventoryModal;