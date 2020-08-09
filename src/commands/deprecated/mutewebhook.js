const Command = require('../../structures/DeprecatedCommand');

module.exports = class MuteWebhook extends Command {
  get name() { return 'mutewebhook'; }

  get _options() { return {
    aliases: ['mwebhook', 'mute', 'm', 'mwh']
  }; }

  get replacedCommandName() {
    return 'editwebhook';
  }
};
