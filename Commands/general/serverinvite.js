const { Command } = require('faux-classes')

module.exports = class ServerInvite extends Command {
  get name() { return 'serverinvite' }
  get cooldown() { return 0 }
  get aliases() { return ['support', 'supportserver'] }

  exec(message) {
    message.channel.send(`Join the support server with any of these links!\n  • **<https://trellobot.xyz/server>** • **<https://discord.gg/BueAxTB>**`)
  }

  get helpMeta() { return {
    category: 'General',
    description: 'Get the invite for the support server.'
  } }
}
