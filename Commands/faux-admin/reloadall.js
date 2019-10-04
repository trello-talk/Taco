const { Command } = require("faux-classes");

module.exports = class ReloadAll extends Command {
  get name() { return "reloadall"; }
  get permissions() { return ["elevated"]; }
  get listed() { return false; }

  async exec(message, args) {
    if (!this.client.isSharded()) return message.reply("The bot is not sharded.");
    let m = await message.channel.send(`Reloading commands in all shards.`);
    await this.client.shard.broadcastEval("this.cmds.reload(); this.cmds.preloadAll();");
    m.edit(`Reloaded commands in all shards.`);
  }

  get helpMeta() {
    return {
      category: "Admin",
      description: "Reloads commands in all shards"
    };
  }
};