module.exports = {
  execute (os, client, message, args, MessageEmbed){

    if(!args[0]){
      message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://######.gitbook.io/f-12/f-12/bot-discontinued.');
      return;
    }

    if(args[0] == 'setup'){
      message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://######.gitbook.io/f-12/f-12/bot-discontinued.');
      return;
    }
    
  }
}
