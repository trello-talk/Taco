/* global BigInt */
/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah (and contributors) 2016-2020

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
const WebhookFilters = require('../../structures/WebhookFilters');
const Util = require('../../util');

module.exports = class Webhook extends Command {
  get name() { return 'webhook'; }

  get _options() { return {
    aliases: ['wh'],
    cooldown: 4,
    permissions: ['embed', 'webhooks', 'trelloRole'],
    minimumArgs: 1
  }; }

  async exec(message, { args, _ }) {
    const requestedID = parseInt(args[0]);
    if (isNaN(requestedID) || requestedID < 1)
      return this.client.createMessage(message.channel.id, _('webhook_cmd.invalid'));

    const webhook = await this.client.pg.models.get('webhook').findOne({ where: {
      guildID: message.guildID,
      id: requestedID
    }});

    if (!webhook)
      return this.client.createMessage(message.channel.id, _('webhook_cmd.not_found'));

    const trelloMember = await this.client.pg.models.get('user').findOne({ where: {
      trelloID: webhook.memberID
    }});

    const discordWebhook = (await message.channel.guild.getWebhooks())
      .find(dwh => dwh.id === webhook.webhookID);

    const filters = (new WebhookFilters(BigInt(webhook.filters))).toArray();

    const emojiFallback = Util.emojiFallback({ client: this.client, message });
    const checkEmoji = emojiFallback('632444546684551183', '☑️');
    const uncheckEmoji = emojiFallback('632444550115491910', '⬜');

    const embed = {
      color: this.client.config.embedColor,
      description: `**${_('webhook_cmd.model_filter')}:** ${
        _(webhook.whitelist ? 'webhook_cmd.whitelist' : 'webhook_cmd.blacklist')}\n` +
        `${webhook.active ? checkEmoji : uncheckEmoji} ${_('words.active')}\n\n` +
        `${_.toLocaleString(webhook.lists.length)} ${
          _.numSuffix('webhook_cmd.filtered_list', webhook.lists.length)}\n` +
        `${_.toLocaleString(webhook.cards.length)} ${
          _.numSuffix('webhook_cmd.filtered_card', webhook.cards.length)}\n` +
        `${_.toLocaleString(filters.length)} ${
          _.numSuffix('webhook_cmd.allowed_actions', filters.length)}`,
      fields: []
    };

    embed.fields.push({
      name: '*' + _('webhook_cmd.discord_webhook') + '*',
      value: discordWebhook ? `**${_('words.id')}:** \`${discordWebhook.id}\`\n` +
        `**${_('words.name.one')}:** ${Util.cutoffText(Util.Escape.markdown(discordWebhook.name), 50)}\n` +
        `**${_('words.channel.one')}:** <#${discordWebhook.channel_id}>\n` +
        `**${_('webhook_cmd.owned_by')}:** <@${discordWebhook.user.id}> (${
          Util.Escape.markdown(discordWebhook.user.username)}#${discordWebhook.user.discriminator})` :
        `🛑 **${_('webhook_cmd.dwh_missing')}**\n` + _('webhook_cmd.try_repair'),
      inline: true
    });

    embed.fields.push({
      name: '*' + _('webhook_cmd.trello_webhook') + '*',
      value: `**${_('words.id')}:** \`${webhook.trelloWebhookID}\`\n` +
        `**${_('words.board.one')}:** \`${webhook.modelID}\`\n` +
        (trelloMember ? `**${_('webhook_cmd.owned_by')}:** <@${trelloMember.userID}>` :
          `🛑 **${_('webhook_cmd.twh_missing')}**\n` + _('webhook_cmd.try_repair')),
      inline: true
    });

    return message.channel.createMessage({ embed });
  }

  get metadata() { return {
    category: 'categories.webhook',
  }; }
};