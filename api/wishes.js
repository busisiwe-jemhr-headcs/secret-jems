import { getPlayer, savePlayer } from "../lib/store.js";
import { readToken } from "../lib/auth.js";
import { route, send, fail, body, phase, cleanWishes } from "../lib/http.js";

export default route(["POST"], async (req, res) => {
  const key = readToken(req);
  if (!key) return fail(res, 401, "Please sign in.");
  if (phase() !== "open") return fail(res, 403, "Wish lists are locked now, so they can’t be changed.");
  const wishes = cleanWishes(body(req).wishes);
  if (!wishes) return fail(res, 400, "Fill in all three wishes.");
  const p = await getPlayer(key);
  if (!p) return fail(res, 404, "We couldn’t find your entry.");
  await savePlayer(key, { ...p, wishes, updatedAt: Date.now() });
  send(res, 200, { wishes });
});
