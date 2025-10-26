const db = require("../../database/db");

module.exports = {
  name: "profile",
  description: "Lihat profil dan statistikmu!",
  async execute(message) {
    const user = message.author;

    // Ambil data dasar
    const animals = db.get(`animals_${user.id}`) || [];
    const totalHunt = db.get(`stats_${user.id}.hunt`) || 0;
    const totalBattle = db.get(`stats_${user.id}.battle`) || 0;
    const totalWin = db.get(`stats_${user.id}.win`) || 0;

    // Hitung total power
    const totalPower = animals.reduce((sum, a) => sum + (a.power || 0), 0);

    message.reply(
      `📜 **Profil ${user.username}**\n\n` +
      `🦊 Hewan dimiliki: **${animals.length}**\n` +
      `💪 Total Power: **${totalPower}**\n` +
      `🎯 Total Hunt: **${totalHunt}**\n` +
      `⚔️ Total Battle: **${totalBattle}**\n` +
      `🏆 Total Menang: **${totalWin}**`
    );
  }
};
