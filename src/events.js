/*
 This file is part of TrelloBot.
 Copyright (c) Snazzah (and contributors) 2016-2020

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

const logger = require('./logger')('[EVENTS]');
const Util = require('./util');

module.exports = class Events {
  constructor(client) {
    this.client = client;
    client.on('messageCreate', this.onMessage.bind(this));
  }

  async onMessage(message) {
    if(message.author.bot || message.author.system) return;
    // Check to see if bot can send messages
    if(message.channel.type !== 1 && !message.channel.permissionsOf(this.client.user.id).has('sendMessages')) return;

    // Don't parse if Taco is in the guild
    if(this.client.config.sudoID &&
      this.client.user.id !== this.client.config.sudoID &&
      message.channel.guild) {
      const sudoBot = await message.channel.guild.members.has(this.client.config.sudoID)
      if(sudoBot) return;
    }

    // Command parsing
    const args = Util.Prefix.strip(message, this.client).split(' ');
    const commandName = args.splice(0, 1)[0];
    let command = this.client.cmds.get(commandName, message);
    if(!message.content.match(Util.Prefix.regex(this.client)) || !command) return;

    try {
      await command._exec(message, { args });
    } catch (e) {
      logger.error(`The '${command.name}' command failed.`);
      console.log(e);
      this.client.createMessage(message.channel.id, ':fire: An error occurred while processing that command!');
      this.client.stopTyping(message.channel);
    }
  }
};
