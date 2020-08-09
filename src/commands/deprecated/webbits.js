const Command = require('../../structures/DeprecatedCommand');

module.exports = class WebBits extends Command {
  get name() { return 'webbits'; }

  get _options() { return {
    aliases: ['bits']
  }; }

  get replacedCommandName() {
    return 'editwebhook';
  }
};
