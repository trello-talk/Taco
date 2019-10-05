const { Command } = require("faux-classes");

module.exports = class ListArchive extends Command {

  get name() { return "listarchive"; }
  get aliases() { return ["archivedlists"]; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board"]; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.listsArchived(user.trelloToken, user.current);
    if (!body.length)
      return message.reply("There are no found cards in the archive.");
    await this.client.promptList(message, body, {
      header: "Use `" + this.client.config.prefix + "openlist <listName>` to unarchive that list\n" +
        "Use `" + this.client.config.prefix + "listarchive [page]` to iterate this list",
      pluralName: "Trello Archived Lists",
      itemsPerPage: 15,
      startPage: args[0]
    }, list => list.name);
  }

  get helpMeta() {
    return {
      category: "Viewing",
      description: "Lists all the archived lists in the current board.",
      usage: ["[page]"]
    };
  }
};
