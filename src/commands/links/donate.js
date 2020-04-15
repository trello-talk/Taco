const Command = require('../../structures/Command');

module.exports = class Donate extends Command {
  get name() { return 'donate'; }

  get _options() { return {
    aliases: ['patreon', 'paypal'],
    cooldown: 0,
  }; }

  exec(message) {
    if (Array.isArray(this.client.config.donate) || !this.client.config.donate[0])
      return this.client.createMessage(message.channel.id, "The bot owner hasn't supplied any donation links!");
    return this.client.createMessage(message.channel.id, `Support development by donating!\n` +
      this.client.config.donate.map(inv => `\`▶\` <${inv}>`).join('\n'));
  }

  get metadata() { return {
    category: 'General',
    description: 'Get the donation links for the developer.',
  }; }
};
