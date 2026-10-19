# Secret Jems 💎

Jem’s December gift swap. Staff pick their office and name, set a 4-digit PIN, add three wishes,
and come back with their PIN to update them. On draw day everyone spins a wheel to find out who
they’re buying for.

| Date | What happens |
|---|---|
| Until **Friday 13 November, 23:59** | People join and can edit their wish lists |
| **Saturday 14 – Sunday 15 November** | Wish lists are locked |
| From **Monday 16 November, 09:00** | The draw is open and everyone can spin |

Nobody can draw themselves. Each office is drawn as one loop (A → B → C → A), so nobody is left over;
with two people (KZN) they simply get each other. Only the person who spins sees their match.

---

## Deploy it (about 15 minutes)

### 1. Put it on GitHub
1. On github.com, click **New repository**, name it `secret-jems`, keep it **Private**, and create it.
2. Click **uploading an existing file**, drag in **everything inside** the `secret-jems` folder
   (`api`, `lib`, `public`, `package.json`, `package-lock.json`, `vercel.json`, `README.md`, `.gitignore`)
   and commit.

### 2. Import it into Vercel
1. On vercel.com, click **Add New → Project** and import `secret-jems`.
2. Leave **Framework Preset** as **Other** and click **Deploy**.
   The page will load but say it isn’t connected to its database yet. That’s expected.

### 3. Add the database
1. In the Vercel project, open the **Storage** tab → **Create Database** → **Upstash for Redis**
   (from the Marketplace). The free plan is plenty.
2. Connect it to the `secret-jems` project. Vercel adds the connection settings for you.

### 4. Add two secret settings
In **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `SESSION_SECRET` | A long random string (30+ characters). **Never change it once people have joined**, or everyone’s PIN stops working. |
| `ADMIN_KEY` | Your organiser password, used to open **Organiser tools** at the bottom of the page. |

### 5. Redeploy
Go to **Deployments**, open the menu on the latest one and click **Redeploy**. Then open your link and try it.

---

## Changing things
Everything you’re likely to change is in **`lib/config.js`**: the spend limit, swap day, the two dates,
offices and staff lists. Edit it on GitHub (pencil icon), commit, and Vercel redeploys within a minute.

## Organiser tools
At the bottom of the page. Enter your `ADMIN_KEY` to:
- see who has joined and who has spun (never the pairings or wish lists),
- **Reset PIN** for someone who forgot theirs,
- **Remove** someone (if their office has already been drawn, reshuffle it afterwards),
- **Reshuffle** an office, which clears its matches so everyone spins again.

## Testing the draw before 16 November
Add an environment variable `FORCE_PHASE` with the value `draw` (or `closed`) and redeploy.
Test with a couple of dummy names, then in Organiser tools remove them and reshuffle,
**delete `FORCE_PHASE`** and redeploy. While it’s set, the whole live site uses that phase.
