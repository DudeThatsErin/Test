const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));


module.exports = {
    name: 'delconfig',
    description: 'Delete configuration for auto service status updates.',
    execute(interaction, guildId) {

      // SQL to delete configuration
      connection.execute(`DELETE FROM config WHERE guild_id = ?`, [guildId], function (err) {
        if (err) {
          console.error("Database error:", err.message);
          interaction.reply("Failed to clear configuration.");
        } else if (this.changes > 0) {
          interaction.reply({
            content:
              "Configuration cleared successfully. The bot will no longer auto check for service status updates and send alerts.",
            ephemeral: true,
          });
        } else {
          // If no rows were affected, it means there was nothing to delete
          interaction.reply({
            content: "No configuration to clear.",
            ephemeral: true,
          });
        }
      });

    }
}