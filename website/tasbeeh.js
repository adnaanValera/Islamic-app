const tasbeehStorageKey = "nooriva-tasbeeh-state";
const malawiTimeZone = "Africa/Blantyre";
const dhikrModes = [
  { key: "subhanallah", label: "SubhanAllah", arabic: "SubhanAllah", defaultTarget: 33 },
  { key: "alhamdulillah", label: "Alhamdulillah", arabic: "Alhamdulillah", defaultTarget: 33 },
  { key: "allahuakbar", label: "Allahu Akbar", arabic: "Allahu Akbar", defaultTarget: 34 },
  { key: "custom", label: "General Dhikr", arabic: "General Dhikr", defaultTarget: 100 },
];

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
const tapButton = document.getElementById("tasbeeh-tap");
const targetButtons = Array.from(document.querySelectorAll("[data-target]"));
const dhikrButtons = Array.from(document.querySelectorAll("[data-dhikr]"));
const activeDhikrLabel = document.getElementById("active-dhikr-label");
const activeDhikrArabic = document.getElementById("active-dhikr-arabic");
const tasbeehStreak = document.getElementById("tasbeeh-streak");
const tasbeehBestDhikr = document.getElementById("tasbeeh-best-dhikr");
const tasbeehCompletedRounds = document.getElementById("tasbeeh-completed-rounds");
const tasbeehHistoryList = document.getElementById("tasbeeh-history-list");

function getDateKey(offsetDays = 0) {
  const baseDate = new Date();
  baseDate.setUTCDate(baseDate.getUTCDate() + offsetDays);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: malawiTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(baseDate);
}

function createDefaultDhikrState() {
  return Object.fromEntries(
    dhikrModes.map((mode) => [
      mode.key,
      {
        count: 0,
        todayTotal: 0,
        target: mode.defaultTarget,
        completedRounds: 0,
      },
    ]),
  );
}

function defaultState() {
  return {
    dateKey: getDateKey(),
    activeDhikr: dhikrModes[0].key,
    lastResetLabel: "Today",
    history: [],
    dhikr: createDefaultDhikrState(),
  };
}

function normalizeHistory(history) {
  return Array.isArray(history) ? history.slice(0, 14) : [];
}

function loadState() {
  try {
    const raw = localStorage.getItem(tasbeehStorageKey);

    if (!raw) {
      return defaultState();
    }

    const parsed = JSON.parse(raw);
    const todayKey = getDateKey();
    const initial = defaultState();
    const parsedDhikr = parsed?.dhikr ?? {};
    const mergedDhikr = createDefaultDhikrState();

    dhikrModes.forEach((mode) => {
      const entry = parsedDhikr[mode.key] ?? {};
      mergedDhikr[mode.key] = {
        count: Number(entry.count) || 0,
        todayTotal: Number(entry.todayTotal) || 0,
        target: Number(entry.target) || mode.defaultTarget,
        completedRounds: Number(entry.completedRounds) || 0,
      };
    });

    if (parsed.dateKey !== todayKey) {
      const yesterdaySummary = {
        dateKey: parsed.dateKey,
        totals: Object.fromEntries(
          dhikrModes.map((mode) => [mode.key, Number(parsedDhikr?.[mode.key]?.todayTotal) || 0]),
        ),
      };

      return {
        ...initial,
        activeDhikr: parsed.activeDhikr || initial.activeDhikr,
        lastResetLabel: "Today",
        history: [yesterdaySummary, ...normalizeHistory(parsed.history)].slice(0, 14),
        dhikr: Object.fromEntries(
          dhikrModes.map((mode) => [
            mode.key,
            {
              ...mergedDhikr[mode.key],
              count: 0,
              todayTotal: 0,
            },
          ]),
        ),
      };
    }

    return {
      ...initial,
      activeDhikr: parsed.activeDhikr || initial.activeDhikr,
      lastResetLabel: parsed.lastResetLabel || "Today",
      history: normalizeHistory(parsed.history),
      dhikr: mergedDhikr,
    };
  } catch (error) {
    return defaultState();
  }
}

let tasbeehState = loadState();

function saveState() {
  localStorage.setItem(tasbeehStorageKey, JSON.stringify(tasbeehState));
}

function getActiveMode() {
  return dhikrModes.find((mode) => mode.key === tasbeehState.activeDhikr) ?? dhikrModes[0];
}

function getActiveEntry() {
  return tasbeehState.dhikr[tasbeehState.activeDhikr];
}

function getBestDhikrLabel() {
  const totals = dhikrModes.map((mode) => ({
    label: mode.label,
    total: tasbeehState.dhikr[mode.key]?.todayTotal ?? 0,
  }));
  const best = totals.sort((a, b) => b.total - a.total)[0];
  return best && best.total > 0 ? `${best.label} • ${best.total}` : "No entries yet";
}

