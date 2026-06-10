'use client';

import React, { useState } from 'react';
import { useSweetu } from '@/context/SweetuContext';
import PageHeader from '@/components/v2/PageHeader';
import { Device, DeviceType, DeviceMapping } from '@/types';
import { Cpu, Sparkles, Power, Thermometer, Volume2, Edit, Trash2, RefreshCw, Search, Check, X } from 'lucide-react';

export default function DevicesPage() {
  const { devices, updateDeviceState, saveDeviceMapping, deleteDeviceMapping, refreshDevices, isSyncingDevices, haStatus } = useSweetu();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editing, setEditing] = useState<Device | null>(null);
  const [form, setForm] = useState<DeviceMapping>({ entityId: '', name: '', room: 'Home', description: '', wledIp: '' });

  const icon = (t: DeviceType) => {
    if (t === 'wled') return Sparkles;
    if (t === 'sensor') return Thermometer;
    if (t === 'speaker') return Volume2;
    if (t === 'relay') return Power;
    return Cpu;
  };

  const filtered = devices.filter((d) => {
    const q = search.toLowerCase();
    const matchQ = d.name.toLowerCase().includes(q) || d.room.toLowerCase().includes(q) || (d.entityId || '').includes(q);
    const matchT = typeFilter === 'all' || d.type === typeFilter;
    return matchQ && matchT;
  });

  const openEdit = (d: Device) => {
    setEditing(d);
    setForm({
      entityId: d.entityId || d.id,
      name: d.name,
      room: d.room,
      description: d.description || '',
      type: d.type,
      wledIp: d.wledIp || '',
    });
  };

  const saveEdit = () => {
    if (!form.name.trim()) return;
    saveDeviceMapping(form);
    setEditing(null);
  };

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto animate-fade-up">
      <PageHeader
        title="Devices"
        subtitle={haStatus?.connected ? 'Live from AWS Home Assistant — assign friendly names and rooms' : 'Showing fallback devices until AWS HA connects'}
        badge={`${devices.length} nodes`}
        action={
          <button onClick={refreshDevices} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isSyncingDevices ? 'animate-spin' : ''}`} /> Sync HA
          </button>
        }
      />

      <div className="surface rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search devices..." className="input-field w-full pl-10 pr-4 py-2.5 rounded-xl text-sm" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field px-3 py-2.5 rounded-xl text-sm">
          <option value="all">All types</option>
          <option value="wled">WLED</option>
          <option value="relay">Relay</option>
          <option value="sensor">Sensor</option>
          <option value="speaker">Speaker</option>
          <option value="esp32">ESP32</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((d) => {
          const Icon = icon(d.type);
          return (
            <div key={d.id} className="surface rounded-2xl p-4 surface-hover">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-2-soft)] flex items-center justify-center text-[var(--accent-2)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{d.name}</h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">{d.entityId || d.id}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${d.status === 'online' ? 'text-[var(--success)] border-[var(--success)]/30' : 'text-[var(--text-muted)]'}`}>
                  {d.status}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2">{d.description}</p>
              <p className="text-[11px] mb-3">Room: <span className="text-[var(--text)]">{d.room}</span> · {d.lastSeen}</p>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                {['wled', 'relay', 'speaker'].includes(d.type) && d.state ? (
                  <button
                    onClick={() => updateDeviceState(d.id, { power: !d.state?.power })}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${d.state.power ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {d.state.power ? 'On' : 'Off'}
                  </button>
                ) : <span className="text-xs text-[var(--text-muted)]">Read-only</span>}
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="btn-ghost p-2 rounded-lg"><Edit className="w-3.5 h-3.5" /></button>
                  {d.entityId && (
                    <button onClick={() => deleteDeviceMapping(d.entityId!)} className="btn-ghost p-2 rounded-lg text-[var(--danger)]"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="surface rounded-2xl p-6 w-full max-w-md animate-fade-up">
            <h3 className="font-bold mb-4">Edit device mapping</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Friendly name" className="input-field w-full px-3 py-2 rounded-xl text-sm" />
              <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Room" className="input-field w-full px-3 py-2 rounded-xl text-sm" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="input-field w-full px-3 py-2 rounded-xl text-sm h-20 resize-none" />
              {['wled', 'esp32', 'relay'].includes(form.type || '') && (
                <input value={form.wledIp || ''} onChange={(e) => setForm({ ...form, wledIp: e.target.value })} placeholder="Device IP (optional, e.g. 192.168.1.50)" className="input-field w-full px-3 py-2 rounded-xl text-sm" />
              )}
              <p className="text-[10px] text-[var(--text-muted)]">Entity: {form.entityId}</p>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={saveEdit} className="btn-primary flex-1 py-2 rounded-xl text-sm flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Save</button>
              <button onClick={() => setEditing(null)} className="btn-ghost px-4 py-2 rounded-xl text-sm"><X className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
