const nvt = require('node-virustotal');
const defaultTimedInstance = nvt.makeAPI();
const theSameKey = defaultTimedInstance.setKey('##################################');

module.exports = {
  category: 'Testing',
  description: 'Searches the VirusTotal database',
  testOnly: true,
  ownerOnly: true,
  slash: true,
  minArgs: 2,
  expectedArgs: '<method> <link>',

  callback: ({ interaction, args }) => {

    if(args[0] == 'tomisnoob'){
      return;
    }

    if(args[0] == 'scan'){
      interaction.reply(`Scanning...\nLink: \`${args[1]}\``);

      const rememberargs = args[1];
      
      const theSameObject = defaultTimedInstance.initialScanURL(args[1], async function(err, res){
        if (err) {
          console.log('Well, crap.');
          console.log(err);
          return;
        }
        const ressplit = res.split(/\s/);
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
              interaction.editReply(`Scan done! Searching...\nLink: \`${args[1]}\`\nData: https://www.virustotal.com/gui/url/${ressplit2[x]}/community`);
              
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
                })
              }, 500)
            }
          }
        }
      })
    }

    if(args[0] == 'search'){
      interaction.reply(`Searching the VT database...\nLink: \`${args[1]}\``);

      const hashed = nvt.sha256(args[1]);

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
    }

    else {
      return 'Method does not exist.'
    }
  }
}
