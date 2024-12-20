# AppleUp Discord Bot

AppleUp is a Discord bot designed to monitor the status of Apple's services and apps, provide alerts for outages and issues, and allow guild configurations for automatic service updates and app version notifications.


## Erin's New Setup Description
Run the AppleUp Bot by using:

```
node appleup.js
```

Or run the Dummy Bot by using:

```
node dummy.js
```

All of the varriables for the tokens, server, etc. are in the `.env` file in the root directory. I set up the `.env` file so that we can have separate databases for each bot if we want. If we don't want, just delete those lines and update the `dummy/config/database.js` so that it matches what `appleup/config/database.js` file has.

Each bot's commands and events are in their own folders. This means all of AppleUp's current commands, events, etc. are in the `appleup` folder and dummy in the `dummy` folder.

The `appleup/commands` folder is for any of the old `!` commands. We don't have any but I kept the folders there in case we ever wanted to add them in the future.

All of the database commands are swapped from sqlite3 to MySQL. Data from the databases still needs to be moved over BUT all of the commands work.