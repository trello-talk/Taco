exports.name = 'UPDATE_CARD_CLOSED';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _(data.card.closed ?
        'webhooks.archive_card' : 'webhooks.unarchive_card', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list']),
    },
    small: {
      description: _(data.card.closed ?
        'webhooks.archive_card' : 'webhooks.unarchive_card', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`
      }),
    }
  });
};