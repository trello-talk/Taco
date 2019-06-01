const { Command } = require('faux-classes')

module.exports = class MoveCard extends Command {
  get name() { return 'movecard' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board', 'trello-perm'] }
  get argRequirement() { return 2 }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.cards(user.trelloToken, user.current)
    let card = undefined;
    Object.keys(body).map((board)=>{
      board = body[board];
      if(board.shortLink==args[0]){
        card = board;
        card.id = args[0];
      }
    });
    if(card !== undefined){
      let lists = await this.client.trello.get.lists(user.trelloToken, user.current)
      let bid = undefined;
      for(let board in lists){
        board = lists[board];
        if(board.name.toLowerCase() === args.slice(1).join(' ').slice().toLowerCase() || board.name.toLowerCase().startsWith(args.slice(1).join(' ').toLowerCase())){
          bid = board;
        }
      }
      if(bid !== undefined){
        await this.client.trell.set.card.list(user.trelloToken, card.id, bid.id)
        message.reply("Moved card "+card.name+" `("+args[0]+")` to list "+args.slice(1).join(' '))
      }else{
        message.reply("Uh-Oh! Either that list is non-existant or it's not on the seleted board!");
      }
    }else{
      message.reply("Uh-Oh! Either that card ID is non-existant or it's not on the seleted board!");
    }
  }

  get helpMeta() { return {
    category: 'Editing',
    description: 'Moves a card to the given list.',
    usage: "<cardID> <listName>"
  } }
}