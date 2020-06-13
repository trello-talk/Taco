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
const GenericPager = require('../../structures/GenericPager');
const Util = require('../../util');

module.exports = class Webhooks extends Command {
  get name() { return 'webhooks'; }

  get _options() { return {
    aliases: ['whs'],
    cooldown: 4,
    permissions: ['embed', 'webhooks', 'trelloRole']
  }; }

  async exec(message, { args, _ }) {
    const discordWebhooks = await message.channel.guild.getWebhooks();
    const webhooks = await this.client.pg.models.get('webhook').findAll({ where: {
      guildID: message.guildID
    }})
      .map(wh => wh.get({ plain: true }))
      .map(wh => ({
        ...wh,
        discordWebhook: discordWebhooks.find(dwh => dwh.id === wh.webhookID)
      }));

    if (!webhooks.length)
      return message.channel.createMessage(_('webhook_cmd.none'));

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', '☑️');
    const uncheckEmoji = emojiFallback('632444550115491910', '⬜');

    const paginator = new GenericPager(this.client, message, {
      items: webhooks,
      _, header: _('webhook_cmd.header'), itemTitle: 'words.webhook.many',
      display: (item) => {
        let result = `${item.active ? checkEmoji : uncheckEmoji} \`ID: ${item.id}\` `;
        
        if (item.discordWebhook)
          result += `${
            Util.cutoffText(Util.Escape.markdown(item.discordWebhook.name), 50)} ` + 
            `(<@${item.discordWebhook.user.id}>)`;
        else
          result += `[${_('webhook_cmd.unknown')}] (${_('words.board.one')} \`${item.modelID}\`)`;

        return result;
      }
    });

    if (args[0])
      paginator.toPage(args[0]);

    return paginator.start(message.channel.id, message.author.id);
  }

  get metadata() { return {
    category: 'categories.webhook',
  }; }
};