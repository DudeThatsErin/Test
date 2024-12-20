module.exports = {
    name: 'ping',
    description: 'Ping the bot to see if it\'s responding.',
    execute(interaction) {

    const startTime = Date.now(); // Capture the start time
    interaction.deferReply(); // Acknowledge the interaction
    const endTime = Date.now(); // Capture the end time
    const timeDiff = endTime - startTime; // Calculate the difference

    // Edit the initial reply to include the response time
    interaction.editReply(`Pong! \`${timeDiff}ms\``);

    }
}