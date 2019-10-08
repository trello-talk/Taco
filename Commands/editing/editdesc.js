const { Command } = require("faux-classes");

module.exports = class EditDesc extends Command {

  get name() { return "editdesc"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get aliases() { return ["editdescription", "editcarddescription", "editcarddesc"]; }
  get argRequirement() { return 1; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.cards(user.trelloToken, user.current);
    let bid = undefined;
    Object.keys(body).map((board) => {
      board = body[board];
      if (board.shortLink == args[0]) {
        bid = board;
        bid.id = args[0];
      }
    });
    if (bid !== undefined) {
      await this.client.trello.set.card.description(user.trelloToken, args[0], args.slice(1).join(" "));
      message.reply(`${args.slice(1).join(" ") == "" ? "Removed" : "Edited"} description of card "${bid.name}". \`${bid.shortLink}\``);
    } else {
      message.reply("Uh-Oh! Either that card ID is non-existent or it's not on the selected board!");
    }
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Edits a card's description.",
      usage: ["<cardID> [description]"]
    };
  }
};
