const { EmbedBuilder } = require("discord.js");

module.exports = {
  async send(message, newAchievements) {
    const embed = new EmbedBuilder()
      .setTitle("🏆 Achievement Baru!")
      .setColor(0xffd700)
      .setDescription(newAchievements.map(a => `✅ ${a}`).join("\n"))
      .setFooter({ text: "Keren! Terus main dan kumpulkan semuanya!" });

    await message.channel.send({ embeds: [embed] });
  }
};
