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
const GenericPager = require('../../structures/GenericPager');
const Util = require('../../util');

module.exports = class List extends Command {
  get name() { return 'list'; }

  get _options() { return {
    aliases: ['viewlist', 'cards', 'vl'],
    cooldown: 2,
    permissions: ['embed', 'auth', 'selectedBoard'],
    minimumArgs: 1
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getAllLists(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return this.client.createMessage(message.channel.id, _('boards.gone'));
    }

    const json = handle.body;
    const list = await Util.Trello.findList(args[0], json, this.client, message, _);
    if (!list) return;

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', ':ballot_box_with_check:');
    const uncheckEmoji = emojiFallback('632444550115491910', ':white_large_square:');

    if (list.cards.length) {
      const paginator = new GenericPager(this.client, message, {
        items: list.cards,
        _, header: (list.closed ? `🗃️ **${_('words.arch_list.one')}**\n\n` : '') +
          `**${_('words.list.one')}:** ${Util.cutoffText(Util.Escape.markdown(list.name), 50)}\n` +
          `**${_('words.id')}:** \`${list.id}\`\n` +
          `${list.subscribed ? checkEmoji : uncheckEmoji} ${_('trello.subbed')}\n\n` +
          _('lists.list_header'), itemTitle: 'words.card.many',
        display: (item) => `${item.closed ? '🗃️ ' : ''}${item.subscribed ? '🔔 ' : ''}\`${item.shortLink}\` ${
          Util.cutoffText(Util.Escape.markdown(item.name), 50)}`
      });

      if (args[1])
        paginator.toPage(args[1]);

      return paginator.start(message.channel.id, message.author.id);
    } else {
      const embed = {
        title: Util.cutoffText(Util.Escape.markdown(list.name), 256),
        color: this.client.config.embedColor,
        description: (list.closed ? `🗃️ **${_('words.arch_list.one')}**\n\n` : '') +
          `**${_('words.id')}:** \`${list.id}\`\n` +
          `${list.subscribed ? checkEmoji : uncheckEmoji} ${_('trello.subbed')}\n\n` +
          _('lists.list_none')
      };
      return message.channel.createMessage({ embed });
    }
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};