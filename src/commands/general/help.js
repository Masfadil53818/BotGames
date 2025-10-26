const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "help",
  description: "Menampilkan daftar semua command bot.",
  async execute(message) {
    const commandsPath = path.join(__dirname, "..");
    let commandsList = [];

    // Baca semua folder di /commands
    const folders = fs.readdirSync(commandsPath);
    for (const folder of folders) {
      const folderPath = path.join(commandsPath, folder);
      if (fs.lstatSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));
        for (const file of files) {
          const command = require(path.join(folderPath, file));
          commandsList.push(command);
        }
      }
    }

    // Format daftar command
    const desc = commandsList
      .map(cmd => `**${cmd.name}** — ${cmd.description || "Tidak ada deskripsi."}`)
      .join("\n");

    // Buat embed
    const embed = new EmbedBuilder()
      .setTitle("📜 Daftar Command nxct Bot")
      .setDescription(desc)
      .setColor("Purple")
      .setFooter({ text: `Total command: ${commandsList.length}` })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
