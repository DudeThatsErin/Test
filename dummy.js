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
      // If the entry is a directory, call this function again
      // but now add the directory name to the path string.
      filteredEntries.push(...readFilesFromPath(`${pathString}/${dirEnt.name}`))
    } else if (dirEnt.isFile()) {
      // Check if the entry is a file instead. And if so, check
      // if the file name ends with `.js`.
      if (dirEnt.name.endsWith('.js')) {
        // Add the file to the command file array.
        filteredEntries.push(`${pathString}/${dirEnt.name}`);
      }
    }

    return filteredEntries;
  }, []);
}

// create dummy slash commands
console.log('|-----------------------------------|')
console.log('    Loading Dummy Slash Commands...  ')
console.log('|-----------------------------------|')

const commandFilePaths4 = readFilesFromPath('./dummy/slashcommands');

commandFilePaths4.forEach((filePath) => {
  const cmd = require(filePath);
  let object = {};
  if (cmd.name) { object.name = cmd.name; }
  if (cmd.description) { object.description = cmd.description; }
  if (cmd.options) { object.options = cmd.options; }

  data.push(object);
  //client.dummyCommands.delete(cmd.name, cmd);
  client.dummyCommands.set(cmd.name, cmd);
  console.log(cmd.name + ' loaded successfully!');
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
