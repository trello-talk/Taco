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
const GenericPrompt = require('../../structures/GenericPrompt');
const GenericPager = require('../../structures/GenericPager');
const Util = require('../../util');

module.exports = class List extends Command {
  get name() { return 'list'; }

  get _options() { return {
    aliases: ['viewlist', 'cards'],
    cooldown: 2,
    permissions: ['embed', 'auth', 'selectedBoard'],
    minimumArgs: 1
  }; }

  async findList(query, lists, message, _) {
    if (lists.length) {
      const foundList = lists.find(list => list.id === query);
      if (foundList) return foundList;
      else {
        const prompter = new GenericPrompt(this.client, message, {
          items: lists, itemTitle: 'words.list.many',
          display: list => `${list.closed ? '🗃️ ' : ''}${
            list.subscribed ? '🔔 ' : ''}\`${list.id}\` ${Util.Escape.markdown(list.name)}`,
          _
        });
        const promptResult = await prompter.search(query,
          { channelID: message.channel.id, userID: message.author.id });
        if (promptResult && promptResult._noresults) {
          await message.channel.createMessage(_('prompt.no_search'));
          return;
        } else
          return promptResult;
      }
    } else {
      await message.channel.createMessage(_('lists.none'));
      return;
    }
  }

  async exec(message, { args, _, trello, userData }) {
    const response = await trello.getAllLists(userData.currentBoard);
    if (await trello.handleResponse({ response, client: this.client, message, _ })) return;
    if (response.status === 404) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return this.client.createMessage(message.channel.id, _('boards.gone'));
    }

    const json = await response.json();

    const list = await this.findList(args[0], json, message, _);
    if (!list) return;

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', ':ballot_box_with_check:');
    const uncheckEmoji = emojiFallback('632444550115491910', ':white_large_square:');

    if (list.cards.length) {
      const paginator = new GenericPager(this.client, message, {
        items: list.cards,
        _, header: (list.closed ? `🗃️ **${_('words.arch_list.one')}**\n\n` : '') +
          `**${_('words.list.one')}:** ${Util.Escape.markdown(list.name)}\n` +
          `**${_('words.id')}:** \`${list.id}\`\n` +
          `${list.subscribed ? checkEmoji : uncheckEmoji} ${_('trello.subbed')}\n\n` +
          _('lists.list_header'), itemTitle: 'words.card.many',
        display: (item) => `${item.closed ? '🗃️ ' : ''}${item.subscribed ? '🔔 ' : ''}\`${item.shortLink}\` ${
          Util.Escape.markdown(item.name)}`
      });

      if (args[1])
        paginator.toPage(args[1]);

      return paginator.start(message.channel.id, message.author.id);
    } else {
      const embed = {
        title: Util.Escape.markdown(list.name),
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