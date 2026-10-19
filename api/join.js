import { keyOf, createPlayer } from "../lib/store.js";
import { hashPin, makeToken } from "../lib/auth.js";
import { route, send, fail, body, phase, validOffice, cleanWishes, cleanName } from "../lib/http.js";

export default route(["POST"], async (req, res) => {
  if (phase() !== "open") return fail(res, 403, "Wish lists are closed, so new people can’t join now.");
  const b = body(req);
  const name = cleanName(b.name);
  const wishes = cleanWishes(b.wishes);
  const pin = String(b.pin || "");
  if (!validOffice(b.office)) return fail(res, 400, "Pick your office.");
  if (!name) return fail(res, 400, "Add your name.");
  if (!/^\d{4}$/.test(pin)) return fail(res, 400, "Your PIN needs to be 4 digits.");
  if (!wishes) return fail(res, 400, "Fill in all three wishes.");
  const key = keyOf(name);
  const ok = await createPlayer(key, { name, office: b.office, wishes, pin: hashPin(key, pin), joinedAt: Date.now() });
  if (!ok) return fail(res, 409, `${name} has already joined. Sign in with your PIN instead.`);
  send(res, 200, { token: makeToken(key) });
});
