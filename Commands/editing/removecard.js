const { Command } = require('faux-classes')

module.exports = class RemoveCard extends Command {
  get name() { return 'removecard' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board', 'trello-perm'] }
  get aliases() { return ['remcard', '-card', 'deletecard', 'delcard'] }
  get argRequirement() { return 1 }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.cards(user.trelloToken, user.current)
    let bid = undefined;
    Object.keys(body).map((board)=>{
      board = body[board];
      if(board.shortLink == args[0]){
        bid = board;
        bid.id = args[0];
      }
    });
    if(bid !== undefined){
      await this.client.trello.delete.card(user.trelloToken, args[0]);
      message.reply(`Deleted card "${bid.name}". \`(${args[0]})\``)
    }else{
      message.reply("Uh-Oh! Either that card ID is non-existant or it's not on the seleted board!");
    }
  }

  get helpMeta() { return {
    category: 'Editing',
    description: 'Removes a card from the board.',
    usage: "<cardID>"
  } }
}