const { Command } = require('faux-classes')

module.exports = class SubscribeList extends Command {
  get name() { return 'subscribelist' }
  get cooldown() { return 2 }
  get argRequirement() { return 1 }
  get permissions() { return ['auth'] }
  get aliases() { return ['sublist'] }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.lists(user.trelloToken, user.current)
    let bid = undefined;
    for(let board in body){
      board = body[board];
      if(board.name.toLowerCase() === args.join(" ").toLowerCase()){
        bid = board;
      }
    }
    if(bid !== undefined){
      let newSub = !bid.subscribed
      await this.client.trello.subscribe.list(user.trelloToken, bid.id, newSub);
      message.channel.send(`You are ${newSub ? "now" : "no longer"} subcribed to list "${bid.name}"`)
    }else{
      message.reply(`No list by the name of "${args.join(' ')}" was found!`)
    }
  }

  get helpMeta() { return {
    category: 'User Management',
    description: '(Un)subscribes to a list in the selected board.',
    usage: "<listName>"
  } }
}