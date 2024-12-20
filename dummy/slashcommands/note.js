const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));


module.exports = {
    name: 'note',
    description: 'Add a note to a user.',
    options: [
      {
        name: 'user',
        description: 'The ID of the user to add a note to.',
        required: true
      },
      {
        name: 'note',
        description: 'The note to add.',
        required: true
      }
    ],
    execute(interaction) {
      const userId = options.getString("user");
      const note = options.getString("note");
      const addedBy = interaction.user.id;

      connection.query(
        `INSERT INTO user_notes (user_id, guild_id, note, added_by) VALUES (?, ?, ?, ?)`,
        [userId, guildId, note, addedBy],
        function (err) {
          if (err) {
            console.error("Error adding note:", err.message);
            return interaction.reply({
              content: "Failed to add note.",
              ephemeral: true,
            });
          }
          interaction.reply({
            content: "Note added successfully!",
            ephemeral: true,
          });
        }
      );
    }
}