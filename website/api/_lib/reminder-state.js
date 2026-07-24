const REMINDER_STATE_KEY = "nooriva:push:sent-prayer-slots";

function getKvConfig() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    token,
  };
}

async function kvRequest(path, init = {}) {
  const config = getKvConfig();

  if (!config) {
    return null;
  }

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

export async function loadReminderState() {
  const response = await kvRequest(`/get/${encodeURIComponent(REMINDER_STATE_KEY)}`);

  if (!response?.result) {
    return {};
  }

  try {
    return JSON.parse(response.result);
  } catch {
    return {};
  }
}

export async function saveReminderState(state) {
  await kvRequest(`/set/${encodeURIComponent(REMINDER_STATE_KEY)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });
}

export function pruneReminderState(state, todayDateKey) {
  const entries = Object.entries(state || {}).sort((a, b) => String(b[1]).localeCompare(String(a[1])));
  const keep = {};

  for (const [slotKey, dateKey] of entries) {
    if (dateKey >= todayDateKey || Object.keys(keep).length < 40) {
      keep[slotKey] = dateKey;
    }
  }

  return keep;
}
