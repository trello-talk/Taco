const Command = require('../../structures/Command');

module.exports = class Restart extends Command {
  get name() { return 'restart'; }

  get _options() { return {
    aliases: ['re'],
    permissions: ['elevated'],
    listed: false,
  }; }

  async exec(message, { _ }) {
    await message.channel.createMessage(_('responses.restart'));
    await this.client.dieGracefully();
    process.exit(0);
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
