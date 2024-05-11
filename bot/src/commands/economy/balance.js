const { Client, Interaction, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: 'You can only run this command inside a server.',
        ephemeral: true,
      });
      return;
    }

    const targetUserId = interaction.options.get('user')?.value || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const user = await User.findOne({ userId: targetUserId, guildId: interaction.guild.id });

    const cashEmbed = new EmbedBuilder()
      .setAuthor({
        name: targetUserObj.user.username,
        iconURL: targetUserObj.user.displayAvatarURL({ size: 256 }),
      })
      .setDescription(`You currently have <:money:1238859792408383586> **${user ? user.balance : 0}**.\n\nUse ` + "/daily" + ` to get money!`)
      .setColor("#38b6ff");

    const noProfileEmbed = new EmbedBuilder()
      .setAuthor({
        name: targetUserObj.user.username,
        iconURL: targetUserObj.user.displayAvatarURL({ size: 256 }),
      })
      .setDescription("You currently have <:money:1238859792408383586> **0**.\nRun the command below to get started!\n\nUse `/daily` to get money!")
      .setColor("#c74900");

    await interaction.deferReply();

    if (!user) {
      interaction.editReply({ embeds: [noProfileEmbed] });
      return;
    }

    interaction.editReply({ embeds: [cashEmbed] });
  },

  name: 'balance',
  description: "See yours/someone else's balance",
  options: [
    {
      name: 'user',
      description: 'The user whose balance you want to get.',
      type: ApplicationCommandOptionType.User,
    },
  ],
};
