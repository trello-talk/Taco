exports.name = 'CONVERT_TO_CARD_FROM_CHECK_ITEM';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.checkitem_tocard', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list']),
      fields: [{
        name: '*' + _('trello.item_src') + '*',
        value: [
          `**${_('words.card.one')}:** [${data.util.cutoffText(data.util.Escape.markdown(data.sourceCard.name), 50)}](https://trello.com/c/${data.sourceCard.shortLink})`,
          `**${_('words.checklist.one')}:** ${
            data.util.cutoffText(data.util.Escape.markdown(data.checklist.name), 50)}`
        ].join('\n')
      }]
    },
    small: {
      description: _('webhooks.checkitem_tocard', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`
      }),
    }
  });
};