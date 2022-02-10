const Discord = require("discord.js");
const keepAlive = require('./server.js');
const client = new Discord.Client();
const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const { Permissions } = require('discord.js');
const mongo = require('./mongo.js');
const validUrl = require('valid-url');
const linkCheck = require('link-check');
const BlacklistedLinks = require('./schemas/bllinks.js');
const PerServerSettings = require('./schemas/serversettings.js');
const StaffSchema = require('./schemas/f12staff.js');
const bannedRedirects = require('./extra/redirects.js');
const WhitelistedLinks = require('./schemas/wllinks.js');
const nvt = require('node-virustotal');
const defaultTimedInstance = nvt.makeAPI();
const theSameKey = defaultTimedInstance.setKey('1c3eb4b88baa27490256d95ac1e571a92fc14ba4a1dfec29789af91b5bf3f11e');
const axios = require('axios');
const cheerio = require('cheerio');
const os = require('os');

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
  const command = require(`./commands/${file}`);
  client.commands.set(file, command);
  console.log(client.commands);
}

let cpm = 0;
let mspm = 0;
let vtpm = 0;

client.on("debug", ( e ) => console.log(e));

client.on('ready', async (message) => {
  client.user.setActivity('Bot discontinued. Check about me.', { type: 'WATCHING' } );
  console.log("======================\nOnline at:");
  var logdate = new Date();
  console.log(logdate.toLocaleString());

  setInterval(() => {
    if(cpm + mspm > 10){
      client.guilds.cache.get('900294783107481600').channels.cache.get('925260037474119770').send(`Experiencing increased load for CPM and MSPM.\nCPM: ${cpm}\nMSPM: ${mspm}\n${cpm + mspm}`);
    }

    cpm = cpm - cpm;
    mspm = mspm - mspm;
    vtpm = vtpm - vtpm;
  }, 1000 * 60);
  
  mongo();
});

var prefix = "f!";