function getActiveStreak() {
  let streak = 0;
  const todayEntry = getActiveEntry();

  if ((todayEntry?.todayTotal ?? 0) > 0) {
    streak += 1;
  }

  for (const item of tasbeehState.history) {
    if ((item?.totals?.[tasbeehState.activeDhikr] ?? 0) > 0) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function renderHistory() {
  if (!tasbeehHistoryList) {
    return;
  }

  const items = [
    {
      dateKey: "Today",
      totals: Object.fromEntries(
        dhikrModes.map((mode) => [mode.key, tasbeehState.dhikr[mode.key].todayTotal]),
      ),
    },
    ...tasbeehState.history,
  ].slice(0, 4);

  tasbeehHistoryList.innerHTML = items
    .map((item) => {
      const dateLabel = item.dateKey === "Today" ? "Today" : item.dateKey;
      const topMode = dhikrModes
        .map((mode) => ({
          label: mode.label,
          total: item.totals?.[mode.key] ?? 0,
        }))
        .sort((a, b) => b.total - a.total)[0];

      return `
        <div class="timing-row tasbeeh-history-row">
          <span>${dateLabel}</span>
          <strong>${topMode?.total ? `${topMode.label} • ${topMode.total}` : "No dhikr"}</strong>
        </div>
      `;
    })
    .join("");
}

function renderTasbeeh() {
  const activeMode = getActiveMode();
  const activeEntry = getActiveEntry();
  const progress = Math.min((activeEntry.count / activeEntry.target) * 100, 100);

  if (tasbeehCount) {
    tasbeehCount.textContent = String(activeEntry.count);
  }

  if (tasbeehTodayTotal) {
    tasbeehTodayTotal.textContent = String(
      dhikrModes.reduce((sum, mode) => sum + (tasbeehState.dhikr[mode.key]?.todayTotal ?? 0), 0),
    );
  }

  if (tasbeehRoundTotal) {
    tasbeehRoundTotal.textContent = String(activeEntry.count);
  }

  if (tasbeehTargetTotal) {
    tasbeehTargetTotal.textContent = String(activeEntry.target);
  }

  if (tasbeehLastReset) {
    tasbeehLastReset.textContent = tasbeehState.lastResetLabel;
  }

  if (tasbeehProgressFill) {
    tasbeehProgressFill.style.width = `${Math.max(progress, 4)}%`;
  }

  if (tasbeehProgressCopy) {
    tasbeehProgressCopy.textContent = `${activeEntry.count} of ${activeEntry.target}`;
  }

  if (tasbeehTargetBadge) {
    tasbeehTargetBadge.textContent = `Target ${activeEntry.target}`;
  }

  if (tasbeehGoalCopy) {
    tasbeehGoalCopy.textContent =
      activeEntry.count >= activeEntry.target
        ? `${activeMode.label} target reached. Keep going if you want.`
        : `${Math.max(activeEntry.target - activeEntry.count, 0)} remaining in this round.`;
  }

  if (activeDhikrLabel) {
    activeDhikrLabel.textContent = activeMode.label;
  }

  if (activeDhikrArabic) {
    activeDhikrArabic.textContent = activeMode.arabic;
  }

  if (tasbeehStreak) {
    tasbeehStreak.textContent = `${getActiveStreak()} day${getActiveStreak() === 1 ? "" : "s"}`;
  }

  if (tasbeehBestDhikr) {
    tasbeehBestDhikr.textContent = getBestDhikrLabel();
  }

  if (tasbeehCompletedRounds) {
    tasbeehCompletedRounds.textContent = String(activeEntry.completedRounds);
  }

  targetButtons.forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.target) === activeEntry.target);
  });

  dhikrButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.dhikr === activeMode.key);
  });

  renderHistory();
  saveState();
}

function addCount(amount = 1) {
  const activeEntry = getActiveEntry();
  const wasBelowTarget = activeEntry.count < activeEntry.target;
  activeEntry.count += amount;
  activeEntry.todayTotal += amount;
  tasbeehStatus.textContent = `${getActiveMode().label} updated.`;

  if (tapButton) {
    tapButton.classList.remove("is-tapping");
    window.requestAnimationFrame(() => {
      tapButton.classList.add("is-tapping");
      window.setTimeout(() => tapButton.classList.remove("is-tapping"), 120);
    });
  }

  if (navigator.vibrate) {
    navigator.vibrate(wasBelowTarget && activeEntry.count >= activeEntry.target ? [18, 40, 18] : 12);
  }

  if (wasBelowTarget && activeEntry.count >= activeEntry.target) {
    activeEntry.completedRounds += 1;
    tasbeehStatus.textContent = `${getActiveMode().label} round completed.`;
    if (tapButton) {
      tapButton.classList.add("is-complete");
      window.setTimeout(() => tapButton.classList.remove("is-complete"), 600);
    }
  }

  renderTasbeeh();
}

function setTarget(target) {
  const activeEntry = getActiveEntry();
  activeEntry.target = target;
  tasbeehStatus.textContent = `Target set to ${target}.`;
  renderTasbeeh();
}

function setDhikrMode(modeKey) {
  tasbeehState.activeDhikr = modeKey;
  tasbeehStatus.textContent = `${getActiveMode().label} selected.`;
  renderTasbeeh();
}

tapButton?.addEventListener("click", () => addCount(1));
targetButtons.forEach((button) => {
  button.addEventListener("click", () => setTarget(Number(button.dataset.target)));
});
dhikrButtons.forEach((button) => {
  button.addEventListener("click", () => setDhikrMode(button.dataset.dhikr));
});

renderTasbeeh();
