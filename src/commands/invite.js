const Command = require('../structures/Command');

module.exports = class Invite extends Command {
  get name() { return 'invite'; }

  get _options() { return {
    aliases: ['inv'],
    cooldown: 0,
  }; }

  exec(message) {
    return this.client.createMessage(message.channel.id, 'Here is the link to invite me to other servers!\n:arrow_forward:  <https://invite.snaz.in/discordvid2>');
  }

  get metadata() { return {
    description: 'Sends the bot invite link.',
  }; }
};
