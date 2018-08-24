let discord = require("discord.js");
let client = new discord.Client();
exports.discord = discord;
exports.client = client;
let helpers = require("./handlers/helpers.js");
let settings = require("./settings.js");
let commands = require("./handlers/commands.js");
let guilds = require("./handlers/guilds.js");
let init = require("./handlers/init.js");
let dm = require("./handlers/dm.js");

client.login(settings.secrets.bot_token);

client.on("ready", () => {
    helpers.log("Bot is logged in");
    client.user.setStatus("online");

    const availableGuilds = Array.from(client.guilds.keys());
    const knownGuilds = Object.keys(helpers.getGuildDatabase());
    const unknownGuilds = availableGuilds.filter(x => !knownGuilds.includes(x));

    unknownGuilds.forEach(guildId => {
        helpers.debug("Unknown guild found at startup, init-ing:", guildId);
        guilds.create(client.guilds.get(guildId));
    });
});

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
            dm.run(message, client);
        } catch (err) {
            helpers.logError("dm channel", err);
        }
        return;
    }

    // only load guild settings after checking that message is not direct message.
    let guildSettingsPath = helpers.pathForSpecificGuild(message.guild.id, "settings");
    let guildSettings = helpers.readFile(guildSettingsPath);

    // return if message doesn't look command-like (prefixed relevantly, or mentioning the client)
    if (!helpers.isCommand(message, client)) {
        return;
    }

    helpers.log(`[${message.guild.id}] ${message.author.tag}: ${message.content}`);

    if (!helpers.isGuildInited(guildSettings)) {
        try {
            init.run(message, client);
        } catch (err) {
            helpers.logError(`running init messages in guild: ${message.guild.id}`, err);
            message.channel.send("something went wrong");
        }
        return;
    }

    try {
        commands.run(message, client);
    } catch (err) {
        helpers.logError(`running main message handler in guild: ${message.guild.id}`, err);
        message.channel.send("something went wrong");
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
