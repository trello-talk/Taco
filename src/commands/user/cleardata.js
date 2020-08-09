const Command = require('../../structures/Command');

module.exports = class ClearData extends Command {
  get name() { return 'cleardata'; }

  get _options() { return {
    aliases: ['-data', 'cdata'],
    cooldown: 2,
    permissions: ['userData'],
  }; }

  async exec(message, { _, trello, userData }) {
    if (await this.client.messageAwaiter.confirm(message, _, {
      header: _('user_mgmt.cleardata_confirm')
    })) {
      if (userData.trelloToken)
        await trello.invalidate();
      await this.client.pg.models.get('user').destroy({ where: { userID: message.author.id } });
      return message.channel.createMessage(_('user_mgmt.cleardata'));
    }
  }

  get metadata() { return {
    category: 'categories.user',
  }; }
};