exports.name = 'ADD_LABEL_TO_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.card_add_label', {
        member: data.invoker.webhookSafeName,
        label: data.util.cutoffText(data.label.name, 25),
        card: data.util.cutoffText(data.card.name, 25)
      }),
      description: data.embedDescription(['label', 'card', 'list']),
    },
    small: {
      description: _('webhooks.card_add_label', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        label: data.util.cutoffText(data.label.name, 25),
        card: `[${data.util.cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`
      })
    }
  });
};