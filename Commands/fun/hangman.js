const { Command } = require('faux-classes')

module.exports = class HangMan extends Command {
  get name() { return 'hangman' }
  get cooldown() { return 0 }
  get listed() { return false }

  exec(message) {
    message.channel.send(`I'm not a game bot.`)
  }

  get helpMeta() { return {
    category: 'Misc',
    description: '?????'
  } }
}