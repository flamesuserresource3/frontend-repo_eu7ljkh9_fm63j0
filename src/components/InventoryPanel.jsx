import React from 'react';

export default function InventoryPanel({ inventory, onEquip, onUse, onDrop }) {
  return (
    <div className="w-full border-t md:border-t-0 md:border-l border-neutral-800 bg-neutral-950/40">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <h3 className="text-neutral-100 font-medium">Inventory</h3>
        <p className="text-neutral-400 text-sm">{inventory.length} item{inventory.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {inventory.length === 0 && (
          <p className="text-neutral-400 text-sm">Your pack is empty. Explore to find items!</p>
        )}
        {inventory.map((item) => (
          <div key={item.id} className="p-3 rounded border border-neutral-800 bg-neutral-900/40 flex flex-col">
            <div className="flex-1">
              <p className="text-neutral-100 font-medium">{item.name}</p>
              <p className="text-neutral-400 text-xs">Type: {item.type}</p>
              {item.description && (
                <p className="text-neutral-400 text-sm mt-1">{item.description}</p>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              {['weapon','armor','accessory'].includes(item.type) && (
                <button
                  onClick={() => onEquip(item.id)}
                  className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Equip
                </button>
              )}
              {item.type === 'consumable' && (
                <button
                  onClick={() => onUse(item.id)}
                  className="px-2 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Use
                </button>
              )}
              <button
                onClick={() => onDrop(item.id)}
                className="px-2 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
              >
                Drop
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