client.on("message", async message => {
  if(message.author.bot){
    return;
  }
  
  const args1 = message.content.split(/\s/);
  
    for (let x in args1){
      if(validUrl.isWebUri(args1[x])){
        linkCheck(args1[x], async function (err, result) {
          if (err){
            const errembed = new MessageEmbed()
            .setColor('RED')
            .setTitle('Error!')
            .setDescription(`Error found in ${message.guild.name} | ${message.guild.id}!`)
            .addFields(
              {
                name: 'Sender:',
                value: `${message.author.id} | ${message.author.tag}`
              },
              {
                name: 'Channel sent:',
                value: `${message.channel.name} | ${message.channel.id}`
              },
              {
                name: 'Full message:',
                value: `${message.content}`
              },
              {
                name: 'Error:',
                value: `${err}`
              }
            )
            .setTimestamp();

            client.guilds.cache.get('900294783107481600').channels.cache.get('910025416557887488').send(`<@&909321241071091744>`, {
              embed: errembed,
              });
            console.log(err);
            return;
          }
          if(result.status == "alive"){
            mspm = mspm + 1;
            if(args1[x].startsWith('https:')){
              if(!message.guild.me.hasPermission('ADMINISTRATOR')){
                const nopermsembed = new MessageEmbed()
                .setColor('ORANGE')
                .setTitle(`F-12 has no perms`)
                .setDescription('See more info below:')
                .addFields(
                  {
                    name: 'Server:',
                    value: `${message.guild.name} | ${message.guild.id}`
                  },
                  {
                    name: 'Link scanned:',
                    value: `${args1[x]}`
                  },
                  {
                    name: 'Channel sent:',
                    value: `${message.channel.name} | ${message.channel.id}`
                  },
                  {
                    name: 'Channel notified:',
                    value: `${defaultChannel.name} | ${defaultChannel.id}`
                  },
                  {
                    name: 'Sender:',
                    value: `${message.author.tag} | ${message.author.id}`
                  },
                  {
                    name: 'Full message:',
                    value: `${message.content}`
                  }
                )
                .setTimestamp();

                client.guilds.cache.get('900294783107481600').channels.cache.get('915044158580875324').send(nopermsembed);
                return;
                
                let defaultChannel = "";
                message.guild.channels.cache.forEach((channel) => {
                  if(channel.type == "text" && defaultChannel == "") {
                    if(channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) {
                      defaultChannel = channel;
                    }
                  }
                });

                defaultChannel.send(`Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.`);
              }

              const checkifvar = args1[x].split('/');
              for(let x in checkifvar){
                const link = checkifvar[x];
                const checkiflegit = await WhitelistedLinks.findOne({ link });

                if(checkiflegit){
                  return;
                }
                else if(checkifvar[x].includes('.carrd.co') || checkifvar[x].includes('.itch.io') || checkifvar[x].includes('.tumblr.com') || checkifvar[x].includes('.dcounter.space')){
                  return;
                }
                else if(bannedRedirects.some(bred => checkifvar[x] == (bred))){
                  const guildID = message.guild.id;
                  const guildConfig = await PerServerSettings.findOne({ guildID });

                  const lsembed = new MessageEmbed()
                  .setColor('ORANGE')
                  .setTitle('Link Shortener Detected')
                  .setDescription(`Sender: ${message.author.tag} | ${message.author.id}\nLink: ${checkifvar[x]}\nChannel sent: <#${message.channel.id}>\nFull message: \`${message.content}\``)
                      
                  if(!guildConfig){
                    message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.', {
                      embed: lsembed,
                    });
                  }

                  if(guildConfig){
                    if(guildConfig.logsChannel == 0){
                      message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.', {
                        embed: lsembed,
                      });
                    }
                    else{
                      client.channels.cache.get(guildConfig.logsChannel).send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.');
                      client.channels.cache.get(guildConfig.logsChannel).send(lsembed);
                    }
                  }
                  const globallsembed = new MessageEmbed()
                  .setColor('ORANGE')
                  .setTitle(`${checkifvar[x]} scanned`)
                  .setDescription(`Scanned from ${message.guild.name} | ${message.guild.id}\nSender: ${message.author.tag} | ${message.author.id}\nChannel sent: ${message.channel.name} | ${message.channel.id}\nMessage content: \`${message.content}\``)

                  client.guilds.cache.get('900294783107481600').channels.cache.get('908172666115088434').send(globallsembed);
                  
                  message.delete();
                  return;
                }
              }
            }
            const args2 = args1[x].split('/');

            for (let x in args2){
              if(args2[x].startsWith('ht')){
                args2.slice(args2[x]);
              }
              if(args2[x].length < 7){
                args2.slice(args2[x]);
              }
              if(args2[x] == null){
                args2.slice(args2[x]);
              }
              else if(args2[x].length >= 7){
                const link = args2[x];
                const checkifbled = await BlacklistedLinks.findOne({ link });
                
                if(checkifbled){
                  if(link.includes(checkifbled.link)){
                    const guildID = message.guild.id;
                    const guildConfig = await PerServerSettings.findOne({ guildID });

                    const bledembed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('Malicious link scanned!')
                    .setDescription(`Sender: <@${message.author.id}>\nMalicious link: \`${checkifbled.link}\`\nFull message: \`${message.content}\``)
                    .setTimestamp();

                    const blping = Date.now() - message.createdTimestamp;

                    const globalbled = new MessageEmbed()
                    .setColor('RED')
                    .setTitle('Malicious link scanned!')
                    .setDescription(`Server: ${message.guild.name} | ${message.guild.id}\nSender: ${message.author.tag} | ${message.author.id}\nMalicious link: \`${checkifbled.link}\`\nFull message: \`${message.content}\`\nPing (seconds): ${blping / 1000}`)
                    .setTimestamp();

                    const lowerroleembed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle(`Error when punishing <@${message.author.id}>.`)
                    .setDescription(`**My role is lower than ${message.author.tag}'s!**\nIf my role is lower than the regular member's role, I will not be able to punish them.\n-\nIf ${message.author.tag} is a staff member, it is possible that they have been hacked, or sent a working malicious link without any malicious intent.\nMalicious link: \`${checkifbled.link}\`\nFull message: \`${message.content}\``)
                    .setTimestamp();

                    if(!guildConfig){
                      message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.',
                      {
                        embed: bledembed,
                      });
                      message.delete();
                    }

                    if(guildConfig){
                      if(guildConfig.staffrole == 0 && guildConfig.logsChannel == 0){
                        message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.',
                        {
                          embed: bledembed,
                        });
                        message.delete();
                      }
                      if(guildConfig.staffrole == 0 && guildConfig.logsChannel > 0){
                        client.channels.cache.get(guildConfig.logsChannel).send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.',
                        {
                          embed: bledembed,
                        });
                        message.delete();
                      }
                      if(guildConfig.logsChannel == 0 && guildConfig.staffrole > 0){
                        message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.',
                        {
                          embed: bledembed,
                        })
                        message.delete();
                      }
                      if(guildConfig.logsChannel > 0 && guildConfig.staffrole > 0){
                        client.channels.cache.get(guildConfig.logsChannel).send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.');
                        client.channels.cache.get(guildConfig.logsChannel).send(`<@&${guildConfig.staffrole}>`,
                        {
                          embed: bledembed,
                        });
                        message.delete();
                      }
                    }

                    if(guildConfig.bllinkScannedAction == 2){
                      if(message.guild.members.resolve(message.author).roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position){
                        client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.guild.ownerID}>`,
                        {
                          embed: lowerroleembed,
                        });

                        message.delete();
                      } else{
                        message.member.kick();
                        client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.author.id}> has been kicked.`);

                        message.delete();
                      }
                    }

                    if(guildConfig.bllinkScannedAction == 3){
                      if(message.guild.members.resolve(message.author).roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position){
                        client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.guild.ownerID}>`,
                        {
                          embed: lowerroleembed,
                        });

                        message.delete();
                      } else{
                        message.member.ban();
                        client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.author.id}> has been banned.`);

                        message.delete();
                      }
                    }

                    client.guilds.cache.get('900294783107481600').channels.cache.get('908172666115088434').send(globalbled);
                    return;
                  }
                }
                else{
                  const args3 = args2[x].split('.');
                  for (let x in args3){
                    const main = args3[x];
                    const checkifbled = await BlacklistedLinks.findOne({ main });

                    if(checkifbled){
                      if(main.includes(checkifbled.main)){

                        const guildID = message.guild.id;
                        const guildConfig = await PerServerSettings.findOne({ guildID });

                        const bledembed = new MessageEmbed()
                        .setColor('RED')
                        .setTitle('Malicious link scanned!')
                        .setDescription(`Sender: <@${message.author.id}>\nMalicious link: \`${checkifbled.link}\`\nFull message: \`${message.content}\``)
                        .setTimestamp();

                        const blping = Date.now() - message.createdTimestamp;

                        const globalbled = new MessageEmbed()
                        .setColor('RED')
                        .setTitle('Malicious link scanned!')
                        .setDescription(`Server: ${message.guild.name} | ${message.guild.id}\nSender: ${message.author.tag} | ${message.author.id}\nMalicious link: \`${checkifbled.link}\`\nFull message: \`${message.content}\`\nPing (seconds): ${blping / 1000}`)
                        .setTimestamp();

                        const lowerroleembed = new MessageEmbed()
                        .setColor('RED')
                        .setTitle(`Error when punishing <@${message.author.id}>.`)
                        .setDescription(`**My role is lower than ${message.author.tag}'s!**\nIf my role is lower than the regular member's role, I will not be able to punish them.\n-\nIf ${message.author.tag} is a staff member, it is possible that they have been hacked, or sent a working malicious link without any malicious intent.\nMalicious link: \`${checkifbled.link}\`\nFull message: \`${message.content}\``)
                        .setTimestamp();

                        if(!guildConfig){
                          message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.',
                          {
                            embed: bledembed,
                          });
                          message.delete();
                        }

                        if(guildConfig){
                          if(guildConfig.staffrole == 0 && guildConfig.logsChannel == 0){
                            message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.',
                            {
                              embed: bledembed,
                            });
                            message.delete();
                          }
                          if(guildConfig.staffrole == 0 && guildConfig.logsChannel > 0){
                            client.channels.cache.get(guildConfig.logsChannel).send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.',
                            {
                              embed: bledembed,
                            });
                            message.delete();
                          }
                          if(guildConfig.logsChannel == 0 && guildConfig.staffrole > 0){
                            message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.',
                            {
                              embed: bledembed,
                            })
                            message.delete();
                          }
                          if(guildConfig.logsChannel > 0 && guildConfig.staffrole > 0){
                            client.channels.cache.get(guildConfig.logsChannel).send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.');
                            client.channels.cache.get(guildConfig.logsChannel).send(`<@&${guildConfig.staffrole}>`,
                            {
                              embed: bledembed,
                            });
                            message.delete();
                          }
                        }

                        if(guildConfig.bllinkScannedAction == 2){
                          if(message.guild.members.resolve(message.author).roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position){
                            client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.guild.ownerID}>`,
                            {
                              embed: lowerroleembed,
                            });

                            message.delete();
                          } else{
                            message.member.kick();
                            client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.author.id}> has been kicked.`);

                            message.delete();
                          }
                        }

                        if(guildConfig.bllinkScannedAction == 3){
                          if(message.guild.members.resolve(message.author).roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position){
                            client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.guild.ownerID}>`,
                            {
                              embed: lowerroleembed,
                            });

                            message.delete();
                          } else{
                            message.member.ban();
                            client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.author.id}> has been banned.`);

                            message.delete();
                          }
                        }

                        client.guilds.cache.get('900294783107481600').channels.cache.get('908172666115088434').send(globalbled);
                        return;
                      }
                    }
                  }
                }
              }
            }
            const theSameObject = defaultTimedInstance.initialScanURL(args1[x], async function(err, res){
              vtpm = vtpm + 1;

              if(vtpm > 4){
                const guildID = message.guild.id;
                const guildConfig = await PerServerSettings.findOne({ guildID });

                client.channels.cache.get(guildConfig.logsChannel).send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.');
                client.guilds.cache.get('900294783107481600').channels.cache.get('925260037474119770').send(`VT scan prevented in \`${message.guild.name} | ${message.guild.id}\` due to a possible rate limit.\n${vtpm}`);
                return;
              }
              const ressplit = res.split(/\s/);

              if (err) {
                const errembed = new MessageEmbed()
                .setColor('RED')
                .setTitle('Error!')
                .setDescription(`Error found in ${message.guild.name} | ${message.guild.id}!`)
                .addFields(
                  {
                    name: 'Sender:',
                    value: `${message.author.id} | ${message.author.tag}`
                  },
                  {
                    name: 'Channel sent:',
                    value: `${message.channel.name} | ${message.channel.id}`
                  },
                  {
                    name: 'Full message:',
                    value: `${message.content}`
                  },
                  {
                    name: 'Error:',
                    value: `${err}`
                  }
                )
                .setTimestamp();

                client.guilds.cache.get('900294783107481600').channels.cache.get('910025416557887488').send(`<@&909321241071091744>`, {
                  embed: errembed,
                });
                console.log(err);
                return;
              }

              for (let x in ressplit){
                if(ressplit[x].length < 20){
                  ressplit.slice(ressplit[x]);
                }
                else if(ressplit[x].length > 20){
                  const ressplit2 = ressplit[x].split('-');
                  for(let x in ressplit2)
                    if(ressplit2[x].length < 20){
                      ressplit2.slice(ressplit2[x]);
                    }
                    else if(ressplit2[x].length > 20){
                      const guildID = message.guild.id;
                      const guildConfig = await PerServerSettings.findOne({ guildID });

                      const vtscanembed = new MessageEmbed()
                      .setColor('ORANGE')
                      .setTitle(`VT has scanned a link`)
                      .setDescription(`Sender: ${message.author.tag} | ${message.author.id}\nLink: ${args1[x]}\nChannel sent: <#${message.channel.id}>\nFull message: \`${message.content}\``)
                      .addFields(
                        {
                          name: 'VirusTotal Scan:',
                          value: `https://www.virustotal.com/gui/url/${ressplit2[x]}/community`
                        }
                      )
                      .setFooter('If this site isn\'t malicious, our staff will manually whitelist it. No need to contact us.')
                      .setTimestamp();
                      
                      if(!guildConfig){
                        message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.',
                        {
                          embed: vtscanembed,
                        });
                      }

                      if(guildConfig){
                        if(guildConfig.logsChannel == 0){
                          message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.',
                          {
                            embed: vtscanembed,
                          });
                        }
                        else{
                          client.channels.cache.get(guildConfig.logsChannel).send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.');
                          client.channels.cache.get(guildConfig.logsChannel).send(vtscanembed);
                        }
                      }
                      const vtping = Date.now() - message.createdTimestamp;

                      const vtglobalembed = new MessageEmbed()
                      .setColor('ORANGE')
                      .setTitle("VT scanned a link")
                      .setDescription(`Server: ${message.guild.name} | ${message.guild.id}\nSender: ${message.author.tag} | ${message.author.id}\nLink: ${args1[x]}\nChannel sent: ${message.channel.name} | ${message.channel.id}\nFull message: \`${message.content}\`\nPing (seconds): ${vtping / 1000}`)
                      .addFields(
                        {
                          name: 'VirusTotal Scan:',
                          value: `https://www.virustotal.com/gui/url/${ressplit2[x]}/community`
                        },
                        {
                          name: 'Logs channel:',
                          value: `${guildConfig.logsChannel}`
                        },
                        {
                          name: 'Staff role:',
                          value: `${guildConfig.staffrole}`
                        }
                      )
                      .setTimestamp();

                      client.guilds.cache.get('900294783107481600').channels.cache.get('910025416557887488').send(vtglobalembed)
                    }
                }
              }
            });
          }
        });
      }
    }



    if (!message.content.startsWith(prefix) || message.author.bot){
      return;
    }
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command){
      case 'info':
        if(args.length > 0){
          message.channel.send("Too many arguments!");
          return;
        }

        client.commands.get('info.js').execute(os, client, message, MessageEmbed);
        cpm = cpm + 1;
      break;

      case 'ping':
        if(args.length > 0){
          message.channel.send("Too many arguments!");
          return;
        }

        client.commands.get('ping.js').execute(os, client, message);
        cpm = cpm + 1;
      break;

      case 'commands':
        client.commands.get('help.js').execute(os, client, message, args, MessageEmbed);
        cpm = cpm + 1;
      break;

      case 'help':
        client.commands.get('help.js').execute(os, client, message, args, MessageEmbed);
        cpm = cpm + 1;
      break;

      case 'changelog':
        client.commands.get('changelog.js').execute(os, client, message, MessageEmbed);
        cpm = cpm + 1;
      break;

      // case 'testch':
      //   const url = args[0];

      //   axios(url, { headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:95.0) Gecko/20100101 Firefox/95.0'}}).then(response => {

      //     const $ = cheerio.load(response.data);
      //     const circlePath = $('div.engines div.circle');

      //     for (let i = 0; i < circlePath.length; i++) {
      //       var positivesPath = $(circlePath[i]).find("div.positives")[0];
      //       var positivesText = $(positivesPath).text();

      //       var totalPath = $(circlePath[i]).find("div.total")[0];
      //       var totalText = $(totalPath).text();
      //     }

      //     console.log(`${positivesText}`);
      //     console.log(`${totalText}`);
      //   })

      //   cpm = cpm + 1;
      // break;

      case 'checkload':
        const checkadl2 = await StaffSchema.find(
        {
          adl2: {
            $all: message.author.id,
          }
        });

        if(checkadl2.length == 1){
          const usedmem = os.totalmem() - os.freemem();
          const usageembed = new MessageEmbed()
          .setAuthor(message.author.tag, message.author.avatarURL())
          .setTitle('F-12 load and usage')
          .addFields(
            {
              name: 'CPM | MSPM | VTPM',
              value: `${cpm} | ${mspm} | ${vtpm}`
            },
            {
              name: 'Average CPU usage:',
              value: `${JSON.stringify(os.cpus())}`
            },
            {
              name: 'Memory usage (GB):',
              value: `${usedmem / 1000000000} / ${os.totalmem() / 1000000000}`
            }
          )
          .setTimestamp();

          console.log(os.cpus());

          message.channel.send(usageembed);
          
          return;
        }
      break;

      case 'findguild':
        const checkadl = await StaffSchema.find(
        {
          adl: {
            $all: message.author.id,
          }
        });

        if(checkadl.length == 1){
          const guildtocache = await client.guilds.fetch(args[0]);

          if(!guildtocache){
            message.channel.send(`Cannot find guild with the ID of \`${args[0]}\`!`);
            return;
          }

          if(guildtocache.member('900253555372486657')){

            const findguildembed = new MessageEmbed()
            .setTitle(`${guildtocache.name}`)
            .addFields(
              {
                name: 'Amount of members:',
                value: `${guildtocache.memberCount}`
              },
              {
                name: 'Creation date:',
                value: `${guildtocache.createdAt}`
              },
              {
                name: 'Owner:',
                value: `${guildtocache.ownerID}`
              },
              {
                name: 'Bot has ADMINISTRATOR:',
                value: `${message.guild.me.hasPermission('ADMINISTRATOR')}`
              }
            )
            .setFooter(`Requested by ${message.author.tag}`)
            .setTimestamp();

            message.channel.send(findguildembed);
            return;
          }
        }
      break;
    }
    if(command == 'adl'){
      cpm = cpm + 1;
        const checkadl4 = await StaffSchema.find(
        {
          adl4: {
            $all: message.author.id,
          }
        });

        const checkadl3 = await StaffSchema.find(
        {
          adl3: {
            $all: message.author.id,
          }
        });
        
        const checkadl2 = await StaffSchema.find(
        {
          adl2: {
            $all: message.author.id,
          }
        });

        const checkadl1 = await StaffSchema.find(
        {
          adl1: {
            $all: message.author.id,
          }
        });

        const checkadp = await StaffSchema.find(
        {
          adp: {
            $all: message.author.id,
          }
        });

        if(checkadl4.length == 1){
          const adl4embed = new MessageEmbed()
          .setColor('GREEN')
          .setTitle('Verified Staff Member')
          .setThumbnail(message.author.avatarURL())
          .addFields(
            {
              name: 'User:',
              value: `${message.author.username}`
            },
            {
              name: 'Position:',
              value: 'Head Admin'
            }
          )
          .setTimestamp();

          message.delete();

          message.channel.send(adl4embed);
          return;
        }
        if(checkadl3.length == 1){
          message.delete();
          const adl3embed = new MessageEmbed()
          .setColor('GREEN')
          .setTitle('Verified Staff Member')
          .setThumbnail(message.author.avatarURL())
          .addFields(
            {
              name: 'User:',
              value: `${message.author.username}`
            },
            {
              name: 'Position:',
              value: 'Senior Staff'
            }
          )
          .setTimestamp();

          message.channel.send(adl3embed);
          return;
        }
        if(checkadl2.length == 1){
          message.delete();
          const adl2embed = new MessageEmbed()
          .setColor('GREEN')
          .setTitle('Verified Staff Member')
          .setThumbnail(message.author.avatarURL())
          .addFields(
            {
              name: 'User:',
              value: `${message.author.username}`
            },
            {
              name: 'Position:',
              value: 'Support Staff'
            }
          )
          .setTimestamp();

          message.channel.send(adl2embed);
          return;
        }
        if(checkadl1.length == 1){
          message.delete();
          const adl1embed = new MessageEmbed()
          .setColor('GREEN')
          .setTitle('Verified Staff Member')
          .setThumbnail(message.author.avatarURL())
          .addFields(
            {
              name: 'User:',
              value: `${message.author.username}`
            },
            {
              name: 'Position:',
              value: 'Junior Staff'
            }
          )
          .setTimestamp();

          message.channel.send(adl1embed);
          return;
        }
        if(checkadp.length == 1){
          message.delete();
          const adpembed = new MessageEmbed()
          .setColor('GREEN')
          .setTitle('Verified Staff Member')
          .setThumbnail(message.author.avatarURL())
          .addFields(
            {
              name: 'User:',
              value: `${message.author.username}`
            },
            {
              name: 'Position:',
              value: 'Staff in Training'
            }
          )
          .setTimestamp();

          message.channel.send(adpembed);
          return;
        }
        else{
          message.delete();
          message.channel.send(`<@${message.author.id}> is not a verified staff member.`);
          return;
        }
    }

    if(command == "config"){
      message.channel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.');
      return;
    }
});

