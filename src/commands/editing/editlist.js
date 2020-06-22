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
const SubMenu = require('../../structures/SubMenu');
const Util = require('../../util');

module.exports = class EditList extends Command {
  get name() { return 'editlist'; }

  get _options() { return {
    aliases: ['elist', 'el'],
    cooldown: 10,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getAllLists(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (Util.Trello.cannotUseBoard(handle)) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return message.channel.createMessage(_('boards.gone'));
    }

    const json = handle.body;
    const list = await Util.Trello.findList(args[0], json, this.client, message, _);
    if (!list) return;

    const menu = new SubMenu(this.client, message, {
      header: `**${_('words.list.one')}:** ${
        Util.cutoffText(Util.Escape.markdown(list.name), 25)} (\`${list.id}\`)\n\n` +
        _('lists.wywtd'), itemTitle: 'words.subcmd.many', _ });
    return menu.start(message.channel.id, message.author.id, args[1], [
      {
        // Name
        names: ['name', 'rename'],
        title: _('lists.menu.name'),
        async exec(client) {
          const input = args[2] || await client.messageAwaiter.getInput(message, _, {
            header: _('lists.input_name')
          });
          if (!input) return;
          if ((await trello.handleResponse({
            response: await trello.updateList(list.id, { name: input }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('lists.set_name', {
            old: Util.cutoffText(Util.Escape.markdown(list.name), 50),
            new: Util.cutoffText(Util.Escape.markdown(input), 50)
          }));
        }
      },
      {
        // Archive/Unarchive
        names: ['archive', 'unarchive', 'open', 'close'],
        title: _(list.closed ? 'lists.menu.archive_off' : 'lists.menu.archive_on'),
        async exec(client) {
          if ((await trello.handleResponse({
            response: await trello.updateList(list.id, { closed: !list.closed }),
            client, message, _ })).stop) return;
          
          return message.channel.createMessage(
            _(list.closed ? 'lists.unarchived' : 'lists.archived', {
              name: Util.cutoffText(Util.Escape.markdown(list.name), 50)
            }));
        },
      }
    ]);
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};