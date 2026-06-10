import { query } from './db';
import { callHaService } from './homeassistant';

const COLORS: Record<string, number[]> = {
  violet: [148, 0, 211],
  lavender: [230, 230, 250],
  gold: [255, 215, 0],
  turquoise: [64, 224, 208],
  blue: [0, 0, 255],
  red: [255, 0, 0],
  green: [0, 255, 0],
  white: [255, 255, 255],
  pink: [255, 192, 203],
  rainbow: [255, 255, 255], // Special case placeholder
};

export async function handleIntentRouter(message: string, userId: number) {
  try {
    const lowerMsg = message.toLowerCase();
    
    // Fetch aliases from DB
    const result = await query('SELECT alias_name, device_type, ha_entity_id FROM device_aliases');
    const aliases = result.rows;

    let matchedAlias = null;
    for (const row of aliases) {
      if (lowerMsg.includes(row.alias_name.toLowerCase())) {
        matchedAlias = row;
        break;
      }
    }

    if (matchedAlias && matchedAlias.ha_entity_id) {
      // Basic intent parsing
      const isTurnOn = lowerMsg.includes('turn on') || lowerMsg.includes('on');
      const isTurnOff = lowerMsg.includes('turn off') || lowerMsg.includes('off');
      
      let targetColor = null;
      let targetColorName = null;
      for (const [colorName, rgb] of Object.entries(COLORS)) {
        if (lowerMsg.includes(colorName)) {
          targetColor = rgb;
          targetColorName = colorName;
          break;
        }
      }

      const domain = matchedAlias.ha_entity_id.split('.')[0];
      let service = isTurnOff ? 'turn_off' : 'turn_on';
      let data: Record<string, any> = { entity_id: matchedAlias.ha_entity_id };

      if (service === 'turn_on' && targetColor && domain === 'light') {
        data.rgb_color = targetColor;
      }

      await callHaService(domain, service, data);

      let actionDesc = isTurnOff ? 'turned off' : 'turned on';
      if (service === 'turn_on' && targetColorName) {
         actionDesc += ` and set to ${targetColorName}`;
      }

      return {
        handled: true,
        text: `Got it. ${matchedAlias.alias_name} has been ${actionDesc}.`,
      };
    }
    
    // Not handled by layer 1
    return null;
  } catch (error) {
    console.error('Intent Router Error:', error);
    return null; // Fallback to layer 2 on error
  }
}
