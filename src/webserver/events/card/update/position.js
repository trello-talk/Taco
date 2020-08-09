exports.name = 'UPDATE_CARD_POS';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.move_card_in_list', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['card', 'list']),
  });
};