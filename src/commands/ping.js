const Command = require('../structures/Command');

module.exports = class Ping extends Command {
  get name() { return 'ping'; }

  get _options() { return {
    aliases: ['p', 'pong'],
    cooldown: 0,
  }; }

  async exec(message, { _ }) {
    const currentPing = Array.from(this.client.shards.values())
      .map(shard => shard.latency).reduce((prev, val) => prev + val, 0);
    const timeBeforeMessage = Date.now();
    const sentMessage = await message.channel.createMessage(`> :ping_pong: ***${_('ping.message')}***\n` +
      `> WS: ${_.toLocaleString(currentPing)} ms`);
    await sentMessage.edit(
      `> :ping_pong: ***${_('ping.message')}***\n` +
      `> WS: ${_.toLocaleString(currentPing)} ms\n` +
      `> REST: ${_.toLocaleString(Date.now() - timeBeforeMessage)} ms`);
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
