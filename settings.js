const helpers = require("./handlers/helpers.js");
const path = require("path");

const guildDbStorePath = path.join(__dirname, "stores", "guilddatabase.json");
module.exports = {
    guilddatabase: helpers.readFileSettingDefault(guildDbStorePath, "{}"),
    secrets: require("./config/secrets.json"),
    calendarConfig: require("./config/calendarsettings.js")
};
