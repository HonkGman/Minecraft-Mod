# Setup checklist

Tick each box as you go. On iPhone: open this file on GitHub → tap the **pencil** (Edit) → change `[ ]` to `[x]` for completed steps → **Commit changes**.

---

## Discord Developer Portal

- [ ] Opened [Discord Developer Portal](https://discord.com/developers/applications)
- [ ] Selected my bot application
- [ ] Turned on **Server Members Intent** (Bot tab)
- [ ] Copied my **Bot Token** (saved somewhere safe)
- [ ] Copied my **Application ID** (General Information → Application ID)

## Discord app (iPhone)

- [ ] Enabled **Developer Mode** (Settings → Advanced)
- [ ] Copied my **Server ID** (long-press server name → Copy Server ID)
- [ ] Created a `#join-logs` channel in my server

## Invite the bot

- [ ] Opened OAuth2 → URL Generator in Developer Portal
- [ ] Selected scopes: `bot` + `applications.commands`
- [ ] Selected permissions: View Channels, Send Messages, Embed Links, **Manage Server**
- [ ] Opened the invite link on my iPhone and added the bot to my server

## Bot profile (optional)

- [ ] Added short description: *Tracks who invited each new member and posts join logs with invite counts.*
- [ ] Added tagline: *Know who invited who. Every join, logged automatically.*

## Deploy (Railway or Render)

- [ ] Merged the bot PR / connected repo to GitHub
- [ ] Created a new project on [Railway](https://railway.app) or [Render](https://render.com)
- [ ] Added environment variable: `DISCORD_TOKEN`
- [ ] Added environment variable: `CLIENT_ID`
- [ ] Added environment variable: `GUILD_ID`
- [ ] Deploy finished successfully (bot shows as running)

## Register commands

- [ ] Opened the hosting shell (Railway/Render)
- [ ] Ran `npm run register-commands` once
- [ ] Saw confirmation that commands were registered

## Finish setup in Discord

- [ ] Ran `/setlogchannel` and picked `#join-logs`
- [ ] Ran `/invites` to confirm the bot responds
- [ ] Tested with a friend or second account joining via my invite link
- [ ] Join log appeared in `#join-logs` with correct inviter and count

## Go live

- [ ] Bot token is **not** shared publicly or posted in Discord
- [ ] Bot stays online after I close my phone (hosting is running 24/7)

---

**Progress:** count how many `[x]` you have out of 25 — that's your setup % done.

When every box is ticked, your invite tracker is fully live.
