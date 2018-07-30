const helpers = require("./helpers");
const { USAGE } = require("./strings");
let allCommands = [
    "clean",
    "purge",
    "init",
    "update",
    "sync",
    "display",
    "create",
    "scrim",
    "delete",
    "stats",
    "info",
    "id",
    "tz",
    "invite",
    "prefix",
    "setup"
];

function run(message) {
    // FIXME: remove later
    if (!helpers.checkPermissions(message)) {
        if (helpers.mentioned(message, "help")) {
            message.author.send(USAGE);
            helpers.checkPermissionsManual(message, "help");
            return helpers.log("help & permissions DM sent");
        }
        return helpers.log("no permission to send messages.");
    }
    // FIXME: remove later^^
    let guildSettingsPath = helpers.pathForSpecificGuild(message.guild.id, "settings");
    let guildSettings = helpers.readFile(guildSettingsPath);
    const cmd = message.content.toLowerCase().substring(guildSettings.prefix.length).split(" ")[0];
    if (allCommands.includes(cmd) || helpers.mentioned(message, allCommands)) {
        helpers.checkPermissionsManual(message, cmd);
    }
    if (cmd === "help" || helpers.mentioned(message, "help")) {
        message.channel.send(USAGE);
    }
}

module.exports = { run };
