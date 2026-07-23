import { isAccountStorageConfigured } from "./_lib/account-store.js";
import { isPushStorageConfigured } from "./_lib/push-store.js";
import { isPushConfigured } from "./_lib/web-push.js";

export default async function handler(request, response) {
  response.status(200).json({
    ok: true,
    accountStorageConfigured: isAccountStorageConfigured(),
    pushConfigured: isPushConfigured(),
    pushStorageConfigured: isPushStorageConfigured(),
    syncMode: isAccountStorageConfigured() ? "cloud-ready" : "local-only",
  });
}
