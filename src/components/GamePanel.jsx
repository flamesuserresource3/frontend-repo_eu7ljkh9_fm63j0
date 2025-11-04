import React, { useState } from 'react';

export default function GamePanel({ log, onSubmitLine, onSimulateEvent, onGainXP }) {
  const [input, setInput] = useState('');
  const [eventJSON, setEventJSON] = useState('');

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    onSubmitLine(text);
    setInput('');
  };

  const simulate = () => {
    if (!eventJSON.trim()) return;
    try {
      const event = JSON.parse(eventJSON);
      onSimulateEvent(event);
      setEventJSON('');
    } catch (e) {
      alert('Invalid JSON for event.');
    }
  };

  return (
    <section className="flex-1 flex flex-col min-h-0">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
        <h3 className="text-neutral-100 font-medium">Story</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => onGainXP(10)} className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm">Gain 10 XP</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {log.length === 0 && (
          <p className="text-neutral-400 text-sm">Your journey begins... Describe your action to continue.</p>
        )}
        {log.map((entry, idx) => (
          <div key={idx} className="p-3 rounded border border-neutral-800 bg-neutral-900/40">
            <p className="text-neutral-100 whitespace-pre-wrap text-sm">{entry}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-800 p-3 space-y-3 bg-neutral-950/50">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Type your action..."
            className="flex-1 px-3 py-2 rounded-md bg-neutral-900 text-neutral-100 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={submit} className="px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white">Send</button>
        </div>

        <div className="rounded border border-neutral-800 bg-neutral-900/40 p-3">
          <p className="text-neutral-300 text-sm mb-2">Simulate AI Event (paste JSON)</p>
          <textarea
            value={eventJSON}
            onChange={(e) => setEventJSON(e.target.value)}
            placeholder='{"log":"You found a potion.","gainItems":[{"id":"potion1","name":"Minor Potion","description":"Heals a bit","type":"consumable","modifiers":{"vit":1}}]}'
            className="w-full h-24 px-3 py-2 rounded-md bg-neutral-950 text-neutral-100 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <div className="mt-2 flex items-center gap-2">
            <button onClick={simulate} className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-sm">Apply Event</button>
            <p className="text-neutral-500 text-xs">Use this to test dynamic inventory, stats, and log updates from AI responses.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
