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

const Command = require('../structures/Command');
const Util = require('../util');

module.exports = class Info extends Command {
  get name() { return 'info'; }

  get _options() { return {
    aliases: ['i'],
    cooldown: 0,
  }; }

  canUseEmojis(message) {
    return message.channel.type === 1 ||
      message.channel.permissionsOf(this.client.user.id).has('externalEmojis');
  }

  emojiEmbedFallback(message, customEmojiId, fallback) {
    if (this.canUseEmojis(message) && this.client.guilds.has('617911034555924502')) {
      const emoji = this.client.guilds.get('617911034555924502').emojis.find(e => e.id == customEmojiId);
      return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
    } else return fallback;
  }

  canEmbed(message) {
    return message.channel.type === 1 || message.channel.permissionsOf(this.client.user.id).has('embedLinks');
  }

  async exec(message) {
    if (!this.canEmbed(message))
      return this.client.createMessage(message.channel.id,
        'I need to be able to embed links in order to display bot information!');

    const servers = this.client.guilds.size;
    const hasWebsite = !!this.client.config.website;
    const hasTrelloBoard = this.client.config.trelloBoard;
    const hasDonationLinks = Array.isArray(this.client.config.donate) && this.client.config.donate[0];

    const boardEmoji = this.emojiEmbedFallback(message, '624184549001396225', ':blue_book:');
    const donateEmoji = this.emojiEmbedFallback(message, '625323800048828453', ':money_with_wings:');
    const embed = {
      color: this.client.config.embedColor,
      title: `Information about ${this.client.user.username}.`,
      description: 'This bot is using a modified version of [Faux](https://github.com/Snazzah/Faux)\n\n'
        + `**:computer: ${this.client.user.username} Version** ${this.client.pkg.version}\n`
        + `**:clock: Uptime**: ${process.uptime() ? Util.toHHMMSS(process.uptime().toString()) : '???'}\n`
        + `**:gear: Memory Usage**: ${(process.memoryUsage().heapUsed / 1000000).toFixed(2)} MB\n`
        + `**:file_cabinet: Servers**: ${Util.toHHMMSS(servers)}\n\n`
        + (hasWebsite ? `**:globe_with_meridians: Website**: ${this.client.config.website}\n` : '')
        + (hasTrelloBoard ? `**${boardEmoji} Trello Board**: ${this.client.config.trelloBoard}\n` : '')
        + (hasDonationLinks ? `**${donateEmoji} Donate**: ${this.client.config.donate[0]}\n` : ''),
      thumbnail: {
        url: this.client.config.iconURL
      }
    };
    return this.client.createMessage(message.channel.id, { embed });
  }

  get metadata() { return {
    category: 'General',
    description: 'Get information about the bot.',
  }; }
};