/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Trello Talk Team 2019 - 2020

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
    aliases: ['ex', 'sys'],
    permissions: ['elevated'],
    listed: false,
    minimumArgs: 1
  }; }

  codeBlock(content, lang = null) {
    return `\`\`\`${lang ? `${lang}\n` : ''}${content}\`\`\``;
  }

  async exec(message) {
    await this.client.startTyping(message.channel);
    exec(Util.Prefix.strip(message, this.client).split(' ').slice(1).join(' '), (err, stdout, stderr) => {
      this.client.stopTyping(message.channel);
      if (err) return message.channel.createMessage(this.codeBlock(err, 'js'));
      const stdErrBlock = (stderr ? this.codeBlock(stderr, 'js') + '\n' : '');
      return Util.Hastebin.autosend(stdErrBlock + this.codeBlock(stdout), message);
    });
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
