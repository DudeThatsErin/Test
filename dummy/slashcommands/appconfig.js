const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));

module.exports = {
    name: 'appconfig',
    description: 'Set the channel for new app version alert.',
    execute(interaction, guildId) {

      connection.query(
        `SELECT channel_id, new_version_role_id, updated_at FROM app_config WHERE guild_id = ? AND key = 'new_app_ver'`,
        [guildId],
        async (err, row) => {
          if (err) {
            console.error("Database error:", err.message);
            await interaction.reply("Failed to fetch configuration.");
            return;
          }
          if (row) {
            const updateChannelId = row.channel_id;
            const newVersionRoleId = row.new_version_role_id;
            const updatedAtUnix = Math.floor(
              new Date(row.updated_at).getTime() / 1000
            );
            const discordTimestamp = `<t:${updatedAtUnix}:F>`;
            await interaction.reply({
              content: `Current channel for new app version alerts is <#${updateChannelId}>. The role pinged is <@&${newVersionRoleId}>. Last updated on ${discordTimestamp}.`,
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: "No configuration for auto app version checks found.",
              ephemeral: true,
            });
          }
        }
      );

    }
}