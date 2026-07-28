const CHECKLIST_STATE_KEY = "nooriva:push:prayer-checklist";

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

export async function loadChecklistStateMap() {
  const response = await kvRequest(`/get/${encodeURIComponent(CHECKLIST_STATE_KEY)}`);

  if (!response?.result) {
    return {};
  }

  try {
    return JSON.parse(response.result);
  } catch {
    return {};
  }
}

export async function saveChecklistStateMap(state) {
  await kvRequest(`/set/${encodeURIComponent(CHECKLIST_STATE_KEY)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });
}

export async function syncChecklistState({ endpoint, dateKey, checked }) {
  if (!endpoint || !dateKey) {
    return null;
  }

  const state = await loadChecklistStateMap();
  state[endpoint] = {
    dateKey,
    checked: checked ?? {},
    updatedAt: new Date().toISOString(),
  };

  await saveChecklistStateMap(pruneChecklistStateMap(state, dateKey));
  return state[endpoint];
}

export async function removeChecklistState(endpoint) {
  if (!endpoint) {
    return;
  }

  const state = await loadChecklistStateMap();
  delete state[endpoint];
  await saveChecklistStateMap(state);
}

export function pruneChecklistStateMap(state, todayDateKey) {
  const next = {};

  for (const [endpoint, value] of Object.entries(state || {})) {
    if (!value?.dateKey || value.dateKey >= todayDateKey) {
      next[endpoint] = value;
    }
  }

  return next;
}
