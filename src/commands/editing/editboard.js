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
const SubMenu = require('../../structures/SubMenu');
const Util = require('../../util');

module.exports = class EditBoard extends Command {
  get name() { return 'editboard'; }

  get _options() { return {
    aliases: ['eboard', 'eb'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getBoard(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404) {
      await this.client.pg.models.get('user').update({ currentBoard: null },
        { where: { userID: message.author.id } });
      return this.client.createMessage(message.channel.id, _('boards.gone'));
    }

    const json = handle.body;
    const membership = json.memberships.find(ms => ms.idMember === userData.trelloID);
    const menu = new SubMenu(this.client, message, {
      header: `**${_('words.board.one')}:** ${
        Util.cutoffText(Util.Escape.markdown(json.name), 50)} (\`${json.shortLink}\`)\n\n` +
        _('boards.wywtd'), itemTitle: 'words.subcmd.many', _ });
    const menuOpts = [
      {
        // Description
        names: ['desc', 'description'],
        title: _('boards.menu.desc'),
        async exec(client) {
          const input = args[1] || await client.messageAwaiter.getInput(message, _, {
            header: _('boards.input_desc')
          });
          if (!input) return;
          if ((await trello.handleResponse({
            response: await trello.updateBoard(json.id, { desc: input }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('boards.set_desc', {
            name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
          }));
        }
      }
    ];

    if (json.desc)
      menuOpts.push({
        // Remove Description
        names: ['removedesc', 'removedescription', 'rdesc'],
        title: _('boards.menu.remove_desc'),
        async exec(client) {
          if ((await trello.handleResponse({
            response: await trello.updateBoard(json.id, { desc: '' }),
            client, message, _ })).stop) return;
          return message.channel.createMessage(_('boards.removed_desc', {
            name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
          }));
        }
      });
    
    if (membership.memberType === 'admin') {
      menuOpts.unshift({
        // Archive/Unarchive
        names: ['archive', 'unarchive', 'open', 'close'],
        title: _(json.closed ? 'boards.menu.archive_off' : 'boards.menu.archive_on'),
        async exec(client) {
          const handle = await trello.handleResponse({
            response: await trello.updateBoard(json.id, { closed: !json.closed }),
            client, message, _ });
          if (handle.body === 'unauthorized permission requested')
            return message.channel.createMessage(_('boards.need_admin'));

          return message.channel.createMessage(
            _(json.closed ? 'boards.unarchived' : 'boards.archived', {
              name: Util.cutoffText(Util.Escape.markdown(json.name), 50)
            }));
        }
      });
      menuOpts.unshift({
        // Name
        names: ['name', 'rename'],
        title: _('boards.menu.name'),
        async exec(client) {
          const input = args[1] || await client.messageAwaiter.getInput(message, _, {
            header: _('boards.input_name')
          });
          if (!input) return;

          const handle = await trello.handleResponse({
            response: await trello.updateBoard(json.id, { name: input }),
            client, message, _ });
          if (handle.body === 'unauthorized permission requested')
            return message.channel.createMessage(_('boards.need_admin'));

          return message.channel.createMessage(_('boards.set_name', {
            old: Util.cutoffText(Util.Escape.markdown(json.name), 50),
            new: Util.cutoffText(Util.Escape.markdown(input), 50)
          }));
        }
      });
    }

    return menu.start(message.channel.id, message.author.id, args[0], menuOpts);
  }

  get metadata() { return {
    category: 'categories.edit',
  }; }
};