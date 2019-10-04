const { Command } = require("faux-classes");

module.exports = class Reload extends Command {

  get name() { return "reload"; }
  get permissions() { return ["elevated"]; }
  get listed() { return false; }

  exec(message, args) {
    message.channel.send("Reloading commands...");
    this.client.cmds.reload();
    this.client.cmds.preloadAll();
  }

  get helpMeta() {
    return {
      category: "Admin",
      description: "Reloads commands"
    };
  }
};