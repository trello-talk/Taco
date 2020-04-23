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

const Command = require('../../structures/Command');

module.exports = class Hangman extends Command {
  get name() { return 'hangman'; }

  get _options() { return {
    cooldown: 0,
    listed: false,
  }; }

  exec(message, { _ }) {
    return this.client.createMessage(message.channel.id, _('hangman.response'));
  }

  get metadata() { return {
    category: 'General',
    description: '???',
  }; }
};