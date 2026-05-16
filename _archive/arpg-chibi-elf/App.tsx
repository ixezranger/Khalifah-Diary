import React, { useState, useRef, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import ShopModal from './components/ShopModal';
import InventoryModal from './components/InventoryModal';
import Controls from './components/Controls';
import { INITIAL_PLAYER_STATS } from './constants';
import { PlayerStats, Item, ItemType, AvatarConfig } from './types';
import { soundService } from './services/soundService';

const App: React.FC = () => {
  // Game State
  const [gameKey, setGameKey] = useState(0); // Forces remount of GameCanvas on restart
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [equippedItems, setEquippedItems] = useState<Item[]>([]);
  const [wave, setWave] = useState(1);
  const [isAutoplay, setIsAutoplay] = useState(false);
  
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  
  // Track cooldowns centrally (Skill ID -> End Timestamp)
  const [skillCooldowns, setSkillCooldowns] = useState<Record<number, number>>({});

  // Shared Mutable Ref for Input
  const inputRef = useRef({ vector: { x: 0, y: 0 }, isAttacking: false });
  // Ref to signal immediate skill usage to Canvas (for visual/combat logic)
  const skillTriggerRef = useRef<string | null>(null);

  // Passive Mana Regeneration
  useEffect(() => {
    const regenInterval = setInterval(() => {
      if (isPaused) return; // Don't regen if paused
      setPlayerStats(prev => {
        if (prev.mp >= prev.maxMp) return prev;
        const regenAmount = 5; // Regenerate 5 MP per second
        return {
          ...prev,
          mp: Math.min(prev.maxMp, prev.mp + regenAmount)
        };
      });
    }, 1000);

    return () => clearInterval(regenInterval);
  }, [isPaused]);

  // Audio Helpers
  const handleToggleMute = useCallback(() => {
      const newState = !isMuted;
      setIsMuted(newState);
      soundService.setMute(newState);
  }, [isMuted]);

  const playSFX = useCallback((type: 'attack' | 'hit' | 'kill' | 'buy' | 'equip' | 'levelUp' | 'click' | 'skill') => {
      soundService.playSFX(type);
  }, []);

  const handleRestart = () => {
    // Deep shallow copy of INITIAL stats including nested object to prevent ref issues
    setPlayerStats({
        ...INITIAL_PLAYER_STATS,
        avatarConfig: { ...INITIAL_PLAYER_STATS.avatarConfig }
    });
    setInventory([]);
    setEquippedItems([]);
    setWave(1);
    setIsAutoplay(false);
    setSkillCooldowns({});
    setIsPaused(false);
    setGameKey(prev => prev + 1);
    soundService.playSFX('click');
  };

  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
    soundService.playSFX('click');
  };

  const handleInput = (vector: { x: number, y: number }, isAttacking: boolean) => {
    inputRef.current = { vector, isAttacking };
  };

  const handlePlayerHit = useCallback((damage: number) => {
      setPlayerStats(prev => {
          const newHp = Math.max(0, prev.hp - Math.max(0, damage - prev.defense * 0.1)); 
          return { ...prev, hp: newHp };
      });
  }, []);

  const handleEnemyKill = useCallback((xp: number, gold: number, runes: number) => {
      setPlayerStats(prev => {
          const newXp = prev.xp + xp;
          let newLevel = prev.level;
          let newMaxXp = prev.maxXp;
          let newMaxHp = prev.maxHp;
          let newMaxMp = prev.maxMp;
          
          if (newXp >= prev.maxXp) {
              newLevel += 1;
              newMaxXp = Math.floor(prev.maxXp * 1.5);
              newMaxHp += 50;
              newMaxMp += 20; // Increase max MP on level up
              soundService.playSFX('levelUp');
          }
          
          return {
              ...prev,
              xp: newXp >= prev.maxXp ? newXp - prev.maxXp : newXp,
              maxXp: newMaxXp,
              level: newLevel,
              maxHp: newMaxHp,
              maxMp: newMaxMp,
              hp: newLevel > prev.level ? newMaxHp : prev.hp,
              mp: newLevel > prev.level ? newMaxMp : prev.mp, // Refill MP on level up
              gold: prev.gold + gold,
              runes: prev.runes + runes
          };
      });
  }, []);

  const handleWaveComplete = useCallback(() => {
      setWave(prev => prev + 1);
      soundService.playSFX('levelUp'); // Sound for wave clear
  }, []);

  const handleUseSkill = (skillId: number): boolean => {
      if (isPaused) return false;
      
      const now = Date.now();
      // Check cooldown
      if (skillCooldowns[skillId] && now < skillCooldowns[skillId]) {
          return false;
      }

      if (skillId === 1) { // Spin
          if (playerStats.mp >= 10) { // Cost reduced to 10
              setPlayerStats(prev => ({ ...prev, mp: prev.mp - 10 }));
              skillTriggerRef.current = 'spin'; 
              return true;
          }
      } else if (skillId === 2) { // Heal
          if (playerStats.mp >= 25 && playerStats.hp < playerStats.maxHp) { // Cost reduced to 25
              setPlayerStats(prev => ({ 
                  ...prev, 
                  mp: prev.mp - 25,
                  hp: Math.min(prev.maxHp, prev.hp + prev.maxHp * 0.4) 
              }));
              soundService.playSFX('skill');
              return true;
          }
      } else if (skillId === 3) { // Fireball (Long Range)
          if (playerStats.mp >= 5) { // Cost reduced to 5
              setPlayerStats(prev => ({ ...prev, mp: prev.mp - 5 }));
              skillTriggerRef.current = 'fireball';
              
              // Set 10s Cooldown for Fireball
              setSkillCooldowns(prev => ({ ...prev, [3]: now + 10000 }));
              
              return true;
          }
      }
      return false;
  };

  const handleBuyItem = (item: Item) => {
    if (playerStats.gold >= item.price) {
      soundService.playSFX('buy');
      
      const isGear = item.type === ItemType.WEAPON || item.type === ItemType.ARMOR;

      if (isGear) {
        const currentEquipped = equippedItems.find(i => i.type === item.type);
        
        // 1. Update Inventory: Move old equipped item to inventory if exists
        if (currentEquipped) {
            setInventory(prev => [...prev, { ...currentEquipped, isEquipped: false }]);
        }
        // Note: New item doesn't go to inventory, it goes straight to equipped.

        // 2. Update Equipped Items: Replace old with new
        const newItem = { ...item, isEquipped: true };
        setEquippedItems(prev => [...prev.filter(i => i.type !== item.type), newItem]);

        // 3. Update Player Stats: Gold, and stat diffs
        setPlayerStats(prev => {
            let stats = { ...prev, gold: prev.gold - item.price };
            
            if (currentEquipped) {
                stats.attack -= (currentEquipped.stats.attack || 0);
                stats.defense -= (currentEquipped.stats.defense || 0);
                stats.maxHp -= (currentEquipped.stats.hp || 0);
                stats.maxMp -= (currentEquipped.stats.mp || 0);
            }

            stats.attack += (newItem.stats.attack || 0);
            stats.defense += (newItem.stats.defense || 0);
            stats.maxHp += (newItem.stats.hp || 0);
            stats.maxMp += (newItem.stats.mp || 0);

            return stats;
        });

      } else {
        // Default behavior for non-gear items
        setPlayerStats(prev => ({ ...prev, gold: prev.gold - item.price }));
        setInventory(prev => [...prev, item]);
      }
    }
  };

  const handleUnequipItem = (item: Item) => {
      soundService.playSFX('equip');
      // Remove from equipped
      setEquippedItems(prev => prev.filter(i => i.id !== item.id));
      
      // Add back to inventory with isEquipped false
      const unequippedItem = { ...item, isEquipped: false };
      setInventory(prev => [...prev, unequippedItem]);

      // Remove stats
      setPlayerStats(prev => ({
          ...prev,
          attack: prev.attack - (item.stats.attack || 0),
          defense: prev.defense - (item.stats.defense || 0),
          maxHp: prev.maxHp - (item.stats.hp || 0),
          maxMp: prev.maxMp - (item.stats.mp || 0),
      }));
  };

  const handleEquipItem = (item: Item) => {
      soundService.playSFX('equip');
      // Remove from inventory
      setInventory(prev => prev.filter(i => i.id !== item.id));

      // Handle un-equipping current item of same type
      const currentEquipped = equippedItems.find(i => i.type === item.type);
      if (currentEquipped) {
          const unequipped = { ...currentEquipped, isEquipped: false };
          setInventory(prev => [...prev, unequipped]);
          
          // Remove stats of old item
          setPlayerStats(prev => ({
              ...prev,
              attack: prev.attack - (currentEquipped.stats.attack || 0),
              defense: prev.defense - (currentEquipped.stats.defense || 0),
              maxHp: prev.maxHp - (currentEquipped.stats.hp || 0),
              maxMp: prev.maxMp - (currentEquipped.stats.mp || 0),
          }));
      }

      // Equip new item
      const newItem = { ...item, isEquipped: true };
      // Filter out old item of same type then add new one
      setEquippedItems(prev => [...prev.filter(i => i.type !== item.type), newItem]);
      
      // Add stats of new item
      setPlayerStats(prev => ({
          ...prev,
          attack: prev.attack + (newItem.stats.attack || 0),
          defense: prev.defense + (newItem.stats.defense || 0),
          maxHp: prev.maxHp + (newItem.stats.hp || 0),
          maxMp: prev.maxMp + (newItem.stats.mp || 0),
      }));
  };

  const handleUpgradeItem = (item: Item) => {
     const level = item.upgradeLevel || 0;
     
     // Cap at level 20
     if (level >= 20) return;

     // Updated cost calculation to match InventoryModal (25 * 1.2^level)
     const cost = Math.floor(25 * Math.pow(1.2, level)); 

     if (playerStats.runes >= cost) {
         soundService.playSFX('equip'); // Use equip sound for upgrade
         setPlayerStats(prev => ({ ...prev, runes: prev.runes - cost }));

         const upgradeStat = (val?: number) => val ? Math.ceil(val * 1.1) : undefined; // 10% boost

         const upgrader = (i: Item) => ({
             ...i,
             upgradeLevel: (i.upgradeLevel || 0) + 1,
             stats: {
                 ...i.stats,
                 attack: upgradeStat(i.stats.attack),
                 defense: upgradeStat(i.stats.defense),
                 hp: upgradeStat(i.stats.hp),
                 mp: upgradeStat(i.stats.mp),
                 magic: upgradeStat(i.stats.magic),
                 speed: i.stats.speed // Speed remains constant to prevent OP movement
             }
         });

         if (item.isEquipped) {
             // If item is equipped, update it and adjust player stats by difference
             setEquippedItems(prev => {
                return prev.map(i => {
                    if (i.id === item.id) {
                        const newItem = upgrader(i);
                        // Update Player Stats diff
                        setPlayerStats(ps => ({
                            ...ps,
                            attack: ps.attack + ((newItem.stats.attack||0) - (i.stats.attack||0)),
                            defense: ps.defense + ((newItem.stats.defense||0) - (i.stats.defense||0)),
                            maxHp: ps.maxHp + ((newItem.stats.hp||0) - (i.stats.hp||0)),
                            maxMp: ps.maxMp + ((newItem.stats.mp||0) - (i.stats.mp||0)),
                        }));
                        return newItem;
                    }
                    return i;
                });
             });
         } else {
             // If item is in inventory, just update the item
             setInventory(prev => prev.map(i => i.id === item.id ? upgrader(i) : i));
         }
     }
  };

  const handleUpdateAvatar = (config: AvatarConfig) => {
      setPlayerStats(prev => ({ ...prev, avatarConfig: config }));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      
      <GameCanvas 
        key={gameKey}
        isPaused={isPaused}
        playerStats={playerStats} 
        equippedItems={equippedItems}
        inputState={inputRef}
        skillTriggerRef={skillTriggerRef}
        isAutoplay={isAutoplay}
        wave={wave}
        onPlayerHit={handlePlayerHit}
        onEnemyKilled={handleEnemyKill}
        onWaveComplete={handleWaveComplete}
        onRequestSkill={handleUseSkill}
        playSFX={playSFX}
      />

      <Controls 
        onInput={handleInput} 
        onSkill={handleUseSkill} 
        skillCooldowns={skillCooldowns}
      />
      
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_80%,rgba(0,0,0,0.8)_100%)]"></div>

      <UIOverlay 
        stats={playerStats}
        openShop={() => {
            if(!isPaused) {
                setIsShopOpen(true);
                soundService.playSFX('click');
            }
        }}
        openInventory={() => {
            if(!isPaused) {
                setIsInventoryOpen(true);
                soundService.playSFX('click');
            }
        }}
        equippedItems={equippedItems}
        wave={wave}
        isAutoplay={isAutoplay}
        isPaused={isPaused}
        isMuted={isMuted}
        toggleAutoplay={() => {
            setIsAutoplay(!isAutoplay);
            soundService.playSFX('click');
        }}
        onTogglePause={handleTogglePause}
        onRestart={handleRestart}
        onUseSkill={handleUseSkill}
        onToggleMute={handleToggleMute}
      />

      {isShopOpen && (
        <ShopModal 
          onClose={() => {
              setIsShopOpen(false);
              soundService.playSFX('click');
          }} 
          onBuy={handleBuyItem}
          gold={playerStats.gold}
          inventory={inventory}
        />
      )}

      {isInventoryOpen && (
        <InventoryModal 
            onClose={() => {
                setIsInventoryOpen(false);
                soundService.playSFX('click');
            }}
            inventory={inventory}
            equippedItems={equippedItems}
            playerStats={playerStats}
            onEquip={handleEquipItem}
            onUnequip={handleUnequipItem}
            onUpgrade={handleUpgradeItem}
            onUpdateAvatar={handleUpdateAvatar}
        />
      )}
    </div>
  );
};

export default App;