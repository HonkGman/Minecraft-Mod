require('dotenv').config();

const {
  Client,
  Events,
  GatewayIntentBits,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');

const db = require('./database');
const inviteCache = require('./invite-cache');

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error('Missing DISCORD_TOKEN. Add it to your .env file or hosting environment variables.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

function resolveLogChannel(guild) {
  const savedChannelId = db.getLogChannel(guild.id);
  if (savedChannelId) {
    const savedChannel = guild.channels.cache.get(savedChannelId);
    if (savedChannel?.isTextBased()) {
      return savedChannel;
    }
  }

  const envChannelId = process.env.LOG_CHANNEL_ID;
  if (envChannelId) {
    const envChannel = guild.channels.cache.get(envChannelId);
    if (envChannel?.isTextBased()) {
      return envChannel;
    }
  }

  return null;
}

async function postJoinLog(guild, member, inviterId) {
  const channel = resolveLogChannel(guild);
  if (!channel) {
    return;
  }

  const inviter = inviterId
    ? await client.users.fetch(inviterId).catch(() => null)
    : null;

  const totalInvites = inviterId ? db.getInviteCount(guild.id, inviterId) : 0;

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle('New member joined')
    .setThumbnail(member.user.displayAvatarURL({ size: 128 }))
    .addFields(
      { name: 'Member', value: `${member.user.tag}`, inline: true },
      {
        name: 'Invited by',
        value: inviter ? `${inviter.tag}` : 'Unknown',
        inline: true,
      },
      {
        name: 'Total invites',
        value: inviter ? `${totalInvites}` : 'N/A',
        inline: true,
      }
    )
    .setFooter({ text: 'Thanks for growing the community!' })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  await inviteCache.cacheAllGuildInvites(readyClient);
  console.log('Invite cache ready.');
});

client.on(Events.GuildCreate, async (guild) => {
  await inviteCache.cacheGuildInvites(guild);
});

client.on(Events.InviteCreate, async (invite) => {
  if (!invite.guild) {
    return;
  }

  await inviteCache.cacheGuildInvites(invite.guild);
});

client.on(Events.InviteDelete, async (invite) => {
  if (!invite.guild) {
    return;
  }

  await inviteCache.cacheGuildInvites(invite.guild);
});

client.on(Events.GuildMemberAdd, async (member) => {
  const guild = member.guild;

  if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild)) {
    console.warn(`Missing Manage Server permission in guild ${guild.id}`);
    return;
  }

  let inviterId = null;

  try {
    const invites = await guild.invites.fetch();
    const usedInvite = inviteCache.findUsedInvite(guild.id, invites);

    if (usedInvite?.inviterId) {
      inviterId = usedInvite.inviterId;
      db.incrementInviteCount(guild.id, inviterId);
    }

    inviteCache.updateGuildCache(guild.id, invites);
  } catch (error) {
    console.error(`Failed to resolve invite for ${member.user.tag}:`, error.message);
  }

  await postJoinLog(guild, member, inviterId);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || !interaction.inGuild()) {
    return;
  }

  if (interaction.commandName === 'invites') {
    const targetUser = interaction.options.getUser('user') ?? interaction.user;
    const count = db.getInviteCount(interaction.guildId, targetUser.id);

    await interaction.reply({
      content:
        targetUser.id === interaction.user.id
          ? `You have invited **${count}** member${count === 1 ? '' : 's'}.`
          : `${targetUser.tag} has invited **${count}** member${count === 1 ? '' : 's'}.`,
    });
    return;
  }

  if (interaction.commandName === 'leaderboard') {
    const rows = db.getLeaderboard(interaction.guildId, 10);

    if (rows.length === 0) {
      await interaction.reply('No invite data yet. Invite someone to get started!');
      return;
    }

    const lines = await Promise.all(
      rows.map(async (row, index) => {
        const user = await client.users.fetch(row.user_id).catch(() => null);
        const name = user ? user.tag : `Unknown user (${row.user_id})`;
        return `**${index + 1}.** ${name} — ${row.count} invite${row.count === 1 ? '' : 's'}`;
      })
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Invite leaderboard')
      .setDescription(lines.join('\n'));

    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (interaction.commandName === 'setlogchannel') {
    const channel = interaction.options.getChannel('channel');

    if (!channel.isTextBased()) {
      await interaction.reply({
        content: 'Please choose a text channel.',
        ephemeral: true,
      });
      return;
    }

    db.setLogChannel(interaction.guildId, channel.id);

    await interaction.reply({
      content: `Join logs will now be posted in ${channel}.`,
      ephemeral: true,
    });
  }
});

client.login(token);
