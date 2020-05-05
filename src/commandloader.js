/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah (and contributors) 2016-2020

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const fs = require('fs');
const path = require('path');
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
      if (stat.isSymbolicLink()) {
        const realPath = fs.readlinkSync(filePath);
        if (stat.isFile() && file.endsWith('.js')) {
          this.load(realPath);
        } else if (stat.isDirectory()) {
          this.iterateFolder(realPath);
        }
      } else if (stat.isFile() && file.endsWith('.js'))
        this.load(filePath);
      else if (stat.isDirectory())
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

  get(name) {
    let cmd = this.commands.find(c => c.name === name);
    if (cmd) return cmd;
    this.commands.forEach(c => {
      if (c.options.aliases.includes(name)) cmd = c;
    });
    return cmd;
  }

  preload(name) {
    if (!this.get(name)) return;
    this.get(name)._preload();
  }

  preloadAll() {
    this.commands.forEach(c => c._preload());
  }

  async processCooldown(message, command) {
    if (message.author.id === this.client.config.owner) return true;
    const now = Date.now() - 1;
    const cooldown = command.cooldownAbs;
    let userCD = await this.client.db.hget(`cooldowns:${message.author.id}`, command.name) || 0;
    if (userCD) userCD = parseInt(userCD);
    if (userCD + cooldown > now) return false;
    await this.client.db.hset(`cooldowns:${message.author.id}`, command.name, now);
    return true;
  }
};
