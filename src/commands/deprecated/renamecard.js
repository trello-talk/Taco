const Command = require('../../structures/DeprecatedCommand');

module.exports = class RenameCard extends Command {
  get name() { return 'renamecard'; }

  get _options() { return {
    aliases: ['editcardname']
  }; }

  get replacedCommandName() {
    return 'editcard';
  }
};
