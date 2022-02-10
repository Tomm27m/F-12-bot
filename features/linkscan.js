const { Intents } = require('discord.js');
const { Permissions } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const validUrl = require('valid-url');
const linkCheck = require('link-check');
const BlacklistedLinks = require('../schemas/bllinks.js');
const PerServerSettings = require('../schemas/serversettings.js');
const WhitelistedLinks = require('../schemas/wllinks.js');
const redirectLinks = require('../misc/redirectlinks.js')
const followRedirect = require('follow-redirect-url');
const nvt = require('node-virustotal');
const defaultTimedInstance = nvt.makeAPI();
const theSameKey = defaultTimedInstance.setKey('1c3eb4b88baa27490256d95ac1e571a92fc14ba4a1dfec29789af91b5bf3f11e');

const options = {
  max_redirect_length: 2
};

module.exports = (client, instance) => {
  client.on('messageCreate', async (message) => {
    if(message.author.bot){
      return;
    }

    const args1 = message.content.split(/\s/);
    
    for (let x in args1){
      if(validUrl.isWebUri(args1[x])){
        linkCheck(args1[x], async function (err, result) {
          if (err){
            errembedfunc(err, client, message);
            }
            if(result.status == "alive"){
              if(args1[x].startsWith('https:')){
                if(!message.guild.me.permissions.has(Permissions.FLAGS.ADMINISTRATOR)){
                  nopermsfunc(client, message);
                }

                const dontsplit = args1[x];

                const checkifvar = args1[x].split('/');
                for(let x in checkifvar){
                  const link = checkifvar[x];
                  const checkiflegit = await WhitelistedLinks.findOne({ link });

                  if(checkifvar[x].includes('.carrd.co') || checkifvar[x].includes('.itch.io') || checkifvar[x].includes('.tumblr.com') || checkifvar[x].includes('.dcounter.space')){
                    return;
                  }
                  if(redirectLinks.some(bred => checkifvar[x] == (bred))){
                    followRedirect.startFollowing(dontsplit, options).then(urls => {
                      var stringified = JSON.stringify(urls);
                      var road = JSON.parse(stringified);
                      var finalUrl = road[0].redirectUrl;
                      let args1[x] = finalUrl;
                      continue;
                    }).catch(error => {
                      console.log(error);
                      return;
                    });
                  }
                  if(checkiflegit){
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
                      .setDescription(`Server: ${message.guild.name} | ${message.guild.id}\nSender: ${message.author.tag} | ${message.author.id}\nMalicious link: \`${checkifbled.link}\`\nMessage URL: ${message.url}\nPing (seconds): ${blping / 1000}`)
                      .setTimestamp();

                      const lowerroleembed = new MessageEmbed()
                      .setColor('RED')
                      .setTitle(`Error when punishing <@${message.author.id}>.`)
                      .setDescription(`**My role is lower than ${message.author.tag}'s!**\nIf my role is lower than the regular member's role, I will not be able to punish them.\n-\nIf ${message.author.tag} is a staff member, it is possible that they have been hacked, or sent a working malicious link without any malicious intent.\nMalicious link: \`${checkifbled.link}\`\nFull message: \`${message.content}\``)
                      .setTimestamp();

                      if(!guildConfig){
                        message.channel.send(`<@${message.guild.ownerID}>, you have not set up the bot configuration, and somebody has already sent a malicious link! (Do f!config create then f!help setup)`);
                        message.channel.send({ embeds: [bledembed] });

                        message.delete();
                      }

                      if(guildConfig){
                        if(guildConfig.staffrole == 0 && guildConfig.logsChannel == 0){
                          message.channel.send(`<@${message.guild.ownerID}>, you have not set up the staff role and log channel, and somebody has already sent a malicious link! (Do f!help setup)`);
                          message.channel.send({ embeds: [bledembed] });

                          message.delete();
                        }
                        if(guildConfig.staffrole == 0 && guildConfig.logsChannel > 0){
                          client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.guild.ownerID}>, you have not set up the staff role, and somebody has already sent a malicious link! (Do f!config edit staffrole [staff role ID])`);
                          message.channel.send({ embeds: [bledembed] });

                          message.delete();
                        }
                        if(guildConfig.logsChannel == 0 && guildConfig.staffrole > 0){
                          message.channel.send(`<@&${guildConfig.staffrole}>, you have not set up the logs channel, and somebody has already sent a malicious link! (Do f!config edit logs [channel ID])`);
                          message.channel.send({ embeds: [bledembed] });

                          message.delete();
                        }
                        if(guildConfig.logsChannel > 0 && guildConfig.staffrole > 0){
                          client.channels.cache.get(guildConfig.logsChannel).send(`<@&${guildConfig.staffrole}>`);
                          client.channels.cache.get(guildConfig.logsChannel).send({ embeds: [bledembed] });

                          message.delete();
                        }
                      }

                      if(guildConfig.bllinkScannedAction == 2){
                        if(message.guild.members.resolve(message.author).roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position){
                          client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.guild.ownerID}>`);
                          client.channels.cache.get(guildConfig.logsChannel).send({ embeds: [lowerroleembed] });

                          message.delete();
                        } else{
                          message.author.kick();
                          client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.author.id}> has been kicked.`);

                          message.delete();
                        }
                      }

                      if(guildConfig.bllinkScannedAction == 3){
                        if(message.guild.members.resolve(message.author).roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position){
                          client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.guild.ownerID}>`);
                          client.channels.cache.get(guildConfig.logsChannel).send({ embeds: [lowerroleembed] });

                          message.delete();
                        } else{
                          message.author.ban();
                          client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.author.id}> has been banned.`);

                          message.delete();
                        }
                      }

                      client.guilds.cache.get('900294783107481600').channels.cache.get('908172666115088434').send({ embeds: [globalbled] });
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
                          .setDescription(`Server: ${message.guild.name} | ${message.guild.id}\nSender: ${message.author.tag} | ${message.author.id}\nMalicious link: \`${checkifbled.link}\`\nMessage URL: ${message.url}\nPing (seconds): ${blping / 1000}`)
                          .setTimestamp();

                          const lowerroleembed = new MessageEmbed()
                          .setColor('RED')
                          .setTitle(`Error when punishing <@${message.author.id}>.`)
                          .setDescription(`**My role is lower than ${message.author.tag}'s!**\nIf my role is lower than the regular member's role, I will not be able to punish them.\n-\nIf ${message.author.tag} is a staff member, it is possible that they have been hacked, or sent a working malicious link without any malicious intent.\nMalicious link: \`${checkifbled.link}\`\nFull message: \`${message.content}\``)
                          .setTimestamp();

                          if(!guildConfig){
                            message.channel.send(`<@${message.guild.ownerID}>, you have not set up the bot configuration, and somebody has already sent a malicious link! (Do f!config create then f!help setup)`);
                            message.channel.send({ embeds: [bledembed] });
                            
                            message.delete();
                          }

                          if(guildConfig){
                            if(guildConfig.staffrole == 0 && guildConfig.logsChannel == 0){
                              message.channel.send(`<@${message.guild.ownerID}>, you have not set up the staff role and log channel, and somebody has already sent a malicious link! (Do f!help setup)`);
                              message.channel.send({ embeds: [bledembed] });

                              message.delete();
                            }
                            if(guildConfig.staffrole == 0 && guildConfig.logsChannel > 0){
                              client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.guild.ownerID}>, you have not set up the staff role, and somebody has already sent a malicious link! (Do f!config edit staffrole [staff role ID])`);
                              message.channel.send({ embeds: [bledembed] });

                              message.delete();
                            }
                            if(guildConfig.logsChannel == 0 && guildConfig.staffrole > 0){
                              message.channel.send(`<@&${guildConfig.staffrole}>, you have not set up the logs channel, and somebody has already sent a malicious link! (Do f!config edit logs [channel ID])`);
                              message.channel.send({ embeds: [bledembed] });

                              message.delete();
                            }
                            if(guildConfig.logsChannel > 0 && guildConfig.staffrole > 0){
                              client.channels.cache.get(guildConfig.logsChannel).send(`<@&${guildConfig.staffrole}>`);
                              client.channels.cache.get(guildConfig.logsChannel).send({ embeds: [bledembed] });

                              message.delete();
                            }
                          }

                          if(guildConfig.bllinkScannedAction == 2){
                            if(message.guild.members.resolve(message.author).roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position){
                              client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.guild.ownerID}>`);
                              client.channels.cache.get(guildConfig.logsChannel).send({ embeds: [lowerroleembed] });

                              message.delete();
                            } else{
                              message.author.kick();
                              client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.author.id}> has been kicked.`);

                              message.delete();
                            }
                          }

                          if(guildConfig.bllinkScannedAction == 3){
                            if(message.guild.members.resolve(message.author).roles.highest.position > message.guild.members.resolve(client.user).roles.highest.position){
                              client.channels.cache.get(guildConfig.logsChannel).send(`<@${message.guild.ownerID}>`);
                              client.channels.cache.get(guildConfig.logsChannel).send({ embeds: [lowerroleembed] });

                              message.delete();
                            } else{
                              message.author.ban();
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
              const afterscanargs = args1[x];
              const theSameObject = defaultTimedInstance.initialScanURL(args1[x], async function(err, res){
                // vtpm = vtpm + 1;

                // if(vtpm > 4){
                //   const guildID = message.guild.id;
                //   const guildConfig = await PerServerSettings.findOne({ guildID });

                //   client.channels.cache.get(guildConfig.logsChannel).send(`A VT scan has been prevented in this server due to a possible rate limit in our API. Please contact us if you would like to raise it.`);
                //   client.guilds.cache.get('900294783107481600').channels.cache.get('925260037474119770').send(`VT scan prevented in \`${message.guild.name} | ${message.guild.id}\` due to a possible rate limit.\n${vtpm}`);
                //   return;
                // }
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

                  client.guilds.cache.get('900294783107481600').channels.cache.get('910025416557887488').send(`<@&909321241071091744>`);
                  client.guilds.cache.get('900294783107481600').channels.cache.get('910025416557887488').send({ embeds: [errembed] });
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
                        .setDescription(`Sender: ${message.author.tag} | ${message.author.id}\nLink: \`${afterscanargs}\`\nChannel sent: <#${message.channel.id}>\nFull message: \`${message.content}\``)
                        .addFields(
                          {
                            name: 'VirusTotal Scan:',
                            value: `https://www.virustotal.com/gui/url/${ressplit2[x]}/community`
                          }
                        )
                        .setFooter({ text: 'If the link is clean, our staff will whitelist it within 24 hours.' })
                        .setTimestamp();
                        
                        if(!guildConfig){
                          message.channel.send(`<@${message.guild.ownerID}>, you have not set up the bot configuration, and somebody has already sent an anonymous link! (Do f!config create then f!help setup)`);
                          message.channel.send({
                            embeds: [vtscanembed]
                          });
                        }

                        if(guildConfig){
                          if(guildConfig.logsChannel == 0){
                            message.channel.send(`<@${message.guild.ownerID}>, you have not set up the logs channel, and somebody has already sent an anonymous link! (Do f!config edit logs [channel ID])`);
                            message.channel.send({
                              embeds: [vtscanembed]
                            });
                          }
                          else{
                            client.channels.cache.get(guildConfig.logsChannel).send({ embeds: [vtscanembed] });
                          }
                        }
                        const vtping = Date.now() - message.createdTimestamp;

                        const vtglobalembed = new MessageEmbed()
                        .setColor('ORANGE')
                        .setTitle("VT scanned a link")
                        .setDescription(`Server: ${message.guild.name} | ${message.guild.id}\nSender: ${message.author.tag} | ${message.author.id}\nLink: \`${afterscanargs}\`\nChannel sent: ${message.channel.name} | ${message.channel.id}\nMessage url: ${message.url}\nPing (seconds): ${vtping / 1000}`)
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

                        client.guilds.cache.get('900294783107481600').channels.cache.get('900294783107481603').send({ embeds: [vtglobalembed] })
                      }
                  }
                }
                setTimeout(function(){
                  const hashed = nvt.sha256(rememberargs);

                  const theSameObject = defaultTimedInstance.urlLookup(hashed, function(err, res){
                    if (err) {
                      console.log('Well, crap.');
                      console.log(err);
                      return;
                    }
                    var road = JSON.parse(res);
                    var maliciousint = road.data.attributes.last_analysis_stats.malicious;
                    var suspiciousint = road.data.attributes.last_analysis_stats.suspicious;
                    var categoriesval = road.data.attributes.categories;

                    let categoriestext = "";
                    for (let i in categoriesval) {
                      categoriestext += categoriesval[i] + "\n";
                    }
                    
                    interaction.editReply(`Search done!\nLink: \`${args[1]}\`\nMalicious flags: ${maliciousint}\nSuspicious flags: ${suspiciousint}\n-\nMore info:\n${(categoriestext)}`)
                    return;
                  });
                }, 500);
              });
            }
          });
        }
      }
  });
}

module.exports.config = {
  displayName: 'Link Scanner'
}