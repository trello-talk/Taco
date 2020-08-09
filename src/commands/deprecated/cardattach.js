const Command = require('../../structures/DeprecatedCommand');

module.exports = class CardAttach extends Command {
  get name() { return 'cardattach'; }

  get _options() { return {
    aliases: ['attachfile', 'addattachment', '+attachment', '+file', 'addfile']
  }; }

  get replacedCommandName() {
    return 'editcard';
  }
};
