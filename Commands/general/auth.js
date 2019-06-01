const { Command } = require('faux-classes')

module.exports = class Auth extends Command {
  get name() { return 'auth' }
  get cooldown() { return 0 }

  exec(message) {
    message.channel.send(`Authenticate your Trello account with your Discord here: **<https://api.snazzah-is.cool/trello/auth>**`)
  }

  get helpMeta() { return {
    category: 'General',
    description: 'Get the auth link.'
  } }
}