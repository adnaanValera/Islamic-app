const SUBSCRIPTIONS_KEY = "nooriva:push:subscriptions";

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

export function isPushStorageConfigured() {
  return Boolean(getKvConfig());
}

export async function loadSubscriptions() {
  const response = await kvRequest(`/get/${encodeURIComponent(SUBSCRIPTIONS_KEY)}`);

  if (!response?.result) {
    return [];
  }

  try {
    return JSON.parse(response.result);
  } catch (error) {
    return [];
  }
}

export async function saveSubscriptions(subscriptions) {
  await kvRequest(`/set/${encodeURIComponent(SUBSCRIPTIONS_KEY)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscriptions),
  });
}

export async function upsertSubscription(subscription) {
  const subscriptions = await loadSubscriptions();
  const withoutCurrent = subscriptions.filter(
    (item) => item?.endpoint !== subscription?.endpoint,
  );

  withoutCurrent.push(subscription);
  await saveSubscriptions(withoutCurrent);
  return withoutCurrent.length;
}

export async function removeSubscription(endpoint) {
  const subscriptions = await loadSubscriptions();
  const filtered = subscriptions.filter((item) => item?.endpoint !== endpoint);

  await saveSubscriptions(filtered);
  return filtered.length;
}
