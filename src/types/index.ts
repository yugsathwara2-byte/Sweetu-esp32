export interface DeviceState {
  power: boolean;
  brightness: number;
  color: string;
  effect: string;
  preset: string;
}

export type DeviceType = 'wled' | 'esp32' | 'relay' | 'sensor' | 'speaker';

export interface Device {
  id: string;
  entityId?: string;
  wledIp?: string;
  name: string;
  room: string;
  status: 'online' | 'offline';
  type: DeviceType;
  lastSeen: string;
  description?: string;
  state?: DeviceState;
  isMapped?: boolean;
}

export type MemoryCategory = 'people' | 'preference' | 'note' | 'favorite';

export interface Memory {
  id: string;
  category: MemoryCategory;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export type FamilyRelation = 'dad' | 'mom' | 'brother' | 'sister' | 'other';

export interface FamilyMember {
  id: string;
  name: string;
  relation: FamilyRelation;
  birthday: string;
  favoriteMusic?: string;
  notes?: string;
}

export interface Reminder {
  id: string;
  text: string;
  time: string;
  completed: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'sweetu';
  text: string;
  timestamp: string;
  isCommandResponse?: boolean;
  typing?: boolean;
}

export interface Settings {
  sweetuName: string;
  homeAssistantUrl: string;
  homeAssistantToken: string;
  activeTheme: 'warm' | 'aurora' | 'ember';
  useServerCredentials: boolean;
}

export interface DeviceMapping {
  entityId: string;
  name: string;
  room: string;
  description?: string;
  type?: DeviceType;
  wledIp?: string;
}

export interface HaConnectionStatus {
  connected: boolean;
  host: string;
  message: string;
  usingServerEnv: boolean;
}
