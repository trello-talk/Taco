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

const Command = require('../structures/Command');

module.exports = class Ping extends Command {
  get name() { return 'ping'; }

  get _options() { return {
    aliases: ['p', 'pong'],
    cooldown: 0,
  }; }

  async exec(message, { _ }) {
    const currentPing = Array.from(this.client.shards.values())
      .map(shard => shard.latency).reduce((prev, val) => prev + val, 0);
    const timeBeforeMessage = Date.now();
    const sentMessage = await message.channel.createMessage(`> :ping_pong: ***${_('ping.message')}***\n` +
      `> ${_('ping.ws', { ms: _.toLocaleString(currentPing) })}`);
    await sentMessage.edit(
      `> :ping_pong: ***${_('ping.message')}***\n` +
      `> ${_('ping.ws', { ms: _.toLocaleString(currentPing) })}\n` +
      `> ${_('ping.rest', { ms: _.toLocaleString(Date.now() - timeBeforeMessage) })}`);
  }

  get metadata() { return {
    category: 'categories.general',
  }; }
};
