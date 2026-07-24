const accountSessionStorageKey = "nooriva-account-session";
const registerUrl = "/api/account-register";
const signinUrl = "/api/account-signin";
const syncStatusUrl = "/api/sync-status";

const statusLine = document.getElementById("account-status");
const registerFullName = document.getElementById("register-full-name");
const registerPassword = document.getElementById("register-password");
const signinFullName = document.getElementById("signin-full-name");
const signinPassword = document.getElementById("signin-password");
const registerButton = document.getElementById("account-register");
const signinButton = document.getElementById("account-signin");
const signoutButton = document.getElementById("account-signout");
const showSigninButton = document.getElementById("account-show-signin");
const showRegisterButton = document.getElementById("account-show-register");
const signinCard = document.getElementById("account-signin-card");
const registerCard = document.getElementById("account-register-card");
const signedInCard = document.getElementById("account-signed-in-card");
const signedInName = document.getElementById("account-signed-in-name");
const accountSwitch = document.getElementById("account-switch");
const accountFormStack = document.getElementById("account-form-stack");
const adminPanel = document.getElementById("admin-panel");
const adminUsersList = document.getElementById("admin-users-list");
const adminMessagesList = document.getElementById("admin-messages-list");
const accountButtons = [registerButton, signinButton];
const adminOverviewUrl = "/api/admin-overview";

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(accountSessionStorageKey) || "null");
  } catch (error) {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(accountSessionStorageKey, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(accountSessionStorageKey);
}

let session = loadSession();

async function updateSyncStatus() {
  return syncStatusUrl;
}

function setView(mode) {
  const signinMode = mode === "signin";
  signinCard?.classList.toggle("is-hidden", !signinMode);
  registerCard?.classList.toggle("is-hidden", signinMode);
  showSigninButton?.classList.toggle("is-active", signinMode);
  showRegisterButton?.classList.toggle("is-active", !signinMode);
}

function renderSession() {
  const signedIn = Boolean(session?.user?.fullName);
  const isAdmin = String(session?.user?.fullName ?? "").toLowerCase() === "adnaan valera";

  if (statusLine) {
    statusLine.textContent = signedIn
      ? `Signed in as ${session.user.fullName}.`
      : "No account session yet.";
  }

  if (signoutButton) {
    signoutButton.style.display = signedIn ? "inline-flex" : "none";
  }

  if (signedInCard) {
    signedInCard.classList.toggle("is-hidden", !signedIn);
  }

  if (signedInName) {
    signedInName.textContent = session?.user?.fullName ?? "Nooriva user";
  }

  if (accountSwitch) {
    accountSwitch.style.display = signedIn ? "none" : "";
  }

  if (accountFormStack) {
    accountFormStack.style.display = signedIn ? "none" : "";
  }

  if (adminPanel) {
    adminPanel.classList.toggle("is-hidden", !(signedIn && isAdmin));
  }

  if (!signedIn) {
    setView("signin");
  }
}

function setButtonsDisabled(disabled) {
  accountButtons.forEach((button) => {
    if (button) {
      button.disabled = disabled;
    }
  });
}

async function submitAuth(url, fullName, password) {
  setButtonsDisabled(true);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fullName, password }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Account request failed.");
  }

  session = {
    token: payload.token,
    user: payload.user,
  };
  saveSession(session);
  renderSession();
  loadAdminOverview();
  setButtonsDisabled(false);
}

async function loadAdminOverview() {
  const isAdmin = String(session?.user?.fullName ?? "").toLowerCase() === "adnaan valera";
  if (!isAdmin || !session?.token) {
    return;
  }

  try {
    const response = await fetch(adminOverviewUrl, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
    if (!response.ok) {
      return;
    }

    const payload = await response.json();

    if (adminUsersList) {
      adminUsersList.innerHTML = payload.users
        .map(
          (user) => `
            <div class="timing-row">
              <span>${user.fullName}</span>
              <strong>${new Date(user.createdAt).toLocaleDateString("en-GB")}</strong>
            </div>
          `,
        )
        .join("");
    }

    if (adminMessagesList) {
      adminMessagesList.innerHTML = payload.messages.length
        ? payload.messages
            .map(
              (message) => `
                <div class="timing-row">
                  <span>${message.name}: ${message.message}</span>
                  <strong>${new Date(message.createdAt).toLocaleDateString("en-GB")}</strong>
                </div>
              `,
            )
            .join("")
        : `<div class="timing-row"><span>No messages yet</span><strong>—</strong></div>`;
    }
  } catch {}
}

registerButton?.addEventListener("click", async () => {
  try {
    await submitAuth(registerUrl, registerFullName.value, registerPassword.value);
    statusLine.textContent = "Account created and signed in.";
    setView("signin");
    registerFullName.value = "";
    registerPassword.value = "";
  } catch (error) {
    statusLine.textContent = error.message;
    setButtonsDisabled(false);
  }
});

signinButton?.addEventListener("click", async () => {
  try {
    await submitAuth(signinUrl, signinFullName.value, signinPassword.value);
    statusLine.textContent = "Signed in successfully.";
    signinPassword.value = "";
  } catch (error) {
    statusLine.textContent = error.message;
    setButtonsDisabled(false);
  }
});

signoutButton?.addEventListener("click", () => {
  session = null;
  clearSession();
  renderSession();
  statusLine.textContent = "Signed out.";
});

showSigninButton?.addEventListener("click", () => setView("signin"));
showRegisterButton?.addEventListener("click", () => setView("register"));

signinPassword?.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    signinButton?.click();
  }
});

registerPassword?.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    registerButton?.click();
  }
});

setView("signin");
renderSession();
loadAdminOverview();
