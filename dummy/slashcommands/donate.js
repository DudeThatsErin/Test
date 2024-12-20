module.exports = {
    name: 'donate',
    description: 'Get the link to donate and support bot development.',
    execute(interaction) {
      const donateEmbed = new EmbedBuilder()
        .setColor(0xffffff)
        .setTitle("You are amazing!")
        .setDescription(
          "Thank you for considering a donation to support the development of this bot. Your support helps keep the bot running and allows for continuous improvement."
        )
        .addFields({
          name: "Donation Link",
          value:
            "[Click here to donate.](https://www.paypal.com/donate/?hosted_button_id=Q4SCP3WRY5QYA)",
          inline: false,
        })
        .setFooter({ text: "Thank you for your support! ❤️" });

      interaction.reply({ embeds: [donateEmbed], ephemeral: true });
    }
}