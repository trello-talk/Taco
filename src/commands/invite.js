const Command = require('../structures/Command');

module.exports = class Invite extends Command {
  get name() { return 'invite'; }

  get _options() { return {
    aliases: ['inv'],
    cooldown: 0,
  }; }

  exec(message) {
    return this.client.createMessage(message.channel.id, 'Here is the link to invite me to other servers!\n:arrow_forward:  <https://trellobot.xyz/bot>');
  }

  get metadata() { return {
    category: 'General',
    description: 'Sends the bot invite link.',
  }; }
};
