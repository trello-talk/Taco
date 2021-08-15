const prisma = require('../../prisma');
const Command = require('../../structures/Command');

module.exports = class ClearAuth extends Command {
  get name() { return 'clearauth'; }

  get _options() { return {
    aliases: ['-auth', 'cauth'],
    cooldown: 2,
    permissions: ['auth'],
  }; }

  async exec(message, { _, trello }) {
    if (await this.client.messageAwaiter.confirm(message, _, {
      header: _('user_mgmt.clearauth_confirm')
    })) {
      await trello.invalidate();
      await prisma.user.update({
        where: { userID: message.author.id },
        data: { trelloID: null, trelloToken: null }
      });
      return message.channel.createMessage(_('user_mgmt.clearauth'));
    }
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};