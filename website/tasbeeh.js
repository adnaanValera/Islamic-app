const tasbeehStorageKey = "nooriva-tasbeeh-state";
const malawiTimeZone = "Africa/Blantyre";

const tasbeehCount = document.getElementById("tasbeeh-count");
const tasbeehTodayTotal = document.getElementById("tasbeeh-today-total");
const tasbeehRoundTotal = document.getElementById("tasbeeh-round-total");
const tasbeehTargetTotal = document.getElementById("tasbeeh-target-total");
const tasbeehLastReset = document.getElementById("tasbeeh-last-reset");
const tasbeehProgressFill = document.getElementById("tasbeeh-progress-fill");
const tasbeehProgressCopy = document.getElementById("tasbeeh-progress-copy");
const tasbeehTargetBadge = document.getElementById("tasbeeh-target-badge");
const tasbeehStatus = document.getElementById("tasbeeh-status");
const tasbeehGoalCopy = document.getElementById("tasbeeh-goal-copy");
const addButton = document.getElementById("tasbeeh-add");
const tapButton = document.getElementById("tasbeeh-tap");
const resetButton = document.getElementById("tasbeeh-reset");
const minusButton = document.getElementById("tasbeeh-minus");
const completeRoundButton = document.getElementById("tasbeeh-complete-round");
const targetButtons = Array.from(document.querySelectorAll("[data-target]"));

function getDateKey() {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: malawiTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function defaultState() {
  return {
    dateKey: getDateKey(),
    count: 0,
    todayTotal: 0,
    target: 33,
    lastResetLabel: "Today",
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(tasbeehStorageKey);

    if (!raw) {
      return defaultState();
    }

    const parsed = JSON.parse(raw);
    const todayKey = getDateKey();

    if (parsed.dateKey !== todayKey) {
      return {
        ...defaultState(),
        target: Number(parsed.target) || 33,
      };
    }

    return {
      dateKey: todayKey,
      count: Number(parsed.count) || 0,
      todayTotal: Number(parsed.todayTotal) || 0,
      target: Number(parsed.target) || 33,
      lastResetLabel: parsed.lastResetLabel || "Today",
    };
  } catch (error) {
    return defaultState();
  }
}

let tasbeehState = loadState();

function saveState() {
  localStorage.setItem(tasbeehStorageKey, JSON.stringify(tasbeehState));
}

function renderTasbeeh() {
  const progress = Math.min((tasbeehState.count / tasbeehState.target) * 100, 100);

  if (tasbeehCount) {
    tasbeehCount.textContent = String(tasbeehState.count);
  }

  if (tasbeehTodayTotal) {
    tasbeehTodayTotal.textContent = String(tasbeehState.todayTotal);
  }

  if (tasbeehRoundTotal) {
    tasbeehRoundTotal.textContent = String(tasbeehState.count);
  }

  if (tasbeehTargetTotal) {
    tasbeehTargetTotal.textContent = String(tasbeehState.target);
  }

  if (tasbeehLastReset) {
    tasbeehLastReset.textContent = tasbeehState.lastResetLabel;
  }

  if (tasbeehProgressFill) {
    tasbeehProgressFill.style.width = `${Math.max(progress, 4)}%`;
  }

  if (tasbeehProgressCopy) {
    tasbeehProgressCopy.textContent = `${tasbeehState.count} of ${tasbeehState.target}`;
  }

  if (tasbeehTargetBadge) {
    tasbeehTargetBadge.textContent = `Target ${tasbeehState.target}`;
  }

  if (tasbeehGoalCopy) {
    tasbeehGoalCopy.textContent =
      tasbeehState.count >= tasbeehState.target
        ? "Target reached. You can complete the round or continue counting."
        : `${tasbeehState.target - tasbeehState.count} remaining in this round.`;
  }

  targetButtons.forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.target) === tasbeehState.target);
  });

  saveState();
}

function addCount(amount = 1) {
  tasbeehState.count += amount;
  tasbeehState.todayTotal += amount;
  tasbeehStatus.textContent = "Tasbeeh updated.";
  renderTasbeeh();
}

function undoCount() {
  if (tasbeehState.count <= 0 || tasbeehState.todayTotal <= 0) {
    tasbeehStatus.textContent = "Nothing to undo.";
    return;
  }

  tasbeehState.count -= 1;
  tasbeehState.todayTotal -= 1;
  tasbeehStatus.textContent = "Removed one count.";
  renderTasbeeh();
}

function resetRound() {
  tasbeehState.count = 0;
  tasbeehState.lastResetLabel = "Just now";
  tasbeehStatus.textContent = "Current round reset.";
  renderTasbeeh();
}

function completeRound() {
  tasbeehState.count = 0;
  tasbeehState.lastResetLabel = "Round completed";
  tasbeehStatus.textContent = "Round completed. Keep going if you want to continue.";
  renderTasbeeh();
}

function setTarget(target) {
  tasbeehState.target = target;
  tasbeehStatus.textContent = `Target set to ${target}.`;
  renderTasbeeh();
}

addButton?.addEventListener("click", () => addCount(1));
tapButton?.addEventListener("click", () => addCount(1));
resetButton?.addEventListener("click", resetRound);
minusButton?.addEventListener("click", undoCount);
completeRoundButton?.addEventListener("click", completeRound);
targetButtons.forEach((button) => {
  button.addEventListener("click", () => setTarget(Number(button.dataset.target)));
});

renderTasbeeh();
