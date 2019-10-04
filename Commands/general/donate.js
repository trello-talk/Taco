const { Command } = require("faux-classes");

module.exports = class Donate extends Command {

  get name() { return "donate"; }
  get cooldown() { return 0; }
  get aliases() { return ["patreon", "paypal"]; }

  exec(message) {
    message.channel.send(`Support development by donating!\n${this.client.util.linkList(this.client.config.donate)}`);
  }

  get helpMeta() {
    return {
      category: "General",
      description: "Get the donation links for the developer."
    };
  }
};
