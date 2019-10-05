const { Command } = require("faux-classes");

module.exports = class CloseCard extends Command {

  get name() { return "closecard"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get aliases() { return ["archivecard"]; }
  get argRequirement() { return 1; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.cards(user.trelloToken, user.current);
    let bid;
    Object.keys(body).map((board) => {
      board = body[board];
      if (board.shortLink == args[0]) {
        bid = board;
        bid.id = args[0];
      }
    });
    if (bid !== undefined) {
      await this.client.trello.set.card.closed(user.trelloToken, bid.id, true);
      message.reply(`Archived card "${bid.name}". \`(${bid.shortLink})\``);
    } else {
      message.reply("Uh-Oh! Either that card ID is non-existant or it's not on the seleted board!");
    }
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Archives a card.",
      usage: ["<cardID>"]
    };
  }
};
