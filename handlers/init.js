const helpers = require("./helpers");
const guilds = require("./guilds");

const { NOTIFICATION_SETUP, USAGE_SETUP } = require("./strings");

function writeSetting(message, setting, value) {
    let guildSettingsPath = helpers.pathForSpecificGuild(message.guild.id, "settings");
    let guildSettings = helpers.readFile(guildSettingsPath);
    guildSettings[setting] = value;
    const promise = Promise.all([
        message.channel.send(`Okay, I'm adding your ${setting} as  \`${value}\`.`),
        helpers.writeGuildSpecific(message.guild.id, guildSettings, "settings"),
    ]);
    return promise;
}

function id(message, args) {
    let guildSettingsPath = helpers.pathForSpecificGuild(message.guild.id, "settings");
    let guildSettings = helpers.readFile(guildSettingsPath);

    if (guildSettings.calendarID && args.length === 0) {
        message.channel.send(`You didn't enter a calendar ID. You are currently using \`${guildSettings.calendarID}\`.`);
        return;
    }

    if (args.length !== 1) {
        message.channel.send("This command accepts exactly one argument: a google calendar ID. For example, `!id 123abc@123abc.com`.");
        return;
    }

    const calendarId = args[0];
    if (calendarId.indexOf("@") === -1) {
        message.channel.send("That doesn't look like a calendar ID – it should contain an `@` symbol. Please try again.");
        return;
    }

    let confirmIfNecessary = Promise.resolve();
    if (guildSettings.calendarID) {
        const msg = message.channel.send(`I've already been set up to use \`${guildSettings.calendarID}\` for the calendar ID in this server. Do you want to overwrite this and use \`${calendarId}\` instead? **(y/n)**`);
        confirmIfNecessary = msg
            .then(_ => helpers.yesThenCollector(message));
    }

    return confirmIfNecessary.then(_ => {
        return writeSetting(message, "calendarID", calendarId);
    }).catch(err => helpers.log(err));
}

const timezoneFormat = /^GMT(([+-])(\d{1,2})(:(\d{1,2}))?)?$/;
// FIXME: accept other TLA timezones, and/or Olson timezone formats
// calculates minutes offset from GMT, then reconstructs a standardized GMT[+-]\d{2}:\d{2} string from this (or undefined if an invalid timezone is provided).
// e.g.:
// GMT-05:30 -> -(5*60 + 30) = -330 -> GMT-05:30
// GMT+5 -> +(5*60 + 0) = 300 -> GMT+05:00
// GMT -> +(0*60 + 0) = 0 -> GMT+00:00
function parseTimezone(timezoneString) {
    const match = timezoneString.match(timezoneFormat);
    if (!match) return;

    const [_string, _offset, directionString, hourString, _colonMinute, minuteString] = match;
    const direction = directionString === '-' ? -1 : 1;
    const hours = hourString ? parseInt(hourString, 10) : 0;
    const minutes = minuteString ? parseInt(minuteString, 10) : 0;

    let remainingOffset = direction * (hours * 60 + minutes);

    const plusMinus = remainingOffset < 0 ? '-' : '+';
    remainingOffset = Math.abs(remainingOffset);
    const hoursOffset = Math.floor(remainingOffset / 60);
    remainingOffset = remainingOffset - hoursOffset * 60;
    const minutesOffset = remainingOffset;

    const stringOffset = "GMT" + plusMinus + helpers.zeroPad(hoursOffset, 2) + ":" + helpers.zeroPad(minutesOffset, 2);
    return stringOffset;
}

