const settingsDownloadAppButton = document.getElementById("settings-download-app");
const settingsInstallStatus = document.getElementById("settings-install-status");

if (settingsDownloadAppButton) {
  settingsDownloadAppButton.addEventListener("click", async () => {
    const installResult = await window.noorivaInstall?.triggerInstall?.();

    if (installResult === "installed" || installResult === "standalone") {
      settingsDownloadAppButton.style.display = "none";
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
});

window.addEventListener("nooriva:installed", () => {
  if (settingsDownloadAppButton) {
    settingsDownloadAppButton.style.display = "none";
  }
});
