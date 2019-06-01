const { Command } = require('faux-classes')

module.exports = class Donate extends Command {
  get name() { return 'donate' }
  get cooldown() { return 0 }
  get aliases() { return ['patreon', 'paypal'] }

  exec(message) {
    message.channel.send(`Support development by donating!\n  • Monthly: **<https://patreon.com/Snazzah>**\n  • One-time: **<<https://cash.app/$Snazzah>**`)
  }

  get helpMeta() { return {
    category: 'General',
    description: 'Get the donation links for the developer.'
  } }
}