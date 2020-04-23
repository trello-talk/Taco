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

module.exports = class Reload extends Command {
  get name() { return 'reload'; }

  get _options() { return {
    aliases: ['r'],
    listed: false,
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

  async exec(message, { _ }) {
    if (!this.client.config.elevated.includes(message.author.id)) return;
    const reloadingEmoji = this.emojiEmbedFallback(message, '632444546961375232', ':recycle:');
    const sentMessage = await this.client.createMessage(message.channel.id,
      `${reloadingEmoji} ${_('reload.reloading')}`);
    this.client.cmds.reload();
    this.client.cmds.preloadAll();
    const reloadEmoji = this.emojiEmbedFallback(message, '632444546684551183', ':white_check_mark:');
    return sentMessage.edit(`${reloadEmoji} ${_('reload.done')}`);
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
