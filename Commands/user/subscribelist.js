const { Command } = require('faux-classes')

module.exports = class SubscribeList extends Command {
  get name() { return 'subscribelist' }
  get cooldown() { return 2 }
  get argRequirement() { return 1 }
  get permissions() { return ['auth'] }
  get aliases() { return ['sublist'] }

  async exec(message, args, {user}) {
    let body = await this.client.trello.get.lists(user.trelloToken, user.current)
    let listName = args.join(' ')
    let query = await this.client.util.query(
      message, body, 
      listName, 
      'name', item => `${item.name} (${item.cards.length} Cards)`,
      "Type the number of the list you want to (un)subscribe to."
    )
    if(query.quit) return;
    let result = query.result;
    if(result !== undefined){
      let newSub = !result.subscribed
      await this.client.trello.subscribe.list(user.trelloToken, result.id, newSub);
      message.channel.send(`You are ${newSub ? "now" : "no longer"} subcribed to list "${result.name}".`)
    }else{
      message.reply(`No list by the name of "${listName}" was found!`)
    }
  }

  get helpMeta() { return {
    category: 'User Management',
    description: '(Un)subscribes to a list in the selected board.',
    usage: "<listName>"
  } }
}