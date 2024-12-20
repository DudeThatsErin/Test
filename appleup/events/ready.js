const path = require('path');
const connection = require(path.join(__basedir, 'dummy/config/database.js'));

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log('|-----------------------------------|')
        console.log('          Logging In...             ')
        console.log('|-----------------------------------|')
        console.log(`   ${client.user.tag} is\n   logged in and ready!`);
        console.log('|-----------------------------------|')
        console.log('             Error Logs...           ')
        console.log('|-----------------------------------|')

        client.user.setPresence({ activities: [{ name: 'I monitor Apple\'s service status, official app releases and more.' }] });

       // Create table for message IDs if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS message_ids (
        id INTEGER NOT NULL,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_id TEXT NOT NULL,
        PRIMARY KEY (guild_id, channel_id, id)
        )`);

        // Create table for configuration settings if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS config (
        key TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        outage_role_id TEXT,
        issue_role_id TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guild_id, key),
        UNIQUE (guild_id, key)
        )`);

        // Create table for app_config if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS app_config (
        key TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        new_version_role_id TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guild_id, key),
        UNIQUE (guild_id, key)
        )`);

        // Create table for service_status if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS service_status (
        guild_id TEXT NOT NULL,
        service_name TEXT NOT NULL,
        status TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guild_id, service_name)
        )`);

        // Create table for outage events if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS outage_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        service_name TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        message_id TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create table for apps if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS apps (
        id INTEGER NOT NULL,
        guild_id TEXT NOT NULL,
        name TEXT NOT NULL,
        current_version TEXT,
        app_id TEXT NOT NULL,
        PRIMARY KEY (guild_id, id)
        )`);

        // Create table for AFK statuses if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS afk_status (
        user_id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        message TEXT DEFAULT '',
        channel_id TEXT,
        end_timestamp INTEGER DEFAULT NULL
        )`);

        // Create table for notes if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS user_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        note TEXT NOT NULL,
        added_by TEXT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create table for posted articles if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS posted_articles (
        id TEXT NOT NULL, -- Unique article identifier
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (id, channel_id) -- Ensure uniqueness for each article per channel
        )`);

        // Create table for news channel configuration if it doesn't exist
        connection.execute(`CREATE TABLE IF NOT EXISTS news_channels (
        guild_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

    }
}