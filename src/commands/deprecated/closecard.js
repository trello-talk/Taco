const Command = require('../../structures/DeprecatedCommand');

module.exports = class CloseCard extends Command {
  get name() { return 'closecard'; }

  get _options() { return {
    aliases: ['archivecard']
  }; }

  get replacedCommandName() {
    return 'editcard';
  }
};
