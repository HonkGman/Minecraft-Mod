# Discord Invite Tracker Bot

Automatically logs when someone joins your Discord server, shows who invited them, and keeps a running invite count for each member.

## What it does

- Posts a join log when a new member arrives (who joined, who invited them, total invites)
- Tracks invite counts in a local SQLite database
- `/invites` — check your or someone else's invite count
- `/leaderboard` — top 10 inviters
- `/setlogchannel` — pick where join logs go (admin only)

## Discord setup (do this on your iPhone)

### 1. Enable intents

In the [Discord Developer Portal](https://discord.com/developers/applications):

1. Open your application → **Bot**
2. Turn on **Server Members Intent**
3. Copy your **Bot Token** (keep it secret)

### 2. Get your IDs

- **Application ID (CLIENT_ID):** Developer Portal → General Information → Application ID
- **Server ID (GUILD_ID):** Discord app → your server → long-press server name → Copy Server ID (enable Developer Mode in Discord Settings → Advanced first)

### 3. Invite the bot to your server

Developer Portal → **OAuth2 → URL Generator**:

- Scopes: `bot`, `applications.commands`
- Permissions: `View Channels`, `Send Messages`, `Embed Links`, `Manage Server`

Open the generated link on your iPhone and add the bot to your server.

---

## Deploy from your iPhone (no computer needed)

The easiest way to run this 24/7 without a PC is **Railway** or **Render**. Both have mobile-friendly websites.

### Option A: Railway (recommended)

1. Push this repo to GitHub (or use the PR branch from this project).
2. Go to [railway.app](https://railway.app) and sign in with GitHub.
3. **New Project** → **Deploy from GitHub repo** → select this repo.
4. Open your service → **Variables** and add:

   | Variable | Value |
   |----------|-------|
   | `DISCORD_TOKEN` | Your bot token |
   | `CLIENT_ID` | Your application ID |
   | `GUILD_ID` | Your server ID |

5. Set **Start Command** to: `npm start`
6. After deploy, run the command registration once. In Railway → your service → **Settings** → add a one-off run or use the shell:

   ```bash
   npm run register-commands
   ```

7. In Discord, run `/setlogchannel` and pick your join-log channel.

### Option B: Render

1. Go to [render.com](https://render.com) → **New Web Service** → connect GitHub repo.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add the same environment variables as above.
5. Run `npm run register-commands` once via Render shell.

---

## Commands

| Command | Description |
|---------|-------------|
| `/invites [user]` | Show invite count for you or another member |
| `/leaderboard` | Top 10 inviters |
| `/setlogchannel #channel` | Set where join logs are posted (requires Manage Server) |

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | Yes | Bot token from Developer Portal |
| `CLIENT_ID` | Yes | Application ID (for slash commands) |
| `GUILD_ID` | Recommended | Registers commands instantly to one server |
| `LOG_CHANNEL_ID` | Optional | Default log channel (or use `/setlogchannel`) |

---

## Bot description (for Developer Portal)

**Short description:**

> Tracks who invited each new member and posts join logs with invite counts. See who's growing your community and reward your top inviters.

**About / tagline:**

> Know who invited who. Every join, logged automatically.

---

## Required bot permissions

- **Manage Server** — required to read invite links
- **Send Messages** — to post join logs
- **Embed Links** — for formatted join messages

---

## Testing

1. Create an invite link from your main Discord account.
2. Join with a second account (or ask a friend) using that link.
3. Check your log channel — you should see who joined and who invited them.
4. Run `/invites` to confirm the count updated.

---

## Project structure

```
src/
  index.js              # Main bot
  database.js           # SQLite invite storage
  invite-cache.js       # Invite comparison logic
  register-commands.js  # One-time slash command setup
```
