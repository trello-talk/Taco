const { Command } = require('faux-classes')

module.exports = class OpenList extends Command {
  get name() { return 'openlist' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board', 'trello-perm'] }
  get aliases() { return ['unarchivelist'] }
  get argRequirement() { return 1 }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.listsArchived(user.trelloToken, user.current)
    let bid = undefined;
    for(let board in body){
      board = body[board];
      if(board.name.toLowerCase() === args.join(" ").toLowerCase()){
        bid = board;
      }
    }
    if(bid !== undefined){
      await this.client.trello.set.list.closed(user.trelloToken, bid.id, false)
      message.reply(`Removed list "${bid.name}" from the archive.`)
    }else{
      message.reply(`No list by the name of "${args.join(' ')}" was found!`)
    }
  }

  get helpMeta() { return {
    category: 'Editing',
    description: 'Removes a list from the archive.',
    usage: "<listName>"
  } }
}