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

exports.name = 'UPDATE_BOARD_CLOSED';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _(data.card.closed ?
      'webhooks.archive_card' : 'webhooks.unarchive_card', {
      member: data.invoker.webhookSafeName,
      board: data.util.cutoffText(data.board.name, 50)
    }),
    description: '',
  });
};