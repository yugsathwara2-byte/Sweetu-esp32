import { NextResponse } from 'next/server';
import {
  getHaStates,
  inferDeviceType,
  haStateToDeviceState,
  HaError,
} from '@/lib/homeassistant';
import { Device, DeviceMapping } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { host, token, mappings = [] } = body as {
      host?: string;
      token?: string;
      mappings?: DeviceMapping[];
    };

    const states = await getHaStates(host && token ? { host, token } : undefined);

    const relevant = states.filter((s) => {
      const domain = s.entity_id.split('.')[0];
      return ['light', 'switch', 'sensor', 'binary_sensor', 'media_player'].includes(domain);
    });

    const mappingByEntity = new Map(
      (mappings as DeviceMapping[]).map((m) => [m.entityId, m])
    );

    const devices = relevant.map((entity) => {
      const mapping = mappingByEntity.get(entity.entity_id);
      const attrs = entity.attributes;
      const type = (mapping?.type || inferDeviceType(entity.entity_id, attrs)) as Device['type'];
      const isOnline = entity.state !== 'unavailable' && entity.state !== 'unknown';

      return {
        id: entity.entity_id,
        entityId: entity.entity_id,
        wledIp: mapping?.wledIp,
        name: mapping?.name || String(attrs.friendly_name || entity.entity_id),
        room: mapping?.room || String(attrs.area || 'Home'),
        status: isOnline ? 'online' : 'offline',
        type,
        lastSeen: new Date(entity.last_updated).toLocaleString(),
        description: mapping?.description || `Home Assistant entity: ${entity.entity_id}`,
        state: type === 'sensor' ? undefined : haStateToDeviceState(entity),
        isMapped: Boolean(mapping),
      };
    });

    return NextResponse.json({ devices, count: devices.length });
  } catch (e) {
    const message = e instanceof HaError ? e.message : 'Failed to load Home Assistant states';
    const status = e instanceof HaError ? e.status : 500;
    return NextResponse.json({ error: message, devices: [] }, { status });
  }
}
