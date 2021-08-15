/* jshint evil: true */

const Command = require('../../structures/Command');
const Util = require('../../util');
// eslint-disable-next-line no-unused-vars
const prisma = require('../../prisma');

module.exports = class Eval extends Command {
  get name() { return 'eval'; }

  get _options() { return {
    aliases: ['e'],
    permissions: ['elevated'],
    listed: false,
    minimumArgs: 1
  }; }

  // eslint-disable-next-line no-unused-vars
  async exec(message, opts) {
    try {
      const start = Date.now();
      const result = eval(Util.Prefix.strip(message, this.client).split(' ').slice(1).join(' '));
      const time = Date.now() - start;
      return Util.Hastebin.autosend(
        `${opts._('responses.eval', { ms: opts._.toLocaleString(time) })}\n\`\`\`js\n${result}\`\`\`\n`,
        message);
    } catch (e) {
      return Util.Hastebin.autosend('```js\n' + e.stack + '\n```', message);
    }
  }

  get metadata() { return {
    category: 'categories.dev',
  }; }
};
