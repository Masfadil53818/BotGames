const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.commands = new Collection();

// 🔹 Command Handler
const commandFolders = fs.readdirSync(path.join(__dirname, "commands"));
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, "commands", folder)).filter(f => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(path.join(__dirname, "commands", folder, file));
    client.commands.set(command.name, command);
  }
}

// 🔹 Event Handler
const eventFiles = fs.readdirSync(path.join(__dirname, "events")).filter(f => f.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(path.join(__dirname, "events", file));
  client.on(event.name, (...args) => event.execute(...args, client));
}

// 🔹 Command Listener
client.on("messageCreate", message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // 🔍 Cek command utama atau alias
  const command =
    client.commands.get(commandName) ||
    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;
  command.execute(message, args);
});

 client.once('clientReady', () => {
  console.log(`✅ ${client.user.tag} sudah online!`);
});

client.login(config.token);
