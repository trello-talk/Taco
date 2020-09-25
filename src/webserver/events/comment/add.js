exports.name = 'COMMENT_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.commented', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list']),
      fields: [{
        name: '*' + _('words.comment.one') + '*',
        value: data.util.cutoffText(data.action.data.text, 1024)
      }]
    },
    small: {
      description: _('webhooks.commented', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 25)}](https://trello.com/c/${data.card.shortLink})`
      }),
      fields: [{
        name: '*' + _('words.comment.one') + '*',
        value: data.util.cutoffText(data.action.data.text, 1024)
      }]
    }
  });
};