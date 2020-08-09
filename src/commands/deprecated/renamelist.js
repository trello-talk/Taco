const Command = require('../../structures/DeprecatedCommand');

module.exports = class RenameList extends Command {
  get name() { return 'renamelist'; }

  get replacedCommandName() {
    return 'editlist';
  }
};
