/* jshint evil: true */

const Command = require('../../structures/Command');
const Util = require('../../util');

module.exports = class AsyncEval extends Command {
  get name() { return 'asynceval'; }

  get _options() { return {
    aliases: ['ae', 'aeval', 'aevaluate', 'asyncevaluate'],
    permissions: ['elevated'],
    listed: false,
  }; }

  // eslint-disable-next-line no-unused-vars
  async exec(message, opts) {
    try {
      const start = Date.now();
      const code = Util.Prefix.strip(message, this.client).split(' ').slice(1).join(' ');
      const result = await eval(`(async () => {${code}})()`);
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
