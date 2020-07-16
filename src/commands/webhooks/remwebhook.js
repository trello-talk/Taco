/*
This file is part of Taco

MIT License

Copyright (c) 2020 Trello Talk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

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