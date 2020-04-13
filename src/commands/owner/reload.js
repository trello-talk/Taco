const Command = require('../../structures/Command');

module.exports = class Reload extends Command {
  get name() { return 'reload'; }

  get _options() { return {
    aliases: ['r'],
    listed: false,
  }; }

  canUseEmojis(message) {
    return message.channel.type === 1 || message.channel.permissionsOf(this.client.user.id).has('externalEmojis');
  }

  emojiEmbedFallback(message, customEmojiId, fallback) {
    if (this.canUseEmojis(message) && this.client.guilds.has('617911034555924502')) {
      const emoji = this.client.guilds.get('617911034555924502').emojis.find(e => e.id == customEmojiId);
      return `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`;
    } else return fallback;
  }

  async exec(message) {
    if(!this.client.config.elevated.includes(message.author.id)) return;
    const sentMessage = await this.client.createMessage(message.channel.id, `${this.emojiEmbedFallback(message, '632444546961375232', ':recycle:')} Reloading commands...`);
    this.client.cmds.reload();
    this.client.cmds.preloadAll();
    return sentMessage.edit(`${this.emojiEmbedFallback(message, '632444546684551183', ':white_check_mark:')} Reloaded commands.`);
  }

  get metadata() { return {
    category: 'Developer',
    description: 'Reload commands.',
  }; }
};
