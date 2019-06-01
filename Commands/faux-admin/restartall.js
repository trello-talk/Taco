const { Command } = require('faux-classes')

module.exports = class RestartAll extends Command {
  get name() { return 'restartall' }

  async exec(message, args) {
    if(!this.client.isSharded()) return message.reply('The bot is not sharded.')
    await message.channel.send(`Restarting all shards.`)
    this.client.shard.broadcastEval("process.exit(0)");
  }

  get permissions() { return ['elevated'] }
  get listed() { return false }

  get helpMeta() { return {
    category: 'Admin',
    description: 'Restarts the all shards.',
  } }
}