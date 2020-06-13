/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah 2016 - 2019
 Copyright (c) Trello Talk Team 2019 - 2020

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