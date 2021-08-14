const prisma = require('../../prisma');
const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class Star extends Command {
  get name() { return 'star'; }

  get _options() { return {
    aliases: ['starboard', 'sboard', 'sb'],
    cooldown: 2,
    permissions: ['auth']
  }; }

  async exec(message, { args, _, trello, userData }) {
    const arg = args.join(' ') || userData.currentBoard;

    const handle = await trello.handleResponse({
      response: await trello.getMember(userData.trelloID),
      client: this.client, message, _ });
    if (handle.stop) return;
    if (handle.response.status === 404) {
      await prisma.user.update({
        where: { userID: message.author.id },
        data: { trelloID: null, trelloToken: null }
      });
      return message.channel.createMessage(_('trello_response.unauthorized'));
    }

    const json = handle.body;

    const board = await Util.Trello.findBoard(arg, json.boards, this.client, message, _, userData);
    if (!board) return;

    if (board.starred) {
      // Get stars
      const starHandle = await trello.handleResponse({
        response: await trello.getBoardStars(userData.trelloID),
        client: this.client, message, _ });
      if (starHandle.stop) return;
      const star = starHandle.body.find(star => star.idBoard === board.id);
      if (!star)
        return message.channel.createMessage(_('user_mgmt.star_error'));

      // Remove star
      if ((await trello.handleResponse({
        response: await trello.unstarBoard(userData.trelloID, star.id),
        client: this.client, message, _ })).stop) return;
    } else {
      if ((await trello.handleResponse({
        response: await trello.starBoard(userData.trelloID, board.id),
        client: this.client, message, _ })).stop) return;
    }
    
    return message.channel.createMessage(
      _(board.starred ? 'user_mgmt.unstar_board' : 'user_mgmt.star_board', {
        name: Util.cutoffText(Util.Escape.markdown(board.name), 50),
        id: board.shortLink
      }));
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};