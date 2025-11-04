import React from 'react';

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-neutral-300 text-sm">{label}</span>
      <span className="text-neutral-100 font-medium">{value}</span>
    </div>
  );
}

export default function Sidebar({ profile, stats, equipment, onUnequip }) {
  return (
    <aside className="w-full md:w-72 shrink-0 border-r border-neutral-800 bg-neutral-950/50">
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-neutral-100 font-semibold">Adventurer</h2>
        <p className="text-neutral-400 text-sm">{profile.name}</p>
        <div className="mt-2 h-2 bg-neutral-800 rounded">
          <div
            className="h-full bg-indigo-600 rounded"
            style={{ width: `${Math.min(100, Math.round((profile.xp / profile.xpToNext) * 100))}%` }}
          />
        </div>
        <p className="text-neutral-400 text-xs mt-1">Level {profile.level} • {profile.xp}/{profile.xpToNext} XP</p>
      </div>

      <div className="p-4 border-b border-neutral-800">
        <h3 className="text-neutral-200 font-medium mb-2">Stats</h3>
        <StatRow label="Strength" value={stats.str} />
        <StatRow label="Agility" value={stats.agi} />
        <StatRow label="Intellect" value={stats.int} />
        <StatRow label="Vitality" value={stats.vit} />
      </div>

      <div className="p-4">
        <h3 className="text-neutral-200 font-medium mb-2">Equipment</h3>
        {['weapon', 'armor', 'accessory'].map((slot) => {
          const item = equipment[slot];
          return (
            <div key={slot} className="mb-3 p-3 rounded border border-neutral-800 bg-neutral-900/40">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-neutral-400 text-xs uppercase tracking-wide">{slot}</p>
                  <p className="text-neutral-100">{item ? item.name : 'Empty'}</p>
                </div>
                {item && (
                  <button
                    onClick={() => onUnequip(slot)}
                    className="px-2 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                  >
                    Unequip
                  </button>
                )}
              </div>
              {item?.description && (
                <p className="text-neutral-400 text-xs mt-1">{item.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
