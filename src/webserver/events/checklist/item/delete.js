exports.name = 'DELETE_CHECK_ITEM';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.checkitem_delete', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['card', 'list', 'checklist', 'checklistItem']),
  });
};