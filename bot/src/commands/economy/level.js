const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require('discord.js');
const canvacord = require('canvacord');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }

    await interaction.deferReply();

    const mentionedUserId = interaction.options.get('target-user')?.value;
    const targetUserId = mentionedUserId || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const fetchedLevel = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
          : "You don't have any levels yet. Chat a little more and try again."
      );
      return;
    }

    let allLevels = await Level.find({ guildId: interaction.guild.id }).select(
      '-_id userId level xp'
    );

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;
    const background = 'https://raw.githubusercontent.com/notcl/clearbot/main/images/banner/default.png'

    let rankColor = "#FFFFFF";

    if (currentRank === 1) {
        rankColor = "#FFD700";
    } else if (currentRank === 2) {
        rankColor = "#C0C0C0";
    } else if (currentRank === 3) {
        rankColor = "#CD7F32";
    }

    const rank = new canvacord.Rank()
    .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256 }))
    .setRank(currentRank)
    .setRankColor(rankColor) // White color
    .setLevel(fetchedLevel.level)
    .setLevelColor("#FFFFFF") // White color
    .setCurrentXP(fetchedLevel.xp)
    .setRequiredXP(calculateLevelXp(fetchedLevel.level))
    .setStatus(targetUserObj.presence.status)
    .setUsername(targetUserObj.user.username)
    .setBackground("IMAGE", background)
    .setDiscriminator('0000')
    .setStatus(targetUserObj.presence.status, true)
    .setOverlay("#23272A", 0 || 0, true) // Dark grey color
    .setProgressBar('#FFC300', 'COLOR') // Yellow color
    .setProgressBarTrack("#000000") // Black color
    .renderEmojis(true)

    const data = await rank.build();
    const attachment = new AttachmentBuilder(data);
    interaction.editReply({ files: [attachment] });
  },

  name: 'level',
  description: "Shows your/someone's level.",
  options: [
    {
      name: 'target-user',
      description: 'The user whose level you want to see.',
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
