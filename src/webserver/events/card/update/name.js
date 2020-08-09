exports.name = 'UPDATE_CARD_NAME';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.rename_card', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      oldName: data.util.cutoffText(data.oldData.name, 50)
    }),
    description: data.embedDescription(['card', 'list']),
  });
};