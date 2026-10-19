import { OFFICES } from "../lib/config.js";
import { redis, allPlayers, getPlayer, savePlayer, deletePlayer, drawKey, spunKey, lockKey, failKey } from "../lib/store.js";
import { isAdmin, hashPin } from "../lib/auth.js";
import { route, send, fail, body, validOffice } from "../lib/http.js";

// Organiser tools. Shows who joined and who spun, never the pairings or wish lists.
export default route(["GET", "POST"], async (req, res) => {
  if (!isAdmin(req)) return fail(res, 401, "That organiser key isn’t right.");
  if (req.method === "POST") {
    const b = body(req);
    if (b.action === "reshuffle") {
      if (!validOffice(b.office)) return fail(res, 400, "Unknown office.");
      await redis.del(drawKey(b.office), spunKey(b.office), lockKey(b.office));
    } else if (b.action === "remove") {
      const p = await getPlayer(String(b.key || ""));
      if (!p) return fail(res, 404, "That person isn’t in the swap.");
      await deletePlayer(b.key);
      await redis.srem(spunKey(p.office), b.key);
    } else if (b.action === "resetPin") {
      const pin = String(b.pin || "");
      if (!/^\d{4}$/.test(pin)) return fail(res, 400, "The new PIN needs to be 4 digits.");
      const p = await getPlayer(String(b.key || ""));
      if (!p) return fail(res, 404, "That person isn’t in the swap.");
      await savePlayer(b.key, { ...p, pin: hashPin(b.key, pin) });
      await redis.del(failKey(b.key));
    } else return fail(res, 400, "Unknown action.");
  }
  const players = await allPlayers();
  const offices = await Promise.all(OFFICES.map(async o => {
    const spun = new Set((await redis.smembers(spunKey(o.id))) || []);
    const drawn = (await redis.hlen(drawKey(o.id))) > 0;
    return {
      ...o, drawn,
      people: players.filter(p => p.office === o.id)
        .map(p => ({ key: p.key, name: p.name, spun: spun.has(p.key) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  }));
  send(res, 200, { offices });
});
