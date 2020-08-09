const Command = require('../../structures/DeprecatedCommand');

module.exports = class OpenCard extends Command {
  get name() { return 'opencard'; }

  get _options() { return {
    aliases: ['unarchivecard']
  }; }

  get replacedCommandName() {
    return 'editcard';
  }
};
