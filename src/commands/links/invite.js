const Command = require('../../structures/Command');

module.exports = class Invite extends Command {
  get name() { return 'invite'; }

  get _options() { return {
    aliases: ['inv', 'botinvite'],
    cooldown: 0,
  }; }

  exec(message) {
    if (!Array.isArray(this.client.config.invites) || !this.client.config.invites[0])
      return this.client.createMessage(message.channel.id, "The bot owner hasn't supplied any invite links!");
    return this.client.createMessage(message.channel.id, `Here are the links to invite me to other servers!\n` +
      this.client.config.invites.map(inv => `\`▶\` <${inv}>`).join('\n'));
  }

  get metadata() { return {
    category: 'General',
    description: 'Sends the bot invite link.',
  }; }
};
