const inviteCache = new Map();

function snapshotInvite(invite) {
  return {
    uses: invite.uses ?? 0,
    inviterId: invite.inviter?.id ?? null,
  };
}

async function cacheGuildInvites(guild) {
  const invites = await guild.invites.fetch();
  inviteCache.set(
    guild.id,
    new Map(invites.map((invite) => [invite.code, snapshotInvite(invite)]))
  );
}

async function cacheAllGuildInvites(client) {
  for (const guild of client.guilds.cache.values()) {
    try {
      await cacheGuildInvites(guild);
    } catch (error) {
      console.warn(`Could not cache invites for guild ${guild.id}:`, error.message);
    }
  }
}

function findUsedInvite(guildId, newInvites) {
  const oldInvites = inviteCache.get(guildId) ?? new Map();

  for (const [code, invite] of newInvites) {
    const previous = oldInvites.get(code);
    const currentUses = invite.uses ?? 0;

    if (previous && currentUses > previous.uses) {
      return {
        code,
        inviterId: invite.inviter?.id ?? previous.inviterId,
      };
    }
  }

  return null;
}

function updateGuildCache(guildId, invites) {
  inviteCache.set(
    guildId,
    new Map(invites.map((invite) => [invite.code, snapshotInvite(invite)]))
  );
}

module.exports = {
  cacheGuildInvites,
  cacheAllGuildInvites,
  findUsedInvite,
  updateGuildCache,
};
