import { Redis } from "@upstash/redis";

const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "").trim();
const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "").trim();

// Explains exactly what's missing, so the page can show it instead of crashing.
export const setupProblem =
  !url || !token ? "The site isn’t connected to its database yet. Add Upstash for Redis in Vercel’s Storage tab, then redeploy." :
  !url.startsWith("https://") ? "The database address looks wrong. In Vercel, check the Upstash for Redis connection, then redeploy." :
  !process.env.SESSION_SECRET ? "SESSION_SECRET is missing. Add it in Vercel → Settings → Environment Variables, then redeploy." :
  "";
export const configured = !setupProblem;

let client = null;
try { client = configured ? new Redis({ url, token }) : null; }
catch (e) { console.error("Redis setup failed:", e); }
export const redis = client;

const PLAYERS = "sj:players";
export const drawKey = office => `sj:draw:${office}`;
export const spunKey = office => `sj:spun:${office}`;
export const lockKey = office => `sj:drawlock:${office}`;
export const failKey = key => `sj:fail:${key}`;

export const keyOf = name => String(name || "").normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();

const parse = v => (v == null ? null : typeof v === "string" ? JSON.parse(v) : v);

export async function allPlayers() {
  const h = (await redis.hgetall(PLAYERS)) || {};
  return Object.entries(h).map(([key, v]) => ({ key, ...parse(v) }));
}
export async function getPlayer(key) {
  return parse(await redis.hget(PLAYERS, key));
}
export async function createPlayer(key, p) {
  return (await redis.hsetnx(PLAYERS, key, JSON.stringify(p))) === 1;
}
export async function savePlayer(key, p) {
  await redis.hset(PLAYERS, { [key]: JSON.stringify(p) });
}
export async function deletePlayer(key) {
  await redis.hdel(PLAYERS, key);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Makes one random loop through everyone in the office (A→B→C→…→A),
// so nobody draws themselves and nobody is left over. With two people
// it simply pairs them with each other.
export async function ensureDraw(office) {
  const existing = await redis.hgetall(drawKey(office));
  if (existing && Object.keys(existing).length) return existing;
  const won = await redis.set(lockKey(office), "1", { nx: true, ex: 30 });
  if (won) {
    const keys = (await allPlayers()).filter(p => p.office === office).map(p => p.key);
    if (keys.length < 2) { await redis.del(lockKey(office)); return {}; }
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }
    const map = {};
    keys.forEach((k, i) => { map[k] = keys[(i + 1) % keys.length]; });
    await redis.hset(drawKey(office), map);
    return map;
  }
  for (let i = 0; i < 25; i++) {
    await sleep(200);
    const d = await redis.hgetall(drawKey(office));
    if (d && Object.keys(d).length) return d;
  }
  throw new Error("The draw is being prepared. Try again in a moment.");
}
