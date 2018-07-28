const helpers = require("./handlers/helpers.js");
module.exports = {
    guilddatabase: helpers.readFileSettingDefault("./stores/guilddatabase.json", "{}"),
    secrets: require("./config/secrets.json"),
    calendarConfig: require("./config/calendarsettings.js")
};
