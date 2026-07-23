const accountSessionStorageKey = "nooriva-account-session";
const registerUrl = "/api/account-register";
const signinUrl = "/api/account-signin";
const syncStatusUrl = "/api/sync-status";

const statusLine = document.getElementById("account-status");
const sessionCopy = document.getElementById("account-session-copy");
const modeBadge = document.getElementById("account-mode-badge");
const sessionState = document.getElementById("account-session-state");
const userName = document.getElementById("account-user-name");
const syncState = document.getElementById("account-sync-state");
const registerFullName = document.getElementById("register-full-name");
const registerPassword = document.getElementById("register-password");
const signinFullName = document.getElementById("signin-full-name");
const signinPassword = document.getElementById("signin-password");
const registerButton = document.getElementById("account-register");
const signinButton = document.getElementById("account-signin");
const signoutButton = document.getElementById("account-signout");

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
  try {
    const response = await fetch(syncStatusUrl, { cache: "no-store" });
    const payload = await response.json();
    if (syncState) {
      syncState.textContent = payload?.syncMode === "cloud-ready" ? "Cloud-ready" : "Local-only";
    }
  } catch (error) {
    if (syncState) {
      syncState.textContent = "Unknown";
    }
  }
}

function renderSession() {
  const signedIn = Boolean(session?.user?.fullName);

  if (statusLine) {
    statusLine.textContent = signedIn
      ? `Signed in as ${session.user.fullName}.`
      : "No account session yet.";
  }

  if (sessionCopy) {
    sessionCopy.textContent = signedIn
      ? "Your local Nooriva data can connect to cloud sync later."
      : "Local browsing works without an account.";
  }

  if (modeBadge) {
    modeBadge.textContent = signedIn ? "Signed in" : "Guest";
  }

  if (sessionState) {
    sessionState.textContent = signedIn ? "Active" : "Guest";
  }

  if (userName) {
    userName.textContent = session?.user?.fullName ?? "None";
  }
}

async function submitAuth(url, fullName, password) {
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
}

registerButton?.addEventListener("click", async () => {
  try {
    await submitAuth(registerUrl, registerFullName.value, registerPassword.value);
    statusLine.textContent = "Account created and signed in.";
  } catch (error) {
    statusLine.textContent = error.message;
  }
});

signinButton?.addEventListener("click", async () => {
  try {
    await submitAuth(signinUrl, signinFullName.value, signinPassword.value);
    statusLine.textContent = "Signed in successfully.";
  } catch (error) {
    statusLine.textContent = error.message;
  }
});

signoutButton?.addEventListener("click", () => {
  session = null;
  clearSession();
  renderSession();
  statusLine.textContent = "Signed out.";
});

renderSession();
updateSyncStatus();
