exports.name = 'DELETE_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.delete_card', {
        member: data.invoker.webhookSafeName,
        cardID: data.card.shortLink
      }),
      description: data.embedDescription(['list']),
    },
    small: {
      description: _('webhooks.delete_card', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        cardID: data.card.shortLink
      })
    }
  });
};