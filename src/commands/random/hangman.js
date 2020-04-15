const Command = require('../../structures/Command');

module.exports = class Hangman extends Command {
  get name() { return 'hangman'; }

  get _options() { return {
    cooldown: 0,
    listed: false,
  }; }

  exec(message) {
    return this.client.createMessage(message.channel.id, "I'm not a game bot.");
  }

  get metadata() { return {
    category: 'General',
    description: '???',
  }; }
};