import React, { useState } from 'react';
import { Item, Rarity, ItemType } from '../types';
import { SHOP_ITEMS } from '../constants';
import { generateItemLore } from '../services/geminiService';

interface ShopModalProps {
  onClose: () => void;
  onBuy: (item: Item) => void;
  gold: number;
  inventory: Item[];
}

const RarityColor = {
  [Rarity.COMMON]: 'text-slate-400 drop-shadow-[0_0_2px_rgba(148,163,184,0.5)]',
  [Rarity.RARE]: 'text-cyan-400 drop-shadow-[0_0_3px_rgba(34,211,238,0.6)]',
  [Rarity.EPIC]: 'text-fuchsia-400 drop-shadow-[0_0_3px_rgba(232,121,249,0.6)]',
  [Rarity.LEGENDARY]: 'text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.6)]'
};

const ShopModal: React.FC<ShopModalProps> = ({ onClose, onBuy, gold, inventory }) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [lore, setLore] = useState<string>("");
  const [loadingLore, setLoadingLore] = useState(false);
  const [filter, setFilter] = useState<'ALL' | ItemType.WEAPON | ItemType.ARMOR>('ALL');

  const handleSelect = async (item: Item) => {
    setSelectedItem(item);
    setLore(""); // Reset lore
  };

  const handleGenerateLore = async () => {
    if (!selectedItem) return;
    setLoadingLore(true);
    const newLore = await generateItemLore(selectedItem);
    setLore(newLore);
    setLoadingLore(false);
  };

  const isOwned = selectedItem ? inventory.some(i => i.id === selectedItem.id) : false;

  const filteredItems = SHOP_ITEMS.filter(item => {
      if (filter === 'ALL') return true;
      return item.type === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Main Container */}
      <div className="w-full max-w-6xl h-[85vh] glass-panel flex flex-col md:flex-row relative overflow-hidden clip-path-notch">
        
        {/* Decorative Grid BG */}
        <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-cyan-500/50 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-pink-500/50 pointer-events-none"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-0 right-0 p-2 text-cyan-500 hover:text-white z-20 hover:bg-cyan-900/20 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Left: Item List (Marketplace) - Maximized (70%) */}
        <div className="w-full md:w-[70%] flex flex-col border-r border-white/10 relative z-10 bg-black/40 h-[70%] md:h-full min-h-0 transition-all">
          <div className="p-6 pb-2 border-b border-cyan-500/30 shrink-0">
             <h2 className="text-2xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wider">NEO-MARKET</h2>
             <p className="text-cyan-600/80 text-xs font-tech tracking-widest mt-1 mb-4">:: UNAUTHORIZED DEALER DETECTED ::</p>
             
             {/* Tabs - Scrollable */}
             <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-700 overflow-x-auto custom-scrollbar no-scrollbar-on-mobile">
                 {['ALL', ItemType.WEAPON, ItemType.ARMOR].map(tab => (
                     <button
                        key={tab}
                        onClick={() => setFilter(tab as any)}
                        className={`flex-none px-4 py-1.5 text-[10px] font-cyber tracking-widest uppercase transition-all rounded whitespace-nowrap ${filter === tab ? 'bg-cyan-700 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800 hover:text-cyan-300'}`}
                     >
                         {tab === 'ALL' ? 'ALL GOODS' : tab + 'S'}
                     </button>
                 ))}
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-cyan-700 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                {filteredItems.map((item) => {
                const itemOwned = inventory.some(i => i.id === item.id);
                return (
                    <div 
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`flex items-center gap-4 p-3 border transition-all cursor-pointer group relative overflow-hidden shrink-0 ${selectedItem?.id === item.id ? 'bg-cyan-900/30 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-slate-900/40 border-slate-700 hover:border-cyan-500/50'}`}
                    >
                    {selectedItem?.id === item.id && <div className="absolute inset-0 bg-cyan-400/5 animate-pulse"></div>}
                    
                    <div className="w-16 h-16 bg-black border border-slate-600 shrink-0 relative">
                        <img src={item.image} alt={item.name} className={`w-full h-full object-cover transition-all ${itemOwned ? 'grayscale opacity-50' : 'opacity-80 group-hover:opacity-100 group-hover:grayscale-0'}`} />
                        {/* Rarity Corner */}
                        <div className={`absolute top-0 right-0 w-3 h-3 ${item.rarity === Rarity.LEGENDARY ? 'bg-yellow-500' : (item.rarity === Rarity.EPIC ? 'bg-purple-500' : 'bg-cyan-500')}`}></div>
                        {itemOwned && <div className="absolute inset-0 flex items-center justify-center text-green-500 font-bold text-xl">✓</div>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-cyber text-sm truncate ${itemOwned ? 'text-slate-500' : RarityColor[item.rarity]}`}>{item.name.toUpperCase()}</h3>
                        <div className="text-[10px] text-slate-400 font-tech uppercase tracking-widest mt-1 flex gap-2">
                            <span className="bg-slate-800 px-1 rounded">{item.type}</span>
                            <span>{item.rarity}</span>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className={`font-tech font-bold text-lg ${itemOwned ? 'text-slate-600' : (gold >= item.price ? 'text-yellow-400' : 'text-red-500')}`}>
                            {item.price}<span className="text-[10px] ml-0.5">CR</span>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
          </div>
        </div>

        {/* Right: Details Panel (Data Terminal) - Minimized (30%) */}
        <div className="w-full md:w-[30%] p-3 md:p-4 flex flex-col relative z-10 bg-gradient-to-br from-slate-900/90 to-black/90 h-[30%] md:h-full min-h-0 overflow-y-auto border-l border-white/10 transition-all">
           {selectedItem ? (
             <>
                {/* Header Row: Photo + Name/Stats + Buy Button */}
                <div className="flex gap-3 mb-3 items-start shrink-0 bg-slate-900/40 p-2 border border-slate-700/50 rounded-sm flex-wrap md:flex-nowrap">
                   
                   {/* 1. Photo (Slim) */}
                   <div className="w-14 h-7 md:w-16 md:h-7 shrink-0 border border-cyan-500/50 p-0.5 relative shadow-[0_0_10px_rgba(6,182,212,0.15)] bg-black/50 overflow-hidden">
                       <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                       <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-b border-r border-cyan-400"></div>
                       <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-t border-l border-cyan-400"></div>
                   </div>
                   
                   {/* 2. Info */}
                   <div className="flex-1 min-w-0 flex flex-col justify-center h-full gap-1 pt-0.5">
                       <div>
                           <h2 className={`text-xs md:text-sm font-cyber font-bold leading-none truncate ${RarityColor[selectedItem.rarity]}`}>{selectedItem.name.toUpperCase()}</h2>
                       </div>
                       
                       <div className="flex flex-wrap gap-1">
                           {Object.entries(selectedItem.stats).map(([key, val]) => (
                             <div key={key} className="flex items-center gap-1 bg-slate-800/80 px-1 py-px border-l border-cyan-600">
                                <span className="text-cyan-500 text-[6px] font-cyber uppercase tracking-wider">{key.substring(0,3)}</span>
                                <span className={`font-mono text-[8px] font-bold ${Number(val) > 0 ? 'text-green-400' : 'text-red-400'}`}>{Number(val) > 0 ? '+' : ''}{val}</span>
                             </div>
                           ))}
                       </div>
                   </div>
                   
                   {/* 3. Buy Button */}
                   <button 
                         onClick={() => onBuy(selectedItem)}
                         disabled={gold < selectedItem.price || isOwned}
                         className={`shrink-0 px-2 py-1.5 md:px-3 md:py-2 font-cyber font-bold transition-all uppercase tracking-widest text-[9px] clip-path-corner relative overflow-hidden group flex flex-col items-center justify-center gap-px ${
                            isOwned 
                            ? 'bg-slate-700 text-slate-400 border border-slate-600 cursor-not-allowed' 
                            : 'bg-cyan-700 hover:bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:grayscale'
                         }`}
                   >
                         <span className="relative z-10 leading-none">
                            {isOwned ? 'OWNED' : 'BUY'}
                         </span>
                         {!isOwned && (
                             <span className={`relative z-10 text-[8px] font-mono leading-none ${gold >= selectedItem.price ? 'text-cyan-100' : 'text-red-300'}`}>
                                 {selectedItem.price}
                             </span>
                         )}
                         {!isOwned && <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>}
                   </button>
                </div>

                {/* Data Logs Area */}
                <div className="bg-black/40 border border-slate-700 p-3 relative flex-1 overflow-y-auto custom-scrollbar min-h-[80px]">
                   <div className="flex justify-between items-start mb-2">
                        <div className="text-[8px] px-2 py-px text-slate-400 font-tech border border-slate-800 bg-slate-900/50">DATA_LOGS</div>
                        
                        <button 
                         onClick={handleGenerateLore}
                         disabled={loadingLore}
                         className="flex items-center gap-1 px-2 py-px text-pink-400 font-cyber hover:bg-pink-500/10 hover:text-pink-300 transition-all disabled:opacity-50 uppercase tracking-widest text-[8px]"
                       >
                         <span className="w-1 h-1 bg-pink-500 rounded-full animate-pulse"></span>
                         DECRYPT
                       </button>
                   </div>
                   
                   <p className="text-slate-300 font-tech text-xs leading-relaxed border-l-2 border-slate-600 pl-2 mb-2">
                       "{selectedItem.description}"
                   </p>
                   
                   {/* Lore Terminal */}
                   <div className="font-mono text-[10px] text-cyan-300/80 min-h-[50px] bg-slate-900/30 p-2 border border-slate-800/50 leading-tight">
                     {loadingLore ? (
                         <span className="animate-pulse">{">> "}ACCESSING...</span>
                     ) : lore ? (
                         <span className="animate-in fade-in duration-500">{lore}</span>
                     ) : (
                         <span className="opacity-40 text-[8px]">{">> "}ENCRYPTED.</span>
                     )}
                   </div>
                </div>

             </>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-700">
                <div className="w-12 h-12 md:w-16 md:h-16 border-2 border-dashed border-slate-800 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl animate-pulse">⟡</span>
                </div>
                <p className="font-cyber text-[10px] tracking-widest text-center px-4">SELECT ITEM TO INITIALIZE</p>
             </div>
           )}
        </div>

      </div>
      <style>{`
        .clip-path-notch {
          clip-path: polygon(
            0 0, 
            100% 0, 
            100% calc(100% - 20px), 
            calc(100% - 20px) 100%, 
            0 100%
          );
        }
        .clip-path-corner {
            clip-path: polygon(
                5px 0, 100% 0, 
                100% calc(100% - 5px), calc(100% - 5px) 100%, 
                0 100%, 0 5px
            );
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
        
        /* Hide scrollbar on mobile horizontal tabs */
        @media (max-width: 768px) {
           .no-scrollbar-on-mobile::-webkit-scrollbar { display: none; }
           .no-scrollbar-on-mobile { -ms-overflow-style: none; scrollbar-width: none; }
        }
      `}</style>
    </div>
  );
};

export default ShopModal;