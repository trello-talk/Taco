const Command = require('./Command');

module.exports = class DeprecatedCommand extends Command {
  /**
   * The options for the command
   * @type {Object}
   */
  get options() {
    const options = {
      aliases: [],
      cooldown: 0,
      listed: false,
      minimumArgs: 0,
      permissions: [],

      minimumArgsMessage: 'bad_args',
    };
    Object.assign(options, this._options);
    return options;
  }

  get replacedCommandName() {
    return 'ping';
  }

  get replacedCommand() {
    return this.client.cmds.get(this.replacedCommandName);
  }

  exec(message, { _, prefixUsed }) {
    return message.channel.createMessage(`${_('deprecated')}\n*${_('use_this')}* \`${
      prefixUsed.clean}${this.replacedCommand.name}\``);
  }

  get metadata() { return {
    category: 'categories.hidden',
  }; }
};
