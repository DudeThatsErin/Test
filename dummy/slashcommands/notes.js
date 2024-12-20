const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));


module.exports = {
    name: 'notes',
    description: 'View all notes for a user.',
    options: [
        {
            name: 'user',
            description: 'The ID of the user to view notes for.',
            required: true
        }
    ],
    execute(interaction) {

    const userId = options.getString("user");

    connection.query(
      `SELECT id, note, added_by, added_at FROM user_notes WHERE user_id = ? AND guild_id = ?`,
      [userId, guildId],
      (err, rows) => {
        if (err) {
          console.error("Error retrieving notes:", err.message);
          return interaction.reply({
            content: "Failed to retrieve notes.",
            ephemeral: true,
          });
        }

        if (rows.length === 0) {
          return interaction.reply({
            content: "No notes found for this user.",
            ephemeral: true,
          });
        }

        const noteEmbeds = rows.map((row) => {
          const embed = new EmbedBuilder()
            .setColor(0xffffff)
            .setDescription(
              `**Note:** ${row.note}\n**Added by:** <@${
                row.added_by
              }> on <t:${Math.floor(
                new Date(row.added_at).getTime() / 1000
              )}:F>`
            );

          const deleteButton = new ButtonBuilder()
            .setCustomId(`delete_note_${row.id}`)
            .setLabel("Delete note")
            .setStyle(ButtonStyle.Danger);

          const actionRow = new ActionRowBuilder().addComponents(deleteButton);

          return { embeds: [embed], components: [actionRow] };
        });

        noteEmbeds.forEach((note) => interaction.reply(note));
      }
    );

    }
}