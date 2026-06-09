'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Device, Memory, FamilyMember, Reminder, Message, Settings,
  DeviceMapping, HaConnectionStatus, DeviceState,
} from '@/types';

interface SweetuContextType {
  devices: Device[];
  memories: Memory[];
  family: FamilyMember[];
  reminders: Reminder[];
  messages: Message[];
  settings: Settings;
  conversationId: string | null;
  isChatLoading: boolean;
  haStatus: HaConnectionStatus | null;
  deviceMappings: DeviceMapping[];
  isSyncingDevices: boolean;
  refreshDevices: () => Promise<void>;
  refreshHaStatus: () => Promise<void>;
  saveDeviceMapping: (mapping: DeviceMapping) => void;
  deleteDeviceMapping: (entityId: string) => void;
  updateDeviceState: (id: string, partialState: Partial<DeviceState>) => Promise<void>;
  addMemory: (category: Memory['category'], title: string, content: string, tags: string[]) => void;
  deleteMemory: (id: string) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  deleteFamilyMember: (id: string) => void;
  addReminder: (text: string, time: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  sendChatMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  saveSettings: (settings: Settings) => void;
}

const SweetuContext = createContext<SweetuContextType | undefined>(undefined);

const defaultMemories: Memory[] = [
  { id: 'm-1', category: 'preference', title: 'Favorite Color', content: "Yug's favorite color is Cyan (#22d3ee).", tags: ['color', 'cyan'], createdAt: '2026-06-08' },
  { id: 'm-2', category: 'favorite', title: 'Favorite Anime', content: 'Favorite anime is One Piece.', tags: ['anime'], createdAt: '2026-06-08' },
  { id: 'm-3', category: 'preference', title: 'Gaming Preset', content: 'Gaming setup triggers purple/cyan glows and monitor power.', tags: ['gaming'], createdAt: '2026-06-09' },
];

const defaultFamily: FamilyMember[] = [
  { id: 'f-1', name: 'Yug Sathwara', relation: 'other', birthday: '2002-08-15', favoriteMusic: 'Synthwave / Lofi', notes: 'Creator of Sweetu.' },
  { id: 'f-2', name: 'Sanjay Sathwara', relation: 'dad', birthday: '1974-01-10', favoriteMusic: 'Classic Instrumental' },
  { id: 'f-3', name: 'Geeta Sathwara', relation: 'mom', birthday: '1976-05-24', favoriteMusic: 'Retro Bollywood' },
  { id: 'f-4', name: 'Kishan Sathwara', relation: 'brother', birthday: '2005-10-18', favoriteMusic: 'Hip Hop' },
];

const defaultReminders: Reminder[] = [
  { id: 'r-1', text: 'Buy WS2812B LED strips for ceiling upgrade', time: '2026-06-10T18:00', completed: false, createdAt: '2026-06-09' },
];

const defaultSettings: Settings = {
  sweetuName: 'Sweetu',
  homeAssistantUrl: '',
  homeAssistantToken: '',
  activeTheme: 'warm',
  useServerCredentials: true,
};

const welcomeMessage: Message = {
  id: 'welcome',
  sender: 'sweetu',
  text: "Hey Yug — Sweetu v2 is online. Connect your AWS Home Assistant in Vercel env vars and we'll share the same Gemini brain as your ESP32.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const fallbackDevices: Device[] = [
  { id: 'wled-1', name: 'Anime Wall', room: 'Bedroom', status: 'online', type: 'wled', lastSeen: 'Just now', description: 'Main RGB strip', state: { power: true, brightness: 180, color: '#22d3ee', effect: 'Rainbow', preset: 'Anime Chill' } },
  { id: 'wled-2', name: 'Desk Glow', room: 'Gaming Setup', status: 'online', type: 'wled', lastSeen: '1m ago', state: { power: false, brightness: 255, color: '#a855f7', effect: 'Solid', preset: 'Cozy' } },
  { id: 'esp32-1', name: 'Bedroom Assistant', room: 'Bedroom', status: 'online', type: 'esp32', lastSeen: 'Just now', description: 'ESP32 voice node' },
];

function getCredentials(settings: Settings) {
  if (settings.useServerCredentials) return {};
  return {
    host: settings.homeAssistantUrl || undefined,
    token: settings.homeAssistantToken || undefined,
  };
}

export const SweetuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devices, setDevices] = useState<Device[]>(fallbackDevices);
  const [memories, setMemories] = useState<Memory[]>(defaultMemories);
  const [family, setFamily] = useState<FamilyMember[]>(defaultFamily);
  const [reminders, setReminders] = useState<Reminder[]>(defaultReminders);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [deviceMappings, setDeviceMappings] = useState<DeviceMapping[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [haStatus, setHaStatus] = useState<HaConnectionStatus | null>(null);
  const [isSyncingDevices, setIsSyncingDevices] = useState(false);
  const [ready, setReady] = useState(false);

  const settingsRef = useRef(settings);
  const devicesRef = useRef(devices);
  const memoriesRef = useRef(memories);
  const familyRef = useRef(family);
  const remindersRef = useRef(reminders);
  const mappingsRef = useRef(deviceMappings);

  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { devicesRef.current = devices; }, [devices]);
  useEffect(() => { memoriesRef.current = memories; }, [memories]);
  useEffect(() => { familyRef.current = family; }, [family]);
  useEffect(() => { remindersRef.current = reminders; }, [reminders]);
  useEffect(() => { mappingsRef.current = deviceMappings; }, [deviceMappings]);

  const persist = (key: string, data: unknown) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  useEffect(() => {
    try {
      const load = <T,>(key: string, fallback: T): T => {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      };

      setMemories(load('sweetu_memories', defaultMemories));
      setFamily(load('sweetu_family', defaultFamily));
      setReminders(load('sweetu_reminders', defaultReminders));
      setMessages(load('sweetu_messages', [welcomeMessage]));
      setDeviceMappings(load('sweetu_mappings', []));
      const storedSettings = load('sweetu_settings', defaultSettings);
      setSettings({ ...defaultSettings, ...storedSettings });
      document.documentElement.setAttribute('data-theme', storedSettings.activeTheme || 'warm');
      const conv = localStorage.getItem('sweetu_conv_id');
      if (conv) setConversationId(conv);
    } catch (e) {
      console.error('Load error', e);
    }
    setReady(true);
  }, []);

  const refreshHaStatus = useCallback(async () => {
    const creds = getCredentials(settingsRef.current);
    const params = new URLSearchParams();
    if (creds.host) params.set('host', creds.host);
    if (creds.token) params.set('token', creds.token);
    try {
      const res = await fetch(`/api/health?${params}`);
      const data = await res.json();
      setHaStatus(data);
    } catch {
      setHaStatus({ connected: false, host: '', message: 'Health check failed', usingServerEnv: false });
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    setIsSyncingDevices(true);
    const creds = getCredentials(settingsRef.current);
    try {
      const res = await fetch('/api/ha/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...creds, mappings: mappingsRef.current }),
      });
      const data = await res.json();
      if (data.devices?.length) {
        setDevices(data.devices);
      } else if (!haStatus?.connected) {
        setDevices(fallbackDevices);
      }
    } catch {
      setDevices(fallbackDevices);
    } finally {
      setIsSyncingDevices(false);
    }
  }, [haStatus?.connected]);

  useEffect(() => {
    if (!ready) return;
    refreshHaStatus();
    refreshDevices();
    const interval = setInterval(() => {
      refreshHaStatus();
      refreshDevices();
    }, 30000);
    return () => clearInterval(interval);
  }, [ready, refreshHaStatus, refreshDevices, settings.homeAssistantUrl, settings.useServerCredentials]);

  const saveDeviceMapping = (mapping: DeviceMapping) => {
    const updated = [...mappingsRef.current.filter((m) => m.entityId !== mapping.entityId), mapping];
    setDeviceMappings(updated);
    persist('sweetu_mappings', updated);
    refreshDevices();
  };

  const deleteDeviceMapping = (entityId: string) => {
    const updated = mappingsRef.current.filter((m) => m.entityId !== entityId);
    setDeviceMappings(updated);
    persist('sweetu_mappings', updated);
    refreshDevices();
  };

  const updateDeviceState = async (id: string, partialState: Partial<DeviceState>) => {
    const device = devicesRef.current.find((d) => d.id === id);
    if (!device) return;

    setDevices((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, state: { ...(d.state || { power: false, brightness: 128, color: '#22d3ee', effect: 'Solid', preset: 'Default' }), ...partialState }, lastSeen: 'Just now' }
          : d
      )
    );

    const creds = getCredentials(settingsRef.current);

    try {
      if (device.type === 'wled') {
        await fetch('/api/wled', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...creds,
            wledIp: device.wledIp,
            entityId: device.entityId,
            power: partialState.power,
            brightness: partialState.brightness,
            color: partialState.color,
            effect: partialState.effect,
          }),
        });
      } else if (device.type === 'relay' && typeof partialState.power === 'boolean') {
        const domain = device.entityId?.startsWith('switch.') ? 'switch' : 'light';
        await fetch('/api/ha/service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...creds,
            domain,
            service: partialState.power ? 'turn_on' : 'turn_off',
            data: { entity_id: device.entityId || device.id },
          }),
        });
      }
      await refreshDevices();
    } catch (e) {
      console.error('Device control failed', e);
    }
  };

  const addMemory = (category: Memory['category'], title: string, content: string, tags: string[]) => {
    const item: Memory = { id: `mem-${Date.now()}`, category, title, content, tags, createdAt: new Date().toISOString().split('T')[0] };
    const updated = [item, ...memoriesRef.current];
    setMemories(updated);
    persist('sweetu_memories', updated);
  };

  const deleteMemory = (id: string) => {
    const updated = memoriesRef.current.filter((m) => m.id !== id);
    setMemories(updated);
    persist('sweetu_memories', updated);
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const item = { ...member, id: `fam-${Date.now()}` };
    const updated = [...familyRef.current, item];
    setFamily(updated);
    persist('sweetu_family', updated);
  };

  const deleteFamilyMember = (id: string) => {
    const updated = familyRef.current.filter((f) => f.id !== id);
    setFamily(updated);
    persist('sweetu_family', updated);
  };

  const addReminder = (text: string, time: string) => {
    const item: Reminder = { id: `rem-${Date.now()}`, text, time, completed: false, createdAt: new Date().toISOString().split('T')[0] };
    const updated = [item, ...remindersRef.current];
    setReminders(updated);
    persist('sweetu_reminders', updated);
  };

  const toggleReminder = (id: string) => {
    const updated = remindersRef.current.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
    setReminders(updated);
    persist('sweetu_reminders', updated);
  };

  const deleteReminder = (id: string) => {
    const updated = remindersRef.current.filter((r) => r.id !== id);
    setReminders(updated);
    persist('sweetu_reminders', updated);
  };

  const saveSettings = (next: Settings) => {
    setSettings(next);
    persist('sweetu_settings', next);
    document.documentElement.setAttribute('data-theme', next.activeTheme);
    refreshHaStatus();
    refreshDevices();
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
    persist('sweetu_messages', [welcomeMessage]);
    setConversationId(null);
    localStorage.removeItem('sweetu_conv_id');
  };

  const runLocalSideEffects = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('favorite color is')) {
      const match = text.match(/favorite color is ([a-zA-Z#0-9]+)/i);
      if (match) addMemory('preference', 'Favorite Color', `Favorite color is ${match[1]}.`, ['color', 'chat']);
    }
    if (lower.includes('favorite anime is')) {
      const match = text.match(/favorite anime is ([a-zA-Z0-9\s]+)/i);
      if (match) addMemory('favorite', 'Favorite Anime', `Favorite anime is ${match[1].trim()}.`, ['anime', 'chat']);
    }
    if (lower.includes('remind me to')) {
      const match = text.match(/remind me to (.*)/i);
      if (match) addReminder(match[1], new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    }
    const wled = devicesRef.current.find((d) => d.type === 'wled' && d.name.toLowerCase().includes('anime'));
    if (wled && lower.includes('anime wall') && lower.includes('on')) {
      updateDeviceState(wled.id, { power: true, effect: 'Rainbow' });
    }
    if (wled && lower.includes('anime wall') && lower.includes('off')) {
      updateDeviceState(wled.id, { power: false });
    }
  };

  const sendChatMessage = async (text: string) => {
    if (!text.trim()) return;
    const creds = getCredentials(settingsRef.current);

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => {
      const next = [...prev, userMsg];
      persist('sweetu_messages', next);
      return next;
    });
    setIsChatLoading(true);

    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [...prev, { id: typingId, sender: 'sweetu', text: '', timestamp: '', typing: true }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
          sweetuName: settingsRef.current.sweetuName,
          ...creds,
          context: {
            memories: memoriesRef.current,
            family: familyRef.current,
            reminders: remindersRef.current,
          },
        }),
      });
      const data = await res.json();

      const sweetuMsg: Message = {
        id: `msg-${Date.now()}-r`,
        sender: 'sweetu',
        text: data.text || data.error || 'No response.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => {
        const next = [...prev.filter((m) => m.id !== typingId), sweetuMsg];
        persist('sweetu_messages', next);
        return next;
      });

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
        localStorage.setItem('sweetu_conv_id', data.conversation_id);
      }

      runLocalSideEffects(text);
    } catch {
      setMessages((prev) => {
        const next = [
          ...prev.filter((m) => m.id !== typingId),
          { id: `err-${Date.now()}`, sender: 'sweetu' as const, text: "Couldn't reach Sweetu backend. Check Vercel env vars.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ];
        persist('sweetu_messages', next);
        return next;
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <SweetuContext.Provider
      value={{
        devices, memories, family, reminders, messages, settings, conversationId,
        isChatLoading, haStatus, deviceMappings, isSyncingDevices,
        refreshDevices, refreshHaStatus, saveDeviceMapping, deleteDeviceMapping,
        updateDeviceState, addMemory, deleteMemory, addFamilyMember, deleteFamilyMember,
        addReminder, toggleReminder, deleteReminder, sendChatMessage, clearChat, saveSettings,
      }}
    >
      {children}
    </SweetuContext.Provider>
  );
};

export const useSweetu = () => {
  const ctx = useContext(SweetuContext);
  if (!ctx) throw new Error('useSweetu must be used within SweetuProvider');
  return ctx;
};
