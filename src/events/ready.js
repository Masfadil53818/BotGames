module.exports = {
  name: "clientReady",
  execute(client) {
    console.log(`✅ ${client.user.tag} sudah online!`);
  }
};
