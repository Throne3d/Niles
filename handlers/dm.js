const helpers = require("./helpers");
const { USAGE } = require("./strings");

// FIXME: include DM commands specifically

function permissions(message, args) {
    if (args.length !== 1) {
        return message.author.send("This command accepts exactly one argument. For example, use `!permissions 0`.");
    }

    const arg = parseInt(arg[0], 10);
    if (!Number.isInteger(arg) || ![0, 1].includes(arg)) {
        return message.author.send("You must use an argument of either 0 or 1.");
    }

    helpers.amendUserSettings(message.author.id, { permissionChecker: arg });

    return message.author.send(`Okay, I've now set permissions to ${arg}.`);
}

function help(message, args) {
    if (args.length > 0) message.author.send("This command doesn't take an argument.");
    message.author.send(USAGE);
}

const commands = {
    permissions,
    help,
};

function run(message) {
    const cmdBits = message.content.match(/^!?(\w+)\b/);
    if (!cmdBits) return message.author.send("That doesn't look like a command. Please use `help` to get a list of available commands, with associated syntaxes.");

    const cmdText = cmdBits[1];
    const cmdName = Object.keys(commands).find(cmd => cmd.localeCompare(cmdText, "en", { sensitivity: "base" }) === 0);

    if (!cmdName) return message.author.send("I don't understand that command. Please use `help` to get a list of available commands.");

    const args = message.content.replace(cmdBits, "").trim().split(/\s+/);

    return commands[cmdName](message, args);
}

module.exports = { run };
