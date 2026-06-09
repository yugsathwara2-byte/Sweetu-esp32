export function getHaConfig(overrides?: { host?: string; token?: string }) {
  const host = overrides?.host || process.env.HOME_ASSISTANT_URL || '';
  const token = overrides?.token || process.env.HOME_ASSISTANT_TOKEN || '';
  const agentId =
    process.env.HOME_ASSISTANT_AGENT_ID || 'conversation.google_ai_conversation_2';

  return {
    host: host.endsWith('/') ? host.slice(0, -1) : host,
    token,
    agentId,
    isConfigured: Boolean(host && token),
  };
}
