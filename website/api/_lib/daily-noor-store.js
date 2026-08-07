const DAILY_NOOR_OVERRIDES_KEY = "nooriva:daily-noor:overrides";

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

export async function loadDailyNoorOverrides() {
  const response = await kvRequest(`/get/${encodeURIComponent(DAILY_NOOR_OVERRIDES_KEY)}`);

  if (!response?.result) {
    return {};
  }

  try {
    return JSON.parse(response.result);
  } catch {
    return {};
  }
}

export async function saveDailyNoorOverrides(value) {
  await kvRequest(`/set/${encodeURIComponent(DAILY_NOOR_OVERRIDES_KEY)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
}

export async function loadDailyNoorOverrideForDate(dateKey) {
  const all = await loadDailyNoorOverrides();
  return all?.[dateKey] ?? null;
}

export async function saveDailyNoorOverrideForDate(dateKey, override) {
  const all = await loadDailyNoorOverrides();
  all[dateKey] = {
    ...(all[dateKey] ?? {}),
    ...override,
    updatedAt: new Date().toISOString(),
  };
  await saveDailyNoorOverrides(all);
  return all[dateKey];
}
