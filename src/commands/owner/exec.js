const Command = require('../../structures/Command');
const Util = require('../../util');
const { exec } = require('child_process');

module.exports = class Exec extends Command {
  get name() { return 'exec'; }

  get _options() { return {
    aliases: ['ex'],
    listed: false,
  }; }

  codeBlock(content, lang = null) {
    return `\`\`\`${lang ? `${lang}\n` : ''}${content}\`\`\``;
  }

  async exec(message) {
    if(!this.client.config.elevated.includes(message.author.id)) return;
    await this.client.startTyping(message.channel);
    exec(Util.Prefix.strip(message, this.client).split(' ').slice(1).join(' '), (err, stdout, stderr) => {
      this.client.stopTyping(message.channel);
      if(err) return this.client.createMessage(message.channel.id, this.codeBlock(err, 'js'));
      return this.client.createMessage(message.channel.id, (stderr ? this.codeBlock(`STDOUT Error: ${stderr}`, 'js') + '\n' : '') + this.codeBlock(stdout));
    });
  }

  get metadata() { return {
    category: 'Developer',
    description: 'Utilizes child_process.exec',
    usage: '<command> ...',
  }; }
};
