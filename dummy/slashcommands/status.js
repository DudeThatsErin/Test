module.exports = {
    name: 'status',
    description: 'Post service status or update the existing one.',
    execute(interaction) {

        interaction.deferReply({
        ephemeral: true,
        });
        try {
            postServiceStatus(guildId, interaction.channelId);
            interaction.editReply({ content: "Service status updated." });
        } catch (error) {
            console.error("Failed to post service status:", error);
            interaction.editReply({
                content: "Failed to update service status.",
            });
        }
    }
}