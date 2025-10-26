const db = require("../../database/db");

module.exports = {
  name: "fuse",
  description: "Gabungkan dua hewan menjadi satu yang lebih kuat!",

  async execute(message, args) {
    const userId = message.author.id;
    const animals = (await db.get(`animals_${userId}`)) || [];
    let money = (await db.get(`money_${userId}`)) || 0;

    if (animals.length < 2)
      return message.reply("❗ Kamu butuh minimal **2 hewan** untuk melakukan fuse!");

    if (args.length < 2)
      return message.reply("🧬 Gunakan: `nxct fuse <nomor1> <nomor2>`");

    const index1 = parseInt(args[0]) - 1;
    const index2 = parseInt(args[1]) - 1;

    if (
      isNaN(index1) ||
      isNaN(index2) ||
      index1 === index2 ||
      index1 < 0 ||
      index2 < 0 ||
      index1 >= animals.length ||
      index2 >= animals.length
    ) {
      return message.reply("❌ Nomor hewan tidak valid!");
    }

    const fuseCost = 500;
    if (money < fuseCost)
      return message.reply(`💰 Kamu butuh **${fuseCost} Coin** untuk melakukan fuse!`);

    const animal1 = animals[index1];
    const animal2 = animals[index2];

    // Rarity tiers
    const rarities = ["common", "uncommon", "rare", "epic", "legendary", "mythical"];
    const rarityIndex = Math.max(
      rarities.indexOf(animal1.rarity.toLowerCase()),
      rarities.indexOf(animal2.rarity.toLowerCase())
    );

    // 25% chance to upgrade rarity
    let newRarity = rarities[rarityIndex];
    if (Math.random() < 0.25 && rarityIndex < rarities.length - 1)
      newRarity = rarities[rarityIndex + 1];

    const avgPower = Math.floor((animal1.power + animal2.power) / 2);
    const bonusPower = Math.floor(Math.random() * 10 + 5); // +5~15 power bonus
    const newAnimal = {
      name: `${animal1.name}-${animal2.name}`,
      power: avgPower + bonusPower,
      rarity: newRarity,
      level: 1,
      xp: 0
    };

    // Hapus hewan lama
    const newList = animals.filter((_, i) => i !== index1 && i !== index2);
    newList.push(newAnimal);

    // Simpan perubahan
    await db.set(`animals_${userId}`, newList);
    await db.set(`money_${userId}`, money - fuseCost);

    // Tambah counter fuse (untuk achievement)
    const currentFuse = (await db.get(`fuse_count_${userId}`)) || 0;
    await db.set(`fuse_count_${userId}`, currentFuse + 1);

    message.reply(
      `🧬 **Fuse Berhasil!**\n` +
      `Kamu menggabungkan **${animal1.name}** & **${animal2.name}** menjadi:\n\n` +
      `> 🦄 **${newAnimal.name}** (${newAnimal.rarity.toUpperCase()})\n` +
      `> ⚡ Power: ${newAnimal.power}\n` +
      `> 💰 Biaya: ${fuseCost} Coin`
    );

    // 🔽 Cek achievement baru (tanpa spam)
    const before = (await db.get(`achievements_${userId}`)) || [];

    const achievementCmd = require("../economy/achievement");
    await achievementCmd.execute(message, "fuse"); // Jalankan dengan konteks fuse

    const after = (await db.get(`achievements_${userId}`)) || [];
    const newlyUnlocked = after.filter(a => !before.includes(a));

    if (newlyUnlocked.length > 0) {
      const achievementInfo = require("../info/achievementEmbed.js");
      await achievementInfo.execute(message, newlyUnlocked);
    }
  }
};
