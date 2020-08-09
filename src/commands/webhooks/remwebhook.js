const Command = require('../../structures/Command');
const Trello = require('../../structures/Trello');

module.exports = class RemWebhook extends Command {
  get name() { return 'remwebhook'; }

  get _options() { return {
    aliases: ['rwebhook', 'rwh', '-wh', '-webhook', 'delwebhook', 'removewebhook', 'deletewebhook'],
    cooldown: 5,
    permissions: ['embed', 'trelloRole']
  }; }

  async exec(message, { args, _ }) {
    const requestedID = parseInt(args[0]);
    if (isNaN(requestedID) || requestedID < 1)
      return message.channel.createMessage(_('webhook_cmd.invalid'));

    const webhook = await this.client.pg.models.get('webhook').findOne({ where: {
      guildID: message.guildID,
      id: requestedID
    }});

    if (!webhook)
      return message.channel.createMessage(_('webhook_cmd.not_found'));

    if (await this.client.messageAwaiter.confirm(message, _, {
      header: _('webhook_cmd.confirm_delete')
    })) {
      await this.client.pg.models.get('webhook').destroy({ where: { id: webhook.id } });
      
      // Remove the internal webhook if there are no more webhooks depending on it
      const trelloMember = await this.client.pg.models.get('user').findOne({ where: {
        trelloID: webhook.memberID
      }});
      if (trelloMember) {
        const trello = new Trello(this.client, trelloMember.trelloToken);
        const webhooks = await this.client.pg.models.get('webhook').findAll({ where: {
          trelloWebhookID: webhook.trelloWebhookID
        }});
        if (!webhooks.length)
          await trello.deleteWebhook(webhook.trelloWebhookID);
      }

      return message.channel.createMessage(_('webhook_cmd.deleted'));
    }
  }

  get metadata() { return {
    category: 'categories.webhook',
  }; }
};