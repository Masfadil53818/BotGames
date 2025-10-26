const db = require("../../database/db");

module.exports = {
  name: "battle",
  description: "Adu hewanmu dengan hewan orang lain!",

  async execute(message) {
    const opponent = message.mentions.users.first();
    if (!opponent)
      return message.reply("❗ Tag lawan yang ingin kamu tantang!");

    const userAnimals = (await db.get(`animals_${message.author.id}`)) || [];
    const oppAnimals = (await db.get(`animals_${opponent.id}`)) || [];

    if (userAnimals.length === 0)
      return message.reply("Kamu belum punya hewan! Gunakan `nxct hunt` dulu 🐾");
    if (oppAnimals.length === 0)
      return message.reply(`${opponent.username} belum punya hewan!`);

    const userAnimal = userAnimals[Math.floor(Math.random() * userAnimals.length)];
    const oppAnimal = oppAnimals[Math.floor(Math.random() * oppAnimals.length)];

    const rarityBonus = {
      common: 1.0,
      uncommon: 1.1,
      rare: 1.2,
      epic: 1.3,
      legendary: 1.4,
      mythical: 1.6
    };

    const userPower = Math.floor(userAnimal.power * rarityBonus[userAnimal.rarity]);
    const oppPower = Math.floor(oppAnimal.power * rarityBonus[oppAnimal.rarity]);

    const winner = userPower > oppPower ? message.author : opponent;
    const loser = winner.id === message.author.id ? opponent : message.author;
    const winnerAnimal = winner.id === message.author.id ? userAnimal : oppAnimal;

    const emoji = {
      common: "🩶",
      uncommon: "💚",
      rare: "💙",
      epic: "💜",
      legendary: "🧡",
      mythical: "❤️‍🔥"
    };

    // 🧬 Tambahkan XP
    const xpGain = Math.floor(Math.random() * 21) + 20;
    winnerAnimal.xp = (winnerAnimal.xp || 0) + xpGain;

    // 💰 Tambah Coin
    const moneyGain = Math.floor(Math.random() * 31) + 20;
    const currentMoney = (await db.get(`money_${winner.id}`)) || 0;
    await db.set(`money_${winner.id}`, currentMoney + moneyGain);

    // 📈 Level Up
    const levelUpThreshold = winnerAnimal.level * 50;
    let levelUp = false;
    if (winnerAnimal.xp >= levelUpThreshold) {
      winnerAnimal.xp -= levelUpThreshold;
      winnerAnimal.level += 1;
      winnerAnimal.power += 3;
      levelUp = true;
    }

    // 🗂️ Simpan hewan pemenang
    const winnerAnimals = await db.get(`animals_${winner.id}`);
    const index = winnerAnimals.findIndex(
      a => a.name === winnerAnimal.name && a.rarity === winnerAnimal.rarity
    );
    if (index !== -1) winnerAnimals[index] = winnerAnimal;
    await db.set(`animals_${winner.id}`, winnerAnimals);

    // 🏆 Tambah total battle win
    const winCount = (await db.get(`battle_wins_${winner.id}`)) || 0;
    await db.set(`battle_wins_${winner.id}`, winCount + 1);

    // 💬 Kirim hasil
    let msg =
      `⚔️ **Pertarungan Dimulai!**\n\n` +
      `${message.author.username} mengeluarkan ${emoji[userAnimal.rarity]} **${userAnimal.name}** (${userPower})\n` +
      `${opponent.username} mengeluarkan ${emoji[oppAnimal.rarity]} **${oppAnimal.name}** (${oppPower})\n\n` +
      `🏆 **${winner.username} menang!** 😎\n` +
      `🧬 ${winnerAnimal.name} mendapat **${xpGain} XP**`;

    if (levelUp)
      msg += `\n✨ ${winnerAnimal.name} naik ke **Level ${winnerAnimal.level}**! (+3 Power)`;

    msg += `\n💰 ${winner.username} mendapat **${moneyGain} Coin**!`;

    await message.reply(msg);

    // 🎯 Cek Achievement (tanpa spam)
    const achievementCheck = require("../info/achievementCheck");
    const newlyUnlocked = await achievementCheck.checkAndUnlock(winner.id);

    if (newlyUnlocked.length > 0) {
      const achievementEmbed = require("../info/achievementEmbed");
      await achievementEmbed.send(message, newlyUnlocked);
    }
  }
};
