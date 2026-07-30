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
const adminCardTitleInput = document.getElementById("admin-card-title");
const adminCardBodyInput = document.getElementById("admin-card-body");
const adminTemplateTitle = document.getElementById("admin-template-title");
const adminTemplateBody = document.getElementById("admin-template-body");
const adminCardDownloadButton = document.getElementById("admin-card-download");
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

function fitTextToBox(element, { min, max, step = 1, lineHeight = 1.4 }) {
  if (!element) {
    return;
  }

  let size = max;
  element.style.fontSize = `${size}px`;
  element.style.lineHeight = String(lineHeight);

  while (size > min && (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)) {
    size -= step;
    element.style.fontSize = `${size}px`;
  }
}

function fitAdminTemplatePreview() {
  fitTextToBox(adminTemplateTitle, { min: 17, max: 28, step: 1, lineHeight: 1.1 });
  fitTextToBox(adminTemplateBody, { min: 11, max: 17, step: 0.5, lineHeight: 1.5 });
}

function renderAdminTemplatePreview() {
  if (adminTemplateTitle) {
    adminTemplateTitle.textContent = adminCardTitleInput?.value?.trim() || "Nooriva";
  }

  if (adminTemplateBody) {
    const value = adminCardBodyInput?.value?.trim();
    adminTemplateBody.textContent = value || "Add your text here.";
  }

  window.requestAnimationFrame(fitAdminTemplatePreview);
}

function wrapCanvasText(context, text, maxWidth) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth || !currentLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function getCanvasLayout(context, text, options) {
  const { maxFontSize, minFontSize, width, maxHeight, lineHeightRatio, weight, family } = options;

  for (let size = maxFontSize; size >= minFontSize; size -= 1) {
    context.font = `${weight} ${size}px ${family}`;
    const lines = wrapCanvasText(context, text, width);
    const lineHeight = size * lineHeightRatio;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      return { size, lines, lineHeight, totalHeight };
    }
  }

  context.font = `${weight} ${minFontSize}px ${family}`;
  const lines = wrapCanvasText(context, text, width);
  const lineHeight = minFontSize * lineHeightRatio;
  return { size: minFontSize, lines, lineHeight, totalHeight: lines.length * lineHeight };
}

function drawCenteredLines(context, lines, x, startY, lineHeight) {
  lines.forEach((line, index) => {
    context.fillText(line, x, startY + index * lineHeight);
  });
}

function sanitizeFileNamePart(value) {
  return String(value || "Nooriva").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
}

function downloadAdminCard() {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(image, 0, 0);
    context.textAlign = "center";

    const titleText = adminCardTitleInput?.value?.trim() || "Nooriva";
    const bodyText = adminCardBodyInput?.value?.trim() || "Add your text here.";

    const titleCenterX = canvas.width * 0.5;
    const titleBoxTop = canvas.height * 0.24;
    const titleBoxWidth = canvas.width * 0.58;
    const titleBoxHeight = canvas.height * 0.039;
    const titleLayout = getCanvasLayout(context, titleText, {
      maxFontSize: 27,
      minFontSize: 16,
      width: titleBoxWidth,
      maxHeight: titleBoxHeight,
      lineHeightRatio: 1,
      weight: "600",
      family: "'Cormorant Garamond', serif",
    });

    const bodyCenterX = canvas.width * 0.5;
    const bodyBoxTop = canvas.height * 0.313;
    const bodyBoxWidth = canvas.width * 0.8;
    const bodyBoxHeight = canvas.height * 0.438;
    const bodyLayout = getCanvasLayout(context, bodyText, {
      maxFontSize: 22,
      minFontSize: 14,
      width: bodyBoxWidth,
      maxHeight: bodyBoxHeight,
      lineHeightRatio: 1.5,
      weight: "500",
      family: "Manrope, sans-serif",
    });

    context.fillStyle = "#1F2E29";
    context.font = `600 ${titleLayout.size}px 'Cormorant Garamond', serif`;
    drawCenteredLines(
      context,
      titleLayout.lines,
      titleCenterX,
      titleBoxTop + Math.max((titleBoxHeight - titleLayout.totalHeight) / 2, 0) + titleLayout.lineHeight * 0.79,
      titleLayout.lineHeight,
    );

    context.fillStyle = "#2A3833";
    context.font = `500 ${bodyLayout.size}px Manrope, sans-serif`;
    drawCenteredLines(
      context,
      bodyLayout.lines,
      bodyCenterX,
      bodyBoxTop + Math.max((bodyBoxHeight - bodyLayout.totalHeight) / 2, 0) + bodyLayout.lineHeight * 0.88,
      bodyLayout.lineHeight,
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${sanitizeFileNamePart(titleText)}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }, "image/png");
  };

  image.src = "./assets/admin-card-template.jpg";
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
adminCardTitleInput?.addEventListener("input", renderAdminTemplatePreview);
adminCardBodyInput?.addEventListener("input", renderAdminTemplatePreview);
adminCardDownloadButton?.addEventListener("click", downloadAdminCard);

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
renderAdminTemplatePreview();
window.addEventListener("resize", renderAdminTemplatePreview);
