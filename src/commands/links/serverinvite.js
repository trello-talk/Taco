const Command = require('../../structures/Command');

module.exports = class ServerInvite extends Command {
  get name() { return 'serverinvite'; }

  get _options() { return {
    aliases: ['supportserver', 'support'],
    cooldown: 0,
  }; }

  exec(message) {
    if (Array.isArray(this.client.config.supportServers) || !this.client.config.invites[0])
      return this.client.createMessage(message.channel.id, "The bot owner hasn't supplied any support server links!");
    return this.client.createMessage(message.channel.id, `Here are the links to invite me to other servers!\n` +
      this.client.config.supportServers.map(inv => `\`▶\` <${inv}>`).join('\n'));
  }

  get metadata() { return {
    category: 'General',
    description: 'Get the invite for the support server.',
  }; }
};
