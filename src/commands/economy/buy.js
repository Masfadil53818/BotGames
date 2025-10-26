const db = require("../../database/db");
const { name: shopCmd } = require("./shop.js");
const shop = require("./shop.js");

const shopItems = [
  { name: "🦊 Rubah", price: 250, rarity: "uncommon", power: 35 },
  { name: "🦅 Elang", price: 500, rarity: "rare", power: 55 },
  { name: "🐉 Naga Mini", price: 1000, rarity: "epic", power: 70 },
  { name: "🔥 Phoenix", price: 2500, rarity: "legendary", power: 85 },
  { name: "🌌 Celestial Dragon", price: 5000, rarity: "mythical", power: 100 }
];

module.exports = {
  name: "buy",
  description: "Beli hewan dari toko OwO!",
  
  async execute(message, args) {
    const userId = message.author.id;
    const money = (await db.get(`money_${userId}`)) || 0;

    if (!args[0])
      return message.reply("🛒 Gunakan: `owo buy <nomor>` (cek `owo shop`)");

    const index = parseInt(args[0]) - 1;
    if (isNaN(index) || index < 0 || index >= shopItems.length)
      return message.reply("❌ Nomor item tidak valid!");

    const item = shopItems[index];
    if (money < item.price)
      return message.reply(`💸 Uangmu kurang! Kamu butuh **${item.price - money} Cowoncy** lagi.`);

    // Kurangi uang
    await db.set(`money_${userId}`, money - item.price);

    // Tambahkan hewan ke inventory
    const animals = (await db.get(`animals_${userId}`)) || [];
    animals.push({
      name: item.name,
      power: item.power,
      rarity: item.rarity,
      xp: 0,
      level: 1
    });
    await db.set(`animals_${userId}`, animals);

    message.reply(
      `✅ Kamu membeli **${item.name}** seharga 💰 ${item.price} Cowoncy!\n` +
      `🧬 Rarity: ${item.rarity.toUpperCase()} | ⚡ Power: ${item.power}`
    );
  }
};
