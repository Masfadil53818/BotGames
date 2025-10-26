const db = require("../../database/db");

module.exports = {
  name: "daily",
  description: "Klaim hadiah harianmu!",

  async execute(message) {
    const userId = message.author.id;
    const now = Date.now();
    const lastClaim = (await db.get(`daily_${userId}`)) || 0;

    // 🕒 Cek cooldown 24 jam
    const cooldown = 24 * 60 * 60 * 1000;
    if (now - lastClaim < cooldown) {
      const remaining = cooldown - (now - lastClaim);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      return message.reply(`⏰ Kamu sudah klaim daily! Coba lagi dalam **${hours} jam ${mins} menit**.`);
    }

    // 🎁 Reward harian
    const reward = 200;
    const money = (await db.get(`money_${userId}`)) || 0;
    await db.set(`money_${userId}`, money + reward);
    await db.set(`daily_${userId}`, now);

    // 📅 Tambahkan counter harian
    const streak = (await db.get(`daily_streak_${userId}`)) || 0;
    await db.set(`daily_streak_${userId}`, streak + 1);

    // 💬 Notifikasi klaim
    await message.reply(`🎁 Kamu klaim **${reward} Coin** hari ini! 🐮`);

   // 🏆 Cek achievement (anti spam)
const achievementCheck = require("../info/achievementCheck");
const newlyUnlocked = await achievementCheck.checkAndUnlock(userId);

if (newlyUnlocked.length > 0) {
  const achievementEmbed = require("../info/achievementEmbed");
  await achievementEmbed.send(message, newlyUnlocked);
}
  }
};
