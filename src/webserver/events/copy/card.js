exports.name = 'COPY_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.copy_card', {
        member: data.invoker.webhookSafeName,
        sourceCard: data.util.cutoffText(data.sourceCard.name, 50),
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list']),
    },
    small: {
      description: _('webhooks.copy_card', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        sourceCard: `[${data.util.cutoffText(data.sourceCard.name, 50)}](https://trello.com/c/${data.sourceCard.shortLink})`,
        card: `[${data.util.cutoffText(data.card.name, 50)}](https://trello.com/c/${data.card.shortLink})`
      }),
    }
  });
};