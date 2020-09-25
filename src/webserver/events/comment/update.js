exports.name = 'UPDATE_COMMENT';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.update_comment', {
        member: data.invoker.webhookSafeName,
        card: data.util.cutoffText(data.card.name, 50)
      }),
      description: data.embedDescription(['card', 'list']),
      fields: [{
        name: '*' + _('trello.old_comment') + '*',
        value: data.util.cutoffText(data.oldData.text, 1024),
        inline: true
      }, {
        name: '*' + _('trello.new_comment') + '*',
        value: data.util.cutoffText(data.action.data.action.text, 1024),
        inline: true
      }]
    },
    small: {
      description: _('webhooks.update_comment', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        card: `[${data.util.cutoffText(data.card.name, 50)}](https://trello.com/c/${data.card.shortLink})`
      }),
      fields: [{
        name: '*' + _('trello.old_comment') + '*',
        value: data.util.cutoffText(data.oldData.text, 1024),
        inline: true
      }, {
        name: '*' + _('trello.new_comment') + '*',
        value: data.util.cutoffText(data.action.data.action.text, 1024),
        inline: true
      }]
    }
  });
};