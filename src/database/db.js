const { Database } = require("simpl.db");
const db = new Database({ autoSave: true, path: "./database.json" });

module.exports = db;
