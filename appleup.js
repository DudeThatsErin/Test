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
client.appleUpCommands = new Collection();
const port = process.env.DISCORD_PORT;
const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
const RSSParser = require("rss-parser");
const parser = new RSSParser();
client.setMaxListeners(20);

// Send notifications about new commits on GitHub
const crypto = require('crypto');

// Secret token
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

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

//github stuffs wasn't sure where to put this -e
function verifySignature(req, res, buf) {
    // Get the GitHub signature from headers
    const githubSignature = req.headers['x-hub-signature-256'];
    
    // Calculate the signature based on the request payload
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    hmac.update(buf);
    const calculatedSignature = `sha256=${hmac.digest('hex')}`;

    // Compare the calculated signature with the GitHub signature
    if (calculatedSignature !== githubSignature) {
        throw new Error('Invalid signature.');
    }
}

app.post('/git', express.json({ verify: verifySignature }), async (req, res) => {
  try {
      const { ref, commits, repository, pusher } = req.body;

      // Only listen to pushes to the main branch
      if (ref === 'refs/heads/main') {
          const channel = await client.channels.fetch('760016116197621791');

          // Construct commit messages
          const commitMessages = commits.map(commit => `[\`${commit.id.slice(0, 7)}\`](${commit.url}) - ${commit.message}`).join('\n');

          // Create the embed
          const embed = new EmbedBuilder()
              .setColor(0xffffff)
              .setTitle(`New push to ${repository.name}`)
              .setDescription(commitMessages)
              .addFields(
                  { name: 'Branch', value: ref.replace('refs/heads/', ''), inline: true },
                  { name: 'Author', value: pusher.name, inline: true }
              )
              .setFooter({ text: `Repository: ${repository.full_name}` })
              .setTimestamp();

          // Send the message with role ping and embed
          await channel.send({ content: `<@&1293162904832708628>`, embeds: [embed] });
      }

      res.sendStatus(200);
  } catch (error) {
      console.error('Signature verification failed or other error:', error.message);
      res.sendStatus(401);
  }
});

app.listen(port, () => {
  console.log(`Bot listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("I'm online!");
});

// create appleup slash commands
console.log('|-----------------------------------|')
console.log('   Loading AppleUp Slash Commands... ')
console.log('|-----------------------------------|')

const commandFilePaths3 = readFilesFromPath('./appleup/slashcommands');

commandFilePaths3.forEach((filePath) => {
  const cmd = require(filePath);
  let object = {};
  if (cmd.name) { object.name = cmd.name; }
  if (cmd.description) { object.description = cmd.description; }
  if (cmd.options) { object.options = cmd.options; }

  data.push(object);
  //client.appleUpCommands.delete(cmd.name, cmd);
  client.appleUpCommands.set(cmd.name, cmd);
  console.log(cmd.name + ' loaded successfully!');
});

// events
console.log('|-----------------------------------|')
console.log('       Loading Event Files...        ')
console.log('|-----------------------------------|')
const eventFiles = fs.readdirSync(`${__dirname}/appleup/events`).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
  const event = require(`${__dirname}/events/${file}`);
  if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
  else client.on(event.name, (...args) => event.execute(...args, client));
  console.log(event.name + ' loaded successfully!');
}


// end of file
(async () => {
  connection = await require('./appleup/config/database.js');
  await client.login(process.env.APPLEUP_TOKEN);
})();
