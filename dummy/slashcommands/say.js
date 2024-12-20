module.exports = {
    name: 'say',
    description: 'Broadcast a message as the bot itself.',
    options: [
        {
            name: 'message',
            description: 'The message to broadcast.',
            required: true
        },
        {
            name: 'channel',
            description: 'The channel to broadcast the message.',
            required: true
        }
    ],
    execute(interaction) {

      const message = options.getString("message");
      const targetChannel = options.getChannel("channel");

      if (
        !targetChannel ||
        (targetChannel.type !== ChannelType.GuildText &&
          targetChannel.type !== ChannelType.GuildAnnouncement)
      ) {
        interaction.reply({
          content: "You must specify a valid text or announcement channel.",
          ephemeral: true,
        });
        return;
      }

      try {
        targetChannel.send(message);
        interaction.reply({
          content: "Message broadcasted successfully.",
          ephemeral: true,
        });
      } catch (error) {
        // Handle known error codes without logging
        if (error.code === 50013 || error.code === 50001) {
          interaction.reply({
            content:
              "I do not have permission to send messages in this channel or I cannot access the channel.",
            ephemeral: true,
          });
        } else {
          // Log unexpected errors
          console.error("Error broadcasting message:", error);
          interaction.reply({
            content: "Failed to broadcast the message.",
            ephemeral: true,
          });
        }
      }

    }
}