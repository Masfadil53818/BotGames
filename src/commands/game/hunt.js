const db = require("../../database/db");

module.exports = {
  name: "hunt",
  description: "Berburu hewan baru!",

  async execute(message) {
    const userId = message.author.id;

    // 🎲 Tentukan rarity
    const random = Math.random() * 100;
    let rarity;
    if (random < 0.5) rarity = "mythical";
    else if (random < 3) rarity = "legendary";
    else if (random < 10) rarity = "epic";
    else if (random < 25) rarity = "rare";
    else if (random < 50) rarity = "uncommon";
    else rarity = "common";

    // 🐾 Hewan per rarity
    const animalsByRarity = {
      common: ["🐇 Kelinci", "🐿️ Tupai", "🦆 Bebek", "🐍 Ular"],
      uncommon: ["🐺 Serigala", "🦊 Rubah", "🐢 Kura-kura"],
      rare: ["🦅 Elang", "🐘 Gajah", "🐅 Harimau"],
      epic: ["🐉 Naga Mini", "🦄 Unicorn", "🐲 Wyvern"],
      legendary: ["🔥 Phoenix", "❄️ Leviathan", "⚡ Raijin"],
      mythical: ["🌌 Celestial Dragon", "👼 Seraphim", "💀 Death Reaper"]
    };

    const chosen = animalsByRarity[rarity][Math.floor(Math.random() * animalsByRarity[rarity].length)];

    // ⚡ Power per rarity
    const powerRanges = {
      common: [10, 30],
      uncommon: [25, 45],
      rare: [40, 60],
      epic: [55, 75],
      legendary: [70, 90],
      mythical: [90, 120]
    };
    const [min, max] = powerRanges[rarity];
    const power = Math.floor(Math.random() * (max - min + 1)) + min;

    // 💾 Simpan hewan baru
    const animals = (await db.get(`animals_${userId}`)) || [];
    animals.push({ name: chosen, power, rarity, xp: 0, level: 1 });
    await db.set(`animals_${userId}`, animals);

    // 💰 Tambahkan Coin
    const moneyGain = Math.floor(Math.random() * 21) + 10;
    const currentMoney = (await db.get(`money_${userId}`)) || 0;
    const newMoney = currentMoney + moneyGain;
    await db.set(`money_${userId}`, newMoney);

    // 🖼️ Tampilkan hasil
    const rarityColor = {
      common: "🩶",
      uncommon: "💚",
      rare: "💙",
      epic: "💜",
      legendary: "🧡",
      mythical: "❤️‍🔥"
    };

    await message.reply(
      `${rarityColor[rarity]} | Kamu menemukan **${chosen}**!\n` +
      `🧬 Rarity: **${rarity.toUpperCase()}**\n` +
      `⚡ Power: **${power}**\n` +
      `💰 Dapat **${moneyGain} Coin** (Total: ${newMoney})`
    );

    // 🎯 Cek achievement baru (tanpa spam)
    const achievementCheck = require("../info/achievementCheck");
    const newlyUnlocked = await achievementCheck.checkAndUnlock(userId);

    if (newlyUnlocked.length > 0) {
      const achievementEmbed = require("../info/achievementEmbed");
      await achievementEmbed.send(message, newlyUnlocked);
    }
  }
};
