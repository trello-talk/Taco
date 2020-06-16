/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Trello Talk Team 2019 - 2020

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
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
