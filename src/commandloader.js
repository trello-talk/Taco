/*
This file is part of Taco

MIT License

Copyright (c) 2020 Trello Talk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const fs = require('fs');
const path = require('path');
const reload = require('require-reload')(require);

module.exports = class CommandLoader {
  constructor(client, cPath) {
    this.commands = [];
    this.path = path.resolve(cPath);
    this.client = client;
  }

  /**
   * Loads commands from a folder
   * @param {String} folderPath
   */
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

  /**
   * Loads a command
   * @param {string} commandPath
   */
  load(commandPath) {
    console.fileload('Loading command', commandPath);
    const cls = reload(commandPath);
    const cmd = new cls(this.client);
    cmd.path = commandPath;
    this.commands.push(cmd);
    return cmd;
  }

  /**
   * Reloads all commands
   */
  reload() {
    this.commands = [];
    this.iterateFolder(this.path);
  }

  /**
   * Gets a command based on it's name or alias
   * @param {string} name The command's name or alias
   */
  get(name) {
    let cmd = this.commands.find(c => c.name === name);
    if (cmd) return cmd;
    this.commands.forEach(c => {
      if (c.options.aliases.includes(name)) cmd = c;
    });
    return cmd;
  }

  /**
   * Preloads a command
   * @param {string} name The command's name or alias
   */
  preload(name) {
    if (!this.get(name)) return;
    this.get(name)._preload();
  }

  /**
   * Preloads all commands
   */
  preloadAll() {
    this.commands.forEach(c => c._preload());
  }

  /**
   * Processes the cooldown of a command
   * @param {Message} message
   * @param {Command} command
   */
  async processCooldown(message, command) {
    if (this.client.config.elevated.includes(message.author.id)) return true;
    const now = Date.now() - 1;
    const cooldown = command.cooldownAbs;
    let userCD = await this.client.db.hget(`cooldowns:${message.author.id}`, command.name) || 0;
    if (userCD) userCD = parseInt(userCD);
    if (userCD + cooldown > now) return false;
    await this.client.db.hset(`cooldowns:${message.author.id}`, command.name, now);
    return true;
  }
};
