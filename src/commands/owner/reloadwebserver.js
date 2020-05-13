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
const reload = require('require-reload');

module.exports = class ReloadWebServer extends Command {
  get name() { return 'reloadwebserver'; }

  get _options() { return {
    aliases: ['rws'],
    permissions: ['elevated'],
    listed: false,
  }; }

  async exec(message, { _ }) {
    if (!this.client.webserver)
      return message.channel.createMessage(_('reloadwebserver.no'));
    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const reloadingEmoji = emojiFallback('632444546961375232', '♻️', true);
    const sentMessage = await message.channel.createMessage(
      `${reloadingEmoji} ${_('reloadwebserver.reloading')}`);
    await this.client.webserver.stop();
    this.client.webserver = null;
    reload.emptyCache(require);
    this.client.webserver = new (require('../../webserver'))(this.client);
    await this.client.webserver.start();
    const reloadEmoji = emojiFallback('632444546684551183', '✅');
    return sentMessage.edit(`${reloadEmoji} ${_('reloadwebserver.done')}`);
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
