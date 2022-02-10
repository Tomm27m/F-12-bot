console.log("NodeJS Version: " + process.version);

const DiscordJS = require('discord.js');
const { Intents } = require('discord.js');
const { Permissions } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const keepAlive = require('./server.js');
const WOKCommands = require('wokcommands');
const mongo = require('./mongo.js');
const path = require('path');

const client = new DiscordJS.Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

let logsList = [];

let log = console.log;
console.log = (...args) => {
  logsList.push(...args);
  log(...args);
}

module.exports = logsList;

client.on("debug", ( e ) => console.log(e));

client.on('ready', async () => {
  console.log('Bot is online!');

  new WOKCommands(client, {
    commandsDir: path.join(__dirname, 'commands'),
    featuresDir: path.join(__dirname, 'features'),
    testServers: '900294783107481600',
    botOwners: ['530188818733727774', '578935696518152193'],
  })
  .setDefaultPrefix('t!');

  mongo();

  setInterval( function(){
    if(logsList.length > 20){
      logsList.shift();
    }
  }, 500);
  
});

process.on("unhandledRejection", (reason, p) => {
  console.log(" [antiCrash] :: Unhandled Rejection/Catch");
  console.log(p);
  console.log(JSON.stringify(reason, null, 5));
});
process.on("unhandledRejection", (message) => {
  client.guilds.cache.get('900294783107481600').channels.cache.get('910024582893830194').send(' [antiCrash] :: Unhandled Rejection/Catch\nLogs sending soon.');
  client.guilds.cache.get('900294783107481600').channels.cache.get('910024582893830194').send('```\n' + logsList.join('\n') + '\n```');
});

process.on("uncaughtException", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch");
    console.log(err, origin);
});
process.on("uncaughtException", (message) => {
  client.guilds.cache.get('900294783107481600').channels.cache.get('910024582893830194').send(' [antiCrash] :: Uncaught Exception/Catch\nLogs sending soon.');
  client.guilds.cache.get('900294783107481600').channels.cache.get('910024582893830194').send('```\n' + logsList.join('\n') + '\n```');
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (message) => {
  client.guilds.cache.get('900294783107481600').channels.cache.get('910024582893830194').send(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)\nLogs sending soon.');
  client.guilds.cache.get('900294783107481600').channels.cache.get('910024582893830194').send('```\n' + logsList.join('\n') + '\n```');
});

process.on("multipleResolves", (type, promise, reason) => {
    console.log(" [antiCrash] :: Multiple Resolves");
    console.log(type, promise, reason);
});
process.on("multipleResolves", (message) => {
  client.guilds.cache.get('900294783107481600').channels.cache.get('910024582893830194').send(' [antiCrash] :: Multiple Resolves\nLogs sending soon.');
  client.guilds.cache.get('900294783107481600').channels.cache.get('910024582893830194').send('```\n' + logsList.join('\n') + '\n```');
});

keepAlive();
client.login(process.env.TOKEN);