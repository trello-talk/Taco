exports.name = 'DELETE_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.delete_card', {
      member: data.invoker.webhookSafeName,
      cardID: data.card.shortLink
    }),
    description: data.embedDescription(['list']),
  });
};