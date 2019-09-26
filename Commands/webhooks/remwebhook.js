const { Command } = require('faux-classes')

module.exports = class RemoveWebhook extends Command {
  get name() { return 'remwebhook' }
  get cooldown() { return 1 }
  get permissions() { return ['auth', 'trello-perm'] }
  get aliases() { return ['-webhook', 'delwebhook', 'removewebhook', 'deletewebhook'] }
  get argRequirement() { return 1 }

  async exec(message, args, {user}) {
    try {
      const { webhookId } = await this.client.data.get.webhookBoard(args[0])
      const internalWebhooks = await this.client.trello.get.webhooks(user.trelloToken)

      const webhook = internalWebhooks.find(webhook => webhook.id === webhookId);
      if (!webhook || !webhook.id) throw 404;

      await this.client.trello.delete.webhook(user.trelloToken, webhook.id)
      await this.client.data.delete.webhook(message.guild.id, args[0])

      message.reply(`Deleted webhook for board \`${args[0]}\`.`);
    } catch (e) {
      if(e === 404){
        message.reply("Could not find webhook.");
      } else throw e;
    }
  }

  get helpMeta() { return {
    category: 'Webhooks',
    description: 'Deletes a webhook from a board.',
    usage: "<boardID>"
  } }
}
