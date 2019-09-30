const { Command } = require('faux-classes')

module.exports = class CardArchive extends Command {
  get name() { return 'cardarchive' }
  get aliases() { return ['archivedcards'] }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board'] }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.cardsArchived(user.trelloToken, user.current)
    if(!body.length)
      return message.reply("There are no found cards in the archive.");
    await this.client.promptList(message, body, (card, embed) => {
      if (embed)
        return `\`${card.shortLink}\` ${card.name}`;
        else return `${card.shortLink}: ${card.name}`;
    }, {
      header: "Use `" + this.client.config.prefix + "opencard <cardID>` to unarchive that card\n" + 
        "Use `" + this.client.config.prefix + "cardarchive [page]` to iterate this list",
      pluralName: "Trello Archived Cards",
      itemsPerPage: 15,
      startPage: args[0]
    });
  }

  get helpMeta() { return {
    category: 'Viewing',
    description: 'Lists all the archived cards in the current board.',
    usage: ["[page]"]
  } }
}
