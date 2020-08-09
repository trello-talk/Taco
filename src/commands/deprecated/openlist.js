const Command = require('../../structures/DeprecatedCommand');

module.exports = class OpenList extends Command {
  get name() { return 'openlist'; }

  get _options() { return {
    aliases: ['unarchivelist']
  }; }

  get replacedCommandName() {
    return 'editlist';
  }
};
