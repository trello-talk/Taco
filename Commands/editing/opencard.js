const { Command } = require('faux-classes')

module.exports = class OpenCard extends Command {
  get name() { return 'opencard' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board', 'trello-perm'] }
  get aliases() { return ['unarchivecard'] }
  get argRequirement() { return 1 }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.cardsArchived(user.trelloToken, user.current)
    let bid = undefined;
    Object.keys(body).map((board)=>{
      board = body[board];
      if(board.shortLink==args[0]){
        bid = board;
        bid.id = args[0];
      }
    });
    if(bid !== undefined){
      await this.client.trello.set.card.closed(user.trelloToken, bid.id, false)
      message.reply(`Removed card \`${bid.name}\` from the archive.`)
    }else{
      message.reply("Uh-Oh! Either that card ID is non-existant or it's not on the seleted board!");
    }
  }

  get helpMeta() { return {
    category: 'Editing',
    description: 'Removes a card from the archive.',
    usage: "<cardID>"
  } }
}