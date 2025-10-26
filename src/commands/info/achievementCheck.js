const db = require("../../database/db");

module.exports = {
  async checkAndUnlock(userId) {
    const before = (await db.get(`achievements_${userId}`)) || [];
    const unlocked = [...before];

    const money = (await db.get(`money_${userId}`)) || 0;
    const animals = (await db.get(`animals_${userId}`)) || [];
    const fuseCount = (await db.get(`fuseCount_${userId}`)) || 0;

    // Contoh achievement sederhana
    if (money >= 1000 && !unlocked.includes("💰 Kaya 1000")) unlocked.push("💰 Kaya 1000");
    if (animals.length >= 10 && !unlocked.includes("🐾 Kolektor 10")) unlocked.push("🐾 Kolektor 10");
    if (fuseCount >= 5 && !unlocked.includes("⚗️ Tukang Fuse")) unlocked.push("⚗️ Tukang Fuse");

    await db.set(`achievements_${userId}`, unlocked);
    return unlocked.filter(a => !before.includes(a)); // hanya yang baru
  }
};
