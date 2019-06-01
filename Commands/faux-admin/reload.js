const { Command } = require('faux-classes')

module.exports = class Reload extends Command {
  get name() { return 'reload' }

  exec(message, args) {
    message.channel.send("Reloading commands...")
    this.client.cmds.reload()
    this.client.cmds.preloadAll()
  }

  get permissions() { return ['elevated'] }
  get listed() { return false }

  get helpMeta() { return {
    category: 'Admin',
    description: 'Reloads commands',
  } }
}