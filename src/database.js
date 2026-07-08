const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'invites.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS invite_counts (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    log_channel_id TEXT
  );
`);

function incrementInviteCount(guildId, userId) {
  db.prepare(`
    INSERT INTO invite_counts (guild_id, user_id, count)
    VALUES (?, ?, 1)
    ON CONFLICT (guild_id, user_id) DO UPDATE SET count = count + 1
  `).run(guildId, userId);
}

function getInviteCount(guildId, userId) {
  const row = db.prepare(
    'SELECT count FROM invite_counts WHERE guild_id = ? AND user_id = ?'
  ).get(guildId, userId);

  return row?.count ?? 0;
}

function getLeaderboard(guildId, limit = 10) {
  return db.prepare(`
    SELECT user_id, count
    FROM invite_counts
    WHERE guild_id = ?
    ORDER BY count DESC
    LIMIT ?
  `).all(guildId, limit);
}

function setLogChannel(guildId, channelId) {
  db.prepare(`
    INSERT INTO guild_settings (guild_id, log_channel_id)
    VALUES (?, ?)
    ON CONFLICT (guild_id) DO UPDATE SET log_channel_id = excluded.log_channel_id
  `).run(guildId, channelId);
}

function getLogChannel(guildId) {
  const row = db.prepare(
    'SELECT log_channel_id FROM guild_settings WHERE guild_id = ?'
  ).get(guildId);

  return row?.log_channel_id ?? null;
}

module.exports = {
  incrementInviteCount,
  getInviteCount,
  getLeaderboard,
  setLogChannel,
  getLogChannel,
};
