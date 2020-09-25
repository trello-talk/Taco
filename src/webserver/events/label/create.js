exports.name = 'CREATE_LABEL';

exports.exec = async data => {
  const _ = data.localeModule;
  return data.send({
    default: {
      title: _('webhooks.create_label', {
        member: data.invoker.webhookSafeName,
        label: data.util.cutoffText(data.label.name, 50)
      }),
      description: data.embedDescription(['label']),
    },
    small: {
      description: _('webhooks.create_label', {
        member: `[${data.invoker.webhookSafeName}](https://trello.com/${data.invoker.username})`,
        label: data.util.cutoffText(data.label.name, 50)
      }),
    }
  });
};