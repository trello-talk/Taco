const { Command } = require("faux-classes");

module.exports = class MoveCard extends Command {

  get name() { return "movecard"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get argRequirement() { return 2; }
  async exec(message, args, { user }) {
    let body = await this.client.trello.get.cards(user.trelloToken, user.current);
    let card = undefined;
    let listName = args.slice(1).join(" ");
    Object.keys(body).map((board) => {
      board = body[board];
      if (board.shortLink == args[0]) {
        card = board;
        card.id = args[0];
      }
    });
    if (card !== undefined) {
      let lists = await this.client.trello.get.lists(user.trelloToken, user.current);
      let query = await this.client.util.query(
        message, lists,
        listName,
        "name", item => `${item.name} (${item.cards.length} Cards)`,
        "Type the number of the list you want to move the card to."
      );
      if (query.quit) return;
      let result = query.result;
      if (result !== null) {
        await this.client.trello.set.card.list(user.trelloToken, card.id, result.id);
        message.reply(`Moved card "${card.name}" \`(${args[0]})\` to list "${result.name}".`);
      } else {
        message.reply("Uh-Oh! Either that list is non-existent or it's not on the selected board!");
      }
    } else {
      message.reply("Uh-Oh! Either that card ID is non-existent or it's not on the selected board!");
    }
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Moves a card to the given list.",
      usage: ["<cardID> <listName>"]
    };
  }
};
