const Command = require('../structures/Command');

module.exports = class Ping extends Command {
  get name() { return 'ping'; }

  get _options() { return {
    aliases: ['p'],
    cooldown: 0,
  }; }

  async exec(message) {
    const currentPing = Array.from(this.client.shards.values()).map(shard => shard.latency).reduce((prev, val) => prev + val, 0);
    const timeBeforeMessage = Date.now();
    const sentMessage = await this.client.createMessage(message.channel.id, `> :ping_pong: ***Pong!***\n> WS: ${currentPing} ms`);
    await sentMessage.edit(`> :ping_pong: ***Pong!***\n> WS: ${currentPing} ms\n> REST: ${Date.now() - timeBeforeMessage} ms`);
  }

  get metadata() { return {
    category: 'General',
    description: 'Pong!',
  }; }
};
