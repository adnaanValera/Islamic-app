const USERS_KEY = "nooriva:accounts:users";
const SESSIONS_KEY = "nooriva:accounts:sessions";
const SYNC_KEY_PREFIX = "nooriva:sync:";

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

export function isAccountStorageConfigured() {
  return Boolean(getKvConfig());
}

async function loadJsonValue(key, fallback) {
  const response = await kvRequest(`/get/${encodeURIComponent(key)}`);

  if (!response?.result) {
    return fallback;
  }

  try {
    return JSON.parse(response.result);
  } catch (error) {
    return fallback;
  }
}

async function saveJsonValue(key, value) {
  await kvRequest(`/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
}

export async function loadUsers() {
  return loadJsonValue(USERS_KEY, []);
}

export async function saveUsers(users) {
  await saveJsonValue(USERS_KEY, users);
}

export async function loadSessions() {
  return loadJsonValue(SESSIONS_KEY, []);
}

export async function saveSessions(sessions) {
  await saveJsonValue(SESSIONS_KEY, sessions);
}

export async function findUserByName(fullName) {
  const users = await loadUsers();
  return users.find((user) => String(user.fullName).toLowerCase() === String(fullName).toLowerCase()) ?? null;
}

export async function upsertUser(user) {
  const users = await loadUsers();
  const filtered = users.filter(
    (item) => String(item.fullName).toLowerCase() !== String(user.fullName).toLowerCase(),
  );
  filtered.push(user);
  await saveUsers(filtered);
  return user;
}

export async function createSession(session) {
  const sessions = await loadSessions();
  const nextSessions = sessions.filter((item) => item.userId !== session.userId);
  nextSessions.push(session);
  await saveSessions(nextSessions);
  return session;
}

export async function findSession(token) {
  const sessions = await loadSessions();
  return sessions.find((session) => session.token === token) ?? null;
}

export async function saveUserSync(userId, payload) {
  await saveJsonValue(`${SYNC_KEY_PREFIX}${userId}`, payload);
}

export async function loadUserSync(userId) {
  return loadJsonValue(`${SYNC_KEY_PREFIX}${userId}`, null);
}
