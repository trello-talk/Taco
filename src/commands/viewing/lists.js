const Command = require('../../structures/Command');
const GenericPager = require('../../structures/GenericPager');
const Util = require('../../util');

module.exports = class Lists extends Command {
  get name() { return 'lists'; }

  get _options() { return {
    aliases: ['viewlists', 'vls'],
    cooldown: 2,
    permissions: ['auth', 'selectedBoard'],
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getLists(userData.currentBoard),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (await Util.Trello.ensureBoard(handle, message, _)) return;

    const json = handle.body;

    if (json.length) {
      const paginator = new GenericPager(this.client, message, {
        items: json,
        _, header: _('lists.header'), itemTitle: 'words.list.many',
        display: (item) => `${
          item.subscribed ? '🔔 ' : ''}${Util.cutoffText(Util.Escape.markdown(item.name), 50)} (${
          _.toLocaleString(item.cards.length)} ${_.numSuffix('words.card', item.cards.length)})`
      });

      if (args[0])
        paginator.toPage(args[0]);

      return paginator.start(message.channel.id, message.author.id);
    } else
      return message.channel.createMessage(_('lists.none'));
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};