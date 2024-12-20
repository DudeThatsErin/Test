module.exports = {
    name: 'cleardb',
    description: 'Clean slate.',
    execute(interaction) {
      const modal = new ModalBuilder()
        .setCustomId("clearDbModal")
        .setTitle("Database Wipe Confirmation");

      const securityQuestionComponent = new TextInputBuilder()
        .setCustomId("securityAnswer")
        .setLabel('Are you sure? Type "YES" to continue.')
        .setStyle(TextInputStyle.Short);

      const actionRow = new ActionRowBuilder().addComponents(
        securityQuestionComponent
      );

      modal.addComponents(actionRow);

      interaction.showModal(modal);

    }
}