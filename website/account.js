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
const accountButtons = [registerButton, signinButton];

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

  if (signinCard) {
    signinCard.style.opacity = signedIn && !signinCard.classList.contains("is-hidden") ? "0.96" : "1";
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
  setButtonsDisabled(false);
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
