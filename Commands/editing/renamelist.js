const { Command } = require("faux-classes");

module.exports = class RenameList extends Command {

  get name() { return "renamelist"; }
  get cooldown() { return 2; }
  get permissions() { return ["auth", "board", "trello-perm"]; }
  get argRequirement() { return 3; }

  async exec(message, args, { user }) {
    let body = await this.client.trello.get.lists(user.trelloToken, user.current);
    if (!args.join(" ").match(/\s\|\s/, "|")) {
      message.channel.send(`Format is invalid!`);
      return;
    }
    let c = args.join(" ").replace(/\s\|\s/, "|").split("|");
    let oldName = c[0].trim();
    let newName = c[1].trim();
    let query = await this.client.util.query(
      message, body,
      oldName,
      "name", item => `${item.name} (${item.cards.length} Cards)`,
      "Type the number of the list you want to rename."
    );
    if (query.quit) return;
    let result = query.result;
    if (result !== null) {
      if (result.name !== newName)
        await this.client.trello.set.list.name(user.trelloToken, result.id, newName);
      message.reply(`Renamed list "${result.name}" to "${newName}".`);
    } else {
      message.reply(`No list by the name of "${oldName}" was found!`);
    }
  }

  get helpMeta() {
    return {
      category: "Editing",
      description: "Renames a list.",
      usage: ["<oldName> | <newName>"]
    };
  }
};
