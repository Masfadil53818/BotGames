const db = require("../../database/db");

module.exports = {
  name: "inv",
  alias: "inventory",
  description: "Lihat semua hewan yang kamu miliki!",

  async execute(message) {
    const userId = message.author.id;
    const animals = await db.get(`animals_${userId}`) || [];

    if (animals.length === 0)
      return message.reply("Kamu belum punya hewan! Coba `nxct hunt`/ `nxct shop` dulu 🐾");

    const rarityColor = {
      common: "🩶",
      uncommon: "💚",
      rare: "💙",
      epic: "💜",
      legendary: "🧡",
      mythical: "❤️‍🔥"
    };

    const formatted = animals.map((a, i) => {
      const xp = a.xp || 0;
      const level = a.level || 1;
      return `${i + 1}. ${rarityColor[a.rarity]} **${a.name}** — ⚡${a.power} | ${a.rarity.toUpperCase()} | 🧬 Lv.${level} (${xp} XP)`;
    }).join("\n");

    message.reply(`📜 **Daftar Hewanmu (${animals.length})**\n\n${formatted}`);
  }
};
