const path = require("path");
const helpers = require("./helpers.js");
const fs = require("fs");
const userStorePath = path.join(__dirname, "..", "stores", "users.json");
const users = helpers.readFileSettingDefault(userStorePath, "{}");
const HELP_MESSAGE = "```\
        Niles Usage\n\
---------------------------\n\
!display             -  Display your calendar\n\
!update / !sync      -  Update the Calendar\n\
!create / !scrim     -  Create events using GCal's default interpreter - works best like !scrim xeno June 5 8pm - 9pm\n\
!delete              -  Delete an event using the form !delete Friday 8pm, ONLY works like this !delete <day> <starttime>\n\
!clean / !purge      -  Deletes messages in current channel, either !clean or !clean <number>\n\
!stats / !info       -  Display list of statistics and information about the Niles bot\n\
!invite              -  Get the invite link for Niles to join your server!\n\
!setup               -  Get details on how to setup Niles\n\
!id                  -  Set the Google calendar ID for the guild\n\
!tz                  -  Set the timezone for the guild\n\
!prefix              -  View or change the prefix for Niles\n\
!help                -  Display this message\n\
```\
Visit http://niles.seanecoffey.com for more info.";

function permissionDMChanger(message) {
    let pieces = message.content.split(" ");
    if (!pieces[1]) {
        return message.author.send("You didn't enter an argument. Use `!permissions 0`");
    }
    if (pieces[1] && !Number.isInteger(parseInt(pieces[1], 10))) {
        return message.author.send("You can only use a number i.e. `!permissions 0`");
    }
    if (["0", "1"].includes(pieces[1])) {
        let settings = {
            permissionChecker: pieces[1]
        };
        users[message.author.id] = settings;
        fs.writeFile(userStorePath, JSON.stringify(users, "", "\t"), (err) => {
            if (err) {
                return helpers.log("error writing the users database" + err);
            }
        });
        return message.author.send("okay I've changed that setting.");
    }
    return message.author.send("I didn't change anything, use `!permissions 0` or `!permissions 1`");
}

function run (message) {
    const cmd = message.content.toLowerCase().substring(1).split(" ")[0];
    //Command to function mappings
    let help = () => message.author.send(HELP_MESSAGE);
    let permissions = () => permissionDMChanger(message);
    let cmdFns = {
        permissions,
        help
    };
    let cmdFn = cmdFns[cmd];
    if (cmdFn) {
        cmdFn();
    }
    if (message.content === "help") {
        message.author.send(HELP_MESSAGE);
    }
}

module.exports = { run };
