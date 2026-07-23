const settingsDownloadAppButton = document.getElementById("settings-download-app");
const settingsInstallStatus = document.getElementById("settings-install-status");
const settingsInstallMode = document.getElementById("settings-install-mode");
const settingsNotificationMode = document.getElementById("settings-notification-mode");
const settingsWorkerMode = document.getElementById("settings-worker-mode");
const settingsPushMode = document.getElementById("settings-push-mode");
const settingsSyncMode = document.getElementById("settings-sync-mode");

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
      "PushManager" in window && "serviceWorker" in navigator ? "Ready for backend push" : "Limited";
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

updateSettingsDiagnostics();
