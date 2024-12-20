const Discord = require('discord.js');
const connection = require('./appleup/config/database.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const command = client.appleUpCommands.get(interaction.commandName);
        if (!command) return interaction.reply({ content: 'This command no longer exists.', ephemeral: true });

        // command cooldowns
        if (!client.appleUpCommands.has(interaction.commandName)) {
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
           client.appleUpCommands.get(interaction.commandName).execute(interaction, client);
        } catch (error) {
            console.error(error);
        }

    }
};