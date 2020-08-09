const Command = require('../../structures/DeprecatedCommand');

module.exports = class UnmuteWebhook extends Command {
  get name() { return 'unmutewebhook'; }

  get _options() { return {
    aliases: ['umwebhook', 'unmute', 'um', 'umwh']
  }; }

  get replacedCommandName() {
    return 'editwebhook';
  }
};
