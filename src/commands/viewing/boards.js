const Command = require('../../structures/Command');
const GenericPager = require('../../structures/GenericPager');
const Util = require('../../util');

module.exports = class Boards extends Command {
  get name() { return 'boards'; }

  get _options() { return {
    aliases: ['viewboards', 'vbs'],
    cooldown: 2,
    permissions: ['auth'],
  }; }

  async exec(message, { args, _, trello, userData }) {
    const handle = await trello.handleResponse({
      response: await trello.getMember(userData.trelloID),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404) {
      await this.client.pg.models.get('user').removeAuth(message.author);
      return message.channel.createMessage(_('trello_response.unauthorized'));
    }

    const json = handle.body;

    if (json.boards.length) {
      const paginator = new GenericPager(this.client, message, {
        items: json.boards,
        _, header: _('boards.header'), itemTitle: 'words.trello_board.many',
        display: (item) => `${item.closed ? '🗃️ ' : ''}${item.subscribed ? '🔔 ' : ''}${
          item.starred ? '⭐ ' : ''}\`${item.shortLink}\` ${
          Util.cutoffText(Util.Escape.markdown(item.name), 50)}`
      });

      if (args[0])
        paginator.toPage(args[0]);

      return paginator.start(message.channel.id, message.author.id);
    } else {
      // Remove current board
      if (userData.currentBoard)
        await this.client.pg.models.get('user').update({ currentBoard: null },
          { where: { userID: message.author.id } });

      return message.channel.createMessage(_('boards.none'));
    }
  }

  get metadata() { return {
    category: 'categories.view',
  }; }
};