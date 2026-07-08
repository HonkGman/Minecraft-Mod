require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Show how many people someone has invited')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Member to check (defaults to you)')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top inviters on this server'),

  new SlashCommandBuilder()
    .setName('setlogchannel')
    .setDescription('Set the channel where join logs are posted')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel for join logs')
        .setRequired(true)
    ),
].map((command) => command.toJSON());

async function main() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId) {
    throw new Error('DISCORD_TOKEN and CLIENT_ID are required in .env');
  }

  const rest = new REST({ version: '10' }).setToken(token);

  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log(`Registered ${commands.length} guild commands for server ${guildId}.`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log(`Registered ${commands.length} global commands.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
