const { Command } = require('faux-classes')

module.exports = class CreateCard extends Command {
  get name() { return 'createcard' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board', 'trello-perm'] }
  get aliases() { return ['createcard', '+card', 'ccard', 'acard'] }
  get argRequirement() { return 3 }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.lists(user.trelloToken, user.current)
    if(!args.join(" ").match(/\s\|\s/,"|")){message.channel.send(`Format is invalid!`); return;}
    let c = args.join(" ").replace(/\s\|\s/,"|").split("|");
    let cargs = c.reverse()[0].split(" ");
    let bid = undefined;
    for(let board in body){
      board = body[board];
      if(board.name.toLowerCase() === c.slice(c.length-1).join(" ").toLowerCase()){
        bid = board;
      }
    }
    if(bid !== undefined){
      let createdCard = await this.client.trello.add.card(user.trelloToken, bid.id, cargs.join(" "))
      message.reply(`Created card "${cargs.join(" ")}" \`(${createdCard.shortLink})\` in list "${bid.name}".`)
    }else message.reply("No list by the name of "+c.slice(c.length-1).join(' ')+" was found!");
  }

  get helpMeta() { return {
    category: 'Editing',
    description: 'Creates a card.',
    usage: "<listName> | <cardName>"
  } }
}