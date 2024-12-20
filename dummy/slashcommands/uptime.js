module.exports = {
    name: 'uptime',
    description: 'Show total uptime of the bot.',
    execute(interaction) {

      const currentTime = Date.now();
      const uptime = currentTime - startTime;
      const seconds = Math.floor((uptime / 1000) % 60);
      const minutes = Math.floor((uptime / (1000 * 60)) % 60);
      const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
      const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
      interaction.reply(
        `Uptime: \`${days}d ${hours}h ${minutes}m ${seconds}s\``
      );
    }
}