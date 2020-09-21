exports.name = 'ADD_LABEL_TO_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.card_add_label', {
      member: data.invoker.webhookSafeName,
      label: data.util.cutoffText(data.label.name, 25),
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['label', 'card', 'list']),
  });
};