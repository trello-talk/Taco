const Command = require('../../structures/DeprecatedCommand');

module.exports = class EditDesc extends Command {
  get name() { return 'editdesc'; }

  get _options() { return {
    aliases: ['editdescription', 'editcarddescription', 'editcarddesc']
  }; }

  get replacedCommandName() {
    return 'editcard';
  }
};
