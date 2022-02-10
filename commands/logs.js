const logsList = require('../index.js');

module.exports = {
  category: 'Testing',
  description: 'Shows recent logs',
  slash: 'both',
  testOnly: true,
  
  callback: ({ message, interaction }) => {
    if(message){
      message.reply('```\n' + logsList.join('\n') + '\n```');
      return;
    }
    if(interaction){
      interaction.reply('```\n' + logsList.join('\n') + '\n```');
      return;
    }
  }
 }