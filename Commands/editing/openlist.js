const { Command } = require('faux-classes')

module.exports = class OpenList extends Command {
  get name() { return 'openlist' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board', 'trello-perm'] }
  get aliases() { return ['unarchivelist'] }
  get argRequirement() { return 1 }

  async exec(message, args, {user}) {
    let listName = args.join(' ')
    let body = await this.client.trello.get.listsArchived(user.trelloToken, user.current)
    let query = await this.client.util.query(
      message, body, 
      listName, 
      'name', item => `${item.name} (${item.cards.length} Cards)`,
      "Type the number of the list you want to open."
    )
    if(query.quit) return;
    let result = query.result;
    if(result !== null){
      await this.client.trello.set.list.closed(user.trelloToken, result.id, false)
      message.reply(`Removed list "${result.name}" from the archive.`)
    }else{
      message.reply(`No list by the name of "${listName}" was found!`)
    }
  }

  get helpMeta() { return {
    category: 'Editing',
    description: 'Removes a list from the archive.',
    usage: ["<listName>"]
  } }
}
