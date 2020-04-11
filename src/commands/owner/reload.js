const Command = require('../../structures/Command');
const config = require('config');

module.exports = class Reload extends Command {
  get name() { return 'reload'; }

  get _options() { return {
    aliases: ['r'],
    listed: false,
  }; }

  canUseEmojis(message) {
    return message.channel.type === 1 || message.channel.permissionsOf(this.client.user.id).has('externalEmojis');
  }

  async exec(message) {
    if(message.author.id !== config.get('owner')) return;
    const sentMessage = await this.client.createMessage(message.channel.id, `${this.canUseEmojis(message) ? '<a:matchmaking:415045517123387403>' : ':recycle:'} Reloading commands...`);
    this.client.cmds.reload();
    this.client.cmds.preloadAll();
    return sentMessage.edit(`${this.canUseEmojis(message) ? '<:check:314349398811475968>' : ':white_check_mark:'} Reloaded commands.`);
  }

  get metadata() { return {
    description: 'Reload commands.',
  }; }
};
