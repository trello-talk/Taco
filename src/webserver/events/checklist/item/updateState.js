exports.name = 'UPDATE_CHECK_ITEM_STATE_ON_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _(data.checklistItem.state === 'complete' ?
      'webhooks.checkitem_state_on' : 'webhooks.checkitem_state_off', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      checklistItem: data.util.cutoffText(data.checklistItem.name, 50)
    }),
    description: data.embedDescription(['card', 'list', 'checklist', 'checklistItem']),
  });
};