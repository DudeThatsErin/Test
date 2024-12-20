const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));

module.exports = {
    name: 'afk',
    description: 'Mark yourself as AFK.',
    options: [
        {
            name: 'duration',
            description: 'Duration in minutes (e.g., "2m" for 2 minutes).',
            required: true,
            type: 3
        },
        {
            name: 'message',
            description: 'Custom AFK message.',
            type: 3
        }
    ],
    execute(interaction) {

      const durationString = options.getString("duration");
      const message = options.getString("message") || "No message.";
      const user = interaction.member;

      let duration = 0;
      if (durationString) {
        const match = durationString.match(/(\d+)([mhs])/);
        if (match) {
          const value = parseInt(match[1], 10);
          const unit = match[2];
          if (unit === "m") duration = value * 60;
          else if (unit === "h") duration = value * 3600;
          else if (unit === "s") duration = value;
        }
      }

      const endTimestamp =
        duration > 0 ? Math.floor(Date.now() / 1000) + duration : null;
      const prefix = `(AFK) `;

      // Check if the user already has the AFK prefix
      let newNickname;
      if (!user.displayName.startsWith(prefix)) {
        newNickname = `${prefix}${user.displayName}`;
      } else {
        newNickname = user.displayName; // Don't change the nickname if already AFK
      }

      // Update AFK status in the database
      connection.execute(
        `INSERT OR REPLACE INTO afk_status (user_id, guild_id, message, channel_id, end_timestamp) VALUES (?, ?, ?, ?, ?)`,
        [user.id, guildId, message, channelId, endTimestamp]
      );

      // Check nickname length
      if (newNickname.length <= 32) {
        // Change the user's nickname only if the AFK prefix is not already there
        try {
          user.setNickname(newNickname);
        } catch (error) {
          console.error("Failed to change nickname:", error.message);
        }
      }

      const afkResponse = duration
        ? `You're now AFK for ${durationString}.`
        : `You're now AFK.`;
      interaction.reply({
        content: `${afkResponse} Message: ${message}`,
        ephemeral: true,
      });

      // Remove AFK status after the specified duration
      if (duration > 0) {
        timers[user.id] = setTimeout(async () => {
          await clearAfkStatus(user, guildId, channelId, true);
          delete timers[user.id]; // Remove reference to the timer
        }, duration * 1000);
      }

    }
}