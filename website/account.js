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
const adminTemplatePreview = document.getElementById("admin-template-preview");
const adminTemplateTitle = document.getElementById("admin-template-title");
const adminTemplateBody = document.getElementById("admin-template-body");
const adminCardDownloadButton = document.getElementById("admin-card-download");
const adminDailyNoorDate = document.getElementById("admin-daily-noor-date");
const adminDailyNoorSaveButton = document.getElementById("admin-daily-noor-save");
const adminDailyNoorStatus = document.getElementById("admin-daily-noor-status");
const adminReminderTitle = document.getElementById("admin-reminder-title");
const adminReminderQuote = document.getElementById("admin-reminder-quote");
const adminReminderReflection = document.getElementById("admin-reminder-reflection");
const adminHistoryTitle = document.getElementById("admin-history-title");
const adminHistorySummary = document.getElementById("admin-history-summary");
const adminDuaTitle = document.getElementById("admin-dua-title");
const adminDuaArabic = document.getElementById("admin-dua-arabic");
const adminDuaTransliteration = document.getElementById("admin-dua-transliteration");
const adminDuaEnglish = document.getElementById("admin-dua-english");
const accountButtons = [registerButton, signinButton];
const adminOverviewUrl = "/api/admin";
const adminDailyNoorUrl = "/api/admin?mode=daily-noor";

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

function isAdminName(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase() === "adnaan valera";
}

function setAccountStatus(message, isOffline = false) {
  if (!statusLine) {
    return;
  }

  statusLine.textContent = message;
  statusLine.classList.toggle("is-offline", Boolean(isOffline));
}

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
  const isAdmin = isAdminName(session?.user?.fullName);

  setAccountStatus(
    signedIn
      ? `Signed in as ${session.user.fullName}.`
      : "No account session yet.",
    !navigator.onLine,
  );

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

