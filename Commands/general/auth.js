const { Command } = require("faux-classes");

module.exports = class Auth extends Command {
  get name() { return "auth"; }
  get cooldown() { return 0; }

  async exec(message) {
    const userId = message.author.id;
    const currentAuth = await this.client.data.get.user(userId);
    if (currentAuth === null) return message.channel.send(`Authorize your Trello account with your Discord here: **<${this.client.config.authURL}>**`);
    await message.reply("Your account is already authorized with Trello! To connect to a different Trello account, please clear your current authorization with `T!clearauth`, and run this command again")
  }

  get helpMeta() {
    return {
      category: "General",
      description: "Get the auth link."
    };
  }
};
