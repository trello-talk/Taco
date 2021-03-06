exports.name = 'UPDATE_LABEL_COLOR';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.label_recolor', {
        member: data.invoker.webhookSafeName,
        label: data.util.cutoffText(data.label.name, 50),
        oldColor: data.oldData.color ? _(`trello.label_color.${data.oldData.color}`) :
          _('trello.label_color.none'),
        color: data.label.color ? _(`trello.label_color.${data.label.color}`) :
          _('trello.label_color.none')
      }),
      description: data.embedDescription(['label']),
    },
    small: {
      description: _('webhooks.label_recolor', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        label: data.util.cutoffText(data.label.name, 25),
        oldColor: data.oldData.color ? _(`trello.label_color.${data.oldData.color}`) :
          _('trello.label_color.none'),
        color: data.label.color ? _(`trello.label_color.${data.label.color}`) :
          _('trello.label_color.none')
      }),
    }
  });
};