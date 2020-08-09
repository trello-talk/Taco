exports.name = 'UPDATE_CARD_CLOSED';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _(data.card.closed ?
      'webhooks.archive_card' : 'webhooks.unarchive_card', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['card', 'list']),
  });
};