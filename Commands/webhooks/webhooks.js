const { Command } = require("faux-classes");

module.exports = class Webhooks extends Command {

  get name() { return "webhooks"; }
  get cooldown() { return 1; }
  get aliases() { return ["allwebhooks"]; }
  get permissions() { return ["trello-perm"]; }

  toOrigin(str) {
    return Object.keys(this.client.util.TrelloEvents).filter(t => t.toLowerCase() == str.toLowerCase())[0];
  }

  async exec(message, args) {
    let webhooks = await this.client.data.get.webhooksOf(message.guild.id);
    if (webhooks.length !== 0) {
      await this.client.promptList(message, webhooks, (webhook, embed) => {
        let bits = webhook.bits.map(bit => embed ? `\`${this.toOrigin(bit)}\`` : this.toOrigin(bit)).join(", ");
        if (webhook.bits.length === 0)
          bits = embed ? "*\`[all]\`*" : "[all]";
        if (embed) {
          return `**Board \`${webhook.board}\`**\n-  Bits: ${bits}`;
        } else {
          return `Board ${webhook.board}\n  Bits: ${bits}`;
        }
      }, {
        header: "Use `" + this.client.config.prefix + "webhooks [page]` to iterate this list",
        pluralName: "Trello Webhooks",
        itemsPerPage: 3,
        startPage: args[0]
      });
    } else {
      message.reply("Could not find any active webhooks. `" + this.client.config.prefix + "help addwebhook` to learn how to create one!");
    }
  }

  get helpMeta() {
    return {
      category: "Webhooks",
      description: "List webhook bits.",
      usage: ["[page]"]
    };
  }
};
