const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));

module.exports = {
    name: 'config',
    description: 'Show current configuration for automatic service status updates.',
    execute(interaction, guildId) {

      connection.query(
        `SELECT channel_id, outage_role_id, issue_role_id, updated_at FROM config WHERE guild_id = ? AND key = 'auto_service_status'`,
        [guildId],
        async (err, row) => {
          if (err) {
            console.error("Database error:", err.message);
            await interaction.reply("Failed to fetch configuration.");
            return;
          }
          if (row) {
            const updateChannelId = row.channel_id;
            const outageRoleId = row.outage_role_id;
            const issueRoleId = row.issue_role_id;
            const updatedAtUnix = Math.floor(
              new Date(row.updated_at).getTime() / 1000
            );
            const discordTimestamp = `<t:${updatedAtUnix}:F>`;
            await interaction.reply({
              content: `Current channel for service status updates is <#${updateChannelId}>. The role pinged for outages is <@&${outageRoleId}>. The role pinged for issues is <@&${issueRoleId}>. Last updated on ${discordTimestamp}.`,
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: "No configuration for auto service status updates found.",
              ephemeral: true,
            });
          }
        }
      );

    }
}