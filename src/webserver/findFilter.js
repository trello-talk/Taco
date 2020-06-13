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

const WebhookFilters = require('../structures/WebhookFilters');

module.exports = (request, webserver) => {
  const keyMap = {
    idList: 'list',
    dueComplete: 'due'
  };
  const snakeCaseAction = request.body.action.type
    .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).toUpperCase();
  if (WebhookFilters.FLAGS[snakeCaseAction] && webserver.events.has(snakeCaseAction))
    return snakeCaseAction;

  if (exports.PARENT_FILTERS.includes(snakeCaseAction) && request.body.action.data.old) {
    const keyChanged = Object.keys(request.body.action.data.old)[0];
    const childAction = snakeCaseAction + '_' +
      (keyMap[keyChanged] || keyChanged).toUpperCase();
    if (WebhookFilters.FLAGS[childAction] && webserver.events.has(childAction))
      return childAction;
  }
};

exports.PARENT_FILTERS = [
  'UPDATE_CARD', 'UPDATE_CHECK_ITEM', 'UPDATE_CHECKLIST',
  'UPDATE_LIST', 'UPDATE_BOARD', 'UPDATE_LABEL'
];