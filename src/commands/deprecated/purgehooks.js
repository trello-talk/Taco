const Command = require('../../structures/DeprecatedCommand');

module.exports = class PurgeHooks extends Command {
  get name() { return 'purgehooks'; }

  get _options() { return {
    aliases: ['pwh']
  }; }

  get replacedCommandName() {
    return 'editwebhook';
  }
};
