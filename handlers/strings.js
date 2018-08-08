const website = null; // "http://niles.seanecoffey.com/"
const websiteSetup = null; // "http://niles.seanecoffey.com/setup"
const account = null; // "niles-291@niles-169605.iam.gserviceaccount.com"
const discordServer = null; // "https://discord.gg/jNyntBn"
const botName = "the bot";

const USAGE = "```\
Usage\n\
---------------------------\n\
!display             -  Display your calendar\n\
!update / !sync      -  Update the calendar\n\
!create / !scrim     -  Create events using GCal's default interpreter. Example format: !scrim xeno June 5 8pm - 9pm\n\
!delete              -  Delete an event. Format: !delete <day> <starttime>\n\
!clean / !purge      -  Delete messages in current channel. Format: either !clean or !clean <number>\n\
!stats / !info       -  Display a list of statistics and information about " + botName + "\n\
!invite              -  Get an invite link for " + botName + " to join your server!\n\
!setup               -  Get details on how to set up " + botName + "\n\
!id                  -  Set the Google calendar ID for the guild\n\
!tz                  -  Set the timezone for the guild\n\
!prefix              -  View or change the prefix for " + botName + "\n\
!help                -  Display this message\n\
```" + (website ? `\nVisit ${website} for more info.` : "");

const USAGE_SETUP = "```\
Usage - SETUP MODE\n\
---------------------------\n\
NOTE: ALL COMMANDS BECOME AVAILABLE AFTER SETUP IS COMPLETE\n\
!setup               -  Get details on how to set up " + botName + "\n\
!id                  -  Set the Google calendar ID for the guild\n\
!tz                  -  Set the timezone for the guild\n\
!prefix              -  View or change the prefix for " + botName + "\n\
!help                -  Display this message\n\
```" + (websiteSetup ? `\nVisit ${websiteSetup} for more info.` : "");

const NOTIFICATION_SETUP = "\
Hi! Let's get me setup for use in this Discord. The steps are outlined below" + (websiteSetup ? `, but for a detailed setup guide, visit ${websiteSetup}.` : "") + "\n\
\n\
1. Invite " + (account ? `\`${account}\`` : "my google account") + " to 'Make changes to events' under the Permission Settings on the Google Calendar you want to use with " + botName + ".\n\
2. Enter the Calendar ID of the calendar in Discord using the `!id` command, e.g. `!id 123abc@123abc.com`.\n\
3. Enter the timezone you want to use in Discord with the `!tz` command, e.g. `!tz GMT+10:00`. (Note: it must be formatted like this, as an offset from GMT.)\n\
\n\
I should now be able to sync with your Google calendar and interact with on you on Discord. Try `!display` to get started!";

const WARNING_NO_CALENDAR = "I can't seem to find your calendar! This is usually because you haven't invited Niles to access your calendar. Run `!setup` and make sure you've followed step 1.\n\
You should also check that you have entered the correct calendar ID, using `!id`.\n\
\n\
If you still get this error, join the Discord support server" + (discordServer ? ` here: <${discordServer}>` : "") + ".";

module.exports = {
    USAGE,
    USAGE_SETUP,
    NOTIFICATION_SETUP,
    WARNING_NO_CALENDAR,
};
