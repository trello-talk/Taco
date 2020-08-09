const Command = require('../../structures/Command');
const Util = require('../../util');
const { exec } = require('child_process');

module.exports = class Exec extends Command {
  get name() { return 'exec'; }

  get _options() { return {
    aliases: ['ex', 'sys'],
    permissions: ['elevated'],
    listed: false,
    minimumArgs: 1
  }; }

  codeBlock(content, lang = null) {
    return `\`\`\`${lang ? `${lang}\n` : ''}${content}\`\`\``;
  }

  async exec(message) {
    await this.client.startTyping(message.channel);
    exec(Util.Prefix.strip(message, this.client).split(' ').slice(1).join(' '), (err, stdout, stderr) => {
      this.client.stopTyping(message.channel);
      if (err) return message.channel.createMessage(this.codeBlock(err, 'js'));
      const stdErrBlock = (stderr ? this.codeBlock(stderr, 'js') + '\n' : '');
      return Util.Hastebin.autosend(stdErrBlock + this.codeBlock(stdout), message);
    });
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
