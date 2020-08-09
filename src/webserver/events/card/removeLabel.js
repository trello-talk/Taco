exports.name = 'REMOVE_LABEL_FROM_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.card_remove_label', {
      member: data.invoker.webhookSafeName,
      label: data.util.cutoffText(data.label.name, 50),
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['label', 'card', 'list']),
  });
};