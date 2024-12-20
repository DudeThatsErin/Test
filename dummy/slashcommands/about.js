module.exports = {
    name: 'about',
    description: 'Show information about the bot.',
    execute(interaction) {

    // Get the number of servers the bot is in
    const serverCount = client.guilds.cache.size;

    // Create an about embed
    const aboutEmbed = new EmbedBuilder()
      .setColor(0xffffff)
      .setTitle("About:")
      .addFields(
        {
          name: "\n",
          value:
            "I'm your dedicated companion for monitoring the heartbeat of all things Apple. Crafted with precision and a touch of digital wizardry, I'm here to ensure you're always in the know about the status of Apple's services and apps. If there's an outage, service interruption or app update, you'll hear it from me first.",
        },
        {
          name: "Servers:",
          value: `${serverCount}`,
          inline: true,
        },
        {
          name: "Last updated:",
          value: "16.12.2024",
          inline: true,
        },
        {
          name: "Version:",
          value: "4.7",
          inline: true,
        }
      )
      .setFooter({
        text: "Made by @markwwd, @JimScared, and @DudeThatsErin with JavaScript and some imagination ✨",
      });

    interaction.reply({ embeds: [aboutEmbed] });

    }
}