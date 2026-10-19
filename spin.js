import { redis, allPlayers, getPlayer, ensureDraw, spunKey } from "../lib/store.js";
import { readToken } from "../lib/auth.js";
import { route, send, fail, phase } from "../lib/http.js";

export default route(["POST"], async (req, res) => {
  const key = readToken(req);
  if (!key) return fail(res, 401, "Please sign in.");
  if (phase() !== "draw") return fail(res, 403, "The draw isn’t open yet.");
  const me = await getPlayer(key);
  if (!me) return fail(res, 404, "We couldn’t find your entry.");
  const draw = await ensureDraw(me.office);
  const rk = draw[key];
  if (!rk) return fail(res, 409, Object.keys(draw).length
    ? "You’re not in this office’s draw. Ask the organiser to reshuffle your office."
    : "Your office needs at least 2 people for the draw.");
  const r = await getPlayer(rk);
  if (!r) return fail(res, 409, "Your match has left the swap. Ask the organiser to reshuffle your office.");
  await redis.sadd(spunKey(me.office), key);
  const wheel = (await allPlayers()).filter(p => p.office === me.office && p.key !== key).map(p => p.name);
  send(res, 200, { match: { name: r.name, wishes: r.wishes }, wheel });
});
