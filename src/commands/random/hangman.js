const Command = require('../../structures/Command');

module.exports = class Hangman extends Command {
  get name() { return 'hangman'; }

  get _options() { return {
    cooldown: 0,
    listed: false,
  }; }

  exec(message, { _ }) {
    return message.channel.createMessage(_('responses.hangman'));
  }

  get metadata() { return {
    category: 'categories.hidden',
  }; }
};