const db = require("../../database/db");

module.exports = {
  name: "balance",
  aliases: ["bal", "money"],
  description: "Lihat jumlah cowoncy yang kamu miliki.",

  async execute(message) {
    const userId = message.author.id;
    const money = (await db.get(`money_${userId}`)) || 0;
    message.reply(`🐮 Kamu punya **${money} Coin**! 💰`);
  }
};
