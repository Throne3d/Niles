const USAGE = "```\
Niles Usage\n\
---------------------------\n\
!display             -  Display your calendar\n\
!update / !sync      -  Update the calendar\n\
!create / !scrim     -  Create events using GCal's default interpreter. Example format: !scrim xeno June 5 8pm - 9pm\n\
!delete              -  Delete an event. Format: !delete <day> <starttime>\n\
!clean / !purge      -  Delete messages in current channel. Format: either !clean or !clean <number>\n\
!stats / !info       -  Display a list of statistics and information about the Niles bot\n\
!invite              -  Get an invite link for Niles to join your server!\n\
!setup               -  Get details on how to set up Niles\n\
!id                  -  Set the Google calendar ID for the guild\n\
!tz                  -  Set the timezone for the guild\n\
!prefix              -  View or change the prefix for Niles\n\
!help                -  Display this message\n\
```\n\
Visit http://niles.seanecoffey.com for more info.";

const USAGE_SETUP = "```\
Niles Usage - SETUP MODE\n\
---------------------------\n\
NOTE: ALL COMMANDS BECOME AVAILABLE AFTER SETUP IS COMPLETE\n\
!setup               -  Get details on how to set up Niles\n\
!id                  -  Set the Google calendar ID for the guild\n\
!tz                  -  Set the timezone for the guild\n\
!prefix              -  View or change the prefix for Niles\n\
!help                -  Display this message\n\
```\n\
Visit http://niles.seanecoffey.com/setup for more info.";

const NOTIFICATION_SETUP = "\
Hi! Let's get me setup for use in this Discord. The steps are outlined below, but for a detailed setup guide, visit <http://niles.seanecoffey.com/setup>.\n\
\n\
1. Invite `niles-291@niles-169605.iam.gserviceaccount.com` to 'Make changes to events' under the Permission Settings on the Google Calendar you want to use with Niles.\n\
2. Enter the Calendar ID of the calendar in Discord using the `!id` command, e.g. `!id 123abc@123abc.com`.\n\
3. Enter the timezone you want to use in Discord with the `!tz` command, e.g. `!tz GMT+10:00`. (Note: it must be formatted like this, as an offset from GMT.)\n\
\n\
Niles should now be able to sync with your Google calendar and interact with on you on Discord. Try `!display` to get started!";

module.exports = {
    USAGE,
    USAGE_SETUP,
    NOTIFICATION_SETUP,
};
