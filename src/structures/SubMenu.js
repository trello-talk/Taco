/*
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
const GenericPrompt = require('./GenericPrompt');

class SubMenu {
  /**
   * @param {TrelloBot} client The client to use
   * @param {Message} message The user's message to read permissions from
   * @param {Object} pagerOptions The options for the pager
   */
  constructor(client, message, pagerOptions = {}) {
    this.client = client;
    this.message = message;
    this.pagerOptions = pagerOptions;
    this.prompt = new GenericPrompt(client, message, this.pagerOptions);
  }

  /**
   * Starts the menu
   * @param {string} channelID The channel to post the new message to
   * @param {string} userID The user's ID that started the process
   * @param {Array} menu
   * @param {number} timeout
   */
  async start(channelID, userID, name, menu = [], timeout = 30000) {
    /*
    menu = [
      {
        names: ['a', 'b'],
        title: 'Title',
        exec: (client) => ...
      }
    ]
    */
    const command = menu.find(command => command.names.includes(name ? name.toLowerCase() : null));
    if (!command) {
      this.prompt.pager.items = menu;
      this.prompt.pager.displayFunc = (item, _, ai) => `\`[${ai + 1}]\` ${item.title}`;
      const chosenCommand = await this.prompt.choose(channelID, userID, timeout);
      if (!chosenCommand) return;
      return chosenCommand.exec(this.client);
    } else return command.exec(this.client);
  }
}

module.exports = SubMenu;