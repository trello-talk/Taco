const { Command } = require('faux-classes')

module.exports = class RenameCard extends Command {
  get name() { return 'renamecard' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board', 'trello-perm'] }
  get aliases() { return ['editcardname'] }
  get argRequirement() { return 2 }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.cards(user.trelloToken, user.current)
    let bid = undefined;
    Object.keys(body).map((board)=>{
      board = body[board];
      if(board.shortLink==args[0]){
        bid = board;
        bid.id = args[0];
      }
    });
    if(bid !== undefined){
      await this.client.trello.set.card.name(user.trelloToken, args[0], args.slice(1).join(' '))
      message.reply(`Renamed card "${bid.name}" \`(${args[0]})\` to "${args.slice(1).join(' ')}"`)
    }else{
      message.reply("Uh-Oh! Either that card ID is non-existant or it's not on the seleted board!");
    }
  }

  get helpMeta() { return {
    category: 'Editing',
    description: 'Renames a card.',
    usage: "<cardID> <name>"
  } }
}