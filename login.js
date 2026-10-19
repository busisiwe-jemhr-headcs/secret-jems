import { redis, keyOf, getPlayer, failKey } from "../lib/store.js";
import { hashPin, makeToken } from "../lib/auth.js";
import { route, send, fail, body, cleanName } from "../lib/http.js";

export default route(["POST"], async (req, res) => {
  const b = body(req);
  const name = cleanName(b.name);
  const pin = String(b.pin || "");
  if (!name || !/^\d{4}$/.test(pin)) return fail(res, 400, "Pick your name and enter your 4-digit PIN.");
  const key = keyOf(name);
  const fails = Number(await redis.get(failKey(key))) || 0;
  if (fails >= 6) return fail(res, 429, "Too many wrong PINs. Wait 15 minutes, or ask the organiser to reset your PIN.");
  const p = await getPlayer(key);
  if (!p || p.pin !== hashPin(key, pin)) {
    await redis.incr(failKey(key));
    await redis.expire(failKey(key), 900);
    return fail(res, 401, "That PIN doesn’t match. Try again, or ask the organiser to reset it.");
  }
  await redis.del(failKey(key));
  send(res, 200, { token: makeToken(key) });
});
