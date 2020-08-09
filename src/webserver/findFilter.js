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