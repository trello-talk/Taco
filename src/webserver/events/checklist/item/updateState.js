exports.name = 'UPDATE_CHECK_ITEM_STATE_ON_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _(data.checklistItem.state === 'complete' ?
        'webhooks.checkitem_state_on' : 'webhooks.checkitem_state_off', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50),
        checklistItem: data.util.cutoffText(data.checklistItem.name, 50)
      }),
      description: data.embedDescription(['card', 'list', 'checklist', 'checklistItem']),
    },
    small: {
      description: _(data.checklistItem.state === 'complete' ?
        'webhooks.checkitem_state_on' : 'webhooks.checkitem_state_off', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`,
        checklistItem: data.util.cutoffText(data.checklistItem.name, 25)
      }),
    }
  });
};