exports.name = 'UPDATE_CHECK_ITEM_POS';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.checkitem_move', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list', 'checklist', 'checklistItem']),
    },
    small: {
      description: _('webhooks.checkitem_move', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 50)}](https://trello.com/c/${data.card.shortLink})`
      }),
    }
  });
};