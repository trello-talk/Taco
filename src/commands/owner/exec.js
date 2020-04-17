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

const Command = require('../../structures/Command');
const Util = require('../../util');
const { exec } = require('child_process');

module.exports = class Exec extends Command {
  get name() { return 'exec'; }

  get _options() { return {
    aliases: ['ex'],
    listed: false,
  }; }

  codeBlock(content, lang = null) {
    return `\`\`\`${lang ? `${lang}\n` : ''}${content}\`\`\``;
  }

  async exec(message) {
    if (!this.client.config.elevated.includes(message.author.id)) return;
    await this.client.startTyping(message.channel);
    exec(Util.Prefix.strip(message, this.client).split(' ').slice(1).join(' '), (err, stdout, stderr) => {
      this.client.stopTyping(message.channel);
      if (err) return this.client.createMessage(message.channel.id, this.codeBlock(err, 'js'));
      const stdErrBlock = (stderr ? this.codeBlock(stderr, 'js') + '\n' : '');
      return this.client.createMessage(message.channel.id, stdErrBlock + this.codeBlock(stdout));
    });
  }

  get metadata() { return {
    category: 'Developer',
    description: 'Utilizes child_process.exec',
    usage: '<command> ...',
  }; }
};