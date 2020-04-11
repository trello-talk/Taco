const fs = require('fs');
const path = require('path');
const config = require('config');
const logger = require('./logger')('[COMMANDS]');
const reload = require('require-reload')(require);

module.exports = class CommandLoader {
  constructor(client, cPath, debug) {
    this.commands = [];
    this.path = path.resolve(cPath);
    this.debug = debug;
    this.client = client;
    this.logger = logger;
  }

  iterateFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    files.map(file => {
      const filePath = path.join(folderPath, file);
      const stat = fs.lstatSync(filePath);
      if(stat.isSymbolicLink()) {
        const realPath = fs.readlinkSync(filePath);
        if(stat.isFile() && file.endsWith('.js')) {
          this.load(realPath);
        } else if(stat.isDirectory()) {
          this.iterateFolder(realPath);
        }
      } else if(stat.isFile() && file.endsWith('.js'))
        this.load(filePath);
      else if(stat.isDirectory())
        this.iterateFolder(filePath);
    });
  }

  load(commandPath) {
    logger.info('Loading command', commandPath);
    const cls = reload(commandPath);
    const cmd = new cls(this.client);
    cmd.path = commandPath;
    this.commands.push(cmd);
  }

  reload() {
    this.commands = [];
    this.iterateFolder(this.path);
  }

  get(name, message = null) {
    const cmds = this.commands.filter(c => {
      if(!c.options.listed && message && message.author.id !== config.get('owner')) return false;
      return true;
    });
    let cmd = cmds.find(c => c.name === name);
    if(cmd) return cmd;
    cmds.forEach(c => {
      if(c.options.aliases.includes(name)) cmd = c;
    });
    return cmd;
  }

  preload(name) {
    if(!this.get(name)) return;
    this.get(name)._preload();
  }

  preloadAll() {
    this.commands.forEach(c => c._preload());
  }

  async processCooldown(message, command) {
    if(message.author.id === config.get('owner')) return true;
    const now = Date.now() - 1;
    const cooldown = command.cooldownAbs;
    let userCD = await this.client.db.hget(`cooldowns:${message.author.id}`, command.name) || 0;
    if(userCD) userCD = parseInt(userCD);
    if(userCD + cooldown > now) return false;
    await this.client.db.hset(`cooldowns:${message.author.id}`, command.name, now);
    return true;
  }
};
