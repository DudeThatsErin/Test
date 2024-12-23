const fs = require('fs');
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]});


// configurations
require("dotenv").config();
client.commands = new Collection();
client.dummyCommands = new Collection();
client.setMaxListeners(20);
const axios = require("axios");
const cheerio = require("cheerio");
const RSSParser = require("rss-parser");
const parser = new RSSParser();
global.__basedir = __dirname;
const path = require('path');

// for all commands
let data = [];
function readFilesFromPath(pathString) {
    const directoryEntries = fs.readdirSync(pathString, { withFileTypes: true });

    return directoryEntries.reduce((filteredEntries, dirEnt) => {
        if (dirEnt.isDirectory()) {
            if (filteredEntries.includes(`${pathString}/${dirEnt.name}`)) {
                console.warn(`Skipping cycled directory: ${pathString}/${dirEnt.name}`);
                return filteredEntries;
            }

            filteredEntries.push(`...readFilesFromPath(${pathString}/${dirEnt.name})`);
        } else if (dirEnt.isFile() && dirEnt.name.endsWith('.js')) {
            filteredEntries.push(`${pathString}/${dirEnt.name}`);
        }

        return filteredEntries;
    }, []);
}
// create dummy slash commands
console.log('|-----------------------------------|');
console.log('    Loading Dummy Slash Commands...  ');
console.log('|-----------------------------------|');

// Define readFilesFromPath function
function readFilesFromPath(directory) {
    const directoryPath = path.resolve(__dirname, directory); // Resolve the full path
    try {
        return fs.readdirSync(directoryPath) // Read all files in the directory
            .filter(file => file.endsWith('.js')) // Only include JavaScript files
            .map(file => path.join(directoryPath, file)); // Get full paths to files
    } catch (err) {
        console.error(`Error reading files from directory: ${directoryPath}`, err);
        return [];
    }
}

const commandFilePaths4 = readFilesFromPath('./dummy/slashcommands');

commandFilePaths4.forEach((filePath) => {
    try {
        const cmd = require(filePath); // Dynamically import the command module
        let object = {};
        if (cmd.name) { object.name = cmd.name; }
        if (cmd.description) { object.description = cmd.description; }
        if (cmd.options) { object.options = cmd.options; }

        data.push(object); // Push to data array
        client.dummyCommands.set(cmd.name, cmd); // Add to client.dummyCommands
        console.log(`${cmd.name} loaded successfully!`);
    } catch (err) {
        console.error(`Failed to load command from file: ${filePath}`, err);
    }
});


// events
console.log('|-----------------------------------|')
console.log('       Loading Event Files...        ')
console.log('|-----------------------------------|')
const eventFiles = fs.readdirSync(`${__dirname}/dummy/events`).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`${__dirname}/dummy/events/${file}`);
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
  console.log(event.name + ' loaded successfully!');
}


// end of file
(async () => {
  connection = await require(path.join(__basedir, 'dummy/config/database.js'));
  await client.login(process.env.DUMMY_TOKEN);
})();
