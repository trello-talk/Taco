const Command = require('../../structures/DeprecatedCommand');

module.exports = class CloseList extends Command {
  get name() { return 'closelist'; }

  get _options() { return {
    aliases: ['archivelist']
  }; }

  get replacedCommandName() {
    return 'editlist';
  }
};
