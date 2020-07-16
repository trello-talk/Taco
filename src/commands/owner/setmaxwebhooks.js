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
const Util = require('../../util');

module.exports = class SetMaxWebhooks extends Command {
  get name() { return 'setmaxwebhooks'; }

  get _options() { return {
    aliases: ['smw', 'smwh'],
    permissions: ['elevated'],
    minimumArgs: 1,
    listed: false,
  }; }

  async exec(message, { args, _ }) {
    const idRegex = /^\d{17,18}$/;
    const targetID = args[0];
    
    if (!idRegex.test(targetID))
      return message.channel.createMessage(_('setmaxwebhooks.invalid'));

    const webhookLimit = parseInt(args[1]) || 5;
    // Create a row if there is none
    await this.client.pg.models.get('server').get({ id: targetID });
    const emojiFallback = Util.emojiFallback({ client: this.client, message });

    await this.client.pg.models.get('server').update({ maxWebhooks: webhookLimit },
      { where: { serverID: targetID } });

    const doneEmoji = emojiFallback('632444546684551183', '✅');
    return message.channel.createMessage(`${doneEmoji} ` +
      _('setmaxwebhooks.set', { serverID: targetID, value: webhookLimit }));
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
