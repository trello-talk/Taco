const { Command } = require('faux-classes')

module.exports = class Invite extends Command {
  get name() { return 'invite' }
  get aliases() { return ['✉', 'botinvite', 'botinv', 'inv'] }
  get cooldown() { return 0 }

  exec(message) {
    message.channel.send(`Invite me with any of these links!\n  • **<https://bot.discord.io/trello>**\n  • **<https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot>**`)
  }

  get helpMeta() { return {
    category: 'General',
    description: 'Gets the bot invite link.'
  } }
}