const db = require("../../database/db");

module.exports = {
  name: "sell",
  description: "Jual hewanmu untuk mendapatkan Coin!",

  async execute(message, args) {
    const userId = message.author.id;
    const animals = (await db.get(`animals_${userId}`)) || [];

    if (animals.length === 0)
      return message.reply("❗ Kamu belum punya hewan untuk dijual! Coba cari dulu lewat `nxct hunt`.");

    if (!args[0])
      return message.reply("💰 Gunakan: `nxct sell <nomor>` — lihat daftar di `nxct inventory`.");

    const index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0 || index >= animals.length)
      return message.reply("❌ Nomor hewan tidak valid!");

    const animal = animals[index];
    const rarityValues = {
      common: 50,
      uncommon: 100,
      rare: 250,
      epic: 500,
      legendary: 1000,
      mythical: 2500
    };

    const rarityValue = rarityValues[animal.rarity?.toLowerCase()] || 0;
    const sellPrice = Math.floor(rarityValue + animal.level * 100 + animal.power * 2);

    // 🗑️ Hapus hewan dari inventory
    animals.splice(index, 1);
    await db.set(`animals_${userId}`, animals);

    // 💰 Tambahkan uang
    const money = (await db.get(`money_${userId}`)) || 0;
    const newMoney = money + sellPrice;
    await db.set(`money_${userId}`, newMoney);

    // 📊 Tambahkan counter total penjualan
    const sellCount = (await db.get(`sell_count_${userId}`)) || 0;
    await db.set(`sell_count_${userId}`, sellCount + 1);

    // 💬 Kirim hasil
    await message.reply(
      `💸 Kamu menjual **${animal.name}** (${animal.rarity.toUpperCase()}) seharga **${sellPrice} Coin**!\n` +
      `💰 Saldo sekarang: **${newMoney} Coin**`
    );

    // 🎯 Cek achievement (tanpa spam)
    const achievementCheck = require("../info/achievementCheck");
    const newlyUnlocked = await achievementCheck.checkAndUnlock(userId);

    if (newlyUnlocked.length > 0) {
      const achievementEmbed = require("../info/achievementEmbed");
      await achievementEmbed.send(message, newlyUnlocked);
    }
  }
};
