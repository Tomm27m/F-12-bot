const { MessageEmbed } = require('discord.js');

module.exports = {
  category: 'Testing',
  description: 'Info about the bot',
  slash: 'both',
  testOnly: true,

  callback: ({ message, interaction }) => {
    var marcy = "530188818733727774";
    var me = "578935696518152193";

    const infoEmbed = new MessageEmbed()
    .setColor('RANDOM')
    .setTitle('F-12 - Info')
    .setDescription(`F-12 is a free bot that keeps track of scams spread throughout Discord. Our bot scans every message sent if it includes a malicious link.\n\nF-12 was created by <@${me}> and <@${marcy}>.\nIf you would like to support the growth of our bot, click [here](https://discord.gg/XyqZd7thdB)!`)
    .setThumbnail('https://cdn.discordapp.com/attachments/907903436874452993/929269025349984316/F-12.png')
    .setTimestamp();

    return infoEmbed
  }
}
