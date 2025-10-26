const db = require("../../database/db");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ach",
  aliases: [ "achievement"],
  description: "Lihat daftar pencapaianmu!",

  async execute(message, action = null) {
    const userId = message.author.id;

    // 💾 Ambil data dari database
    const coins = (await db.get(`money_${userId}`)) || 0;
    const hunts = ((await db.get(`animals_${userId}`)) || []).length;
    const fuses = (await db.get(`fuse_count_${userId}`)) || 0;
    const unlocked = (await db.get(`achievements_${userId}`)) || [];

    // 🎯 Daftar achievement
    const achievements = [
      { id: "rich_1000", name: "💰 Kaya 1000", desc: "Kumpulkan 1000 Coin", progress: coins, goal: 1000 },
      { id: "rich_5000", name: "💎 Sultan Nxct", desc: "Kumpulkan 5000 Coin", progress: coins, goal: 5000 },
      { id: "hunter_10", name: "🐾 Pemburu", desc: "Lakukan 10x hunt", progress: hunts, goal: 10 },
      { id: "hunter_50", name: "🐉 Pemburu Legendaris", desc: "Lakukan 50x hunt", progress: hunts, goal: 50 },
      { id: "fuse_1", name: "⚙️ Fuse Master", desc: "Gabungkan 1 hewan melalui fuse", progress: fuses, goal: 1 },
      { id: "fuse_10", name: "⚙️ Legendary Alchemist", desc: "Lakukan 10x fuse", progress: fuses, goal: 10 },
    ];

    // 🔄 Kalau ini dipanggil oleh command lain (misal hunt, fuse, battle)
    if (action) {
      const newlyUnlocked = [];

      for (const a of achievements) {
        // Cek apakah sudah memenuhi syarat & belum didapat
        if (a.progress >= a.goal && !unlocked.includes(a.id)) {
          unlocked.push(a.id);
          newlyUnlocked.push(a);
        }
      }

      // Simpan progress & achievement baru
      await db.set(`achievements_${userId}`, unlocked);

      // Kalau ada achievement baru → tampilkan embed
      if (newlyUnlocked.length > 0) {
        const embed = new EmbedBuilder()
          .setTitle("🏆 Achievement Unlocked!")
          .setColor("#f5aaff")
          .setDescription(
            newlyUnlocked.map(a => `✅ **${a.name}** — ${a.desc}`).join("\n")
          )
          .setFooter({ text: "Keren! Kamu makin hebat di dunia Nxct!" })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      }

      return; // ⛔ Jangan tampilkan daftar kalau hanya deteksi achievement
    }

    // 📊 Kalau dipanggil manual → tampilkan daftar lengkap
    function progressBar(current, goal) {
      const filled = Math.min(10, Math.floor((current / goal) * 10));
      const empty = 10 - filled;
      return `【${"█".repeat(filled)}${"░".repeat(empty)}】`;
    }

    const lines = achievements.map(a => {
      const isUnlocked = unlocked.includes(a.id);
      if (isUnlocked) {
        return `✅ **${a.name}** — ${a.desc}\n${progressBar(a.goal, a.goal)} (${a.goal}/${a.goal})`;
      } else if (a.progress > 0) {
        return `🔓 **${a.name}** — ${a.desc}\n${progressBar(a.progress, a.goal)} (${a.progress}/${a.goal})`;
      } else {
        return `🔒 **${a.name}** — ???`;
      }
    });

    const embed = new EmbedBuilder()
      .setTitle(`🏆 Achievement ${message.author.username}`)
      .setDescription(lines.join("\n\n"))
      .setColor("#b26cf6")
      .setFooter({ text: "Gunakan hewanmu untuk membuka lebih banyak achievement!" })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
