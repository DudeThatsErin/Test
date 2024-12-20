const Discord = require('discord.js');
const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;
        if (!interaction.isCommand() || !interaction.guildId) return;

        const command = client.dummyCommands.get(interaction.commandName);
        if (!command) return interaction.reply({ content: 'This command no longer exists.', ephemeral: true });

        const customId = interaction.customId;
        const guildId = interaction.guildId;
        const userId = interaction.userId;

        // command usage logging
        const { commandName, user, channel } = interaction;

        // Define log channel ID
        const logChannelId = "1302019963464454256";
        
        // Collect all user inputs for this command
        const optionsData = interaction.options.data.map(
            option => `**${option.name}**: ${option.value || "No other input."}`
        ).join("\n");

        // Create embed for logging
        const logEmbed = new EmbedBuilder()
            .setTitle("Command Used")
            .setDescription(`**Command**: \`/${commandName}\``)
            .addFields(
            { name: "User", value: `<@${user.id}>`, inline: true },
            { 
                name: "Channel/Thread", 
                value: `<#${channel.id}>`,
                inline: true 
            },
            { name: "Options", value: optionsData || "No options provided.", inline: false } // All command options and their inputs
            )
            .setColor(0xFFFFFF)
            .setTimestamp();

        // Send log to the log channel
        const logChannel = await client.channels.fetch(logChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
        }

        // I wasn't sure if this was a separate command or what so I just kept it here -e
        if (customId.startsWith("delete_note_")) {
            const noteId = customId.split("_").pop(); // Get the note ID from the customId

            connection.query(
            `DELETE FROM user_notes WHERE id = ? AND guild_id = ?`,
            [noteId, guildId],
            function (err) {
                if (err) {
                console.error("Error deleting note:", err.message);
                return interaction.reply({
                    content: "Failed to delete the note.",
                    ephemeral: true,
                });
                }

                if (this.changes > 0) {
                interaction.reply({
                    content: "Note deleted successfully.",
                    ephemeral: true,
                });

                // Re-fetch the notes after deletion
                connection.query(
                    `SELECT id, note, added_by, added_at FROM user_notes WHERE user_id = ? AND guild_id = ?`,
                    [userId, guildId],
                    (err, rows) => {
                    if (err) {
                        console.error("Error retrieving notes:", err.message);
                        return interaction.followUp({
                        content: "Failed to retrieve remaining notes.",
                        ephemeral: true,
                        });
                    }

                    if (rows.length === 0) {
                        return interaction.followUp({
                        content: "No more notes found for this user.",
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

                        const actionRow = new ActionRowBuilder().addComponents(
                        deleteButton
                        );

                        return { embeds: [embed], components: [actionRow] };
                    });

                    noteEmbeds.forEach((note) => interaction.followUp(note));
                    }
                );
                } else {
                interaction.reply({
                    content: "Note not found or already deleted.",
                    ephemeral: true,
                });
                }
            }
            );
        }

        // command cooldowns
        if (!client.dummyCommands.has(interaction.commandName)) {
            client.slashCooldowns.set(interaction.commandName, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = client.slashCooldowns.get(interaction.commandName);
        const cooldownAmount = (command.cooldown || 1) * 1000;
        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`, ephemeral: true });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // actually running the commands.
        try {
           client.dummyCommands.get(interaction.commandName).execute(interaction, client);
        } catch (error) {
            console.error(error);
        }

    }
};