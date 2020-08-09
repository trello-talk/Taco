const Util = require('../util');

/**
 * A command in the bot.
 */
class Command {
  /**
   * @param {TrelloBot} client
   */
  constructor(client) {
    this.client = client;
    this.subCommands = {};
  }

  /**
   * @private
   */
  _preload() {
    if (!this.preload() && this.client.config.debug)
      this.client.cmds.logger.info('Preloading command', this.name);
  }

  /**
   * The function executed while loading the command into the command handler.
   */
  preload() {
    return true;
  }

  /**
   * @private
   * @param {Message} message
   * @param {Object} opts
   */
  async _exec(message, opts) {
    // Check minimum arguments
    if (this.options.minimumArgs > 0 && opts.args.length < this.options.minimumArgs)
      return message.channel.createMessage(
        `${opts._(this.options.minimumArgsMessage)}\n${
          opts._('words.usage')}: ${opts.prefixUsed.raw}${this.name}${
          opts._.valid(`commands.${this.name}.usage`) ?
            ` \`${opts._(`commands.${this.name}.usage`)}\`` : ''}`);

    // Check commmand permissions
    if (this.options.permissions.length)
      for (const i in this.options.permissions) {
        const perm = this.options.permissions[i];
        if (!Util.CommandPermissions[perm])
          throw new Error(`Invalid command permission "${perm}"`);
        if (!Util.CommandPermissions[perm](this.client, message, opts))
          return message.channel.createMessage(opts._(`command_permissions.${perm}`));
      }

    // Process cooldown
    if (!this.cooldownAbs || await this.client.cmds.processCooldown(message, this)) {
      await this.exec(message, opts);
    } else {
      const cd = await this.client.db.hget(`cooldowns:${message.author.id}`, this.name);
      return message.channel.createMessage(
        `:watch: ${opts._('cooldown_msg', { seconds: Math.ceil(this.cooldownAbs - (Date.now() - cd))})}`);
    }
  }

  // eslint-disable-next-line no-empty-function, no-unused-vars
  exec(Message, opts) { }

  /**
   * The options for the command
   * @type {Object}
   */
  get options() {
    const options = {
      aliases: [],
      cooldown: 2,
      listed: true,
      minimumArgs: 0,
      permissions: [],

      minimumArgsMessage: 'bad_args',
    };
    Object.assign(options, this._options);
    return options;
  }

  /**
   * @private
   */
  _options() { return {}; }

  /**
   * The cooldown in milliseconnds
   * @returns {number}
   */
  get cooldownAbs() { return this.options.cooldown * 1000; }

  /**
   * The metadata for the command
   * @return {Object}
   */
  get metadata() {
    return {
      category: 'categories.misc',
    };
  }
}

module.exports = Command;