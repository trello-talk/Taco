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

exports.name = 'UPDATE_CUSTOM_FIELD_DISPLAY';

exports.exec = async data => {
  const _ = data.localeModule;
  const changedKey = Object.keys(data.oldData.display)[0];
  if (changedKey === 'cardFront')
    return data.send({
      title: _(`webhooks.customfield_carddisplay_${!data.oldData.display.cardFront}`, {
        member: data.invoker.webhookSafeName,
        customField: data.util.cutoffText(data.customField.name, 50)
      }),
      description: '',
    });
};