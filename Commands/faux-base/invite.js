const { Command } = require('faux-classes')

module.exports = class Invite extends Command {
  get name() { return 'invite' }
  get aliases() { return ['✉', 'botinvite', 'botinv', 'inv'] }
  get cooldown() { return 0 }

  exec(message) {
    message.channel.send(`Invite me with any of these links!\n${this.client.util.linkList(this.client.config.invites)}`)
  }

  get helpMeta() { return {
    category: 'General',
    description: 'Gets the bot invite link.'
  } }
}
