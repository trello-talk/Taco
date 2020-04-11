const config = require('config');

module.exports = class Command {
  constructor(client) {
    this.client = client;
    this.subCommands = {};
  }

  _preload() {
    if(!this.preload() && config.get('debug')) this.client.cmds.logger.info('Preloading command', this.name);
  }

  preload() {
    return true;
  }

  async _exec(message, Extra) {
    if(!this.cooldownAbs || await this.client.cmds.processCooldown(message, this)) {
      this.client.stats.bumpStat('commands');
      this.client.stats.bumpCommandStat(this.name);
      await this.exec(message, Extra);
    } else {
      const cd = await this.client.db.hget(`cooldowns:${message.author.id}`, this.name);
      message.reply(`:watch: This command needs to cool down! *(${Math.ceil(this.cooldownAbs - (Date.now() - cd))})*`);
    }
  }

  // eslint-disable-next-line no-empty-function, no-unused-vars
  exec(Message, Extra) { }

  get options() {
    const options = {
      aliases: [],
      cooldown: 2,
      listed: true,
      minimumArgs: 0,

      badArgsMessage: 'Not enough arguments!',
    };
    Object.assign(options, this._options);
    return options;
  }

  _options() { return {}; }

  get cooldownAbs() { return this.options.cooldown * 1000; }

  get metadata() {
    return {
      description: '???',
      usage: '',
    };
  }
};
