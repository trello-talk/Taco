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

module.exports = class ReloadLocale extends Command {
  get name() { return 'reloadlocale'; }

  get _options() { return {
    aliases: ['rl'],
    permissions: ['elevated'],
    listed: false,
  }; }

  async exec(message, { _ }) {
    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const reloadingEmoji = emojiFallback('632444546961375232', ':recycle:');
    const sentMessage = await this.client.createMessage(message.channel.id,
      `${reloadingEmoji} ${_('reloadlocale.reloading')}`);
    this.client.locale.reload();
    const reloadEmoji = emojiFallback('632444546684551183', ':white_check_mark:');
    return sentMessage.edit(`${reloadEmoji} ${_('reloadlocale.done')}`);
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
