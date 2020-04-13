const Command = require('../../structures/Command');

module.exports = class Restart extends Command {
  get name() { return 'restart'; }

  get _options() { return {
    aliases: ['re'],
    listed: false,
  }; }

  async exec(message) {
    if(!this.client.config.elevated.includes(message.author.id)) return;
    await this.client.createMessage(message.channel.id, 'Restarting shard...');
    await this.client.dieGracefully();
    process.exit(0);
  }

  get metadata() { return {
    category: 'Developer',
    description: 'Restarts the bot.',
  }; }
};
