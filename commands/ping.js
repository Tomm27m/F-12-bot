module.exports = {
  category: 'Testing',
  description: 'Replies with pong',
  slash: false,

  callback: ({ message }) => {
    message.reply(`Pinging...`).then((pingMessage) =>{
      const givenPing = pingMessage.createdTimestamp - message.createdTimestamp;
      pingMessage.edit(`:ping_pong: The ping of the bot is: ${givenPing}ms!`);
    });
  }
}