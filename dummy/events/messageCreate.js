const Discord = require('discord.js');
const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));
const timers = {}; // Object to store timers by user ID

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // if (!message.content.startsWith(config.prefix)) {
        //     return;
        // };
        // const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        // const commandName = args.shift().toLowerCase();
        // const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        // if (!command) return;
        //console.log(command);

        // Clear auto-reactions from Carl in the #suggestions channel and add custom ones
        const targetChannelId = '1312870002784993350'; // Channel ID
        const targetBotId = '235148962103951360'; // Bot's user ID

        // Check if the message is from the specific channel and the target bot
        if (message.channel.id !== targetChannelId || message.author.id !== targetBotId) return;

        const suggestionRegex = /^Suggestion #\d+$/;

        for (const embed of message.embeds) {
            if (
            (embed.title && suggestionRegex.test(embed.title)) ||
            (embed.description && suggestionRegex.test(embed.description)) ||
            (embed.fields && embed.fields.some(field => suggestionRegex.test(field.name) || suggestionRegex.test(field.value)))
            ) {
            try {
                // Wait for 1 second before removing reactions
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Clear all reactions
                await message.reactions.removeAll();
                console.log(`Cleared reactions for message: ${message.id}`);

                // Add custom emoji reactions
                const customEmojis = [
                '<:emoji1:1312876794638110781>', // Custom emoji ID
                '<:emoji2:1312876812434673767>', // Second custom emoji ID
                ];

                // React with each custom emoji sequentially
                for (const emoji of customEmojis) {
                await message.react(emoji);
                }
            } catch (error) {
                console.error(`Failed to handle reactions: ${error.message}`);
            }
            break;
            }
        }

        // command cooldowns
        if (!client.cooldowns.has(command.name)) {
            client.cooldowns.set(command.name, new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 1) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply({content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`});
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        // AFK STUFFS -e
        const { guildId, mentions, author } = message;
        connection.query(
            `SELECT message FROM afk_status WHERE user_id = ? AND guild_id = ?`,
            [author.id, guildId],
            async (err, row) => {
                if (err) {
                    console.error("Database error:", err.message);
                    return;
                }

                if (row) {
                    await clearAfkStatus(
                        message.member,
                        guildId,
                        message.channel.id,
                        false
                    );
                    // Clear the existing timer for this user if it exists
                    if (timers[author.id]) {
                        clearTimeout(timers[author.id]);
                        delete timers[author.id];
                    }

                    // Notify the user that their AFK status has been removed manually
                    const notification = await message.channel.send(
                        `Great! You're back. I've removed your AFK, <@${author.id}>.`
                    );
                    setTimeout(() => notification.delete(), 4000);
                }
            }
        );
        if (mentions.users.size > 0) {
            mentions.users.forEach((user) => {
            connection.query(
                `SELECT message, end_timestamp FROM afk_status WHERE user_id = ? AND guild_id = ?`,
                [user.id, guildId],
                async (err, row) => {
                if (err) {
                    console.error("Database error:", err.message);
                    return;
                }

                if (row) {
                    let timeRemaining = "";
                    if (row.end_timestamp) {
                        const now = Math.floor(Date.now() / 1000);
                        const remainingSeconds = row.end_timestamp - now;
                        if (remainingSeconds > 0) {
                            timeRemaining = ` (Back <t:${row.end_timestamp}:R>)`; // Discord timestamp format
                        }
                    }

                    const reply = await message.reply(
                    `<@${user.id}> is currently AFK: ${row.message}${timeRemaining}`
                    );
                    // Delete the bot's reply after 6 seconds
                    setTimeout(() => reply.delete(), 6000);
                }
                }
            );
            });
        }

        // actually running the commands.
        try {
            command.execute(message, args, client);
        } catch (error) {
            console.error(error);
        }
    }
}// end client.on message