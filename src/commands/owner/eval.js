/* jshint evil: true */

/*
This file is part of Taco

MIT License

Copyright (c) 2020 Trello Talk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const Command = require('../../structures/Command');
const Util = require('../../util');

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