function normalizeFlowText(value, fallback = "") {
  const normalized = String(value ?? "")
    .replace(/\s*\n+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || fallback;
}

function normalizePreviewText(value, fallback = "") {
  const normalized = String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalized || fallback;
}

function renderAdminTemplatePreview() {
  if (adminTemplateTitle) {
    adminTemplateTitle.textContent = normalizeFlowText(adminCardTitleInput?.value, "Nooriva");
  }

  if (adminTemplateBody) {
    adminTemplateBody.textContent = normalizePreviewText(adminCardBodyInput?.value, "Add your text here.");
  }

  window.requestAnimationFrame(fitAdminTemplatePreview);
}

function wrapCanvasText(context, text, maxWidth) {
  const words = String(text || "").split(" ");
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

function wrapCanvasParagraphs(context, text, maxWidth) {
  return String(text || "")
    .split("\n")
    .flatMap((paragraph, index, array) => {
      const normalizedParagraph = paragraph.trim();
      const paragraphLines = normalizedParagraph ? wrapCanvasText(context, normalizedParagraph, maxWidth) : [""];

      if (index < array.length - 1) {
        return [...paragraphLines, ""];
      }

      return paragraphLines;
    });
}

function getCanvasLayout(context, text, options) {
  const { maxFontSize, minFontSize, width, maxHeight, lineHeightRatio, weight, family } = options;

  for (let size = maxFontSize; size >= minFontSize; size -= 1) {
    context.font = `${weight} ${size}px ${family}`;
    const lines = wrapCanvasParagraphs(context, text, width);
    const lineHeight = size * lineHeightRatio;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      return { size, lines, lineHeight, totalHeight };
    }
  }

  context.font = `${weight} ${minFontSize}px ${family}`;
  const lines = wrapCanvasParagraphs(context, text, width);
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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function assetToDataUrl(assetUrl) {
  const response = await fetch(assetUrl);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function buildInlineStyle(computedStyle, extra = {}) {
  const base = {
    position: computedStyle.position,
    left: computedStyle.left,
    top: computedStyle.top,
    width: computedStyle.width,
    height: computedStyle.height,
    display: computedStyle.display,
    alignItems: computedStyle.alignItems,
    justifyContent: computedStyle.justifyContent,
    margin: computedStyle.margin,
    color: computedStyle.color,
    fontFamily: computedStyle.fontFamily,
    fontSize: computedStyle.fontSize,
    fontWeight: computedStyle.fontWeight,
    lineHeight: computedStyle.lineHeight,
    textAlign: computedStyle.textAlign,
    whiteSpace: computedStyle.whiteSpace,
    overflow: computedStyle.overflow,
    padding: computedStyle.padding,
  };

  return Object.entries({ ...base, ...extra })
    .filter(([, value]) => value && value !== "normal")
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${value}`)
    .join(";");
}

async function downloadAdminCard() {
  if (!adminTemplatePreview || !adminTemplateTitle || !adminTemplateBody) {
    return;
  }

  const previewRect = adminTemplatePreview.getBoundingClientRect();
  const titleStyles = window.getComputedStyle(adminTemplateTitle);
  const bodyStyles = window.getComputedStyle(adminTemplateBody);
  const backgroundUrl = await assetToDataUrl("./assets/admin-card-template.jpg");

  const titleHtml = escapeHtml(adminTemplateTitle.textContent || "Nooriva");
  const bodyHtml = escapeHtml(adminTemplateBody.textContent || "Add your text here.").replace(/\n/g, "<br/>");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(previewRect.width * 3)}" height="${Math.round(previewRect.height * 3)}" viewBox="0 0 ${previewRect.width} ${previewRect.height}">
      <foreignObject x="0" y="0" width="${previewRect.width}" height="${previewRect.height}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${previewRect.width}px;height:${previewRect.height}px;background-image:url('${backgroundUrl}');background-size:cover;background-position:center;border-radius:28px;overflow:hidden;">
          <div style="${buildInlineStyle(titleStyles)}">${titleHtml}</div>
          <div style="${buildInlineStyle(bodyStyles)}">${bodyHtml}</div>
        </div>
      </foreignObject>
    </svg>
  `;

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(previewRect.width * 3);
    canvas.height = Math.round(previewRect.height * 3);
    const context = canvas.getContext("2d");

    if (!context) {
      URL.revokeObjectURL(svgUrl);
      return;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      URL.revokeObjectURL(svgUrl);
      if (!blob) {
        return;
      }

      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${sanitizeFileNamePart(adminTemplateTitle.textContent || "Nooriva")}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }, "image/png");
  };

  image.src = svgUrl;
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
  loadAdminDailyNoor();
  setButtonsDisabled(false);
}

async function loadAdminOverview() {
  const isAdmin = isAdminName(session?.user?.fullName);
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

async function saveAdminDailyNoor() {
  if (!session?.token) {
    return;
  }

  if (adminDailyNoorStatus) {
    adminDailyNoorStatus.textContent = "Saving…";
  }

  try {
    const response = await fetch(adminDailyNoorUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({
        reminder: {
          title: adminReminderTitle?.value?.trim(),
          quote: adminReminderQuote?.value?.trim(),
          reflection: adminReminderReflection?.value?.trim(),
        },
        history: {
          title: adminHistoryTitle?.value?.trim(),
          summary: adminHistorySummary?.value?.trim(),
        },
        dua: {
          title: adminDuaTitle?.value?.trim(),
          arabic: adminDuaArabic?.value?.trim(),
          transliteration: adminDuaTransliteration?.value?.trim(),
          english: adminDuaEnglish?.value?.trim(),
        },
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.error || "Unable to save Today's Noor content.");
    }

    if (adminDailyNoorStatus) {
      adminDailyNoorStatus.textContent = `Saved for ${payload.dateKey}.`;
    }
  } catch (error) {
    if (adminDailyNoorStatus) {
      adminDailyNoorStatus.textContent = error.message || "Unable to save Today's Noor content.";
    }
  }
}

async function loadAdminDailyNoor() {
  const isAdmin = isAdminName(session?.user?.fullName);
  if (!isAdmin || !session?.token) {
    return;
  }

  try {
    const response = await fetch(adminDailyNoorUrl, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    if (!response.ok) {
      return;
    }

    const payload = await response.json();
    const override = payload.override || {};

    if (adminDailyNoorDate) adminDailyNoorDate.textContent = payload.dateKey || "Today";
    if (adminReminderTitle) adminReminderTitle.value = override?.reminder?.title || "";
    if (adminReminderQuote) adminReminderQuote.value = override?.reminder?.quote || "";
    if (adminReminderReflection) adminReminderReflection.value = override?.reminder?.reflection || "";
    if (adminHistoryTitle) adminHistoryTitle.value = override?.history?.title || "";
    if (adminHistorySummary) adminHistorySummary.value = override?.history?.summary || "";
    if (adminDuaTitle) adminDuaTitle.value = override?.dua?.title || "";
    if (adminDuaArabic) adminDuaArabic.value = override?.dua?.arabic || "";
    if (adminDuaTransliteration) adminDuaTransliteration.value = override?.dua?.transliteration || "";
    if (adminDuaEnglish) adminDuaEnglish.value = override?.dua?.english || "";
  } catch {}
}

registerButton?.addEventListener("click", async () => {
  try {
    await submitAuth(registerUrl, registerFullName.value, registerPassword.value);
    setAccountStatus("Account created and signed in.");
    setView("signin");
    registerFullName.value = "";
    registerPassword.value = "";
  } catch (error) {
    setAccountStatus(error.message);
    setButtonsDisabled(false);
  }
});

signinButton?.addEventListener("click", async () => {
  try {
    await submitAuth(signinUrl, signinFullName.value, signinPassword.value);
    setAccountStatus("Signed in successfully.");
    signinPassword.value = "";
  } catch (error) {
    setAccountStatus(error.message);
    setButtonsDisabled(false);
  }
});

signoutButton?.addEventListener("click", () => {
  session = null;
  clearSession();
  renderSession();
  setAccountStatus("Signed out.");
});

showSigninButton?.addEventListener("click", () => setView("signin"));
showRegisterButton?.addEventListener("click", () => setView("register"));
adminCardTitleInput?.addEventListener("input", renderAdminTemplatePreview);
adminCardBodyInput?.addEventListener("input", renderAdminTemplatePreview);
adminCardDownloadButton?.addEventListener("click", downloadAdminCard);
adminDailyNoorSaveButton?.addEventListener("click", saveAdminDailyNoor);

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
loadAdminDailyNoor();
renderAdminTemplatePreview();
window.addEventListener("resize", renderAdminTemplatePreview);
window.addEventListener("offline", () => {
  if (session?.user?.fullName) {
    setAccountStatus(`Signed in as ${session.user.fullName}.`, true);
  } else {
    setAccountStatus("Offline. Your saved account session is still available on this device.", true);
  }
});
window.addEventListener("online", () => {
  renderSession();
  loadAdminOverview();
  loadAdminDailyNoor();
});
