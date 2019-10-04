const { Command } = require("faux-classes");

module.exports = class SubscribeCard extends Command {

  get name() { return "subscribecard"; }
  get cooldown() { return 2; }
  get argRequirement() { return 1; }
  get permissions() { return ["auth"]; }
  get aliases() { return ["subcard"]; }

  async exec(message, args, { user }) {
    let body = null;
    try {
      body = await this.client.trello.get.card(user.trelloToken, args[0]);
    } catch (e) {
      if (e.response && e.response.text == "invalid id") {
        return message.reply("That ID is invalid!");
      }
    }
    let newSub = !body.subscribed;
    await this.client.trello.subscribe.card(user.trelloToken, body.id, newSub);
    message.channel.send(`You are ${newSub ? "now" : "no longer"} subcribed to card "${body.name}" \`(${body.shortLink})\``);
  }

  get helpMeta() {
    return {
      category: "User Management",
      description: "(Un)subscribes to a card.",
      usage: ["<cardID>"]
    };
  }
};
