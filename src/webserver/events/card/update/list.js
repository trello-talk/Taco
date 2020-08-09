exports.name = 'UPDATE_CARD_LIST';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.move_card', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50),
      list: data.util.cutoffText(data.listAfter.name, 50)
    }),
    description: data.embedDescription(['card', 'listBefore', 'listAfter'])
  });
};