function tz(message, args) {
    let guildSettingsPath = helpers.pathForSpecificGuild(message.guild.id, "settings");
    let guildSettings = helpers.readFile(guildSettingsPath);

    if (guildSettings.timezone && args.length === 0) {
        return message.channel.send(`You didn't enter a timezone. You are currently using \`${guildSettings.timezone}\`.`);
    }

    if (args.length !== 1) {
        return message.channel.send("This command accepts exactly one argument: a timezone, formatted as an offset from GMT. For example, use `!tz GMT+10:00`.");
    }

    const timezone = args[0].toUpperCase();

    const minutesOffset = parseTimezone(timezone);
    if (!minutesOffset) {
        return message.channel.send("Please enter a timezone in a valid format. It must be presented as an offset from GMT – for example, `GMT-05:00`.");
    }

    let confirmIfNecessary = Promise.resolve();
    if (guildSettings.timezone) {
        const msg = message.channel.send(`I've already been set up to use \`${guildSettings.timezone}\` for the timezone in this server. Do you want to overwrite this and use \`${timezone}\` instead? **(y/n)**`);
        confirmIfNecessary = msg
            .then(_ => helpers.yesThenCollector(message));
    }

    return confirmIfNecessary.then(_ => {
        return writeSetting(message, "timezone", timezone);
    }).catch(err => helpers.log(err));
}

function prefix(message, args, bot) {
    let guildSettingsPath = helpers.pathForSpecificGuild(message.guild.id, "settings");
    let guildSettings = helpers.readFile(guildSettingsPath);

    if (args.length === 0) {
        return message.channel.send(`You are currently using \`${guildSettings.prefix}\` as the prefix. To change the prefix, supply an argument to this command – e.g. \`!prefix ?\` or \`${bot.client.user} prefix !\`.`);
    }

    if (args.length !== 1) {
        return message.channel.send("This command accepts exactly one argument: the new prefix to use. For example, use `!prefix ?`.");
    }

    const newPrefix = args[0];
    let confirm = message.channel.send(`Do you want to set the prefix to \`${newPrefix}\` ? **(y/n)**`);
    return confirm.then(_ => helpers.yesThenCollector(message)).then(_ => {
        return writeSetting(message, "prefix", newPrefix);
    }).catch((err) => helpers.log(err));
}

function setup(message) {
    message.channel.send(NOTIFICATION_SETUP);
}

function init(message) {
    // should wipe data
    guilds.create(message.guild);
}

function help(message) {
    message.channel.send(USAGE_SETUP);
}

const restricted = (message) => message.channel.send("You haven't finished setting up! Try `!setup` for details on how to start.");

const commands = {
    setup,
    id,
    tz,
    init,
    prefix,
    help,
    start: setup,
    display: restricted,
    clean: restricted,
    update: restricted,
    sync: restricted,
    invite: restricted,
    stats: restricted,
    create: restricted,
    scrim: restricted,
    delete: restricted,
    info: restricted,
};

// called for all messages encountered in the init phase
exports.run = function(message, bot) {
    // FIXME: extract fetching settings, so this doesn't use a lot of resources on heavy-use servers in the init phase
    let guildSettingsPath = helpers.pathForSpecificGuild(message.guild.id, "settings");
    let guildSettings = helpers.readFile(guildSettingsPath);

    // FIXME: allow mention-style commands
    const cmdBits = message.content.match(new RegExp(`^(${helpers.escapeRegExp(guildSettings.prefix)})?(\\w+)\\b/`));
    if (!cmdBits) return;

    const [_match, _prefix, cmdText] = cmdBits;
    const cmdName = Object.keys(commands).find(cmd => cmd.localeCompare(cmdText, "en", { sensitivity: "base" }) === 0);

    const hasPermissions = helpers.checkPermissions(message);

    if (!cmdName) {
        // if command unrecognized, notify iff can respond in channel.
        if (!hasPermissions) return;
        return message.author.send("I don't understand that command. Please use `help` to get a list of available commands.");
    }

    if (!hasPermissions) {
        helpers.log(`No permission to send messages, in guild ${message.guild.id}, channel ${message.channel.id}, for command: \`${cmdBits[0]}\``);
        message.author.send("I can't seem to post in that channel – try giving me the 'Send Messages' permission, then running that command again.");
        return;
    }

    const args = message.content.replace(cmdBits, "").trim().split(/\s+/);

    return commands[cmdName](message, args, bot);
};
