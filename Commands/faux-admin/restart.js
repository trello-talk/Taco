const { Command } = require("faux-classes");

module.exports = class Restart extends Command {

  get name() { return "restart"; }
  get permissions() { return ["elevated"]; }
  get listed() { return false; }

  async exec(message, args) {
    await message.channel.send(`Restarting shard.`);
    process.exit(0);
  }

  get helpMeta() {
    return {
      category: "Admin",
      description: "Restarts the current shard."
    };
  }
};