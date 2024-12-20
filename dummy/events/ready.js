let updateIntervalId, appVersionIntervalId;
const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));
let botStartupTime;
const trackedThreads = new Set(); // Store threads already pinged
const { ChannelType } = require('discord.js');

// Function to check and post updates automatically
async function checkForUpdates(guildId) {
  connection.query(
    `SELECT channel_id FROM config WHERE guild_id = ? AND no = 'auto_service_status'`,
    [guildId],
    async (err, row) => {
      if (err) {
        console.error("Database error:", err.message);
        return;
      }
      if (row) {
        const updateChannelId = row.channel_id;
        await postServiceStatus(guildId, updateChannelId);
      }
    }
  );
}

async function checkAppVersions() {
  try {
    const [apps] = await connection.query(`SELECT * FROM apps`);

    for (const app of apps) {
      const appInfo = await fetchAppInfo(app.app_id);
      if (appInfo.error) {
        console.error("Failed to fetch app info:", appInfo.error);
        continue;
      }

      if (isNewerVersion(appInfo.version, app.current_version)) {
        const [configRows] = await connection.query(
          `SELECT channel_id, new_version_role_id FROM app_config WHERE guild_id = ? AND no = 'new_app_ver'`,
          [app.guild_id]
        );

        if (configRows.length > 0) {
          const config = configRows[0];
          try {
            const channel = await client.channels.fetch(config.channel_id);

            // Truncate release notes if they exceed 1024 characters
            let releaseNotes = appInfo.releaseNotes;
            if (releaseNotes.length > 1024) {
              releaseNotes = releaseNotes.substring(0, 1021) + "...";
            }

            const embed = new EmbedBuilder()
              .setTitle(`New version released for **${app.name}**!`)
              .setColor(0x00ff00)
              .setThumbnail(appInfo.iconUrl)
              .setDescription(
                `A new version **${appInfo.version}** is available. Previous version was **${
                  app.current_version || "N/A"
                }**.`
              )
              .addFields({
                name: "Release Notes:",
                value: releaseNotes,
              })
              .setTimestamp();

            await channel.send({
              content: config.new_version_role_id
                ? `<@&${config.new_version_role_id}>`
                : "",
              embeds: [embed],
            });
          } catch (error) {
            if (error.code === 50013) {
              // Bot lacks permissions
              return;
            } else {
              console.error("An unexpected error occurred:", error);
            }
          }
        }

        // Update the current version in the database
        await connection.query(
          `UPDATE apps SET current_version = ? WHERE app_id = ?`,
          [appInfo.version, app.app_id]
        );
      }
    }
  } catch (err) {
    console.error("An error occurred while checking app versions:", err);
  }
}



// Genius Bar Specialist and Photoshop Helper Role Pinging
// Channels to monitor
const monitoredChannels = [
  {
    channelIds: ["1299464530010574948", "1299465597733834894"], // Genius Bar channels
    roleId: "1299464970706096188" // Genius Bar Specialist role
  },
  {
    channelIds: ["1199969314309144618"], // Photoshop Requests channel
    roleId: "1301952666846363659" // Photoshop Helper role
  }
];

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        botStartupTime = Date.now(); // Record bot startup time
        console.log('|-----------------------------------|')
        console.log('          Logging In...             ')
        console.log('|-----------------------------------|')
        console.log(`   ${client.user.tag} is\n   logged in and ready!`);
        console.log('|-----------------------------------|')
        console.log('             Error Logs...           ')
        console.log('|-----------------------------------|')

        // Clear existing intervals
        if (updateIntervalId) clearInterval(updateIntervalId);
        if (appVersionIntervalId) clearInterval(appVersionIntervalId);

        // Set new intervals
        updateIntervalId = setInterval(() => {
            client.guilds.cache.forEach((guild) => {
            checkForUpdates(guild.id);
            });
        }, 30000); // Check every 30 seconds

        appVersionIntervalId = setInterval(checkAppVersions, 30000);

       // Create table for message IDs if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS message_ids (
        id INTEGER NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        channel_id VARCHAR(255) NOT NULL,
        message_id VARCHAR(255) NOT NULL,
        PRIMARY KEY (guild_id, channel_id, id)
        )`);

        // Create table for configuration settings if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS config (
        no VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        channel_id VARCHAR(255) NOT NULL,
        outage_role_id VARCHAR(255),
        issue_role_id VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guild_id, no),
        UNIQUE (guild_id, no)
        )`);

        // Create table for app_config if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS app_config (
        no VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        channel_id VARCHAR(255) NOT NULL,
        new_version_role_id VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guild_id, no),
        UNIQUE (guild_id, no)
        )`);

        // Create table for service_status if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS service_status (
        guild_id VARCHAR(255) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guild_id, service_name)
        )`);

        // Create table for outage events if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS outage_events (
        no INTEGER PRIMARY KEY AUTO_INCREMENT,
        guild_id VARCHAR(255) NOT NULL,
        service_name VARCHAR(255) NOT NULL,
        channel_id VARCHAR(255) NOT NULL,
        message_id VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create table for apps if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS apps (
        no INTEGER NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        current_version VARCHAR(255),
        app_id VARCHAR(255) NOT NULL,
        PRIMARY KEY (guild_id, no)
        )`);

        // Create table for AFK statuses if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS afk_status (
        user_id VARCHAR(255) PRIMARY KEY,
        guild_id VARCHAR(255) NOT NULL,
        message VARCHAR(255) DEFAULT '',
        channel_id VARCHAR(255),
        end_timestamp INTEGER DEFAULT NULL
        )`);

        // Create table for posted articles if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS posted_articles (
        no VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255) NOT NULL,
        channel_id VARCHAR(255) NOT NULL,
        posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (no, channel_id)
        )`);

        // Create table for news channel configuration if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS news_channels (
        guild_id VARCHAR(255) PRIMARY KEY,
        channel_id VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Check threads in monitored channels every minute
        setInterval(async () => {
            for (const { channelIds, roleId } of monitoredChannels) {
            for (const channelId of channelIds) {
                const channel = await client.channels.fetch(channelId);

                if (!channel || channel.type !== ChannelType.GuildForum) continue;

                // Fetch active threads
                const activeThreads = await channel.threads.fetchActive();

                activeThreads.threads.forEach(async (thread) => {
                if (thread.archived || trackedThreads.has(thread.id)) return; // Skip archived or already pinged threads

                const messages = await thread.messages.fetch();
                const threadCreationTime = thread.createdAt.getTime();
                const opId = thread.ownerId; // OP's ID

                // Check if all messages are from OP
                const onlyOpMessages = messages.every(msg => msg.author.id === opId);

                if (
                    threadCreationTime > botStartupTime &&
                    onlyOpMessages &&
                    Date.now() - threadCreationTime >= 24 * 60 * 60 * 1000
                ) {
                    // Ping the specific role in the thread
                    await thread.send(`<@&${roleId}> Hey, a little help in here please.`);
                    trackedThreads.add(thread.id); // Mark thread as pinged
                }

                // Stop tracking if someone other than OP replies
                messages.forEach((msg) => {
                    if (msg.author.id !== opId) {
                    trackedThreads.add(thread.id); // Mark as complete, don't track again
                    }
                });
                });
            }
            }
        }, 10); // Check every 1 minute 60 * 1000

    }
}