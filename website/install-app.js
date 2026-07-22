(function () {
  let deferredInstallPrompt = null;

  function isStandaloneApp() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (error) {
      // Ignore registration failures for now.
    }
  }

  async function triggerInstall() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;

      if (choice?.outcome === "accepted") {
        return "installed";
      }

      return "dismissed";
    }

    if (isStandaloneApp()) {
      return "standalone";
    }

    return "unsupported";
  }

  function updateHomepageInstallVisibility() {
    const homeActions = document.getElementById("home-install-actions");
    const downloadButton = document.getElementById("home-download-app");
    const installStatus = document.getElementById("home-install-status");
    const settingsDownloadButton = document.getElementById("settings-download-app");
    const settingsInstallStatus = document.getElementById("settings-install-status");
    const notificationsEnabled =
      "Notification" in window && Notification.permission === "granted";

    if (homeActions) {
      if (downloadButton && isStandaloneApp()) {
        downloadButton.style.display = "none";
      } else if (downloadButton) {
        downloadButton.style.display = "";
      }

      const visibleButtons = homeActions.querySelectorAll(
        ".button:not([style*='display: none'])",
      );

      if (visibleButtons.length === 0 || (isStandaloneApp() && notificationsEnabled)) {
        homeActions.classList.add("prayer-actions-hidden");
        if (installStatus) {
          installStatus.textContent = "";
        }
      } else {
        homeActions.classList.remove("prayer-actions-hidden");
      }
    }

    if (settingsDownloadButton && isStandaloneApp()) {
      settingsDownloadButton.style.display = "none";
      if (settingsInstallStatus) {
        settingsInstallStatus.textContent = "";
      }
    }
  }

  window.noorivaInstall = {
    isStandaloneApp,
    registerServiceWorker,
    triggerInstall,
    updateHomepageInstallVisibility,
    updateInstallButtonVisibility() {
      updateHomepageInstallVisibility();
    },
  };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    window.dispatchEvent(new CustomEvent("nooriva:install-available"));
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent("nooriva:installed"));
  });

  if (isStandaloneApp()) {
    document.body.classList.add("standalone-app");
  }

  const homeDownloadButton = document.getElementById("home-download-app");
  const homeInstallStatus = document.getElementById("home-install-status");

  if (homeDownloadButton) {
    homeDownloadButton.addEventListener("click", async () => {
      const installResult = await triggerInstall();

      if (installResult === "installed" || installResult === "standalone") {
        homeDownloadButton.style.display = "none";
        updateHomepageInstallVisibility();
        return;
      }

      if (homeInstallStatus) {
        homeInstallStatus.textContent =
          "Use your browser's install option to add Nooriva to your device.";
      }
    });
  }

  updateHomepageInstallVisibility();
})();
