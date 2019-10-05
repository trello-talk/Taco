const { Command } = require("faux-classes");

module.exports = class Boards extends Command {

  get name() { return "boards"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth"]; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.boards(user.trelloToken, user.trelloID);
    if (!body.boards.length)
      return message.reply("There are no found boards that you manage. You can create a board via Trello.");
    await this.client.promptList(message, body.boards, {
      header: "Use `" + this.client.config.prefix + "switch <boardID>` to switch between boards\n" +
        "Use `" + this.client.config.prefix + "boards [page]` to iterate this list",
      pluralName: "Trello Boards",
      itemsPerPage: 15,
      startPage: args[0]
    }, (board, embed) => {
      let emojis = (board.subscribed ? "🔔" : "") + (board.starred ? "⭐" : "") + (board.pinned ? "📌" : "");
      let current = board.shortLink === user.current;
      if (embed) {
        if (current)
          return `\`${board.shortLink}\` ${emojis} [${board.name} **(Current)**](${board.shortUrl})`;
        else return `\`${board.shortLink}\` ${emojis} ${board.name}`;
      } else {
        if (current)
          return `> ${board.shortLink}: ${board.name} (Current) ${emojis}`;
        else return `${board.shortLink}: ${board.name} ${emojis}`;
      }
    });
  }

  get helpMeta() {
    return {
      category: "Viewing",
      description: "Lists all of your boards.",
      usage: ["[page]"]
    };
  }
};
