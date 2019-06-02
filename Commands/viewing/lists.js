const { Command } = require('faux-classes')

module.exports = class Lists extends Command {
  get name() { return 'lists' }
  get cooldown() { return 2 }
  get permissions() { return ['auth'] }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.lists(user.trelloToken, user.current)
    this.client.promptList(message, body, (list, embed) => {
      let emojis = (list.subscribed ? "🔔" : "")
      if(embed)
        return `${list.name} ${emojis} *(${list.cards.length} Cards)*`;
        else return `${list.name} ${emojis} (${list.cards.length} Cards)`;
    }, {
      header: "Use `" + this.client.config.prefix + "viewlist <listName>` to see all cards in that list\n" + 
        "Use `" + this.client.config.prefix + "lists [page]` to iterate this list",
      pluralName: "Trello Lists",
      itemsPerPage: 15,
      startPage: args[0]
    });
  }

  get helpMeta() { return {
    category: 'Viewing',
    description: 'Lists all the lists in the current board.',
    usage: "[page]"
  } }
}