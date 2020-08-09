exports.name = 'DELETE_COMMENT';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    title: _('webhooks.delete_comment', {
      member: data.invoker.webhookSafeName,
      card: data.util.cutoffText(data.card.name, 50)
    }),
    description: data.embedDescription(['card', 'list'])
  });
};