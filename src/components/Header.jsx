import React, { useState } from 'react';

export default function Header({ userCode, setUserCode, onNewGame, onSave, onLoad }) {
  const [tempCode, setTempCode] = useState(userCode || '');

  const applyCode = () => {
    const code = tempCode.trim();
    if (!code) return;
    setUserCode(code);
  };

  return (
    <header className="w-full border-b border-neutral-800 bg-neutral-900/70 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Mythic Weave RPG</h1>
          <p className="text-xs text-neutral-400">AI-driven roleplay adventure with dynamic inventory and saves</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            value={tempCode}
            onChange={(e) => setTempCode(e.target.value)}
            placeholder="Enter your save code"
            className="px-3 py-2 rounded-md bg-neutral-800 text-sm text-neutral-100 placeholder-neutral-500 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={applyCode}
            className="px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-sm text-white"
          >
            Set Code
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button onClick={onNewGame} className="px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sm text-white border border-neutral-700">New</button>
          <button onClick={onSave} className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm text-white">Save</button>
          <button onClick={onLoad} className="px-3 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-sm text-white">Load</button>
        </div>
      </div>
    </header>
  );
}
