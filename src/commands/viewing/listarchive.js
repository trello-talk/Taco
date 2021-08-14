const Command = require('../../structures/Command');
const GenericPager = require('../../structures/GenericPager');
const Util = require('../../util');

module.exports = class ListArchive extends Command {
  get name() { return 'listarchive'; }

  get _options() { return {
    aliases: ['viewlistarchive', 'vla'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard'],
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getListsArchived(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (await Util.Trello.ensureBoard(handle, message, _)) return;

    const json = handle.body;

    if (json.length) {
      const paginator = new GenericPager(this.client, message, {
        items: json,
        _, header: _('lists.arch_header'), itemTitle: 'words.arch_list.many',
        display: (item) => `${item.subscribed ? '🔔 ' : ''} ${
          Util.cutoffText(Util.Escape.markdown(item.name), 50)}`
      });

      if (args[0])
        paginator.toPage(args[0]);

      return paginator.start(message.channel.id, message.author.id);
    } else
      return message.channel.createMessage(_('lists.arch_none'));
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};