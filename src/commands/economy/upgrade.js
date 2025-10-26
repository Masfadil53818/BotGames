const db = require("../../database/db");

module.exports = {
  name: "upgrade",
  description: "Tingkatkan hewanmu agar jadi lebih kuat!",

  async execute(message, args) {
    const userId = message.author.id;
    const animals = (await db.get(`animals_${userId}`)) || [];
    const money = (await db.get(`money_${userId}`)) || 0;

    if (animals.length === 0)
      return message.reply("❗ Kamu belum punya hewan untuk di-upgrade! Coba beli di `nxct shop`.");

    if (!args[0])
      return message.reply("📈 Gunakan: `nxct upgrade <nomor>` — cek daftar hewanmu pakai `nxct inventory`.");

    const index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0 || index >= animals.length)
      return message.reply("❌ Nomor hewan tidak valid!");

    const animal = animals[index];
    const cost = animal.level * 150;

    if (money < cost)
      return message.reply(
        `💸 Kamu butuh **${cost} Coin** untuk upgrade ${animal.name} ke level ${animal.level + 1}. (Saldo: ${money})`
      );

    // 🧬 Upgrade hewan
    animal.level += 1;
    animal.power += 5;
    animal.xp = 0;

    // 💰 Update data
    animals[index] = animal;
    await db.set(`animals_${userId}`, animals);
    await db.set(`money_${userId}`, money - cost);

    // 💬 Notifikasi sukses
    await message.reply(
      `⚒️ **Upgrade Berhasil!**\n` +
      `🐾 ${animal.name} sekarang **Level ${animal.level}**!\n` +
      `⚡ Power meningkat jadi **${animal.power}**!\n` +
      `💰 Biaya: ${cost} Coin`
    );

    // 🏆 Cek achievement (anti spam)
    const achievementCheck = require("../info/achievementCheck");
    const newlyUnlocked = await achievementCheck.checkAndUnlock(userId);

    if (newlyUnlocked.length > 0) {
      const achievementEmbed = require("../info/achievementEmbed");
      await achievementEmbed.send(message, newlyUnlocked);
    }
  }
};
