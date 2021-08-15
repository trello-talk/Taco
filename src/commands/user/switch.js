const prisma = require('../../prisma');
const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class Switch extends Command {
  get name() { return 'switch'; }

  get _options() { return {
    aliases: ['switchboard', 'select', 'selectboard'],
    cooldown: 2,
    permissions: ['auth']
  }; }

  async exec(message, { args, _, trello, userData }) {
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

    const board = await Util.Trello.findBoard(args.join(' '), json.boards, this.client, message, _, userData);
    if (!board) return;

    await prisma.user.update({
      where: { userID: message.author.id },
      data: { currentBoard: board.id }
    });
    
    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const doneEmoji = emojiFallback('632444546684551183', ':white_check_mark:');
    return message.channel.createMessage(`${doneEmoji} ` + _('boards.switch', {
      name: Util.cutoffText(Util.Escape.markdown(board.name), 50),
      id: board.shortLink
    }));
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};