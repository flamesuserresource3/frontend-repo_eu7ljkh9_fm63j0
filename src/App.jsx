import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GamePanel from './components/GamePanel';
import InventoryPanel from './components/InventoryPanel';

function defaultState(code) {
  return {
    userCode: code || '',
    profile: {
      name: 'Unnamed Hero',
      level: 1,
      xp: 0,
      xpToNext: 100,
    },
    stats: { str: 3, agi: 3, int: 3, vit: 3 },
    equipment: { weapon: null, armor: null, accessory: null },
    inventory: [
      {
        id: 'starter_sword',
        name: 'Rusty Sword',
        description: 'A worn blade. Better than nothing.',
        type: 'weapon',
        modifiers: { str: 1 },
      },
      {
        id: 'bandage',
        name: 'Bandage',
        description: 'Stops minor bleeding. +1 VIT when used.',
        type: 'consumable',
        modifiers: { vit: 1 },
      },
    ],
    log: [],
  };
}

export default function App() {
  const [state, setState] = useState(defaultState(''));

  const saveKey = useMemo(() => (state.userCode ? `rpg_save_${state.userCode}` : null), [state.userCode]);

  const persist = () => {
    if (!saveKey) return;
    localStorage.setItem(saveKey, JSON.stringify(state));
  };

  const load = () => {
    if (!saveKey) return alert('Set your save code first.');
    const raw = localStorage.getItem(saveKey);
    if (!raw) return alert('No save found for this code.');
    try {
      const parsed = JSON.parse(raw);
      setState(parsed);
    } catch (e) {
      alert('Save data is corrupted.');
    }
  };

  const newGame = () => {
    setState(defaultState(state.userCode));
  };

  const setUserCode = (code) => setState((s) => ({ ...s, userCode: code }));

  const addLog = (text) =>
    setState((s) => ({ ...s, log: [...s.log, text] }));

  const recalcXP = (profile) => {
    let { level, xp, xpToNext } = profile;
    let leveledUp = false;
    while (xp >= xpToNext) {
      xp -= xpToNext;
      level += 1;
      xpToNext = Math.round(xpToNext * 1.25 + 10);
      leveledUp = true;
    }
    return { profile: { ...profile, level, xp, xpToNext }, leveledUp };
  };

  const gainXP = (amount) => {
    setState((s) => {
      const { profile } = s;
      const updated = recalcXP({ ...profile, xp: profile.xp + amount });
      const newLog = updated.leveledUp ? [...s.log, `You gained ${amount} XP and leveled up to ${updated.profile.level}!`] : [...s.log, `You gained ${amount} XP.`];
      return { ...s, profile: updated.profile, log: newLog };
    });
  };

  const applyModifiers = (stats, modifiers = {}) => {
    const next = { ...stats };
    for (const [k, v] of Object.entries(modifiers)) {
      if (k in next) next[k] = Math.max(0, next[k] + Number(v || 0));
    }
    return next;
  };

  const equipItem = (itemId) => {
    setState((s) => {
      const item = s.inventory.find((i) => i.id === itemId);
      if (!item) return s;
      if (!['weapon', 'armor', 'accessory'].includes(item.type)) return s;
      const slot = item.type;

      // Remove item from inventory
      const inv = s.inventory.filter((i) => i.id !== itemId);

      // If something is already equipped in slot, move it back to inventory and remove its modifiers
      let stats = { ...s.stats };
      let equipment = { ...s.equipment };
      if (equipment[slot]) {
        inv.push(equipment[slot]);
        stats = applyModifiers(stats, Object.fromEntries(Object.entries(equipment[slot].modifiers || {}).map(([k,v]) => [k, -v])));
      }

      equipment[slot] = item;
      stats = applyModifiers(stats, item.modifiers || {});

      const log = [...s.log, `Equipped ${item.name} (${slot}).`];
      return { ...s, equipment, inventory: inv, stats, log };
    });
  };

  const unequip = (slot) => {
    setState((s) => {
      const equipped = s.equipment[slot];
      if (!equipped) return s;
      const equipment = { ...s.equipment, [slot]: null };
      const inventory = [...s.inventory, equipped];
      const stats = applyModifiers(
        s.stats,
        Object.fromEntries(Object.entries(equipped.modifiers || {}).map(([k, v]) => [k, -v]))
      );
      const log = [...s.log, `Unequipped ${equipped.name}.`];
      return { ...s, equipment, inventory, stats, log };
    });
  };

  const useConsumable = (itemId) => {
    setState((s) => {
      const item = s.inventory.find((i) => i.id === itemId);
      if (!item || item.type !== 'consumable') return s;
      const inventory = s.inventory.filter((i) => i.id !== itemId);
      const stats = applyModifiers(s.stats, item.modifiers || {});
      const log = [...s.log, `Used ${item.name}.`];
      return { ...s, inventory, stats, log };
    });
  };

  const dropItem = (itemId) => {
    setState((s) => {
      const item = s.inventory.find((i) => i.id === itemId);
      if (!item) return s;
      const inventory = s.inventory.filter((i) => i.id !== itemId);
      const log = [...s.log, `Dropped ${item.name}.`];
      return { ...s, inventory, log };
    });
  };

  const mergeItems = (current, gainItems = []) => {
    const byId = new Map(current.map((i) => [i.id, i]));
    for (const it of gainItems) {
      if (byId.has(it.id)) {
        // If item exists, create a new id with suffix to avoid collision
        const base = it.id;
        let idx = 2;
        let newId = `${base}_${idx}`;
        while (byId.has(newId)) { idx += 1; newId = `${base}_${idx}`; }
        byId.set(newId, { ...it, id: newId });
      } else {
        byId.set(it.id, it);
      }
    }
    return Array.from(byId.values());
  };

  const applyAIEvent = (event) => {
    // Event structure can include: log, gainItems[], removeItems[], xp, statsDelta{}, equip {slot,itemId}
    setState((s) => {
      let log = [...s.log];
      if (event.log) log.push(String(event.log));
      let inventory = mergeItems(s.inventory, event.gainItems || []);
      if (event.removeItems?.length) {
        const toRemove = new Set(event.removeItems);
        inventory = inventory.filter((i) => !toRemove.has(i.id));
      }
      let stats = applyModifiers(s.stats, event.statsDelta || {});

      let profile = { ...s.profile };
      if (event.xp) {
        const updated = recalcXP({ ...profile, xp: profile.xp + Number(event.xp) });
        profile = updated.profile;
        if (updated.leveledUp) log.push(`Level up! You are now level ${profile.level}.`);
      }

      let equipment = { ...s.equipment };
      if (event.equip && ['weapon', 'armor', 'accessory'].includes(event.equip.slot)) {
        const target = inventory.find((i) => i.id === event.equip.itemId);
        if (target && target.type === event.equip.slot) {
          // simulate equip via shared logic
          // Remove from inventory
          inventory = inventory.filter((i) => i.id !== target.id);
          // If existing equipped, move back and remove its modifiers
          if (equipment[event.equip.slot]) {
            const eq = equipment[event.equip.slot];
            inventory.push(eq);
            stats = applyModifiers(stats, Object.fromEntries(Object.entries(eq.modifiers || {}).map(([k,v]) => [k, -v])));
          }
          equipment[event.equip.slot] = target;
          stats = applyModifiers(stats, target.modifiers || {});
          log.push(`Equipped ${target.name}.`);
        }
      }

      return { ...s, inventory, equipment, stats, profile, log };
    });
  };

  // Auto-save on important changes
  useEffect(() => {
    if (!saveKey) return;
    persist();
  }, [state.profile, state.stats, state.equipment, state.inventory, state.log]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-black text-white">
      <Header
        userCode={state.userCode}
        setUserCode={setUserCode}
        onNewGame={newGame}
        onSave={persist}
        onLoad={load}
      />

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[18rem_1fr] lg:grid-cols-[18rem_1fr_22rem] gap-0 md:gap-0">
        <Sidebar profile={state.profile} stats={state.stats} equipment={state.equipment} onUnequip={unequip} />
        <GamePanel
          log={state.log}
          onSubmitLine={(text) => addLog(`You: ${text}`)}
          onSimulateEvent={applyAIEvent}
          onGainXP={gainXP}
        />
        <InventoryPanel
          inventory={state.inventory}
          onEquip={equipItem}
          onUse={useConsumable}
          onDrop={dropItem}
        />
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-6 text-neutral-500 text-xs">
        <p>
          Tip: Set a save code first. Your progress is stored locally per code and auto-saves as you play. Later we can connect to an AI model to drive the story and trigger events that add items, change stats, and more.
        </p>
      </footer>
    </div>
  );
}
