const Command = require('../../structures/Command');
const config = require('config');

module.exports = class Restart extends Command {
  get name() { return 'restart'; }

  get _options() { return {
    aliases: ['re'],
    listed: false,
  }; }

  async exec(message) {
    if(message.author.id !== config.get('owner')) return;
    await this.client.createMessage(message.channel.id, 'Restarting shard...');
    await this.client.dieGracefully();
    process.exit(0);
  }

  get metadata() { return {
    description: 'Restarts the bot.',
  }; }
};
