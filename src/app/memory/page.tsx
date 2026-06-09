'use client';

import React, { useState } from 'react';
import { useSweetu } from '@/context/SweetuContext';
import PageHeader from '@/components/v2/PageHeader';
import { MemoryCategory } from '@/types';
import { Plus, Trash2, Search, Brain } from 'lucide-react';

export default function MemoryPage() {
  const { memories, addMemory, deleteMemory } = useSweetu();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('preference');
  const [tags, setTags] = useState('');

  const filtered = memories.filter((m) => {
    const q = search.toLowerCase();
    const matchQ = m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q);
    const matchC = cat === 'all' || m.category === cat;
    return matchQ && matchC;
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    addMemory(category, title, content, tags.split(',').map((t) => t.trim()).filter(Boolean));
    setTitle(''); setContent(''); setTags(''); setOpen(false);
  };

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto animate-fade-up">
      <PageHeader title="Memory" subtitle="Facts injected into every Gemini chat — shared context for Web + ESP32" badge={`${memories.length} cards`}
        action={<button onClick={() => setOpen(true)} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>} />

      <div className="surface rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search memories..." className="input-field w-full pl-10 py-2.5 rounded-xl text-sm" />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input-field px-3 py-2.5 rounded-xl text-sm">
          <option value="all">All</option>
          <option value="preference">Preferences</option>
          <option value="favorite">Favorites</option>
          <option value="people">People</option>
          <option value="note">Notes</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <div key={m.id} className="surface rounded-2xl p-4 group">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-[var(--accent-2)]">{m.category}</span>
              <button onClick={() => deleteMemory(m.id)} className="opacity-0 group-hover:opacity-100 text-[var(--danger)]"><Trash2 className="w-4 h-4" /></button>
            </div>
            <h3 className="font-semibold text-sm">{m.title}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-2">{m.content}</p>
            <div className="flex flex-wrap gap-1 mt-3">{m.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/5">#{t}</span>)}</div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form onSubmit={submit} className="surface rounded-2xl p-6 w-full max-w-md animate-fade-up space-y-3">
            <h3 className="font-bold flex items-center gap-2"><Brain className="w-5 h-5 text-[var(--accent)]" /> New memory</h3>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="input-field w-full px-3 py-2 rounded-xl text-sm" required />
            <select value={category} onChange={(e) => setCategory(e.target.value as MemoryCategory)} className="input-field w-full px-3 py-2 rounded-xl text-sm">
              <option value="preference">Preference</option><option value="favorite">Favorite</option><option value="people">People</option><option value="note">Note</option>
            </select>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Memory statement" className="input-field w-full px-3 py-2 rounded-xl text-sm h-24 resize-none" required />
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags, comma separated" className="input-field w-full px-3 py-2 rounded-xl text-sm" />
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary flex-1 py-2 rounded-xl text-sm">Save</button>
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost px-4 py-2 rounded-xl text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
