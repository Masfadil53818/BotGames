const db = require("../../database/db");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "leaderboard",
  description: "Lihat peringkat pemain di server!",
  aliases: ["lb"],

  async execute(message) {
    const store = db.table || db;
    const users = store.JSON ? store.JSON() : {}; // ambil semua key dari database

    const moneyData = [];
    const powerData = [];
    const xpData = [];

    for (const key in users) {
      if (key.startsWith("money_")) {
        const userId = key.replace("money_", "");
        const money = users[key] || 0;
        const animals = (await db.get(`animals_${userId}`)) || [];
        const totalPower = animals.reduce((sum, a) => sum + a.power, 0);
        const totalXP = animals.reduce((sum, a) => sum + a.xp, 0);

        moneyData.push({ userId, money });
        powerData.push({ userId, totalPower });
        xpData.push({ userId, totalXP });
      }
    }

    const topMoney = moneyData.sort((a, b) => b.money - a.money).slice(0, 5);
    const topPower = powerData.sort((a, b) => b.totalPower - a.totalPower).slice(0, 5);
    const topXP = xpData.sort((a, b) => b.totalXP - a.totalXP).slice(0, 5);

    const formatList = (arr, key) =>
      arr
        .map(
          (x, i) => `**${i + 1}.** <@${x.userId}> — ${x[key].toLocaleString()}`
        )
        .join("\n") || "_Belum ada data_";

    const embed = new EmbedBuilder()
      .setColor("#9B59B6")
      .setTitle("🏆 NXCT Leaderboard")
      .setDescription("Peringkat pemain paling top di server ini!")
      .addFields(
        { name: "💰 Uang Terbanyak", value: formatList(topMoney, "money"), inline: false },
        { name: "⚔️ Power Tertinggi", value: formatList(topPower, "totalPower"), inline: false },
        { name: "🧬 XP Tertinggi", value: formatList(topXP, "totalXP"), inline: false }
      )
      .setFooter({ text: "Update real-time berdasarkan data server" });

    message.reply({ embeds: [embed] });
  }
};
