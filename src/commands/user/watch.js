const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class Watch extends Command {
  get name() { return 'watch'; }

  get _options() { return {
    aliases: ['watchboard', 'wboard', 'wb', 'subscribeboard', 'subboard'],
    cooldown: 4,
    permissions: ['auth']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const arg = args.join(' ') || userData.currentBoard;
    const handle = await trello.handleResponse({
      response: await trello.getMember(userData.trelloID),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404) {
      await this.client.pg.models.get('user').removeAuth(message.author);
      return message.channel.createMessage(_('trello_response.unauthorized'));
    }

    const json = handle.body;

    const board = await Util.Trello.findBoard(arg, json.boards, this.client, message, _, userData);
    if (!board) return;

    if ((await trello.handleResponse({
      response: await trello.updateBoard(board.id, { subscribed: !board.subscribed }),
      client: this.client, message, _ })).stop) return;
    
    return message.channel.createMessage(
      _(board.subscribed ? 'user_mgmt.unsub_board' : 'user_mgmt.sub_board', {
        name: Util.cutoffText(Util.Escape.markdown(board.name), 50),
        id: board.shortLink
      }));
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};