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