client.on('guildCreate', async guild => {
  await PerServerSettings.create({
    guildID: guild.id,
    logsChannel: 0,
    bllinkScannedAction: 1,
    staffrole: 0
  });

  const botaddedembed = new MessageEmbed()
  .setColor("GREEN")
  .setTitle("F-12 joined a server!")
  .setDescription(`F-12 is now in ${client.guilds.cache.size} servers!`)
  .addFields(
    {
      name: 'Server:',
      value: `${guild.name}`
    },
    {
      name: 'Amount of members:',
      value: `${guild.memberCount}`
    },
    {
      name: 'Guild ID:',
      value: `${guild.id}`
    }
  )
  .setTimestamp();

  client.guilds.cache.get('900294783107481600').channels.cache.get('912522896654622790').send(botaddedembed);

  let defaultChannel = "";
  guild.channels.cache.forEach((channel) => {
    if(channel.type == "text" && defaultChannel == "") {
      if(channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
    }
  });

  defaultChannel.send('Bot discontinued. Read the docs below for more info.\nhttps://tomm27m.gitbook.io/f-12/f-12/bot-discontinued.');
  return;
});

client.on("guildDelete", async guild => {
  const guildID = guild.id;
  const guildConfig = await PerServerSettings.findOne({ guildID });

  await PerServerSettings.deleteOne(
    {
      guildID: guildID,
    }
  );
  const clientid = '900253555372486657';

  const botremovedembed = new MessageEmbed()
  .setColor("RED")
  .setTitle("F-12 left a server...")
  .setDescription(`Configuration deleted.`)
  .addFields(
    {
      name: 'Server:',
      value: `${guild.name}`
    },
    {
      name: 'Amount of members:',
      value: `${guild.memberCount}`
    },
    {
      name: 'Guild ID:',
      value: `${guild.id}`
    }
  )
  .setTimestamp();

  client.guilds.cache.get('900294783107481600').channels.cache.get('912524473050214460').send(botremovedembed);
});

keepAlive();
client.login(process.env.TOKEN)