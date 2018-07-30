const fs = require("fs");
const path = require("path");
const util = require("util");
const defer = require("promise-defer");
let bot = require("../bot.js");

const writeFilePromise = util.promisify(fs.writeFile);

function folderForSpecificGuild(guildId) {
    return path.join(__dirname, "..", "stores", guildId);
}

function pathForSpecificGuild(guildId, file) {
    return path.join(folderForSpecificGuild(guildId), `${file}.json`);
}

function getSettings() {
    return require("../settings.js");
}
function getLogChannel() {
    return bot.client.channels.get(getSettings().secrets.log_discord_channel);
}
function getMinimumPermissions() {
    return getSettings().secrets.minimumPermissions;
}

let logChannelWarned = false;

function formatLogMessage(message) {
    return `[${new Date().toUTCString()}] ${message}`;
}

function debug(...logItems) {
    const logMessage = logItems.join(" ");
    const logString = formatLogMessage(logMessage);
    console.debug(logString); // eslint-disable-line no-console
}

function log(...logItems) {
    const logMessage = logItems.join(" ");
    const logString = formatLogMessage(logMessage);
    const tripleGrave = "```";
    console.log(logString); // eslint-disable-line no-console

    const logChannel = getLogChannel();
    if (logChannel) {
        logChannel.send(tripleGrave + "\n" + logString + "\n" + tripleGrave);
        return;
    }

    if (!logChannelWarned) {
        logChannelWarned = true;
        // eslint-disable-next-line no-console
        console.log(formatLogMessage(`No log channel found.`));
    }
}

function logError(context, ...logItems) {
    const logMessage = "error" + (context ? ` in ${context}` : "") + ": " + logItems.join(" ");
    log("[ERROR]", logMessage);
}

function readFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readFileSettingDefault(filePath, defaultValue) {
    try {
        const fileData = fs.readFileSync(filePath, "utf8");
        return JSON.parse(fileData);
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;

        fs.writeFileSync(filePath, defaultValue, { encoding: "utf8", flag: "wx" });
        return JSON.parse(defaultValue);
    }
}

