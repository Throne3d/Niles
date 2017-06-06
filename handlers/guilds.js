const fs = require('fs');

exports.create = (guild) => {
  guilddb[guild.id] = {'prefix': '!',
                        'calendarID': '',
                        'calendarChannel': '',
                        'timezone': ''
                      };
  fs.writeFile('./stores/guilddb.json', JSON.stringify(guilddb, '', '\t'), (err) => {
    if (err)
      return console.log(Date() + 'createGuild error: ' + err);
});
console.log('guild.create guildb updated.');
var emptyString = {
	"day0": "[]",
	"day1": "[]",
	"day2": "[]",
  "day3": "[]",
  "day4": "[]",
  "day5": "[]",
  "day6": "[]"
}
fileString = './stores/' + guild.id + 'db.json';
fs.writeFile(fileString, JSON.stringify(emptyString, '', '\t'), (err) => {
  if (err)
    return console.log(Date() + 'createdb error: ' + err);
  });
  console.log('guild.create invidual db updated.');
guild.defaultChannel.send(`Hi, I'm ${client.user.username} and I'm ready to serve you. To see a list of my commands, send !help. DM Sean#8856 for more info`);
console.log('welcome message sent');
}

exports.delete = (guild) => {
  delete guilddb[guild.id];
  fs.writeFile('./stores/guilddb.json', JSON.stringify(guilddb, '','\t'), (err) => {
    if (err)
      return console.log(Date() + ' deleteGuild error: ' + err);
  });
  guilddbString = './stores/' + String(guild.id) + 'db.json';
  empty = {};
  fs.writeFile(guilddbString, JSON.stringify(empty, '','\t'), (err) => {
    if (err)
      return console.log(Date() + ' deleteGuilde error: ' + err);
    });
  }