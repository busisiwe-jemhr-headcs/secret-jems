import { redis, getPlayer, drawKey, spunKey } from "../lib/store.js";
import { readToken } from "../lib/auth.js";
import { route, send, fail, phase } from "../lib/http.js";

export default route(["GET"], async (req, res) => {
  const key = readToken(req);
  if (!key) return fail(res, 401, "Please sign in.");
  const me = await getPlayer(key);
  if (!me) return fail(res, 404, "We couldn’t find your entry. Join again or ask the organiser.");
  let match = null, hasSpun = false;
  if (phase() === "draw") {
    hasSpun = (await redis.sismember(spunKey(me.office), key)) === 1;
    if (hasSpun) {
      const rk = await redis.hget(drawKey(me.office), key);
      const r = rk ? await getPlayer(rk) : null;
      if (r) match = { name: r.name, wishes: r.wishes };
    }
  }
  send(res, 200, { me: { name: me.name, office: me.office, wishes: me.wishes }, hasSpun, match });
});
