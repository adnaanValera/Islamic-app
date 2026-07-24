const settingsDownloadAppButton = document.getElementById("settings-download-app");
const settingsInstallStatus = document.getElementById("settings-install-status");
const settingsInstallMode = document.getElementById("settings-install-mode");
const settingsNotificationMode = document.getElementById("settings-notification-mode");
const settingsWorkerMode = document.getElementById("settings-worker-mode");
const settingsPushMode = document.getElementById("settings-push-mode");
const settingsSyncMode = document.getElementById("settings-sync-mode");
const settingsTestNotificationButton = document.getElementById("settings-test-notification");
const settingsTestStatus = document.getElementById("settings-test-status");

const pushPublicKeyApiUrl = "/api/push-public-key";
const pushSubscribeApiUrl = "/api/push-subscribe";
const pushSendTestApiUrl = "/api/push-send-test";

function base64UrlToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output;
}

async function ensureBackendPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported on this device.");
  }

  await window.noorivaInstall?.registerServiceWorker?.();

  if (!("Notification" in window)) {
    throw new Error("Notifications are not available.");
  }

  let permission = Notification.permission;
  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const keyResponse = await fetch(pushPublicKeyApiUrl, { cache: "no-store" });
  const keyPayload = await keyResponse.json();

  if (!keyResponse.ok || !keyPayload?.configured || !keyPayload?.publicKey) {
    throw new Error("Server push is not configured yet.");
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(keyPayload.publicKey),
    });
  }

  const subscribeResponse = await fetch(pushSubscribeApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscription }),
  });

  if (!subscribeResponse.ok) {
    const errorPayload = await subscribeResponse.json().catch(() => ({}));
    throw new Error(errorPayload?.error || "Unable to store the push subscription.");
  }

  return subscription;
}

async function updateSettingsDiagnostics() {
  if (settingsInstallMode) {
    settingsInstallMode.textContent = window.noorivaInstall?.isStandaloneApp?.()
      ? "Installed app"
      : "Browser";
  }

  if (settingsNotificationMode) {
    if (!("Notification" in window)) {
      settingsNotificationMode.textContent = "Unsupported";
    } else if (Notification.permission === "granted") {
      settingsNotificationMode.textContent = "Enabled";
    } else if (Notification.permission === "denied") {
      settingsNotificationMode.textContent = "Blocked";
    } else {
      settingsNotificationMode.textContent = "Not enabled";
    }
  }

  if (settingsWorkerMode) {
    settingsWorkerMode.textContent = "serviceWorker" in navigator ? "Available" : "Unavailable";
  }

  if (settingsPushMode) {
    settingsPushMode.textContent =
      "PushManager" in window && "serviceWorker" in navigator
        ? Notification.permission === "granted"
          ? "Ready"
          : "Permission needed"
        : "Limited";
  }

  if (settingsSyncMode) {
    settingsSyncMode.textContent = "Local-only (cloud sync later)";
  }
}

if (settingsDownloadAppButton) {
  settingsDownloadAppButton.addEventListener("click", async () => {
    const installResult = await window.noorivaInstall?.triggerInstall?.();

    if (installResult === "installed" || installResult === "standalone") {
      settingsDownloadAppButton.style.display = "none";
      updateSettingsDiagnostics();
      return;
    }

    if (settingsInstallStatus) {
      settingsInstallStatus.textContent =
        "Use your browser's install option to add Nooriva to your device.";
    }
  });
}

window.addEventListener("nooriva:install-available", () => {
  if (settingsDownloadAppButton) {
    settingsDownloadAppButton.style.display = "inline-flex";
  }
  updateSettingsDiagnostics();
});

window.addEventListener("nooriva:installed", () => {
  if (settingsDownloadAppButton) {
    settingsDownloadAppButton.style.display = "none";
  }
  updateSettingsDiagnostics();
});

settingsTestNotificationButton?.addEventListener("click", async () => {
  if (settingsTestStatus) {
    settingsTestStatus.textContent = "Sending test notification...";
  }

  try {
    const subscription = await ensureBackendPushSubscription();
    const response = await fetch(pushSendTestApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.error || "Unable to send a test notification.");
    }

    if (settingsTestStatus) {
      settingsTestStatus.textContent = "Test notification sent.";
    }
  } catch (error) {
    if (settingsTestStatus) {
      settingsTestStatus.textContent = error.message || "Test notification failed.";
    }
  }

  updateSettingsDiagnostics();
});

if ("Notification" in window && Notification.permission === "granted") {
  ensureBackendPushSubscription().catch(() => undefined);
}

updateSettingsDiagnostics();
