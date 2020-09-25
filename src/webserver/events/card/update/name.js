exports.name = 'UPDATE_CARD_NAME';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.rename_card', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50),
        oldName: data.util.cutoffText(data.oldData.name, 50)
      }),
      description: data.embedDescription(['card', 'list']),
    },
    small: {
      description: _('webhooks.rename_card', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 50)}](https://trello.com/c/${data.card.shortLink})`,
        oldName: data.util.cutoffText(data.oldData.name, 50)
      })
    }
  });
};