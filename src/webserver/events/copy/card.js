exports.name = 'COPY_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.copy_card', {
      member: data.invoker.webhookSafeName,
      sourceCard: data.util.cutoffText(data.sourceCard.name, 50),
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['card', 'list']),
  });
};