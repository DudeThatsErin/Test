const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));
const axios = require("axios");

module.exports = {
    name: 'appadd',
    description: '"Add a new app to the list.',
    options: [
        {
            name: 'name',
            description: 'Name of the app.',
            required: true,
            type: 3
        },
        {
            name: 'id',
            description: 'App Store ID of the app.',
            required: true,
            type: 3
        }
    ],
    execute(interaction) {

    const guildId = interaction.guildId;
    const appName = interaction.options.getString("name").trim();
    const appId = interaction.options.getString("id").trim();

    connection.query(
      `SELECT name FROM apps WHERE app_id = ? AND guild_id = ?`,
      [appId, guildId],
      async (err, row) => {
        if (err) {
          console.error(err.message);
          await interaction.reply({
            content: "Error checking the database.",
            ephemeral: true,
          });
          return;
        }

        if (row) {
          await interaction.reply({
            content: `An app with the App Store ID: **${appId}** already exists under the name **${row.name}**.`,
            ephemeral: true,
          });
        } else {
          // Fetch the app version from the iTunes API
          try {
            const response = await axios.get(
              `https://itunes.apple.com/lookup?id=${appId}`
            );
            if (response.data.resultCount > 0) {
              const appVersion = response.data.results[0].version;

              // Find the highest id for this guild
              connection.query(
                `SELECT MAX(id) as max_id FROM apps WHERE guild_id = ?`,
                [guildId],
                (err, row) => {
                  const newId = row.max_id + 1 || 1; // Start from 1 if no apps are present
                  // Insert the app with the new calculated ID and version
                  connection.execute(
                    `INSERT INTO apps (id, guild_id, name, app_id, current_version) VALUES (?, ?, ?, ?, ?)`,
                    [newId, guildId, appName, appId, appVersion],
                    function (err) {
                      if (err) {
                        console.error(err.message);
                        interaction.reply({
                          content: "Failed to add app: " + err.message,
                          ephemeral: true,
                        });
                      } else {
                        interaction.reply({
                          content: `App **${appName}** version **${appVersion}** added with App Store ID: **${appId}**.`,
                          ephemeral: true,
                        });
                      }
                    }
                  );
                }
              );
            } else {
              await interaction.reply({
                content:
                  "No results found for the provided App Store ID. Please check the ID and try again.",
                ephemeral: true,
              });
            }
          } catch (error) {
            console.error("Error fetching app info:", error);
            await interaction.reply({
              content: "Failed to fetch app version information.",
              ephemeral: true,
            });
          }
        }
      }
    );

    }
}