let discord = require("discord.js");
let client = new discord.Client();
exports.discord = discord;
exports.client = client;
const path = require("path");
let helpers = require("./handlers/helpers.js");
let settings = require("./settings.js");
let commands = require("./handlers/commands.js");
let guilds = require("./handlers/guilds.js");
let init = require("./handlers/init.js");
let restricted = require("./handlers/nopermissions.js");
let dm = require("./handlers/dm.js");

const userStorePath = path.join(__dirname, "stores", "users.json");
const users = helpers.readFileSettingDefault(userStorePath, "{}");

client.login(settings.secrets.bot_token);

client.on("ready", () => {
    helpers.log("Bot is logged in");
    client.user.setStatus("online");
});

// FIXME: what about guilds that exist prior to the bot being loaded? (or while the bot is offline?)
client.on("guildCreate", (guild) => {
    helpers.debug("guildCreate:", guild);
    guilds.create(guild);
});

client.on("guildDelete", (guild) => {
    helpers.debug("guildDelete:", guild);
    guilds.delete(guild);
});

client.on("message", (message) => {
    if (message.author.bot) {
        return;
    }
    if (message.channel.type === "dm") {
        try {
            dm.run(message);
        } catch (err) {
            helpers.logError("dm channel", err);
        }
        return;
    }

    // only load guild settings after checking that message is not direct message.
    let guildSettingsPath = helpers.pathForSpecificGuild(message.guild.id, "settings");
    let guildSettings = helpers.readFile(guildSettingsPath);
    if (!message.content.toLowerCase().startsWith(guildSettings.prefix) && !message.isMentioned(client.user.id)) {
        return;
    }

    helpers.log(`[${message.guild.id}] ${message.author.tag}: ${message.content}}`);

    if (!helpers.checkPermissions(message) && (!users[message.author.id] || users[message.author.id].permissionChecker === "1" || !users[message.author.id].permissionChecker)) {
        try {
            restricted.run(message);
        } catch (err) {
            helpers.logError("restricted permissions", err);
        }
        return;
    } else if (!helpers.checkPermissions(message)) {
        return;
    }

    if (!guildSettings.calendarID || !guildSettings.timezone) {
        try {
            init.run(message);
        } catch (err) {
            helpers.logError(`running init messages in guild: ${message.guild.id}`, err);
            return message.channel.send("something went wrong");
        }
    } else {
        try {
            commands.run(message);
        } catch (err) {
            helpers.logError(`running main message handler in guild: ${message.guild.id}`, err);
            return message.channel.send("something went wrong");
        }
    }
});

// ProcessListeners

process.on("uncaughtException", (err) => {
    helpers.logError("uncaughtException", err);
});

process.on("SIGINT", () => {
    client.destroy();
    process.exit();
});

process.on("exit", () => {
    client.destroy();
    process.exit();
});
