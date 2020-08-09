exports.name = 'COMMENT_CARD';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.commented', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['card', 'list']),
    fields: [{
      name: '*' + _('words.comment.one') + '*',
      value: data.util.cutoffText(data.action.data.text, 1024)
    }]
  });
};