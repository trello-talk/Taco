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
  'UPDATE_LIST', 'UPDATE_BOARD', 'UPDATE_LABEL', 'UPDATE_CUSTOM_FIELD'
];