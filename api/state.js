import { EVENT, OFFICES, ROSTER } from "../lib/config.js";
import { redis, allPlayers, spunKey } from "../lib/store.js";
import { route, send, phase } from "../lib/http.js";

// Public info: dates, offices, staff lists and who has joined (never wishes or pairings).
export default route(["GET"], async (req, res) => {
  const players = await allPlayers();
  const offices = await Promise.all(OFFICES.map(async o => ({
    ...o,
    roster: ROSTER[o.id] || [],
    joined: players.filter(p => p.office === o.id).map(p => p.name).sort((a, b) => a.localeCompare(b)),
    spun: (await redis.scard(spunKey(o.id))) || 0,
  })));
  send(res, 200, { event: EVENT, phase: phase(), forced: Boolean(process.env.FORCE_PHASE), now: Date.now(), offices });
});
