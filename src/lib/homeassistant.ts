import { getHaConfig } from './config';

export interface HaState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
}

export class HaError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

async function haFetch<T>(
  path: string,
  options: RequestInit = {},
  overrides?: { host?: string; token?: string }
): Promise<T> {
  const { host, token, isConfigured } = getHaConfig(overrides);

  if (!isConfigured) {
    throw new HaError('Home Assistant is not configured. Set HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN.', 503);
  }

  const response = await fetch(`${host}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new HaError(`Home Assistant error ${response.status}: ${text}`, response.status);
  }

  if (response.status === 204) return {} as T;
  return response.json() as Promise<T>;
}

export async function getHaStates(overrides?: { host?: string; token?: string }) {
  return haFetch<HaState[]>('/api/states', {}, overrides);
}

export async function getHaState(entityId: string, overrides?: { host?: string; token?: string }) {
  return haFetch<HaState>(`/api/states/${entityId}`, {}, overrides);
}

export async function callHaService(
  domain: string,
  service: string,
  data: Record<string, unknown> = {},
  overrides?: { host?: string; token?: string }
) {
  return haFetch(`/api/services/${domain}/${service}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, overrides);
}

export async function processConversation(
  text: string,
  conversationId?: string | null,
  overrides?: { host?: string; token?: string }
) {
  const { agentId } = getHaConfig(overrides);
  const data = await haFetch<{
    response?: {
      speech?: {
        plain?: { speech?: string };
        speech?: string;
      };
    };
    conversation_id?: string;
  }>('/api/conversation/process', {
    method: 'POST',
    body: JSON.stringify({
      text,
      conversation_id: conversationId || undefined,
      agent_id: agentId,
    }),
  }, overrides);

  const speechText =
    data.response?.speech?.plain?.speech ??
    data.response?.speech?.speech ??
    'Done.';

  return {
    text: speechText,
    conversation_id: data.conversation_id || conversationId || null,
  };
}

export async function checkHaConnection(overrides?: { host?: string; token?: string }) {
  try {
    const { host, isConfigured } = getHaConfig(overrides);
    if (!isConfigured) {
      return { connected: false, host: '', message: 'Not configured' };
    }
    await haFetch('/api/', {}, overrides);
    return { connected: true, host, message: 'Connected' };
  } catch (e) {
    const message = e instanceof HaError ? e.message : 'Connection failed';
    return { connected: false, host: getHaConfig(overrides).host, message };
  }
}

export function inferDeviceType(entityId: string, attributes: Record<string, unknown>): string {
  const domain = entityId.split('.')[0];
  const friendly = String(attributes.friendly_name || '').toLowerCase();

  if (domain === 'light' && (friendly.includes('wled') || attributes.effect_list)) return 'wled';
  if (domain === 'light') return 'wled';
  if (domain === 'switch') return 'relay';
  if (domain === 'sensor' || domain === 'binary_sensor') return 'sensor';
  if (domain === 'media_player') return 'speaker';
  if (friendly.includes('esp32')) return 'esp32';
  return 'esp32';
}

export function haStateToDeviceState(entity: HaState) {
  const attrs = entity.attributes;
  const isOn = entity.state === 'on' || entity.state === 'playing' || entity.state === 'idle';
  const brightness = typeof attrs.brightness === 'number' ? attrs.brightness : isOn ? 255 : 0;
  const rgb = Array.isArray(attrs.rgb_color) ? attrs.rgb_color as number[] : null;
  const color = rgb ? rgbToHex(rgb[0], rgb[1], rgb[2]) : '#22d3ee';

  return {
    power: isOn,
    brightness,
    color,
    effect: String(attrs.effect || 'Solid'),
    preset: String(attrs.preset || 'Default'),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const h = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}
