const { Command } = require("faux-classes");

module.exports = class SubscribeBoard extends Command {

  get name() { return "subscribeboard"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board"]; }
  get aliases() { return ["subboard"]; }

  async exec(message, args, { user }) {
    let board = await this.client.trello.get.board(user.trelloToken, user.current);
    let newSub = !board.subscribed;
    await this.client.trello.subscribe.board(user.trelloToken, board.id, newSub);
    message.channel.send(`You are ${newSub ? "now" : "no longer"} subcribed to "${board.name}" \`(${board.shortLink})\``);
  }

  get helpMeta() {
    return {
      category: "User Management",
      description: "(Un)subscribes to the selected board."
    };
  }
};