const MESSAGES_KEY = "nooriva:contact:messages";

function getKvConfig() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function kvRequest(path, init = {}) {
  const config = getKvConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`KV request failed with ${response.status}`);
  }
  return response.json();
}

export async function loadMessages() {
  const response = await kvRequest(`/get/${encodeURIComponent(MESSAGES_KEY)}`);
  if (!response?.result) return [];
  try {
    return JSON.parse(response.result);
  } catch {
    return [];
  }
}

export async function saveMessages(messages) {
  await kvRequest(`/set/${encodeURIComponent(MESSAGES_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });
}

export async function addMessage(message) {
  const messages = await loadMessages();
  messages.unshift(message);
  await saveMessages(messages.slice(0, 200));
  return message;
}
