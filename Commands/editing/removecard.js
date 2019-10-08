const { Command } = require("faux-classes");

module.exports = class RemoveCard extends Command {

  get name() { return "removecard"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get aliases() { return ["remcard", "-card", "deletecard", "delcard"]; }
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
      try {
        await message.reply(`Are you sure you want to delete the card "${bid.name}"? Type \`yes\` to confirm, anything else will cancel the deletion.`);
        let nextMessage = await this.client.awaitMessage(message);
        if (nextMessage.content == "yes") {
          await this.client.trello.delete.card(user.trelloToken, args[0]);
          message.reply(`Deleted card "${bid.name}". \`(${args[0]})\``);
        } else {
          await message.channel.send("Cancelled confirmation.");
        }
      } catch (e) {
        await message.channel.send("Cancelled confirmation due to an interruption.");
      }
    } else {
      message.reply("Uh-Oh! Either that card ID is non-existent or it's not on the selected board!");
    }
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Removes a card from the board.",
      usage: ["<cardID>"]
    };
  }
};
