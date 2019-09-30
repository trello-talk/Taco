const { Command } = require('faux-classes')

module.exports = class Switch extends Command {
  get name() { return 'switch' }
  get cooldown() { return 2 }
  get permissions() { return ['auth'] }
  get argRequirement() { return 1 }

  async exec(message, args, {user}) {
    let boards = await this.client.trello.get.boards(user.trelloToken, user.trelloID)
    if(!boards.boards.map(b => b.shortLink).includes(args[0])){
      message.channel.send("You don't have access to that board!");
    }else{
      await this.client.data.set.user(message.author.id, { current: args[0] })
      let board = boards.boards.filter(b => b.shortLink === args[0])
      message.channel.send(`Switched board to "${board[0].name}" \`(${args[0]})\``);
    }
  }

  get helpMeta() { return {
    category: 'Viewing',
    description: 'Selects the board. View boards with the `boards` command.',
    usage: ["<boardID>"]
  } }
}