function deleteFolderRecursive(folderPath) {
    try {
        fs.readdirSync(folderPath).forEach(function(file) {
            var curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath);
    } catch (err) {
        if (err.code !== "ENOENT") throw err;
    }
}

const guildDatabasePath = path.join(__dirname, "..", "stores", "guilddatabase.json");
let guildDatabase;

function getGuildDatabase() {
    guildDatabase = guildDatabase || readFile(guildDatabasePath);
    return guildDatabase;
}

function writeGuildDatabase() {
    const formattedJson = JSON.stringify(guildDatabase, "", "\t");
    fs.writeFile(guildDatabasePath, formattedJson, (err) => {
        if (!err) return;
        return logError("writing the guild database", err);
    });
}

function amendGuildDatabase(partialGuildDb) {
    Object.assign(guildDatabase, partialGuildDb);
    writeGuildDatabase();
}

function removeGuildFromDatabase(guildId) {
    delete guildDatabase[guildId];
    writeGuildDatabase();
}

function isGuildInited(guildSettings) {
    return guildSettings.calendarID && guildSettings.timezone;
}

function writeGuildSpecific(guildId, data, file) {
    const formattedJson = JSON.stringify(data, "", "\t");
    const fullPath = pathForSpecificGuild(guildId, file);
    return writeFilePromise(fullPath, formattedJson).catch(err => {
        if (!err) return;
        return logError("writing guild-specific database", err);
    });
}

const userStorePath = path.join(__dirname, "..", "stores", "users.json");
const users = readFileSettingDefault(userStorePath, "{}");

const userDefaults = {}; // only used in reading; that is, only explicitly-set values are persisted

// uses cached version of user data
function amendUserSettings(userId, partialSettings) {
    users[userId] = Object.assign({}, users[userId], partialSettings);

    const formattedJson = JSON.stringify(users, "", "\t");
    fs.writeFile(userStorePath, formattedJson, (err) => {
        if (!err) return;
        return logError("writing the users database", err);
    });
}

function getUserSetting(userId, settingName) {
    const apparentSettings = Object.assign({}, userDefaults, users[userId]);
    return apparentSettings[settingName];
}

// checks if msg both @mentions bot.client.user and contains some string in the list (or singleton) x
function mentioned(msg, x) {
    if (!Array.isArray(x)) {
        x = [x];
    }
    return msg.isMentioned(bot.client.user.id) && x.some((c) => msg.content.toLowerCase().includes(c));
}

// 24-hour clock
const hourStrings24 = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
function hourString(hour) {
    return hourStrings24[hour];
}

const dayStrings = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function dayString(number) {
    return dayStrings[number];
}

const monthStrings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function monthString(number) {
    return monthStrings[number];
}

function firstUpper(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function zeroPad(item, length) {
    let itemString = String(item);
    let zeroCount = Math.max(length - itemString.length, 0);
    let zeroes = "0".repeat(zeroCount);
    return zeroes + itemString;
}

// FIXME: timezone awareness should use npm:timezone
function convertDate(dateToConvert, guildId) {
    let guildSettingsPath = pathForSpecificGuild(guildId, "settings");
    let guildSettings = readFile(guildSettingsPath);
    let tz = guildSettings.timezone;
    let pieces = tz.split("GMT")[1];
    let hour = pieces.split(":")[0];
    let minutes = pieces.split(":")[1];
    if (minutes === "00") {
        minutes = ".";
    }
    if (minutes === "30") {
        minutes = ".5";
    }
    let offset = parseFloat(hour + minutes);
    let utc = dateToConvert.getTime() + (dateToConvert.getTimezoneOffset() * 60000);
    let nd = new Date(utc + (3600000*offset));
    return nd;
}

function stringDate(date, guildId, hour) {
    let guildSettingsPath = pathForSpecificGuild(guildId, "settings");
    let guildSettings = readFile(guildSettingsPath);
    let offset;
    if (guildSettings.timezone.indexOf("-") === -1) {
        offset = guildSettings.timezone.split("+")[1];
    } else {
        offset = guildSettings.timezone.split("-")[1];
    }
    let year = date.getFullYear();
    let month = zeroPad(date.getMonth() + 1, 2);
    let day = zeroPad(date.getDate(), 2);
    let dateString = "";
    if (guildSettings.timezone.indexOf("-") === -1) {
        if (hour === "start") {
            dateString += `${year}-${month}-${day}T00:00:00+${offset}`;
        }
        if (hour === "end") {
            dateString += `${year}-${month}-${day}T23:59:00+${offset}`;
        }
    } else {
        if (hour === "start") {
            dateString += `${year}-${month}-${day}T00:00:00-${offset}`;
        }
        if (hour === "end") {
            dateString += `${year}-${month}-${day}T23:59:00-${offset}`;
        }
    }
    return dateString;
}

function getStringTime(date) {
    let hour = date.getHours();
    let minutes = zeroPad(date.getMinutes(), 2);
    if (minutes === "00") {
        if (hour <= 11) {
            return hourString(parseInt(date.getHours(), 10)) + "AM";
        }
        if (hour > 11) {
            return hourString(parseInt(date.getHours(), 10)) + "PM";
        }
    } else {
        if (hour <= 11) {
            return `${hourString(parseInt(date.getHours(), 10))}:${minutes}AM`;
        }
        if (hour > 11) {
            return `${hourString(parseInt(date.getHours(), 10))}:${minutes}PM`;
        }
    }
}

function sendMessageHandler(message, err) {
    log(err);

    if (err.message === "Missing Permissions") {
        message.author.send("Oh no! I don't have the right permissions in the channel you're trying to use me in! Toggle on all of the 'text permissions' for the **Niles** role");
    }
}

function getMissingPermissionsFor(channel) {
    let botPermissions = channel.permissionsFor(bot.client.user).serialize(true);
    let missingPermissions = [];
    getMinimumPermissions().forEach(function(permission) {
        if (!botPermissions[permission]) {
            missingPermissions.push(permission);
        }
    });
    return missingPermissions;
}

function checkPermissions(message) {
    const missingPermissions = getMissingPermissionsFor(message.channel);
    log(`Missing permissions in guild ${message.guild.id}, channel ${message.channel.id}:`, missingPermissions);
    return missingPermissions.length === 0;
}

function checkPermissionsManual(message, cmd) {
    const missingPermissions = getMissingPermissionsFor(message.channel);
    let missingPermissionsString = missingPermissions.map(x => String(x)).join("\n");

    if (missingPermissions !== "") {
        const promise = message.author.send(`Hey I noticed you tried to use the command \`${cmd}\`. I am missing the following permissions in channel **${message.channel.name}**:\n`
          + "```\n"
          + missingPermissionsString + "\n"
          + "```\n"
          + "If you want to stop getting these DMs, type `!permissions 0` in this DM chat.");
        return promise;
    }
    return message.author.send(`I have all the permissions I need in channel **${message.channel.name}**`);
}

function yesThenCollector(message) {
    let p = defer();
    const collector = message.channel.createMessageCollector((m) => message.author.id === m.author.id, { time: 30000 });
    collector.on("collect", (m) => {
        if (["y", "yes"].includes(m.content.toLowerCase())) {
            p.resolve();
        } else {
            message.channel.send("Okay, I won't do that");
            p.reject();
        }
        collector.stop();
    });
    collector.on("end", (collected, reason) => {
        if (reason === "time") {
            return message.channel.send("Command response timeout");
        }
    });
    return p.promise;
}

function isCommand(message, client) {
    // FIXME: cache guild settings, so this doesn't use a lot of resources on heavy-use servers
    let guildSettingsPath = pathForSpecificGuild(message.guild.id, "settings");
    let guildSettings = readFile(guildSettingsPath);

    return message.content.match(new RegExp(`^${escapeRegExp(guildSettings.prefix)}`, "i")) || message.isMentioned(client.user);
}

// undefined if it doesn't look like a command
// null if it looks like a command, but not an acceptable one
// else: [commandString, [...args]]
function parseCommand(message, client, acceptableCommands) {
    let guildSettingsPath = pathForSpecificGuild(message.guild.id, "settings");
    let guildSettings = readFile(guildSettingsPath);

    let content = message.cleanContent;
    let cmdName, argString;
    if (message.isMentioned(client.user)) {
        const clientName = message.guild.member(client.user).displayName;
        const mentionMatch = new RegExp(escapeRegExp(`@${clientName}`), "g");
        content = content.replace(mentionMatch, "").trim();
        cmdName = content.split(/\s+/)[0];
        argString = content.replace(cmdName, "").trim();
    } else {
        const prefixMatch = new RegExp(`^${escapeRegExp(guildSettings.prefix)}(\\w+)\\b`, "i");

        const match = content.match(prefixMatch);
        if (!match) return;
        cmdName = match[1];
        argString = content.replace(match[0], "").trim();
    }

    const args = argString.split(/\s+/);

    if (acceptableCommands) {
        debug("First parse:", cmdName, args);
        debug("Testing against:", acceptableCommands);

        cmdName = acceptableCommands.find(cmd => cmd.localeCompare(cmdName, "en", { sensitivity: "base" }) === 0);
        if (!cmdName) return null;
    }

    debug("Acceptable command:", cmdName, args);

    return [cmdName, args];
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

module.exports = {
    getGuildDatabase,
    amendGuildDatabase,
    removeGuildFromDatabase,
    isGuildInited,

    isCommand,
    parseCommand,

    folderForSpecificGuild,
    pathForSpecificGuild,
    deleteFolderRecursive,
    writeGuildSpecific,
    mentioned,
    dayString,
    monthString,
    firstUpper,

    amendUserSettings,
    getUserSetting,

    debug,
    log,
    logError,
    getLogChannel,

    readFile,
    readFileSettingDefault,

    getStringTime,
    stringDate,
    hourString,
    convertDate,
    zeroPad,
    sendMessageHandler,
    checkPermissions,
    checkPermissionsManual,
    yesThenCollector,

    escapeRegExp,
};
