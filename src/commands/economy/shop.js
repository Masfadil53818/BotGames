const db = require("../../database/db");

const shopItems = [
  { name: "🦊 Rubah", price: 250, rarity: "uncommon", power: 35 },
  { name: "🦅 Elang", price: 500, rarity: "rare", power: 55 },
  { name: "🐉 Naga Mini", price: 1000, rarity: "epic", power: 70 },
  { name: "🔥 Phoenix", price: 2500, rarity: "legendary", power: 85 },
  { name: "🌌 Celestial Dragon", price: 5000, rarity: "mythical", power: 100 }
];

module.exports = {
  name: "shop",
  description: "Lihat daftar hewan yang bisa dibeli di toko.",

  async execute(message, args) {
    // kalau tanpa argumen -> tampilkan daftar
    if (!args[0]) {
      const list = shopItems
        .map((item, i) => 
          `${i + 1}. ${item.name} — 💰 ${item.price} Coin | 🧬 ${item.rarity.toUpperCase()} | ⚡ ${item.power}`
        )
        .join("\n");
      return message.reply(
        `🏪 **Toko Hewan NXCT**\n\nGunakan: \`nxct buy <nomor>\` untuk membeli.\n\n${list}`
      );
    }
  }
};
