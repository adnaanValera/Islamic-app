import {
  pruneChecklistStateMap,
  syncChecklistState,
  loadChecklistStateMap,
  saveChecklistStateMap,
} from "./_lib/prayer-checklist-state.js";
import { isPushStorageConfigured } from "./_lib/push-store.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  if (!isPushStorageConfigured()) {
    response.status(503).json({ ok: false, error: "Push storage is not configured." });
    return;
  }

  const endpoint = request.body?.endpoint;
  const dateKey = request.body?.dateKey;
  const checked = request.body?.checked;

  if (!endpoint || !dateKey || typeof checked !== "object" || Array.isArray(checked)) {
    response.status(400).json({ ok: false, error: "Endpoint, dateKey and checked state are required." });
    return;
  }

  await syncChecklistState({ endpoint, dateKey, checked });
  const state = await loadChecklistStateMap();
  await saveChecklistStateMap(pruneChecklistStateMap(state, dateKey));

  response.status(200).json({ ok: true });
}
