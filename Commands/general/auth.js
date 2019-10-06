const { Command } = require("faux-classes");

module.exports = class Auth extends Command {
  get name() { return "auth"; }
  get cooldown() { return 0; }

  exec(message) {
    return message.channel.send(`Authorize your Trello account with your Discord here: **<${this.client.config.authURL}>**`);
  }

  get helpMeta() {
    return {
      category: "General",
      description: "Get the auth link."
    };
  }
};
