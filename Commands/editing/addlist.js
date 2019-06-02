const { Command } = require('faux-classes')

module.exports = class AddList extends Command {
  get name() { return 'addlist' }
  get cooldown() { return 2 }
  get permissions() { return ['auth', 'board', 'trello-perm'] }
  get aliases() { return ['createlist', '+list', 'clist', 'alist'] }
  get argRequirement() { return 1 }

  async exec(message, args, {user}) {
    await this.client.trello.add.list(user.trelloToken, user.current, args.join(' '))
    message.channel.send(`Added list "${args.join(' ')}".`);
  }

  get helpMeta() { return {
    category: 'Editing',
    description: 'Adds a list to the board.',
    usage: "<listName>"
  } }
}