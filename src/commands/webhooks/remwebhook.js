const prisma = require('../../prisma');
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

    const webhook = await prisma.webhook.findFirst({
      where: {
        guildID: message.guildID,
        id: requestedID
      }
    });

    if (!webhook)
      return message.channel.createMessage(_('webhook_cmd.not_found'));

    if (await this.client.messageAwaiter.confirm(message, _, {
      header: _('webhook_cmd.confirm_delete')
    })) {
      await prisma.webhook.delete({ where: { id: webhook.id } });
      
      // Remove the internal webhook if there are no more webhooks depending on it
      const trelloMember = await prisma.user.findUnique({
        where: { userID: webhook.memberID }
      });
      if (trelloMember) {
        const trello = new Trello(this.client, trelloMember.trelloToken);
        const webhookCount = await prisma.webhook.count({
          where: { trelloWebhookID: webhook.trelloWebhookID }
        });
        if (webhookCount <= 0)
          await trello.deleteWebhook(webhook.trelloWebhookID);
      }

      return message.channel.createMessage(_('webhook_cmd.deleted'));
    }
  }

  get metadata() { return {
    category: 'categories.webhook',
  }; }
};